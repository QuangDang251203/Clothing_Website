package com.example.clothing_store.service.ImportRecord;

import com.example.clothing_store.dto.ImportRecordDTO;
import com.example.clothing_store.entity.ImportRecord;
import com.example.clothing_store.entity.ProductVariant;
import com.example.clothing_store.mapper.ImportRecordMapper;
import com.example.clothing_store.repository.ImportRecordRepository;
import com.example.clothing_store.repository.ProductVariantRepository;
import com.example.clothing_store.response.ResponseToData;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImportRecordServiceImpl implements ImportRecordService {
    private static final Logger log = LoggerFactory.getLogger(ImportRecordServiceImpl.class);
    private final ImportRecordRepository importRecordRepo;
    private final ImportRecordMapper mapper;
    private final ProductVariantRepository productVariantRepo;

    @Transactional
    public ResponseToData<ImportRecordDTO> importGoods(ImportRecordDTO importRecordDTO) {
        log.info("[Begin]Import Good with data request: {}", importRecordDTO);
        ProductVariant variant = productVariantRepo.findBySkuCode(importRecordDTO.getSkuCode())
                .orElseThrow(() -> new RuntimeException("Product variant not found"));
        BigDecimal oldAvgCost = variant.getAverageCost();
        int oldQty = variant.getQuantity();
        BigDecimal newCostPrice = importRecordDTO.getCostPrice();
        int newQty = importRecordDTO.getQuantity();
        BigDecimal totalCostOld = oldAvgCost.multiply(BigDecimal.valueOf(oldQty));
        BigDecimal totalCostNew = newCostPrice.multiply(BigDecimal.valueOf(newQty));
        BigDecimal combinedCost = totalCostOld.add(totalCostNew);
        int combinedQty = oldQty + newQty;
        BigDecimal updatedAvgCost = combinedQty > 0
                ? combinedCost.divide(BigDecimal.valueOf(combinedQty), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        variant.setAverageCost(updatedAvgCost);
        variant.setQuantity(combinedQty);
        productVariantRepo.save(variant);
        importRecordRepo.save(mapper.toEntity(importRecordDTO));
        log.info("[End]Import Good with data request: {}", importRecordDTO);
        return ResponseToData.success(importRecordDTO);
    }

    public ResponseToData<List<ImportRecordDTO>> importLookupByProductId(int productId) {
        log.info("[Begin]Import Lookup by product id: {}", productId);
        List<ProductVariant> variants = productVariantRepo.findByProductId(productId);
        List<ImportRecordDTO> DTOs = new ArrayList<>();
        for (ProductVariant variant : variants) {
            List<ImportRecord> recs = importRecordRepo.findAllByProductVariant_SkuCode(variant.getSkuCode());
            recs.forEach(rec -> DTOs.add(mapper.toDto(rec)));
        }
        log.info("[End] Found {} import records", DTOs.size());
        return ResponseToData.success(DTOs);
    }

    public ResponseToData<List<ImportRecordDTO>> searchImportRecords(
            Integer productId,
            String skuCode,
            LocalDateTime fromDate,
            LocalDateTime toDate
    ) {
        log.info("[Begin] Search import records with productId={}, skuCode={}, from={}, to={}",
                productId, skuCode, fromDate, toDate);

        Specification<ImportRecord> spec = ImportRecordSpecs
                .filter(productId, skuCode, fromDate, toDate);

        List<ImportRecordDTO> DTOs = importRecordRepo.findAll(spec).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());

        log.info("[End] Found {} records", DTOs.size());
        return ResponseToData.success(DTOs);
    }

}
