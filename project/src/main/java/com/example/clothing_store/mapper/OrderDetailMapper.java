package com.example.clothing_store.mapper;

import com.example.clothing_store.dto.OrderDetailDTO;
import com.example.clothing_store.entity.OrderDetail;
import com.example.clothing_store.entity.Orders;
import com.example.clothing_store.entity.ProductVariant;
import com.example.clothing_store.repository.OrdersRepository;
import com.example.clothing_store.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.NoSuchElementException;

@Component
@RequiredArgsConstructor
public class OrderDetailMapper {
    private static final Logger log = LoggerFactory.getLogger(OrderDetailMapper.class);
    private final OrdersRepository ordersRepository;
    private final ProductVariantRepository productVariantRepo;

    public OrderDetail toEntity(OrderDetailDTO dto) {
        log.info("[Begin] Map Dto to Entity with data request: {}", dto);
        ProductVariant variant = productVariantRepo.findBySkuCode(dto.getSkuCode())
                .orElseThrow(() -> new NoSuchElementException("Product not found"));
        log.info("Product Id is exist");
        int quantityInStorage = variant.getQuantity();
        if (dto.getQuantity() > quantityInStorage) {
            log.error("[Error] Quantity exceeds quantity limit");
            throw new IllegalArgumentException("Quantity exceeds quantity limit");
        }
        log.info("Have enough products in order ");
        variant.setQuantity(quantityInStorage - dto.getQuantity());
        productVariantRepo.save(variant);
        log.info("Saved product quantity after purchase");
        Orders order = ordersRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new NoSuchElementException("Order not found"));
        log.info("Orders Id is exist");
        OrderDetail orderDetail = new OrderDetail();
        orderDetail.setProductVariant(variant);
        orderDetail.setOrder(order);
        orderDetail.setQuantity(dto.getQuantity());
        orderDetail.setPrice(variant.getPrice());
        log.info("Map successful");
        return orderDetail;
    }
}
