package com.example.clothing_store.mapper;

import com.example.clothing_store.dto.CartDTO;
import com.example.clothing_store.dto.CartItemDTO;
import com.example.clothing_store.entity.Cart;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CartMapper {

    ///cần sửa///
    public CartDTO toDTO(Cart cart) {
        List<CartItemDTO> items = cart.getItems().stream()
                .map(i -> CartItemDTO.builder()
                        .cartId(i.getCart().getId())
                        .skuCode(i.getProductVariant().getSkuCode())
                        .quantity(i.getQuantity())
                        .build())
                .collect(Collectors.toList());
        return CartDTO.builder()
                .accountId(cart.getAccount().getId())
                .items(items)
                .totalPrice(cart.getTotalPrice())
                .createdAt(cart.getCreatedAt())
                .updatedAt(cart.getUpdatedAt())
                .build();
    }
}
