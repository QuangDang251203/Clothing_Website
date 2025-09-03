package com.example.clothing_store.service.ShippingAddress;

import com.example.clothing_store.dto.ShippingAddressDTO;
import com.example.clothing_store.entity.Account;
import com.example.clothing_store.entity.ShippingAddress;
import com.example.clothing_store.enums.CommonEnums;
import com.example.clothing_store.mapper.ShippingAddressMapper;
import com.example.clothing_store.repository.AccountRepository;
import com.example.clothing_store.repository.ShippingAddressRepository;
import com.example.clothing_store.response.CommonResponse;
import com.example.clothing_store.response.ResponseToData;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShippingAddressServiceImpl implements ShippingAddressService {
    private static final Logger log = LoggerFactory.getLogger(ShippingAddressServiceImpl.class);
    private final ShippingAddressRepository shippingRepository;
    private final AccountRepository accountRepository;

    public ResponseToData<ShippingAddressDTO> getShippingAddressById(Integer id) {
        log.info("[Begin]GetShippingAddressById with data request:{}", id);
        ShippingAddress shippingAddress = shippingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ShippingAddress not found with id: " + id));
        log.info("[End]GetShippingAddressById");
        return ResponseToData.success(ShippingAddressMapper.toDTO(shippingAddress));
    }

    @Override
    public CommonResponse addShippingAddress(ShippingAddressDTO dto) {
        log.info("[Begin]AddShippingAddress with data request:{}", dto);
        log.info("AccountId is exist");
        shippingRepository.save(ShippingAddressMapper.toEntity(dto));
        log.info("[End]AddShippingAddress");
        return CommonResponse.response(CommonEnums.SUCCESS);
    }

    @Transactional
    public CommonResponse updateShippingAddress(Integer id, ShippingAddressDTO dto) {
        log.info("[Begin]UpdateShippingAddress with data request:{}", dto);
        Account account = accountRepository.findById(dto.getAccountId())
                        .orElseThrow(() -> new RuntimeException("Account not found"));
        ShippingAddressDTO dtoDef = ShippingAddressMapper.toDTO(shippingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ShippingAddress not found with id: " + id))) ;
        dtoDef.setAddress(dto.getAddress());
        dtoDef.setConsigneeName(dto.getConsigneeName());
        dtoDef.setMobile(dto.getMobile());
        shippingRepository.save(ShippingAddressMapper.toEntity(dtoDef));
        log.info("[End]UpdateShippingAddress");
        return CommonResponse.response(CommonEnums.SUCCESS);
    }

    public List<ShippingAddressDTO> getByAccountId(Integer accountId) {
        log.info("[Begin]GetByAccountId with accountId {}", accountId);
        return shippingRepository.findByAccountId(accountId)
                .stream().map(ShippingAddressMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommonResponse deleteShippingAddress(Integer id) {
        log.info("[Begin]DeleteShippingAddress with data request:{}", id);
        ShippingAddress shippingAddress = shippingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ShippingAddress not found with id: " + id));
        log.info("ShippingID is exist");
        shippingRepository.delete(shippingAddress);
        log.info("[End]DeleteShippingAddress");
        return CommonResponse.response(CommonEnums.SUCCESS);
    }
}
