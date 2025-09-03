package com.example.clothing_store.response;

import com.example.clothing_store.entity.Product;
import com.example.clothing_store.enums.ProductEnums;
import lombok.Data;

@Data
public class ProductResponse {
    private String code;
    private String message;
    private Product product;
    public ProductResponse(String code, String message, Product product) {
        this.code = code;
        this.message = message;
        this.product = product;
    }
    public ProductResponse(String code, String message) {
        this.code = code;
        this.message = message;
    }
    public static ProductResponse response(ProductEnums productEnum) {
        return new ProductResponse(productEnum.getCode(), productEnum.getMessage());
    }
    public static ProductResponse fail(String code, String message) {
        return new ProductResponse(code, message);
    }
}
