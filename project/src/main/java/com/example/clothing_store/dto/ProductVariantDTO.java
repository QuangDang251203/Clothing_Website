package com.example.clothing_store.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductVariantDTO {
    private Integer productId;

    private String size;
    private String color;

    @NotBlank(message = "skuCode is required")
    private String skuCode;

    @NotNull(message = "price is required")
    @Min(value = 1000, message = "product must be over 1000")
    private BigDecimal price;

    private BigDecimal averageCost;

    @NotNull(message = "quantity is required")
    private Integer quantity;
}
