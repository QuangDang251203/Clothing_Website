package com.example.clothing_store.mapper;

import com.example.clothing_store.dto.ProductVariantDTO;
import com.example.clothing_store.entity.ProductVariant;
import com.example.clothing_store.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProductVariantMapper {
    private final ProductRepository productRepo;

    public ProductVariant toEntity(ProductVariantDTO dto) {
        return ProductVariant.builder()
                .product(productRepo.findById(dto.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found")))
                .size(dto.getSize())
                .color(dto.getColor())
                .skuCode(dto.getSkuCode())
                .price(dto.getPrice())
                .averageCost(dto.getPrice())
                .quantity(dto.getQuantity())
                .build();
    }
    public ProductVariantDTO toDto(ProductVariant entity) {
        return ProductVariantDTO.builder()
                .productId(entity.getProduct().getId())
                .size(entity.getSize())
                .color(entity.getColor())
                .skuCode(entity.getSkuCode())
                .price(entity.getPrice())
                .averageCost(entity.getAverageCost())
                .quantity(entity.getQuantity())
                .build();
    }
}
