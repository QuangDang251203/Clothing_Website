package com.example.clothing_store.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartDTO {

    @NotNull(message = "accountId is required")
    private int accountId;

    private BigDecimal totalPrice;
    private List<CartItemDTO> items;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
