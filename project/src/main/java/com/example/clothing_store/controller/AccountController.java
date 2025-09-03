package com.example.clothing_store.controller;

import com.example.clothing_store.dto.*;
import com.example.clothing_store.response.CommonResponse;
import com.example.clothing_store.response.ResponseToData;
import com.example.clothing_store.service.Account.AccountService;
import com.example.clothing_store.service.Account.OtpService;
import com.example.clothing_store.service.Account.SmsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000",
        allowCredentials = "true" )
@RequiredArgsConstructor
public class AccountController {
    private final AccountService accountService;
    private final SmsService smsService;
    private final OtpService otpService;


    @PostMapping("/register")
    public ResponseEntity<?> createAccount(@Valid @RequestBody RegisterRequest req) {
        accountService.register(req);
        return ResponseEntity.ok("Account created successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        AuthResponse resp = accountService.login(req);
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/changeInfoAccount")
    public ResponseEntity<CommonResponse> updateProfile(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody ProfileUpdateRequest req) {
        CommonResponse resp = accountService.updateProfile(user.getUsername(), req);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/getPageAccount")
    public List<AccountDTO> getPageAccount(@RequestBody PageConfig pageConfig) {
        return accountService.getAllAccounts(pageConfig);
    }

    @GetMapping("/me")
    public ResponseToData<AccountDTO> getCurrentProfile(@AuthenticationPrincipal UserDetails user) {
        return accountService.getAccountByPhone(user.getUsername());
    }

    @PutMapping("/changePassword")
    public ResponseEntity<CommonResponse> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest req) {
        // Gọi service để xử lý đổi mật khẩu
        CommonResponse resp = accountService.changePassword(
                userDetails.getUsername(), // phone (username) của account đang login
                req.getOldPassword(),
                req.getNewPassword(),
                req.getEmail());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/admin/staff")
    public ResponseEntity<?> createStaff(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody RegisterRequest req) {
        String requesterPhone = (user != null) ? user.getUsername() : null;
        accountService.createStaff(req, requesterPhone);
        return ResponseEntity.ok("Staff account created successfully");
    }

    /**
     * Lấy danh sách tất cả STAFF.
     * Yêu cầu Authorization: Bearer <JWT của ADMIN>
     */
    @GetMapping("/admin/staff")
    public ResponseEntity<List<AccountDTO>> getAllStaff() {
        List<AccountDTO> staffList = accountService.getAllStaff();
        return ResponseEntity.ok(staffList);
    }

    @DeleteMapping("/admin/staff/{id}")
    public ResponseEntity<CommonResponse> deleteStaff(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Integer id) {
        String requesterPhone = (user != null) ? user.getUsername() : null;
        CommonResponse resp = accountService.deleteStaff(id, requesterPhone);
        return ResponseEntity.ok(resp);
    }
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest request) {
        try {
            AuthResponse resp = accountService.googleLogin(request.getIdToken());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Google authentication failed: " + e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String phone) {
        // 1. Kiểm tra user tồn tại
        if (accountService.findByPhone(phone).isEmpty()) {
            return ResponseEntity.badRequest().body("Số điện thoại không đăng ký");
        }
        // 2. Sinh OTP & gửi SMS
        String otp = otpService.generateOtp(phone);
        smsService.sendOtp(phone, otp);
        return ResponseEntity.ok("Đã gửi mã OTP về số " + phone);
    }

    /** Bước 2: Xác thực OTP */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam String phone,
                                       @RequestParam String otp) {
        if (!otpService.validateOtp(phone, otp)) {
            return ResponseEntity.badRequest().body("OTP không hợp lệ hoặc đã hết hạn");
        }
        return ResponseEntity.ok("Xác thực OTP thành công");
    }

    /** Bước 3: Đặt lại mật khẩu */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String phone,
                                           @RequestParam String otp,
                                           @RequestParam String newPassword) {
        // Xác thực OTP lần cuối
        if (!otpService.validateOtp(phone, otp)) {
            return ResponseEntity.badRequest().body("OTP không hợp lệ hoặc đã hết hạn");
        }
        otpService.consumeOtp(phone);
        // Cập nhật mật khẩu
        accountService.updatePasswordByPhone(phone, newPassword);
        return ResponseEntity.ok("Đổi mật khẩu thành công");
    }
}
