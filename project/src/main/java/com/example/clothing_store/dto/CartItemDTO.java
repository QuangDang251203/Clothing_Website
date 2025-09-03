package com.example.clothing_store.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CartItemDTO {

    @NotNull(message = "cartId is required")
    private int cartId;

    @NotBlank(message = "skuCode is required")
    private String skuCode;

    @NotNull(message = "quantity is required")
    private int quantity;

}
