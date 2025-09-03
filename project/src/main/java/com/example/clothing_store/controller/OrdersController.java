package com.example.clothing_store.controller;

import com.example.clothing_store.dto.OrdersDTO;
import com.example.clothing_store.enums.CommonEnums;
import com.example.clothing_store.response.CommonResponse;
import com.example.clothing_store.response.ResponseToData;
import com.example.clothing_store.service.Orders.OrdersService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class OrdersController {
    private final OrdersService ordersService;

    @PostMapping("/createOrder")
    public CommonResponse createOrder(@Valid @RequestBody OrdersDTO ordersDTO) {
        return ordersService.createOrder(ordersDTO);
    }

    @PutMapping("/updateShippingAddress/{id}")
    public CommonResponse updateShippingAddress(@PathVariable int id,
                                                @RequestParam("shippingAddressId") int shippingAddressId) {
        return ordersService.updateShippingAddress(id, shippingAddressId);
    }

    @PutMapping("/cancelOrder/{id}")
    public CommonResponse cancelOrder(@PathVariable int id) {
        return ordersService.changeStatusCancel(id);
    }

    @PutMapping("/changeStatus/{id}")
    public CommonResponse changeStatus(@PathVariable int id) {
        return ordersService.changeStatus(id);
    }

    @GetMapping("/getDetailOrder/{id}")
    public ResponseToData<OrdersDTO> getDetailOrder(@PathVariable int id) {
        return ordersService.getDetailOrder(id);
    }

    @PostMapping("/checkout")
    public ResponseToData<?> checkout(@RequestParam int accountId,
                                              @RequestParam int shippingAddressId,
                                              @RequestParam String voucherCode,
                                              @RequestParam(defaultValue = "1") int paymentMethod) {
        return ordersService.checkoutCart(accountId, shippingAddressId, voucherCode, paymentMethod);
    }
    @GetMapping("/vnpay/callback")
    public ResponseToData<Integer> vnPayCallback(@RequestParam("vnp_ResponseCode") String vnpResponseCode,
                                        @RequestParam("vnp_TxnRef") String vnpTxnRef,
                                        @RequestParam("vnp_SecureHash") String vnpSecureHash) {
        int orderId;
        try {
            orderId = Integer.parseInt(vnpTxnRef);
        } catch (NumberFormatException e) {
            return ResponseToData.failExist(CommonEnums.FAIL_BANKING);
        }
        return ordersService.confirmVnPayPayment(orderId, vnpResponseCode, vnpTxnRef, vnpSecureHash);
    }

    // ZaloPay callback endpoint
    @PostMapping("/zaloPay/callback")
    public ResponseToData<Integer> confirmZaloPayCallback(@RequestParam("data") String data,
                                                          @RequestParam("mac") String mac) {
        return ordersService.confirmZaloPay(data, mac);
    }

    @GetMapping("/getAllOrdersByAccount")
    public ResponseToData<List<OrdersDTO>> listOrders(@RequestParam("accountId") int accountId) {
        return ordersService.listOrdersByAccount(accountId);
    }
    @GetMapping("/getAllOrders")
    public ResponseToData<List<OrdersDTO>> getAllOrders() {
        return ordersService.getAllOrders();
    }
}
