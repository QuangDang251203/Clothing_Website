package com.example.clothing_store.service.Orders;

import com.example.clothing_store.config.Config;
import com.example.clothing_store.config.ZaloPayConfig;
import com.example.clothing_store.config.ZaloPayUtils;
import com.example.clothing_store.constant.CommonConstant;
import com.example.clothing_store.constant.StatusOrderConstant;
import com.example.clothing_store.dto.OrdersDTO;
import com.example.clothing_store.dto.PaymentResDTO;
import com.example.clothing_store.entity.*;
import com.example.clothing_store.enums.CommonEnums;
import com.example.clothing_store.mapper.OrdersMapper;
import com.example.clothing_store.repository.*;
import com.example.clothing_store.response.CommonResponse;
import com.example.clothing_store.response.ResponseToData;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrdersServiceImpl implements OrdersService {
    private static final Logger log = LoggerFactory.getLogger(OrdersServiceImpl.class);
    private final OrdersRepository ordersRepository;
    private final OrdersMapper ordersMapper;
    private final ShippingAddressRepository shippingAddressRepo;
    private final OrderDetailRepository detailRepository;
    private final CartRepository cartRepository;
    private final ProductVariantRepository productVariantRepo;
    private final VoucherRepository voucherRepo;
    private final ProductRepository productRepo;

    @Transactional
    public ResponseToData<?> checkoutCart(int accountId,
                                          int shippingId,
                                          String voucherCode,
                                          int paymentMethod) {
        log.info("[Begin] Checkout Cart with accountId: {}, shippingId: {}, voucherCode: {}, paymentMethod: {}",
                accountId, shippingId, voucherCode, paymentMethod);

        // 1. Lấy Cart
        Cart cart = cartRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Cart not found for accountId=" + accountId));

        BigDecimal total = cart.getTotalPrice();

        // Lưu snapshot các CartItem (để sau này tạo OrderDetail)
        List<CartItem> snapshot = new ArrayList<>(cart.getItems());

        // Clear cart


        // 2. Áp voucher (nếu có)
        Voucher appliedVoucher = null;
        if (voucherCode != null && !voucherCode.isBlank()) {
            Voucher v = voucherRepo.findByVoucherCode(voucherCode)
                    .orElseThrow(() -> new RuntimeException("Voucher not found"));
            LocalDate today = LocalDate.now();
            if (v.getStatus() != CommonConstant.ACTIVE_STATUS
                    || today.isBefore(v.getStartDate())
                    || today.isAfter(v.getExpiryDate())
                    || v.getTimesRedeemed() >= v.getMaxRedemptions()
                    || total.compareTo(v.getMinOrderAmount()) < 0) {
                throw new RuntimeException("Voucher is not valid");
            }
            // Calculate discount
            BigDecimal calculatedDiscount;
            if (Boolean.TRUE.equals(v.getIsPercentage())) {
                // For percentage, calculate the direct percentage of the total
                calculatedDiscount = total.multiply(v.getVoucherValue().divide(new BigDecimal(100), MathContext.DECIMAL128))
                        .setScale(2, RoundingMode.HALF_UP);
                // Ensure the calculated percentage discount does not exceed maxDiscountAmount
                if (calculatedDiscount.compareTo(v.getMaxDiscountAmount()) > 0) {
                    calculatedDiscount = v.getMaxDiscountAmount();
                }
            } else {
                // For fixed amount, the discount is the voucher value itself,
                // but it should also not exceed the maxDiscountAmount (though typically for fixed, they are the same)
                calculatedDiscount = v.getVoucherValue();
                if (calculatedDiscount.compareTo(v.getMaxDiscountAmount()) > 0) {
                    calculatedDiscount = v.getMaxDiscountAmount();
                }
            }
            // Apply discount
            total = total.subtract(calculatedDiscount).max(BigDecimal.ZERO);
            // Update redemption count
            v.setTimesRedeemed(v.getTimesRedeemed() + 1);
            voucherRepo.save(v);
            appliedVoucher = v;
        }

        // 3. Tìm ShippingAddress
        ShippingAddress address = shippingAddressRepo.findById(shippingId)
                .orElseThrow(() -> new RuntimeException("ShippingAddress not found for id=" + shippingId));

        // 4. Nếu paymentMethod == 2 (VNPay): tạo Order với status=PENDING_PAYMENT, trả về URL
        if (paymentMethod == 2) {
            // 4.1. Tạo một đơn hàng tạm với status = PENDING_PAYMENT
            //DANG SUA

            Orders pendingOrder = new Orders();
            pendingOrder.setAccount(cart.getAccount());
            pendingOrder.setShippingAddress(address);
            pendingOrder.setStatus(StatusOrderConstant.PENDING_PAYMENT);
            pendingOrder.setTotalPrice(total);
            pendingOrder.setPayMethod(2); // 2 = VNPay
            if (appliedVoucher != null) {
                pendingOrder.setVoucher(appliedVoucher);
            }

            // 4.2. Lưu OrderDetail nhưng KHÔNG trừ stock
            for (CartItem ci : snapshot) {
                OrderDetail od = new OrderDetail();
                od.setOrder(pendingOrder);
                od.setQuantity(ci.getQuantity());
                od.setPrice(ci.getPrice());
                od.setProductVariant(ci.getProductVariant());
                pendingOrder.getOrderDetails().add(od);
            }

            Orders savedPending = ordersRepository.save(pendingOrder);
            Integer newOrderId = savedPending.getId();
            log.info("Created PENDING_PAYMENT order with id={}", newOrderId);

            // 4.3. Sinh URL VNPay (lấy amount = total * 100 vì VNPay yêu cầu)
//
            long amount = total.multiply(new BigDecimal(100L)).longValue();
            String vnp_TxnRef = newOrderId.toString();                  // orderId làm txnRef
            String vnp_OrderInfo = "Thanh toan don hang: " + newOrderId;
            String vnp_IpAddr = "127.0.0.1"; // có thể thay bằng Config.getIpAddress(request) nếu truyền request vào

            // Tạo tham số VNPay
            Map<String, String> vnpParams = new HashMap<>();
            vnpParams.put("vnp_Version", Config.vnp_Version);
            vnpParams.put("vnp_Command", Config.vnp_Command);
            vnpParams.put("vnp_TmnCode", Config.vnp_TmnCode);
            vnpParams.put("vnp_Amount", String.valueOf(amount));
            vnpParams.put("vnp_CurrCode", "VND");
            vnpParams.put("vnp_TxnRef", vnp_TxnRef);
            vnpParams.put("vnp_OrderInfo", vnp_OrderInfo);
            vnpParams.put("vnp_OrderType", "other");
            vnpParams.put("vnp_Locale", "vn");
            vnpParams.put("vnp_ReturnUrl", Config.vnp_ReturnUrl);
            vnpParams.put("vnp_IpAddr", vnp_IpAddr);

            // Tạo ngày tạo và ngày hết hạn
            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(cld.getTime());
            vnpParams.put("vnp_CreateDate", vnp_CreateDate);

            cld.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());
            vnpParams.put("vnp_ExpireDate", vnp_ExpireDate);

            // Sắp xếp key và build chuỗi hash + query
            List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnpParams.get(fieldName);
                if (fieldValue != null && fieldValue.length() > 0) {
                    try {
                        hashData.append(fieldName)
                                .append('=')
                                .append(URLEncoder.encode(fieldValue, "US-ASCII"));
                        query.append(URLEncoder.encode(fieldName, "US-ASCII"))
                                .append('=')
                                .append(URLEncoder.encode(fieldValue, "US-ASCII"));
                    } catch (UnsupportedEncodingException e) {
                        throw new RuntimeException("Error encoding VNPay params", e);
                    }
                    if (itr.hasNext()) {
                        hashData.append('&');
                        query.append('&');
                    }
                }
            }

            String vnp_SecureHash = Config.hmacSHA512(Config.secretKey, hashData.toString());
            String queryUrl = query.toString() + "&vnp_SecureHash=" + vnp_SecureHash;
            String paymentUrl = Config.vnp_PayUrl + "?" + queryUrl;

            log.info("VNP param: {}",vnpParams);
            // Trả về PaymentResDTO (ResponseToData.success sẽ gói vào data)
            PaymentResDTO resDto = new PaymentResDTO();
            resDto.setStatus("00");
            resDto.setMessage("Success");
            resDto.setUrl(paymentUrl);
            return ResponseToData.success(resDto);
        }

