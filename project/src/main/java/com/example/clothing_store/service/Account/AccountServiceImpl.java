package com.example.clothing_store.service.Account;

import com.example.clothing_store.dto.*;
import com.example.clothing_store.entity.Account;
import com.example.clothing_store.enums.CommonEnums;
import com.example.clothing_store.enums.Role;
import com.example.clothing_store.mapper.AccountMapper;
import com.example.clothing_store.repository.AccountRepository;
import com.example.clothing_store.response.CommonResponse;
import com.example.clothing_store.response.ResponseToData;
import com.example.clothing_store.security.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {
    private static final Logger log = LoggerFactory.getLogger(AccountServiceImpl.class);

    private final AccountRepository accountRepository;
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder encoder;
    private final UserDetailsService uds;

    @Value("${google.client.id:482894447090-ankg3lek3omga75bt9b22na2ce5jcpfu.apps.googleusercontent.com}")
    private String googleClientId;

    public void register(RegisterRequest req) {
        log.info("[Begin] register with data request: {}", req);
        if (accountRepository.findByPhone(req.getPhone()).isPresent()) {
            throw new RuntimeException("Phone already in use");
        }
        Account acc = AccountMapper.toEntity(req, encoder);
        accountRepository.save(acc);
    }

    public AuthResponse login(LoginRequest req) {
        log.info("[Begin] login with data request: {}", req);
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getPhone(), req.getPass())
        );
        UserDetails user = uds.loadUserByUsername(req.getPhone());
        String token = jwtUtil.generateToken(user.getUsername());
        Account acc = accountRepository.findByPhone(req.getPhone()).get();
        // Sửa: getUsername() trả về phone, nên dùng getFullName() để lấy tên
        return new AuthResponse(token, acc.getAccountCode(), acc.getFullName());
    }

    @Override
    @Transactional
    public AuthResponse googleLogin(String idToken) {
        log.info("[Begin] googleLogin with idToken");
        try {
            // Verify token using Google's tokeninfo endpoint
            Map<String, Object> tokenInfo = verifyGoogleToken(idToken);

            if (tokenInfo == null || !googleClientId.equals(tokenInfo.get("aud"))) {
                throw new RuntimeException("Invalid Google ID token");
            }

            String email = (String) tokenInfo.get("email");
            String name = (String) tokenInfo.get("name");
            String googleId = (String) tokenInfo.get("sub");

            log.info("Google user info - email: {}, name: {}, googleId: {}", email, name, googleId);

            // Find or create account from Google info
            Account account = findOrCreateGoogleAccount(email, name, googleId);

            // Generate JWT token
            String jwtToken = jwtUtil.generateToken(account.getPhone());

            log.info("[End] googleLogin successfully for user: {}", email);
            // Sửa: dùng getFullName() thay vì getUsername()
            return new AuthResponse(jwtToken, account.getAccountCode(), account.getFullName());

        } catch (Exception e) {
            log.error("Google login failed", e);
            throw new RuntimeException("Google authentication failed: " + e.getMessage());
        }
    }

    private Map<String, Object> verifyGoogleToken(String idToken) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            // Check if token is valid
            if (response != null && response.containsKey("email")) {
                return response;
            }

            return null;
        } catch (Exception e) {
            log.error("Error verifying Google token", e);
            return null;
        }
    }

    private Account findOrCreateGoogleAccount(String email, String name, String googleId) {
        // Find account by email
        Optional<Account> existingByEmail = accountRepository.findByEmail(email);

        if (existingByEmail.isPresent()) {
            Account account = existingByEmail.get();
            // Update googleId if not set
            if (account.getGoogleId() == null || account.getGoogleId().isEmpty()) {
                account.setGoogleId(googleId);
                accountRepository.save(account);
            }
            return account;
        }

        // Find account by googleId
        Optional<Account> existingByGoogleId = accountRepository.findByGoogleId(googleId);
        if (existingByGoogleId.isPresent()) {
            return existingByGoogleId.get();
        }

        // Create new account from Google
        Account newAccount = Account.builder()
                .email(email)
                .fullName(name)  // Sửa: dùng setFullName() thay vì setUsername()
                .googleId(googleId)
                .phone(generatePhoneFromEmail(email))
                .pass(encoder.encode("google_user_" + System.currentTimeMillis()))
                .accountCode("ACC" + System.currentTimeMillis())
                .roles(new HashSet<>(Collections.singletonList(Role.ROLE_USER)))
                .build();

        Account saved = accountRepository.save(newAccount);
        log.info("Created new Google account for email: {}", email);
        return saved;
    }

    private String generatePhoneFromEmail(String email) {
        String emailPrefix = email.split("@")[0].replaceAll("[^0-9]", "");
        if (emailPrefix.length() >= 10) {
            emailPrefix = emailPrefix.substring(0, 10);
        } else {
            emailPrefix = emailPrefix + "0000000000".substring(emailPrefix.length());
        }

        String phone = emailPrefix;
        int counter = 1;
        while (accountRepository.findByPhone(phone).isPresent()) {
            phone = emailPrefix + counter;
            counter++;
        }

        return phone;
    }

    @Transactional
    public CommonResponse updateProfile(String phone, ProfileUpdateRequest req) {
        Account acc = accountRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        if (req.getPass() != null && !req.getPass().isBlank()) {
            acc.setPass(encoder.encode(req.getPass()));
        }
        acc.setEmail(req.getEmail());
        acc.setGender(req.getGender());
        acc.setBirthday(req.getBirthday());
        // Sửa: dùng setFullName() thay vì setUsername()
        acc.setFullName(req.getUsername());
        accountRepository.save(acc);
        return CommonResponse.response(CommonEnums.SUCCESS);
    }

    public List<AccountDTO> getAllAccounts(PageConfig page) {
        log.info("[Begin] getAllAccounts with data request: {}", page);
        PageRequest pageRequest = PageRequest.of(page.getPage() - 1, page.getRow());
        Page<Account> accounts = accountRepository.findAll(pageRequest);
        log.info("[End] getAllAccounts successfully with size: {}", accounts.getTotalElements());
        return accounts.getContent().stream().map(AccountMapper::toDTO).collect(Collectors.toList());
    }

    public ResponseToData<AccountDTO> getAccountByPhone(String phone) {
        log.info("[Begin] getAccountByPhone with data request: {}", phone);
        Account acc = accountRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        log.info("[End] getAccountByPhone successfully");
        return ResponseToData.success(AccountMapper.toDTO(acc));
    }

    @Transactional
    public CommonResponse changePassword(String phone, String oldPassword, String newPassword, String email) {
        Account acc = accountRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (!acc.getEmail().equalsIgnoreCase(email)) {
            return CommonResponse.response(CommonEnums.FAIL_CHANGE_PASS);
        }

        if (!encoder.matches(oldPassword, acc.getPass())) {
            return CommonResponse.response(CommonEnums.FAIL_CHANGE_PASS);
        }

        acc.setPass(encoder.encode(newPassword));
        accountRepository.save(acc);

        return CommonResponse.response(CommonEnums.SUCCESS);
    }

    @Override
    public void createStaff(RegisterRequest req, String requesterPhone) {
        log.info("[Begin] createStaff with data request: {}", req);
        if (requesterPhone == null) {
            throw new RuntimeException("Unauthorized: only ADMIN can create STAFF");
        }
        Account requester = accountRepository.findByPhone(requesterPhone)
                .orElseThrow(() -> new RuntimeException("Requester not found"));
        if (!requester.getRoles().contains(Role.ROLE_ADMIN)) {
            throw new RuntimeException("Unauthorized: only ADMIN can create STAFF");
        }

        if (accountRepository.findByPhone(req.getPhone()).isPresent()) {
            throw new RuntimeException("Phone already in use");
        }

        Account acc = AccountMapper.toEntity(req, encoder);
        acc.getRoles().add(Role.ROLE_STAFF);
        accountRepository.save(acc);
        log.info("[End] createStaff success");
    }

    @Override
    public List<AccountDTO> getAllStaff() {
        log.info("[Begin] getAllStaff");
        List<Account> staffList = accountRepository.findByRole(Role.ROLE_STAFF);
        List<AccountDTO> dtoList = staffList.stream()
                .map(AccountMapper::toDTO)
                .collect(Collectors.toList());
        log.info("[End] getAllStaff size={}", dtoList.size());
        return dtoList;
    }

    @Override
    public CommonResponse deleteStaff(Integer id, String requesterPhone) {
        log.info("[Begin] deleteStaff id={} by requester={}", id, requesterPhone);
        if (requesterPhone == null) {
            return CommonResponse.response(CommonEnums.FAIL_UNAUTHORIZED);
        }
        Account requester = accountRepository.findByPhone(requesterPhone)
                .orElseThrow(() -> new RuntimeException("Requester not found"));
        if (!requester.getRoles().contains(Role.ROLE_ADMIN)) {
            return CommonResponse.response(CommonEnums.FAIL_UNAUTHORIZED);
        }
        Account toDelete = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        if (!toDelete.getRoles().contains(Role.ROLE_STAFF)) {
            return CommonResponse.response(CommonEnums.FAIL_UNAUTHORIZED);
        }
        accountRepository.delete(toDelete);
        log.info("[End] deleteStaff success id={}", id);
        return CommonResponse.response(CommonEnums.SUCCESS);
    }

    @Override
    @Transactional
    public void updatePasswordByPhone(String phone, String rawPassword) {
        Account acc = accountRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        acc.setPass(encoder.encode(rawPassword));
        accountRepository.save(acc);
    }

    @Override
    public Optional<Account> findByPhone(String phone) {
        return accountRepository.findByPhone(phone);
    }
}
