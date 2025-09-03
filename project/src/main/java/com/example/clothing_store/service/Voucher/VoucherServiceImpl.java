package com.example.clothing_store.service.Voucher;

import com.example.clothing_store.constant.CommonConstant;
import com.example.clothing_store.dto.VoucherDTO;
import com.example.clothing_store.entity.Product;
import com.example.clothing_store.entity.Voucher;
import com.example.clothing_store.entity.VoucherProduct;
import com.example.clothing_store.enums.CommonEnums;
import com.example.clothing_store.mapper.VoucherMapper;
import com.example.clothing_store.repository.ProductRepository;
import com.example.clothing_store.repository.VoucherProductRepository;
import com.example.clothing_store.repository.VoucherRepository;
import com.example.clothing_store.response.CommonResponse;
import com.example.clothing_store.response.ResponseToData;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {
    private static final Logger log = LoggerFactory.getLogger(VoucherServiceImpl.class);
    private final VoucherRepository voucherRepo;
    private final VoucherMapper mapper;
    private final ProductRepository productRepo;
    private final VoucherProductRepository voucherProductRepo;

    @Transactional
    public ResponseToData<VoucherDTO> createVoucher(VoucherDTO dto) {
        log.info("[Begin]Create Voucher : {}", dto);
        if (voucherRepo.existsByVoucherCode(dto.getVoucherCode())) {
            log.info("Voucher code is exist");
            return ResponseToData.failExist(CommonEnums.CODE_IS_EXIST);
        }
        log.info("Voucher code is created");
        dto.setStatus(CommonConstant.ACTIVE_STATUS);
        dto.setTimesRedeemed(0);
        Voucher voucher = mapper.toEntity(dto);
        voucherRepo.save(voucher);
        if (dto.getProductIds() != null && !dto.getProductIds().isEmpty()) {
            log.info("List product ids {} :", dto.getProductIds());
            List<VoucherProduct> listVP = dto.getProductIds().stream().map(pid -> {
                Product p = productRepo.findById(pid)
                        .orElseThrow(() -> new RuntimeException("Product not found id=" + pid));
                return VoucherProduct.builder()
                        .voucher(voucher)
                        .product(p)
                        .build();
            }).collect(Collectors.toList());
            voucherProductRepo.saveAll(listVP);
            voucher.setVoucherProducts(listVP);
        }
        log.info("[End]Create Voucher successfully");
        return ResponseToData.success(mapper.toDto(voucher));
    }

    @Transactional
    public CommonResponse changeStatusVoucher(String code) {
        log.info("[Begin] Change status of Voucher code : {}", code);
        Voucher voucher = voucherRepo.findByVoucherCode(code)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));
        if(voucher.getStatus() == CommonConstant.ACTIVE_STATUS) {
            log.info("Voucher is already active");
            voucher.setStatus(CommonConstant.INACTIVE_STATUS);
        }else {
            log.info("Voucher is inactive");
            voucher.setStatus(CommonConstant.ACTIVE_STATUS);
        }
        voucherRepo.save(voucher);
        log.info("[End] Change status of Voucher successfully");
        return CommonResponse.response(CommonEnums.SUCCESS);
    }

    public ResponseToData<List<VoucherDTO>> getVouchers() {
        log.info("[Begin] Get All Vouchers");
        List<VoucherDTO> DTOs = voucherRepo.findAll()
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
        log.info("[End] Get All Vouchers successfully with {} vouchers", DTOs.size());
        return ResponseToData.success(DTOs);
    }

    public ResponseToData<VoucherDTO> getByVoucherCode(String code) {
        log.info("[Begin] Get Voucher by code : {}", code);
        VoucherDTO dto = mapper.toDto(voucherRepo.findByVoucherCode(code)
                .orElseThrow(() -> new RuntimeException("Voucher not found")));
        log.info("[End] Get Voucher by code successfully");
        return ResponseToData.success(dto);
    }

    @Transactional
    public ResponseToData<VoucherDTO> updateVoucher(String code,VoucherDTO dto) {
        log.info("[Begin] Update Voucher code : {}", code);
        Voucher voucher = voucherRepo.findByVoucherCode(code)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));
        voucher.setDes(dto.getDes());
        voucher.setVoucherValue(dto.getVoucherValue());
        voucher.setStartDate(dto.getStartDate());
        voucher.setExpiryDate(dto.getExpiryDate());
        voucher.setIsPercentage(dto.getIsPercentage());
        voucher.setMinOrderAmount(dto.getMinOrderAmount());
        voucher.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        voucher.setMaxRedemptions(dto.getMaxRedemptions());
        // 3. Trước hết, chỉ "clear" collection voucherProducts trên entity để Hibernate tự xoá các bản ghi cũ
        voucher.getVoucherProducts().clear();
        // (DO NOT gọi voucherProductRepo.deleteAll(...) hay voucher.setVoucherProducts(null) ở đây)

        // 4. Nếu DTO có productIds, tạo mới các liên kết VoucherProduct và thêm vào collection
        if (dto.getProductIds() != null && !dto.getProductIds().isEmpty()) {
            List<VoucherProduct> newLinks = dto.getProductIds().stream().map(pid -> {
                Product p = productRepo.findById(pid)
                        .orElseThrow(() -> new RuntimeException("Product not found id=" + pid));
                return VoucherProduct.builder()
                        .voucher(voucher)
                        .product(p)
                        .build();
            }).collect(Collectors.toList());

            // Thêm tất cả vào collection của voucher (Hibernate sẽ persist các VoucherProduct mới)
            voucher.getVoucherProducts().addAll(newLinks);
        }

        // 5. Lưu voucher (Hibernate sẽ cascade để xoá orphans và persist các newLinks)
        voucherRepo.save(voucher);
        log.info("[End] Update Voucher successfully");
        return ResponseToData.success(mapper.toDto(voucher));
    }

    public ResponseToData<List<VoucherDTO>> getValidVouchersForCart(BigDecimal cartTotal, List<Integer> productIds) {
        log.info("[Begin] Lấy Voucher hợp lệ cho cartTotal = {} và productIds = {}", cartTotal, productIds);
        List<Voucher> all = voucherRepo.findAll();

        LocalDate today = LocalDate.now();

        // Chuyển productIds sang Set để tra nhanh
        Set<Integer> cartProdSet = productIds.stream().collect(Collectors.toSet());

        List<VoucherDTO> validDTOs = all.stream()
                // 1. Filter status (ứng với ACTIVE_STATUS)
                .filter(v -> v.getStatus() != null && v.getStatus().equals(CommonConstant.ACTIVE_STATUS))
                // 2. Filter ngày: startDate <= today <= expiryDate
                .filter(v -> {
                    if (v.getStartDate() == null || v.getExpiryDate() == null) return false;
                    return !today.isBefore(v.getStartDate()) && !today.isAfter(v.getExpiryDate());
                })
                // 3. Filter minOrderAmount <= cartTotal
                .filter(v -> {
                    if (v.getMinOrderAmount() == null) return true;
                    return cartTotal.compareTo(v.getMinOrderAmount()) >= 0;
                })
                // 4. Filter voucher áp dụng cho sản phẩm: nếu voucher.voucherProducts trống → voucher áp dụng cho toàn bộ giỏ
                //    nếu voucher.voucherProducts không trống → phải có ít nhất 1 productId trong cartProdSet
                .filter(v -> {
                    List<VoucherProduct> vpList = v.getVoucherProducts();
                    if (vpList == null || vpList.isEmpty()) {
                        // Không gắn riêng cho sản phẩm nào, nên voucher áp dụng cho toàn giỏ
                        return true;
                    }
                    // Lấy tất cả productId liên quan đến voucher
                    Set<Integer> voucherProdIds = vpList.stream()
                            .map(vp -> vp.getProduct().getId())
                            .collect(Collectors.toSet());
                    // Kiểm tra xem có giao nhau với cartProdSet không
                    for (Integer pid : cartProdSet) {
                        if (voucherProdIds.contains(pid)) {
                            return true;
                        }
                    }
                    return false;
                })
                // 5. Lọc tiếp maxRedemptions vs timesRedeemed nếu cần (đã hết lượt dùng thì loại)
                .filter(v -> {
                    if (v.getMaxRedemptions() == null || v.getTimesRedeemed() == null) {
                        return true;
                    }
                    return v.getTimesRedeemed() < v.getMaxRedemptions();
                })
                // Cuối cùng map sang DTO
                .map(mapper::toDto)
                .collect(Collectors.toList());

        log.info("[End] Danh sách Voucher hợp lệ: size = {}", validDTOs.size());
        return ResponseToData.success(validDTOs);
    }

    public ResponseToData<VoucherDTO> getVoucherById(int id){
        log.info("[Begin] Get Voucher by id {}", id);
        VoucherDTO dto = mapper.toDto(voucherRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher not found")));
        log.info("[End] Get Voucher by id successfully");
        return ResponseToData.success(dto);
    }
}
