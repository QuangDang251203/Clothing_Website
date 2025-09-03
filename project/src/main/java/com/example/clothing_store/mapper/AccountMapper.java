package com.example.clothing_store.mapper;

import com.example.clothing_store.dto.AccountDTO;
import com.example.clothing_store.dto.RegisterRequest;
import com.example.clothing_store.entity.Account;
import com.example.clothing_store.enums.Role;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class AccountMapper {
    private static final ModelMapper modelMapper = new ModelMapper();
    public static AccountDTO toDTO(Account account) {
        Set<String> roleStrings = account.getRoles().stream()
                .map(Role::name).collect(Collectors.toSet());
        AccountDTO dto = new AccountDTO();
        dto.setId(account.getId());
        dto.setAccountCode(account.getAccountCode());
        dto.setEmail(account.getEmail());
        dto.setBirthday(account.getBirthday());
        dto.setGender(account.getGender());
        dto.setUsername(account.getFullName());
        dto.setRoles(roleStrings);
        dto.setPhone(account.getPhone());           // đẩy phone vào DTO
        // thường không đề xuất trả pass về frontend, nhưng nếu muốn,
        // có thể setPass(rỗng) hoặc dùng @JsonProperty(access = Access.WRITE_ONLY) để ẩn
        dto.setPass("");
        return dto;
    }
    public static Account toEntity(RegisterRequest req, PasswordEncoder encoder) {
        Account acc = Account.builder()
                .accountCode(UUID.randomUUID().toString())
                .phone(req.getPhone())
                .pass(encoder.encode(req.getPass()))
                .email(req.getEmail())
                .gender(req.getGender())
                .birthday(req.getBirthday())
                .fullName(req.getUsername())
                // Builder.Default đã khởi tạo roles = {ROLE_USER}, ta sẽ chỉnh lại sau nếu cần
                .build();

        // Nếu client chỉ định role "ROLE_STAFF", gán đúng set<Role>
        if (req.getRole() != null && req.getRole().equals(Role.ROLE_STAFF.name())) {
            acc.setRoles(new HashSet<>(Collections.singletonList(Role.ROLE_STAFF)));
        } else {
            // Mặc định USER (Builder.Default đã gán rồi, nhưng đảm bảo)
            acc.setRoles(new HashSet<>(Collections.singletonList(Role.ROLE_USER)));
        }

        return acc;
    }
    public static void updateEntity(AccountDTO accountDTO, Account account) {
        account.setPhone(accountDTO.getPhone());
        account.setEmail(accountDTO.getEmail());
        account.setBirthday(accountDTO.getBirthday());
        account.setGender(accountDTO.getGender());
        account.setFullName(accountDTO.getUsername());
        account.setPass(accountDTO.getPass());
    }

}
