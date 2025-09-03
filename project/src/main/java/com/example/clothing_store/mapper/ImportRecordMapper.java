package com.example.clothing_store.mapper;

import com.example.clothing_store.dto.ImportRecordDTO;
import com.example.clothing_store.entity.ImportRecord;
import com.example.clothing_store.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ImportRecordMapper {
    private final ProductVariantRepository productVariantRepo;
    public ImportRecord toEntity(ImportRecordDTO dto){
        return ImportRecord.builder()
                .productVariant(productVariantRepo.findBySkuCode(dto.getSkuCode())
                        .orElseThrow(() -> new RuntimeException("Product variant not found")))
                .quantity(dto.getQuantity())
                .costPrice(dto.getCostPrice())
                .createdAt(dto.getCreatedAt())
                .build();
    }

    public ImportRecordDTO toDto(ImportRecord entity){
        return ImportRecordDTO.builder()
                .skuCode(entity.getProductVariant().getSkuCode())
                .quantity(entity.getQuantity())
                .costPrice(entity.getCostPrice())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
