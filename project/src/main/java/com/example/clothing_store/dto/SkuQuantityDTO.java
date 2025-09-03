package com.example.clothing_store.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SkuQuantityDTO {
    private String skuCode;
    private int quantity;
}
