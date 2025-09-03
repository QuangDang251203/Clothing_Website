package com.example.clothing_store.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailDTO {
    private Integer id;

    @NotNull(message = "orderId is required")
    private int orderId;

    @NotBlank(message = "skuCode is required")
    private String skuCode;

    @NotNull(message = "quantity is required")
    private int quantity;

    @NotNull(message = "price is required")
    private BigDecimal price;

    private boolean reviewed;
}
