package com.example.clothing_store.mapper;

import com.example.clothing_store.dto.VoucherDTO;
import com.example.clothing_store.entity.Voucher;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class VoucherMapper {
    private final ModelMapper modelMapper = new ModelMapper();
    public VoucherDTO toDto(Voucher voucher) {
        if (voucher == null) {
            return null;
        }
        VoucherDTO dto = modelMapper.map(voucher, VoucherDTO.class);
        List<Integer> productIds = voucher.getVoucherProducts()
                .stream()
                .map(vp -> vp.getProduct().getId())
                .collect(Collectors.toList());

        dto.setProductIds(productIds);
        return dto;
    }

    public Voucher toEntity(VoucherDTO voucherDTO) {
        if (voucherDTO == null) {
            return null;
        }
        return modelMapper.map(voucherDTO, Voucher.class);
    }
}
