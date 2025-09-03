package com.example.clothing_store.service.Account;

import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {
    private final Map<String, OtpEntry> otpStorage = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    public String generateOtp(String key) {
        String otp = String.format("%06d", random.nextInt(1_000_000));
        long expiry = System.currentTimeMillis() + 5 * 60_000;
        otpStorage.put(key, new OtpEntry(otp, expiry));
        return otp;
    }

    /** Chỉ kiểm tra xem mã có đúng & còn hạn không, KHÔNG xoá entry */
    public boolean validateOtp(String key, String otp) {
        OtpEntry entry = otpStorage.get(key);
        return entry != null
                && entry.expiry >= System.currentTimeMillis()
                && entry.otp.equals(otp);
    }

    /** Xoá mã khỏi storage (gọi khi reset-password thành công) */
    public void consumeOtp(String key) {
        otpStorage.remove(key);
    }

    private static class OtpEntry {
        final String otp;
        final long expiry;
        OtpEntry(String otp, long expiry) { this.otp = otp; this.expiry = expiry; }
    }
}
