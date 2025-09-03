package com.example.clothing_store.controller;

import com.example.clothing_store.dto.PageConfig;
import com.example.clothing_store.dto.PriceUpdate;
import com.example.clothing_store.dto.ProductDTO;
import com.example.clothing_store.dto.ProductVariantDTO;
import com.example.clothing_store.response.CommonResponse;
import com.example.clothing_store.response.ResponseToData;
import com.example.clothing_store.service.Storage.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/storage")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ProductVariantController {
    private final ProductVariantService productVariantService;

    @PostMapping("/getAllVariant")
    public ResponseToData<List<ProductVariantDTO>> getAllVariant(@RequestBody PageConfig page) {
        return productVariantService.findAll(page);
    }

    @GetMapping("getVariantOfProduct/{productId}")
    public ResponseToData<List<ProductVariantDTO>> getVariantOfProduct(@PathVariable Integer productId) {
        return productVariantService.findByProductId(productId);
    }

    @PostMapping("/createProductVariant")
    public CommonResponse createProductVariant(@RequestBody ProductVariantDTO dto) {
        return productVariantService.createProductVariant(dto);
    }
    @GetMapping("/getSku/{skuCode}")
    public ResponseToData<ProductVariantDTO> getSku(@PathVariable String skuCode) {
        return productVariantService.getProductVariantBySkuCode(skuCode);
    }

    @PutMapping("/changePriceVariant/{skuCode}")
    public ResponseToData<ProductVariantDTO> changePriceVariant(@PathVariable String skuCode,@RequestBody PriceUpdate newPrice) {
        return productVariantService.changePriceVariantBySkuCode(skuCode, newPrice.getNewPrice());
    }

    @GetMapping("getProductBySkuCode/{skuCode}")
    public ResponseToData<ProductDTO> getProductBySkuCode(@PathVariable String skuCode) {
        return productVariantService.getProductBySkuCode(skuCode);
    }

}
