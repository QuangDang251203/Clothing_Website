package com.example.clothing_store.mapper;

import com.example.clothing_store.dto.StoreSystemDTO;
import com.example.clothing_store.entity.StoreSystem;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class StoreSystemMapper {
    private final ModelMapper modelMapper = new ModelMapper();
    public StoreSystem toEntity(StoreSystemDTO dto) {
        return modelMapper.map(dto, StoreSystem.class);
    }
    public StoreSystemDTO toDTO(StoreSystem entity) {
        return StoreSystemDTO.builder()
                .id(entity.getId())
                .merchantCode(entity.getMerchantCode())
                .merchantName(entity.getMerchantName())
                .status(entity.getStatus())
                .address(entity.getAddress())
                .phone(entity.getPhone())
                .mapsUrl(entity.getGoogleMapUrl())
                .build();
    }
}
