package com.example.clothing_store.service.Storage;

import com.example.clothing_store.dto.PageConfig;
import com.example.clothing_store.dto.ProductDTO;
import com.example.clothing_store.dto.ProductVariantDTO;
import com.example.clothing_store.response.CommonResponse;
import com.example.clothing_store.response.ResponseToData;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public interface ProductVariantService {
    ResponseToData<List<ProductVariantDTO>> findAll(PageConfig page);

    ResponseToData<List<ProductVariantDTO>> findByProductId(int productId);

    CommonResponse createProductVariant(ProductVariantDTO dto);

    ResponseToData<ProductVariantDTO> getProductVariantBySkuCode(String skuCode);

    ResponseToData<ProductDTO> getProductBySkuCode(String skuCode);

    ResponseToData<ProductVariantDTO> changePriceVariantBySkuCode(String skuCode, BigDecimal price);
}
