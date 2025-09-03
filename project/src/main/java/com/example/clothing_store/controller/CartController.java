package com.example.clothing_store.controller;

import com.example.clothing_store.dto.CartDTO;
import com.example.clothing_store.dto.CartRequest;
import com.example.clothing_store.response.CommonResponse;
import com.example.clothing_store.response.ResponseToData;
import com.example.clothing_store.service.Cart.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    @GetMapping("/getCart/{id}")
    public ResponseToData<CartDTO> getCart(@PathVariable("id") int id) {
        return ResponseToData.success(cartService.getOrCreateCart(id));
    }

    @PostMapping("/addItem")
    public ResponseToData<CartDTO> addItem(@Valid @RequestBody CartRequest cartRequest) {
        return ResponseToData.success(cartService.addItem(cartRequest));
    }

    @PutMapping("/removeItem/{accountId}")
    public ResponseToData<CartDTO> removeItem(@PathVariable int accountId,@RequestParam("skuCode") String skuCode) {
        return cartService.removeItem(accountId, skuCode);
    }

    @PostMapping("/updateItem")
    public ResponseToData<CartDTO> updateItem(@Valid @RequestBody CartRequest cartRequest) {
        return ResponseToData.success(cartService.updateItem(cartRequest));
    }

    @PostMapping("/clearCart/{accountId}")
    public CommonResponse clearCart(@PathVariable int accountId) {
        return cartService.clearCart(accountId);
    }
}
