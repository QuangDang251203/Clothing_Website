package com.example.clothing_store.controller;

import com.example.clothing_store.dto.OrderDetailDTO;
import com.example.clothing_store.response.CommonResponse;
import com.example.clothing_store.service.OrderDetail.OrderDetailService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orderDetail")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderDetailController {
    private final OrderDetailService orderDetailService;

    public OrderDetailController(OrderDetailService orderDetailService) {
        this.orderDetailService = orderDetailService;
    }

    @PostMapping("/createOrderDetail")
    public CommonResponse createOrderDetail(@Valid @RequestBody OrderDetailDTO dto){
        return orderDetailService.createOrderDetail(dto);
    }
}
