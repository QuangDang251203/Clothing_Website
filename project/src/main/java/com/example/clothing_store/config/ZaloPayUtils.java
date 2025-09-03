package com.example.clothing_store.config;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

public class ZaloPayUtils {

    /** Sinh HMAC SHA256 và encode Base64 */
    public static String hmacSHA256(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            // Chuyển bytes sang chuỗi HEX
            StringBuilder sb = new StringBuilder(2 * rawHmac.length);
            for (byte b : rawHmac) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error when calculating HMAC SHA256", e);
        }
    }
}
