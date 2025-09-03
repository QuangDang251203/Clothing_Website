package com.example.clothing_store.mapper;

import com.example.clothing_store.dto.ShippingAddressDTO;
import com.example.clothing_store.entity.Account;
import com.example.clothing_store.entity.ShippingAddress;
import com.example.clothing_store.repository.AccountRepository;
import org.springframework.stereotype.Component;

@Component
public class ShippingAddressMapper {
    private static AccountRepository accountRepository;

    public ShippingAddressMapper(AccountRepository accountRepository) {
        ShippingAddressMapper.accountRepository = accountRepository;
    }

    public static ShippingAddressDTO toDTO(ShippingAddress entity) {
        ShippingAddressDTO dto = new ShippingAddressDTO();
        dto.setId(entity.getId());
        dto.setAccountId(entity.getAccount().getId());
        dto.setAddress(entity.getAddress());
        dto.setConsigneeName(entity.getConsigneeName());
        dto.setMobile(entity.getMobile());
        return dto;
    }

    public static ShippingAddress toEntity(ShippingAddressDTO dto) {
        Account account = accountRepository.findById(dto.getAccountId())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        ShippingAddress entity = new ShippingAddress();
        entity.setId(dto.getId() != null ? dto.getId() : 0);
        entity.setAddress(dto.getAddress());
        entity.setConsigneeName(dto.getConsigneeName());
        entity.setMobile(dto.getMobile());
        entity.setAccount(account);
        return entity;
    }
}
