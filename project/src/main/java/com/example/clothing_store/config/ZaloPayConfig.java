package com.example.clothing_store.config;

public class ZaloPayConfig {
    public static final String BASE_URL = "http://localhost:8080";
    public static final String APP_ID        = "2554";
    public static final String KEY1          = "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn";   // để sign request tạo đơn
    public static final String KEY2          = "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf";   // để verify callback
    public static final String CREATE_ORDER_ENDPOINT = "https://sb-openapi.zalopay.vn/v2/create";
    public static final String QUERY_ORDER_ENDPOINT  = "https://sb-openapi.zalopay.vn/v2/query";
    public static final String CALLBACK_URL = BASE_URL + "/orders/zaloPay/callback";
}
