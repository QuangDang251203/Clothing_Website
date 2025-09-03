package com.example.clothing_store.service.OrderDetail;

import com.example.clothing_store.dto.OrderDetailDTO;
import com.example.clothing_store.response.CommonResponse;
import org.springframework.stereotype.Service;

@Service
public interface OrderDetailService {
    CommonResponse createOrderDetail(OrderDetailDTO dto);
}
