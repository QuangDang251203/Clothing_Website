package com.example.clothing_store.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class PendingOrderDTO {
    private int accountId;
    private int shippingAddressId;
    private String voucherCode;      // có thể null hoặc ""
    private BigDecimal totalBefore;  // tổng tiền trước giảm
    private BigDecimal discount;     // số tiền giảm
    private BigDecimal totalAfter;   // số tiền phải thanh toán
    private List<CartItemData> items; // tạm đóng gói danh sách CartItem

    @Data
    @AllArgsConstructor
    public static class CartItemData {
        private String skuCode;
        private int quantity;
        private BigDecimal price; // giá từng item
    }
}