//        ZaloPay
        if (paymentMethod == 3) {
            // 3.1 Create pending order
            Orders pending = new Orders();
            pending.setAccount(cart.getAccount());
            pending.setShippingAddress(address);
            pending.setStatus(StatusOrderConstant.PENDING_PAYMENT);
            pending.setTotalPrice(total);
            pending.setPayMethod(3);
            if (appliedVoucher != null) pending.setVoucher(appliedVoucher);
            snapshot.forEach(ci -> {
                OrderDetail od = new OrderDetail();
                od.setOrder(pending);
                od.setQuantity(ci.getQuantity());
                od.setPrice(ci.getPrice());
                od.setProductVariant(ci.getProductVariant());
                pending.getOrderDetails().add(od);
            });
            Orders saved = ordersRepository.save(pending);
            long orderId = saved.getId();

            // 3.2 Prepare params
            String appTransId = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd")) + "_" + orderId;
            long appTime = System.currentTimeMillis();
            int amount = total.multiply(new BigDecimal(100)).intValue(); // in VND

            // Build rawData for signature: app_id|app_trans_id|app_user|amount|app_time
            String appUser = String.valueOf(orderId);
            String rawData = ZaloPayConfig.APP_ID + "|" + appTransId + "|" + appUser + "|" + amount + "|" + appTime;
            String mac = ZaloPayUtils.hmacSHA256(rawData, ZaloPayConfig.KEY1);

            Map<String,Object> payload = new HashMap<>();
            payload.put("app_id", ZaloPayConfig.APP_ID);
            payload.put("app_trans_id", appTransId);
            payload.put("app_user", appUser);
            payload.put("amount", amount);
            payload.put("app_time", appTime);
            payload.put("description", "Thanh toán đơn #" + orderId);
            payload.put("callback_url", ZaloPayConfig.CALLBACK_URL);
            payload.put("mac", mac);

            // 3.3 Logging and request
            RestTemplate rt = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String,Object>> req = new HttpEntity<>(payload, headers);
            Map<String,Object> body;
            try {
                log.info("[ZaloPay] Request payload: {}", new ObjectMapper().writeValueAsString(payload));
                ResponseEntity<Map> resp = rt.postForEntity(ZaloPayConfig.CREATE_ORDER_ENDPOINT, req, Map.class);
                body = resp.getBody();
                log.info("[ZaloPay] Response body: {}", body);
            } catch (JsonProcessingException e) {
                log.error("[ZaloPay] Payload serialization error", e);
                throw new RuntimeException("ZaloPay create order error");
            }
            String returnCode = String.valueOf(body.get("return_code"));
            if (!"1".equals(returnCode)) {
                log.error("[ZaloPay] Create order failed: {} - {}", returnCode, body.get("return_message"));
                throw new RuntimeException("ZaloPay create order failed: " + body.get("return_message"));
            }

            // 3.4 Extract token and return URL
            @SuppressWarnings("unchecked")
            Map<String,Object> zp = (Map<String,Object>) body.get("zp_trans");
            String token = (String) zp.get("token");

            PaymentResDTO res = new PaymentResDTO();
            res.setStatus("00");
            res.setMessage("Success");
            res.setUrl("https://sb-openapi.zalopay.vn/v2/gateway/docs?token=" + token);
            return ResponseToData.success(res);
        }

        // 5. Nếu paymentMethod == 1 (COD), tạo đơn ngay và trừ stock
        Orders orders = new Orders();
        orders.setAccount(cart.getAccount());
        orders.setShippingAddress(address);
        orders.setStatus(StatusOrderConstant.ORDERED);
        orders.setTotalPrice(total);
        orders.setPayMethod(1); // 1 = COD
        if (appliedVoucher != null) {
            orders.setVoucher(appliedVoucher);
        }
        for (CartItem ci : snapshot) {
            ProductVariant variant = ci.getProductVariant();
            int newStock = variant.getQuantity() - ci.getQuantity();
            if (newStock < 0) {
                throw new RuntimeException("Not enough stock for SKU: " + variant.getSkuCode());
            }
            variant.setQuantity(newStock);
            productVariantRepo.save(variant);

            Product product = variant.getProduct();
            product.setNumberOfPurchase(product.getNumberOfPurchase() + ci.getQuantity());
            productRepo.save(product);

            OrderDetail od = new OrderDetail();
            od.setOrder(orders);
            od.setQuantity(ci.getQuantity());
            od.setProductVariant(variant);
            od.setPrice(ci.getPrice());
            orders.getOrderDetails().add(od);
        }
        Orders saved = ordersRepository.save(orders);
        cart.clearItems();
        cartRepository.save(cart);
        log.info("[End] Checkout Cart successful (COD) with orderId={}", saved.getId());
        OrdersDTO dto = ordersMapper.toDto(saved, saved.getOrderDetails());
        return ResponseToData.success(dto);
    }

    // confirm zaloPay
    @Transactional
    @Override
    public ResponseToData<Integer> confirmZaloPay(String data, String mac) {
        // 1. Verify signature
        String expectedMac = ZaloPayUtils.hmacSHA256(data, ZaloPayConfig.KEY2);
        if (!expectedMac.equals(mac)) {
            log.error("[Error] ZaloPay signature mismatch");
            return ResponseToData.failExist(CommonEnums.FAIL_BANKING);
        }

        JsonNode node;
        try {
            // 2. Parse callback JSON payload
            node = new ObjectMapper().readTree(data);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            log.error("[Error] Invalid ZaloPay callback payload", e);
            return ResponseToData.failExist(CommonEnums.FAIL_BANKING);
        }

        int errorCode = node.get("error_code").asInt();
        String appTransId = node.get("app_trans_id").asText();
        int orderId = Integer.parseInt(appTransId.split("_")[1]);

        // 3. Handle failure: restore voucher, delete pending order
        if (errorCode != 0) {
            ordersRepository.findById(orderId).ifPresent(pending -> {
                Voucher used = pending.getVoucher();
                if (used != null) {
                    used.setTimesRedeemed(Math.max(0, used.getTimesRedeemed() - 1));
                    voucherRepo.save(used);
                    log.info("[Restore] Voucher {} redemption decremented", used.getVoucherCode());
                }
                ordersRepository.delete(pending);
                log.info("[Delete] Pending ZaloPay order id={} due to error_code={}", orderId, errorCode);
            });
            return ResponseToData.failExist(CommonEnums.FAIL_BANKING);
        }

        // 4. Success: update order status, deduct stock, update sales, clear cart
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        if (order.getStatus() != StatusOrderConstant.PENDING_PAYMENT) {
            log.error("[Error] Order {} is not in PENDING_PAYMENT", orderId);
            return ResponseToData.failExist(CommonEnums.FAIL_BANKING);
        }

        order.setStatus(StatusOrderConstant.ORDERED);
        ordersRepository.save(order);

        for (OrderDetail od : order.getOrderDetails()) {
            ProductVariant variant = od.getProductVariant();
            int newStock = variant.getQuantity() - od.getQuantity();
            if (newStock < 0) {
                throw new RuntimeException("Not enough stock for SKU: " + variant.getSkuCode());
            }
            variant.setQuantity(newStock);
            productVariantRepo.save(variant);

            Product product = variant.getProduct();
            product.setNumberOfPurchase(product.getNumberOfPurchase() + od.getQuantity());
            productRepo.save(product);
        }

        Cart cart = cartRepository.findById(order.getAccount().getId())
                .orElseThrow(() -> new RuntimeException("Cart not found for account " + order.getAccount().getId()));
        cart.clearItems();
        cartRepository.save(cart);

        log.info("[Success] ZaloPay payment confirmed for orderId={}", orderId);
        return ResponseToData.success(orderId);
    }


    @Transactional
    @Override
    public ResponseToData<Integer> confirmVnPayPayment(int orderId,
                                                       String vnpResponseCode,
                                                       String vnpTxnRef,
                                                       String vnpSecureHash) {
        log.info("[Begin] Confirm VNPay Payment for orderId={} with vnpResponseCode={}", orderId, vnpResponseCode);

        // 1. Nếu không phải code thành công, abort và xóa pending order, phục hồi voucher
        if (!"00".equals(vnpResponseCode)) {
            log.error("[Error] VNPay payment failed with vnpResponseCode={}", vnpResponseCode);
            ordersRepository.findById(orderId).ifPresent(pending -> {
                // 1.a. Phục hồi số lần dùng voucher
                Voucher usedVoucher = pending.getVoucher();
                if (usedVoucher != null) {
                    // Giảm lại count
                    usedVoucher.setTimesRedeemed(
                            Math.max(0, usedVoucher.getTimesRedeemed() - 1)
                    );
                    voucherRepo.save(usedVoucher);
                    log.info("Restored voucher {} redemption count to {}",
                            usedVoucher.getVoucherCode(), usedVoucher.getTimesRedeemed());
                }
                // 1.b. Xóa đơn pending
                ordersRepository.delete(pending);
                log.info("Deleted Pending_Payment order id={} because VNPay returned code {}",
                        orderId, vnpResponseCode);
            });
            return ResponseToData.failExist(CommonEnums.FAIL_BANKING);
        }

        // 2. Lấy order
        Orders orders = ordersRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        // 3. Chỉ xử lý nếu đang ở trạng thái PENDING_PAYMENT
        if (orders.getStatus() != StatusOrderConstant.PENDING_PAYMENT) {
            log.error("[Error] Order is not pending payment or already processed.");
            return ResponseToData.failExist(CommonEnums.FAIL_BANKING);
        }

        // 4. Chuyển trạng thái sang ORDERED
        orders.setStatus(StatusOrderConstant.ORDERED);
        ordersRepository.save(orders);

        // 5. Trừ stock và tăng số lượng bán
        for (OrderDetail od : orders.getOrderDetails()) {
            ProductVariant variant = od.getProductVariant();
            int newStock = variant.getQuantity() - od.getQuantity();
            if (newStock < 0) {
                throw new RuntimeException("Not enough stock for SKU: " + variant.getSkuCode());
            }
            variant.setQuantity(newStock);
            productVariantRepo.save(variant);

            Product product = variant.getProduct();
            product.setNumberOfPurchase(product.getNumberOfPurchase() + od.getQuantity());
            productRepo.save(product);
        }

        // 6. Xóa sản phẩm khỏi giỏ hàng sau khi đã thanh toán thành công
        Cart cart = cartRepository.findById(orders.getAccount().getId())
                .orElseThrow(() -> new RuntimeException("Cart not found for account "
                        + orders.getAccount().getId()));
        cart.clearItems();
        cartRepository.save(cart);

        log.info("[End] Confirm VNPay Payment successful for orderId={}", orderId);
        return ResponseToData.success(orderId);
    }


    @Transactional
    public CommonResponse createOrder(OrdersDTO ordersDTO) {
        log.info("[Begin] Create Order with data request:{}", ordersDTO);
        log.info("Account is exist");
        ordersDTO.setStatus(StatusOrderConstant.ORDERED);
        ordersRepository.save(ordersMapper.toEntity(ordersDTO));
        log.info("[End] Create Order");
        return CommonResponse.response(CommonEnums.SUCCESS);
    }

    @Transactional
    public CommonResponse updateShippingAddress(int orderId, int shippingAddressId) {
        log.info("[Begin] Update Shipping Address with id order {} and id shippingAddress {}"
                , orderId, shippingAddressId);
        Orders orders = ordersRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Order not found"));
        List<ShippingAddress> shippingAddresses = shippingAddressRepo.
                findByAccountId(orders.getAccount().getId());
        ShippingAddress matchedAddress = shippingAddresses
                .stream()
                .filter(sa -> sa.getId() == shippingAddressId)
                .findFirst().orElseThrow(() -> new NoSuchElementException("Shipping address is not found"));
        orders.setShippingAddress(matchedAddress);
        ordersRepository.save(orders);
        log.info("[End] Update Shipping Address");
        return CommonResponse.response(CommonEnums.SUCCESS);
    }

    @Transactional
    public CommonResponse changeStatusCancel(int id) {
        log.info("[Begin] Change Status Cancel with id orders {}", id);
        Orders orders = ordersRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Order not found"));
        log.info("Orders is exist");
        if (orders.getStatus() != StatusOrderConstant.ORDERED) {
            log.error("[Error] Order is can not be cancel");
            return CommonResponse.response(CommonEnums.FAIL_CANCEL);
        }
        for (OrderDetail od : orders.getOrderDetails()) {
            ProductVariant variant = od.getProductVariant();
            int currentStock = variant.getQuantity();
            int returnedQty = od.getQuantity();
            variant.setQuantity(currentStock + returnedQty);
            productVariantRepo.save(variant);
            Product product = variant.getProduct();
            product.setNumberOfPurchase(product.getNumberOfPurchase() - returnedQty);
            productRepo.save(product);
            log.info("Returned {} units to variant {} (new stock = {})",
                    returnedQty, variant.getSkuCode(), variant.getQuantity());
        }
        orders.setStatus(StatusOrderConstant.ORDERED_CANCELLED);
        ordersRepository.save(orders);
        log.info("[End] Change Status Cancel");
        return CommonResponse.response(CommonEnums.SUCCESS);
    }

    @Transactional
    public CommonResponse changeStatus(int id) {
        log.info("[Begin] Change Status with id orders {}", id);
        Orders orders = ordersRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Order not found"));
        switch (orders.getStatus()) {
            case StatusOrderConstant.ORDERED:
                orders.setStatus(StatusOrderConstant.DELIVERED_TO_THE_CARRIER);
                break;
            case StatusOrderConstant.DELIVERED_TO_THE_CARRIER:
                orders.setStatus(StatusOrderConstant.ON_THE_WAY);
                break;
            case StatusOrderConstant.ON_THE_WAY:
                orders.setStatus(StatusOrderConstant.RECEIVED);
                break;
            default:
        }
        ordersRepository.save(orders);
        log.info("[End] Changed Status");
        return CommonResponse.response(CommonEnums.SUCCESS);
    }

    public ResponseToData<OrdersDTO> getDetailOrder(int id) {
        log.info("[Begin] Get detail order with id orders {}", id);
        Orders orders = ordersRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Order not found"));
        List<OrderDetail> details = detailRepository.findByOrderId(id);
        log.info("size of list detail {}", details.size());
        OrdersDTO ordersDTO = ordersMapper.toDto(orders, details);
        log.info("[End] Get detail order Successfully");
        return ResponseToData.success(ordersDTO);
    }

    @Override
    public ResponseToData<List<OrdersDTO>> listOrdersByAccount(int accountId) {
        List<Orders> orders = ordersRepository.findByAccountIdOrderByIdDesc(accountId);
        List<OrdersDTO> dtos = orders.stream().map(o -> {
            List<OrderDetail> details = detailRepository.findByOrderId(o.getId());
            return ordersMapper.toDto(o, details);
        }).collect(Collectors.toList());
        return ResponseToData.success(dtos);
    }

    public ResponseToData<List<OrdersDTO>> getAllOrders() {
        List<Orders> orders = ordersRepository.findAll();
        List<OrdersDTO> dtos = orders.stream().map(o -> {
            List<OrderDetail> details = detailRepository.findByOrderId(o.getId());
            return ordersMapper.toDto(o, details);
        }).collect(Collectors.toList());
        return ResponseToData.success(dtos);
    }
}

