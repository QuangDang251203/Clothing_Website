package com.example.clothing_store.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ImportRecordDTO {

    @NotBlank(message = "SKU Code is required")
    private String skuCode;

    @NotNull(message = "Quantity is required")
    @Min(value = 1,message = "Quantity import must be greater than 1")
    private int quantity;

    @NotNull(message = "Cost price is required")
    @Min(value = 1000,message = "Cost must be valid")
    private BigDecimal costPrice;

    private LocalDateTime createdAt;
}
