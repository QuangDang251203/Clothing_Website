package com.example.clothing_store.security;

import com.example.clothing_store.entity.Account;
import com.example.clothing_store.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.*;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    private final AccountRepository accountRepo;
    private final PasswordEncoder encoder;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest req) throws OAuth2AuthenticationException {
        OAuth2User user = new DefaultOAuth2UserService().loadUser(req);
        Map<String, Object> attrs = user.getAttributes();
        String email = (String) attrs.get("email");
        String name  = (String) attrs.get("name");

        // Tạo account nếu chưa có
        accountRepo.findByPhone(email).orElseGet(() -> {
            Account acc = new Account();
            acc.setPhone(email);
            acc.setEmail(email);
            acc.setFullName(name);
            acc.setPass(encoder.encode(UUID.randomUUID().toString()));
            return accountRepo.save(acc);
        });

        return new CustomOAuth2User(attrs);
    }
}
