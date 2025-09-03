package com.example.clothing_store.service.Cart;

import com.example.clothing_store.dto.CartDTO;
import com.example.clothing_store.dto.CartRequest;
import com.example.clothing_store.response.CommonResponse;
import com.example.clothing_store.response.ResponseToData;
import org.springframework.stereotype.Service;

@Service
public interface CartService {
    CartDTO getOrCreateCart(int accountId);

    CartDTO addItem(CartRequest cartRequest);

    ResponseToData<CartDTO> removeItem(int accountId, String skuCode);

    CartDTO updateItem(CartRequest cartRequest);

    CommonResponse clearCart(int accountId);
}
