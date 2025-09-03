package com.example.clothing_store.service.StoreSystem;

import com.example.clothing_store.dto.StoreSystemDTO;
import com.example.clothing_store.response.CommonResponse;
import com.example.clothing_store.response.ResponseToData;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface StoreSystemService {
    ResponseToData<StoreSystemDTO> getStoreById(int id);

    ResponseToData<List<StoreSystemDTO>> getAllStoreSystems();

    ResponseToData<StoreSystemDTO> createStore(StoreSystemDTO storeSystemDTO);

    ResponseToData<StoreSystemDTO> updateStore(Integer id, StoreSystemDTO dto);

    CommonResponse changeStatusStore(Integer id);
}
