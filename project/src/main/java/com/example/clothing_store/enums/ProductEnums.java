package com.example.clothing_store.enums;


public enum ProductEnums {
    SUCCESS("00", "Success"),
    PRODUCT_IS_EXIST("01", "Product is exist"),
    PRODUCT_IS_NOT_EXIST("03", "Product is not exist");

    private final String code;
    private final String message;
    ProductEnums(String code, String message) {
        this.code = code;
        this.message = message;
    }
    public String getCode() {
        return code;
    }
    public String getMessage() {
        return message;
    }
}
