package com.example.clothing_store.dto;

import lombok.Data;

@Data
public class PaymentResDTO implements java.io.Serializable{
    private String status;
    private String message;
    private String url;
}
