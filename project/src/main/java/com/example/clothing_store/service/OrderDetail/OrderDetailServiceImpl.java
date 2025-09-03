package com.example.clothing_store.service.OrderDetail;

import com.example.clothing_store.dto.OrderDetailDTO;
import com.example.clothing_store.enums.CommonEnums;
import com.example.clothing_store.mapper.OrderDetailMapper;
import com.example.clothing_store.repository.OrderDetailRepository;
import com.example.clothing_store.response.CommonResponse;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class OrderDetailServiceImpl implements OrderDetailService {
    private static final Logger log = LoggerFactory.getLogger(OrderDetailServiceImpl.class);
    private final OrderDetailRepository orderDetailRepository;
    private final OrderDetailMapper mapper;

    public OrderDetailServiceImpl(OrderDetailRepository orderDetailRepository,
                                  OrderDetailMapper mapper) {
        this.orderDetailRepository = orderDetailRepository;
        this.mapper = mapper;
    }

    @Transactional
    public CommonResponse createOrderDetail(OrderDetailDTO dto) {
        log.info("[Begin]Create OrderDetail with request data: {}", dto);
        orderDetailRepository.save(mapper.toEntity(dto));
        log.info("[End]Create OrderDetail with request data: {}", dto);
        return CommonResponse.response(CommonEnums.SUCCESS);
    }


}
