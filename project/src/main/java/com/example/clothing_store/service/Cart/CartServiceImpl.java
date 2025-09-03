package com.example.clothing_store.service.Cart;

import com.example.clothing_store.dto.CartDTO;
import com.example.clothing_store.dto.CartRequest;
import com.example.clothing_store.entity.*;
import com.example.clothing_store.enums.CommonEnums;
import com.example.clothing_store.mapper.CartMapper;
import com.example.clothing_store.repository.AccountRepository;
import com.example.clothing_store.repository.CartRepository;
import com.example.clothing_store.repository.ProductVariantRepository;
import com.example.clothing_store.response.CommonResponse;
import com.example.clothing_store.response.ResponseToData;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private final CartRepository cartRepo;
    private final AccountRepository accountRepo;
    private final ProductVariantRepository productVariantRepo;
    private final CartMapper cartMapper;
    private static final Logger log = LoggerFactory.getLogger(CartServiceImpl.class);

    @Transactional
    public CartDTO getOrCreateCart(int accountId) {
        log.info("[Begin]GetCart with account id {}", accountId);
        Cart cart = cartRepo.findById(accountId).orElseGet(() -> {
            Account acc = accountRepo.findById(accountId)
                    .orElseThrow(() -> new RuntimeException("Account not found"));
            log.info("Account with id {} found", accountId);
            Cart c = Cart.builder()
                    .id(acc.getId())
                    .account(acc)
                    .build();
            return cartRepo.save(c);
        });
        return cartMapper.toDTO(cart);
    }

    @Transactional
    public CartDTO addItem(CartRequest cartRequest) {
        log.info("[Begin]Add item to cart with data request: {}", cartRequest);
        ProductVariant variant = productVariantRepo.findBySkuCode(cartRequest.getSkuCode())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        log.info("sku is exist{}",variant.getSkuCode());
        int quantityInStorage = variant.getQuantity();
        CartDTO dto = getOrCreateCart(cartRequest.getAccountId());
        log.info("Cart of account {} data {}", cartRequest.getAccountId(), dto);
        Cart cart = cartRepo.getById(dto.getAccountId());
        CartItem existingItem = cart.getItems().stream()
                .filter(ci -> ci.getProductVariant().getSkuCode().equals(variant.getSkuCode()))
                .findFirst()
                .orElse(null);
        if (existingItem != null) {
            log.info("Item is exist in cart");
            int updatedQty = existingItem.getQuantity() + cartRequest.getQuantity();
            if (updatedQty > quantityInStorage) {
                throw new RuntimeException("Product quantity exceeds available stock");
            }
            existingItem.setQuantity(updatedQty);
            cart.recalculateTotal();

        } else {
            log.info("Item not found in cart");
            int qty = cartRequest.getQuantity();
            if (qty > quantityInStorage) {
                throw new RuntimeException("Product quantity exceeds available stock");
            }
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .productVariant(variant)
                    .price(variant.getPrice())
                    .quantity(qty)
                    .build();
            cart.addItem(newItem);
        }
        cart = cartRepo.save(cart);
        log.info("Add Item Success");
        return cartMapper.toDTO(cart);
    }

    @Transactional
    public CommonResponse clearCart(int accountId) {
        log.info("[Begin]ClearCart with account id {}", accountId);
        Cart cart = cartRepo.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        cart.clearItems();
        cartRepo.save(cart);
        return CommonResponse.response(CommonEnums.SUCCESS);
    }

    @Transactional
    public ResponseToData<CartDTO> removeItem(int accountId, String skuCode) {
        log.info("[Begin]RemoveItem from cart with accountId {} and SkuCode {}", accountId, skuCode);
        CartDTO dto = getOrCreateCart(accountId);
        Cart cart = cartRepo.getById(dto.getAccountId());
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProductVariant().getSkuCode().equals(skuCode))
                .findFirst().orElseThrow(() -> new RuntimeException("Product not found"));
        cart.removeItem(item);
        cartRepo.save(cart);
        return ResponseToData.success(cartMapper.toDTO(cart));
    }

    @Transactional
    public CartDTO updateItem(CartRequest cartRequest) {
        log.info("[Begin]UpdateItem from cart with data request: {}", cartRequest);
        String skuCodeInRequest = cartRequest.getSkuCode();
        CartDTO dto = getOrCreateCart(cartRequest.getAccountId());
        ProductVariant variant = productVariantRepo.findBySkuCode(skuCodeInRequest)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        Cart cart = cartRepo.getById(dto.getAccountId());
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProductVariant().getSkuCode().equals(skuCodeInRequest))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        int newQuantity = cartRequest.getQuantity();
        if (newQuantity > variant.getQuantity()) {
            throw new RuntimeException("Product quantity exceeds cart quantity");
        }
        if (newQuantity == 0) {
            log.info("Remove Item");
            cart.removeItem(item);
        } else {
            item.setQuantity(newQuantity);
            cart.recalculateTotal();
        }
        cartRepo.save(cart);
        return cartMapper.toDTO(cart);
    }

}
