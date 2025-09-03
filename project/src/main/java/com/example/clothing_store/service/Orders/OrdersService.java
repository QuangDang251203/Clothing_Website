package com.example.clothing_store.service.Orders;

import com.example.clothing_store.dto.OrdersDTO;
import com.example.clothing_store.response.CommonResponse;
import com.example.clothing_store.response.ResponseToData;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface OrdersService {
    CommonResponse createOrder(OrdersDTO ordersDTO);

    CommonResponse updateShippingAddress(int orderId, int shippingAddressId);

    CommonResponse changeStatusCancel(int id);

    CommonResponse changeStatus(int id);

    ResponseToData<OrdersDTO> getDetailOrder(int id);

    ResponseToData<?> checkoutCart(int accountId, int shippingId, String voucherCode, int paymentMethod);

    ResponseToData<List<OrdersDTO>> listOrdersByAccount(int accountId);

    ResponseToData<List<OrdersDTO>> getAllOrders();

    ResponseToData<Integer> confirmVnPayPayment(int orderId, String vnpResponseCode, String vnpTxnRef, String vnpSecureHash);

    ResponseToData<Integer> confirmZaloPay(String data, String mac);
}
