package com.example.clothing_store.mapper;

import com.example.clothing_store.dto.OrderDetailDTO;
import com.example.clothing_store.dto.OrdersDTO;
import com.example.clothing_store.entity.*;
import com.example.clothing_store.repository.AccountRepository;
import com.example.clothing_store.repository.ShippingAddressRepository;
import com.example.clothing_store.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OrdersMapper {
    private static final Logger log = LoggerFactory.getLogger(OrdersMapper.class);
    private final AccountRepository accountRepository;
    private final VoucherRepository voucherRepository;
    private final ShippingAddressRepository shippingAddressRepository;

    public Orders toEntity(OrdersDTO dto) {
        Account account = accountRepository.findById(dto.getAccountId())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        ShippingAddress shippingAddress = shippingAddressRepository.findById(dto.getShippingAddressId())
                .orElseThrow(()->new RuntimeException("Shipping address not found"));
        Orders entity = new Orders();
        entity.setShippingAddress(shippingAddress);
        entity.setAccount(account);
        entity.setPayMethod(dto.getPayMethod());
        entity.setTotalPrice(dto.getTotalPrice());
        entity.setStatus(dto.getStatus());
        Optional<Voucher> voucher = voucherRepository.findById(dto.getVoucherId());
        if (voucher.isPresent()) {
            entity.setVoucher(voucher.get());
            return entity;
        }
        return entity;
    }

    public OrdersDTO toDto(Orders entity, List<OrderDetail> details) {
        log.info("[Begin] Map to DTO with detail order size{}", details.size());
        OrdersDTO dto = new OrdersDTO();
        dto.setId(entity.getId());
        dto.setAccountId(entity.getAccount().getId());
        dto.setPayMethod(entity.getPayMethod());
        dto.setTotalPrice(entity.getTotalPrice());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        if(entity.getVoucher() != null) {
            log.info("Voucher is exist");
            dto.setVoucherId(entity.getVoucher().getId());
        }
        dto.setShippingAddressId(entity.getShippingAddress().getId());
        List<OrderDetailDTO> detailDTOS = details.stream()
                .map(d -> {
                    OrderDetailDTO dDTO = new OrderDetailDTO();
                    dDTO.setId(d.getId());
                    dDTO.setSkuCode(d.getProductVariant().getSkuCode());
                    dDTO.setOrderId(d.getId());
                    dDTO.setQuantity(d.getQuantity());
                    dDTO.setPrice(d.getPrice());
                    dDTO.setReviewed(d.getReview() != null);
                    return dDTO;
                })
                .collect(Collectors.toList());
        dto.setDetails(detailDTOS);

        return dto;
    }
}
