package com.example.clothing_store.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartRequest {

    @NotNull(message = "accountId is required")
    private int accountId;

    @NotBlank(message = "skuCode is required")
    private String skuCode;

    @NotNull(message = "quantity is required")
    private int quantity;
}
