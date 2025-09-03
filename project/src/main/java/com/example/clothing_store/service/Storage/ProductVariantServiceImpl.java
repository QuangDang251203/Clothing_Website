package com.example.clothing_store.service.Storage;

import com.example.clothing_store.dto.PageConfig;
import com.example.clothing_store.dto.ProductDTO;
import com.example.clothing_store.dto.ProductVariantDTO;
import com.example.clothing_store.entity.ProductVariant;
import com.example.clothing_store.enums.CommonEnums;
import com.example.clothing_store.mapper.ProductMapper;
import com.example.clothing_store.mapper.ProductVariantMapper;
import com.example.clothing_store.repository.ProductRepository;
import com.example.clothing_store.repository.ProductVariantRepository;
import com.example.clothing_store.response.CommonResponse;
import com.example.clothing_store.response.ResponseToData;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductVariantServiceImpl implements ProductVariantService {
    private static final Logger log = LoggerFactory.getLogger(ProductVariantServiceImpl.class);
    private final ProductVariantRepository productVariantRepo;
    private final ProductVariantMapper mapper;
    private final ProductRepository productRepo;
    private final ProductMapper productMapper;

    public ResponseToData<List<ProductVariantDTO>> findAll(PageConfig page) {
        log.info("[Begin] Get All Storage: {}", page);
        PageRequest pageConfig = PageRequest.of(page.getPage() - 1, page.getRow());
        Page<ProductVariant> variants = productVariantRepo.findAll(pageConfig);
        log.info("[End] Get All Storage: {}", variants.getTotalElements());
        List<ProductVariantDTO> DTOs = variants.getContent().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
        return ResponseToData.success(DTOs);
    }

    public ResponseToData<List<ProductVariantDTO>> findByProductId(int productId) {
        log.info("[Begin] Get All product variants with id product:{}", productId);
        List<ProductVariant> variants = productVariantRepo.findByProductId(productId);
        List<ProductVariantDTO> DTOs = variants.stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
        log.info("[End] Size of list product variants: {}", DTOs.size());
        return ResponseToData.success(DTOs);
    }

    public CommonResponse createProductVariant(ProductVariantDTO dto) {
        log.info("[Begin] Create product variant {}", dto);
        if (productRepo.findById(dto.getProductId()).isEmpty()) {
            throw new RuntimeException("Product not found");
        }
        boolean checkExisting = productVariantRepo.existsBySkuCode(dto.getSkuCode());
        if (checkExisting) {
            log.info("Sku Code is existing");
            return CommonResponse.response(CommonEnums.CODE_IS_EXIST);
        }
        log.info("SKU Code does not exist");
        ProductVariant productVariant = mapper.toEntity(dto);
        productVariantRepo.save(productVariant);
        log.info("[End]Product variant created");
        return CommonResponse.response(CommonEnums.SUCCESS);
    }

    public ResponseToData<ProductVariantDTO> getProductVariantBySkuCode(String skuCode) {
        log.info("[Begin] Get product variant by sku code {}", skuCode);
        ProductVariantDTO dto = mapper.toDto(productVariantRepo.findBySkuCode(skuCode)
                .orElseThrow(() -> new RuntimeException("Product variant not found")));
        log.info("[End] Get product by sku code successfully");
        return ResponseToData.success(dto);
    }

    public ResponseToData<ProductDTO> getProductBySkuCode(String skuCode) {
        log.info("[Begin] Get product by sku code {}", skuCode);
        ProductVariantDTO variantDTO = getProductVariantBySkuCode(skuCode).getData();
        return ResponseToData.success(productMapper
                .toDto(productRepo.findById(variantDTO.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found"))));
    }

    public ResponseToData<ProductVariantDTO> changePriceVariantBySkuCode(String skuCode, BigDecimal price ) {
        log.info("[Begin] Change price Variant by SkuCode {}", skuCode);
        ProductVariant existing = productVariantRepo.findBySkuCode(skuCode)
                .orElseThrow(() -> new RuntimeException("Product variant not found"));
        existing.setPrice(price);
        ProductVariant saved = productVariantRepo.save(existing);

        // 4. Trả về DTO
        return ResponseToData.success(mapper.toDto(saved));
    }
}
