package com.example.clothing_store.controller;

import com.example.clothing_store.config.Config;
import com.example.clothing_store.dto.PaymentResDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {
    @GetMapping("/createPayment")
    public ResponseEntity<?> createPayment(HttpServletRequest request) throws UnsupportedEncodingException {
        String orderType = "other";
        long amount = 100000;
        String vnp_TxnRef = Config.getRandomNumber(8);
        String vnp_TmnCode = Config.vnp_TmnCode;
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", Config.vnp_Version);
        vnp_Params.put("vnp_Command", Config.vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_BankCode", "NCB");
        vnp_Params.put("vnp_Amount", String.valueOf(amount * 100));

        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang: " + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", Config.vnp_ReturnUrl);

        String clientIP = Config.getIpAddress(request);
        vnp_Params.put("vnp_IpAddr", clientIP);


        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);


        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);


        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData   = new StringBuilder();
        StringBuilder query      = new StringBuilder();
        Iterator<String> itr     = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && fieldValue.length() > 0) {

                hashData.append(fieldName)
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));


                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()))
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                if (itr.hasNext()) {
                    hashData.append('&');
                    query.append('&');
                }
            }
        }
        String vnp_SecureHash = Config.hmacSHA512(Config.secretKey, hashData.toString());
        String queryUrl = query.toString() + "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = Config.vnp_PayUrl + "?" + queryUrl;
        PaymentResDTO paymentResDTO = new PaymentResDTO();
        paymentResDTO.setStatus("00");
        paymentResDTO.setMessage("Success");
        paymentResDTO.setUrl(paymentUrl);
        return ResponseEntity.status(HttpStatus.OK).body(paymentResDTO);
    }
    @GetMapping("/return")
    public ResponseEntity<String> paymentReturn(HttpServletRequest request) {
        String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");
        String vnp_SecureHash   = request.getParameter("vnp_SecureHash");
        if ("00".equals(vnp_ResponseCode)) {
            return ResponseEntity.ok("Thanh toán thành công!");
        } else {
            return ResponseEntity.ok("Thanh toán thất bại! Code = " + vnp_ResponseCode);
        }
    }
}
