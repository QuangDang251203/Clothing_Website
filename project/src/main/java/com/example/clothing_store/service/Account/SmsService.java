package com.example.clothing_store.service.Account;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

@Service
public class SmsService {
    @Value("${twilio.account.sid}")
    private String accountSid;
    @Value("${twilio.auth.token}")
    private String authToken;
    @Value("${twilio.phone.number}")
    private String twilioPhoneNumber;

    public void sendOtp(String rawPhone, String otp) {
        String to;
        if (rawPhone.startsWith("0")) {
            to = "+84" + rawPhone.substring(1);
        } else if (rawPhone.startsWith("+")) {
            to = rawPhone;
        } else {
            // nếu đã lưu có mã quốc gia nhưng thiếu dấu +
            to = "+" + rawPhone;
        }

        Twilio.init(accountSid, authToken);
        Message.creator(
                new PhoneNumber(to),
                new PhoneNumber(twilioPhoneNumber),
                "Your OTP code is: " + otp
        ).create();
    }
}
