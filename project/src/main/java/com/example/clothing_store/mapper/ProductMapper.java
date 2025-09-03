package com.example.clothing_store.mapper;

import com.example.clothing_store.dto.ProductDTO;
import com.example.clothing_store.dto.ProductImageDTO;
import com.example.clothing_store.dto.ProductVariantDTO;
import com.example.clothing_store.entity.Product;
import com.example.clothing_store.entity.ProductImage;
import com.example.clothing_store.entity.ProductVariant;
import com.example.clothing_store.repository.ProductImageRepository;
import com.example.clothing_store.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProductMapper {
    private final ProductRepository productRepo;
    private final ProductImageRepository productImageRepo;

    public Product toEntity(ProductDTO dto) {
        Product product = Product.builder()
                .productCode(dto.getProductCode())
                .productName(dto.getProductName())
                .description(dto.getDescription())
                .numberOfPurchase(dto.getNumberOfPurchase())
                .status(dto.getStatus())
                .category(dto.getCategory())
                .build();
        dto.getVariants().forEach(variant -> {
            product.getVariants().add(
                    ProductVariant.builder()
                            .product(product)
                            .color(variant.getColor())
                            .price(variant.getPrice())
                            .averageCost(variant.getPrice())
                            .size(variant.getSize())
                            .skuCode(variant.getSkuCode())
                            .quantity(variant.getQuantity())
                            .build()
            );
        });
        return product;
    }

    public ProductDTO toDto(Product product) {
        List<ProductImageDTO> imageDTOS = product.getImages()
                .stream().
                map(img -> ProductImageDTO.builder()
                        .productId(product.getId())
                        .url(img.getUrl())
                        .build())
                .collect(Collectors.toList());
//        List<ProductVariantDTO> variants = product.getVariants().stream()
//                .map(v -> ProductVariantDTO.builder()
//                        .productId(product.getId())
//                        .size(v.getSize())
//                        .quantity(v.getQuantity())
//                        .color(v.getColor())
//                        .price(v.getPrice())
//                        .skuCode(v.getSkuCode())
//                        .build())
//                .collect(Collectors.toList());
        return ProductDTO.builder()
                .id(product.getId())
                .productCode(product.getProductCode())
                .productName(product.getProductName())
                .description(product.getDescription())
                .numberOfPurchase(product.getNumberOfPurchase())
                .status(product.getStatus())
                .category(product.getCategory())
                .imageURLs(imageDTOS)
//                .variants(variants)
                .build();
    }

}
