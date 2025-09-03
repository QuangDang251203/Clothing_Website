package com.example.clothing_store.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopSellingProductDTO {
    private String skuCode;
    private long totalSold;
}
