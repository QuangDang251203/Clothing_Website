package com.example.clothing_store.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PriceUpdate {
    private BigDecimal newPrice;
}
