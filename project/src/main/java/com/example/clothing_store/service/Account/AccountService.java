package com.example.clothing_store.service.Account;

import com.example.clothing_store.dto.*;
import com.example.clothing_store.entity.Account;
import com.example.clothing_store.response.CommonResponse;
import com.example.clothing_store.response.ResponseToData;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public interface AccountService {
    void register(RegisterRequest req);

    AuthResponse login(LoginRequest req);

    AuthResponse googleLogin(String idToken);

    CommonResponse updateProfile(String phone, ProfileUpdateRequest req);

    List<AccountDTO> getAllAccounts(PageConfig page);

    ResponseToData<AccountDTO> getAccountByPhone(String phone);

    CommonResponse changePassword(String phone, String oldPassword, String newPassword, String email);

    void createStaff(RegisterRequest req, String requesterPhone);

    List<AccountDTO> getAllStaff();

    CommonResponse deleteStaff(Integer id, String requesterPhone);

    void updatePasswordByPhone(String phone, String rawPassword);

    Optional<Account> findByPhone(String phone);
}
