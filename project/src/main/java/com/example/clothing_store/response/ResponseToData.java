package com.example.clothing_store.response;

import com.example.clothing_store.constant.CommonConstant;
import com.example.clothing_store.dto.OrdersDTO;
import com.example.clothing_store.enums.CommonEnums;
import lombok.Data;

@Data

public class ResponseToData<T> {
    private String code;
    private String message;
    private T data;

    public ResponseToData(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public ResponseToData(String code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public static <T> ResponseToData<T> success(T data) {
        return new ResponseToData<>(CommonConstant.SUCCESS, CommonConstant.SUCCESS_MESSAGE, data);
    }

    public static <T> ResponseToData<T> failExist(CommonEnums enums) {
        return new ResponseToData<>(enums.getCode(),enums.getMessage());
    }

    public static <T> ResponseToData<T> failGetProductTop() {
        return new ResponseToData<>(CommonConstant.ERROR,CommonConstant.FAIL_GET_PRODUCT_TOP);
    }

    public static <T> ResponseToData<T> fail(CommonEnums enums) {
        return new ResponseToData<>(enums.getCode(),enums.getMessage());
    }
    public static <T> ResponseToData<T> failReview(String message) {
        return new ResponseToData<>("ERROR",message);
    }

}

