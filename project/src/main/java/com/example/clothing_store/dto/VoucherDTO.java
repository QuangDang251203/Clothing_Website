package com.example.clothing_store.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VoucherDTO {
    @NotBlank(message = "voucherCode is required")
    private String voucherCode;

    private Integer status;

    private String des;

    @NotNull @DecimalMin("0.0")
    private BigDecimal voucherValue;

    private LocalDate startDate;
    private LocalDate expiryDate;

    private Boolean isPercentage;

    @NotNull(message = "Min order amount is required")
    private BigDecimal minOrderAmount;

    @NotNull(message = "Max discount amount is required")
    private BigDecimal maxDiscountAmount;

    @NotNull(message = "Max redemptions is required")
    private Integer maxRedemptions;

    private Integer timesRedeemed;

    private List<Integer> productIds;
}

