package com.example.clothing_store.service.ShippingAddress;

import com.example.clothing_store.dto.ShippingAddressDTO;
import com.example.clothing_store.response.CommonResponse;
import com.example.clothing_store.response.ResponseToData;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ShippingAddressService {
    CommonResponse addShippingAddress(ShippingAddressDTO dto);

    List<ShippingAddressDTO> getByAccountId(Integer accountId);

    CommonResponse updateShippingAddress(Integer id, ShippingAddressDTO dto);

    CommonResponse deleteShippingAddress(Integer id);

    ResponseToData<ShippingAddressDTO> getShippingAddressById(Integer id);
}
