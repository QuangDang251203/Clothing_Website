package com.example.clothing_store.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrdersDTO {
    private Integer id;
    @NotNull(message = "accountId is required")
    private int accountId;

    @NotNull(message = "Status is required")
    private int status;

    @NotNull(message = "totalPrice is required")
    private BigDecimal totalPrice;

    private int payMethod;

    private int voucherId;

    @NotNull(message = "shippingAddress is required")
    private int shippingAddressId;

    private LocalDateTime createdAt;

    private List<OrderDetailDTO> details;

}
