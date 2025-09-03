package com.example.clothing_store.service.StoreSystem;

import com.example.clothing_store.constant.CommonConstant;
import com.example.clothing_store.dto.StoreSystemDTO;
import com.example.clothing_store.entity.StoreSystem;
import com.example.clothing_store.enums.CommonEnums;
import com.example.clothing_store.mapper.StoreSystemMapper;
import com.example.clothing_store.repository.StoreSystemRepository;
import com.example.clothing_store.response.CommonResponse;
import com.example.clothing_store.response.ResponseToData;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreSystemServiceImpl implements StoreSystemService {
    private static final Logger log = LoggerFactory.getLogger(StoreSystemServiceImpl.class);
    private final StoreSystemRepository storeSystemRepo;
    private final StoreSystemMapper mapper;

    public ResponseToData<List<StoreSystemDTO>> getAllStoreSystems() {
        log.info("[Begin]Find all Store Systems");
        List<StoreSystem> storeSystems = storeSystemRepo.findAll();
        log.info("[End]Find all Store Systems:{}", storeSystems.size());
        List<StoreSystemDTO> DTOs = storeSystems.stream().map(mapper::toDTO).collect(Collectors.toList());
        return ResponseToData.success(DTOs);
    }

    public ResponseToData<StoreSystemDTO> getStoreById(int id) {
        log.info("[Begin]Find Store by id:{}", id);
        StoreSystemDTO dto = mapper.toDTO(storeSystemRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Store not found")));
        log.info("[End]Find Success");
        return ResponseToData.success(dto);
    }

    public ResponseToData<StoreSystemDTO> createStore(StoreSystemDTO storeSystemDTO) {
        log.info("[Begin]Create Store System:{}", storeSystemDTO);
        if (storeSystemRepo.existsByMerchantCode(storeSystemDTO.getMerchantCode())) {
            throw new RuntimeException("Merchant code already exists");
        }
        storeSystemDTO.setStatus(CommonConstant.ACTIVE_STATUS);
        StoreSystem storeSystem = mapper.toEntity(storeSystemDTO);
        storeSystemRepo.save(storeSystem);
        log.info("[End]Create Success");
        return ResponseToData.success(mapper.toDTO(storeSystem));
    }

    public ResponseToData<StoreSystemDTO> updateStore(Integer id, StoreSystemDTO dto) {
        log.info("[Begin]Update Store System:{}", dto);
        StoreSystem store = storeSystemRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Store not found"));
        store.setMerchantCode(dto.getMerchantCode());
        store.setAddress(dto.getAddress());
        store.setMerchantName(dto.getMerchantName());
        store.setPhone(dto.getPhone());
        StoreSystem updated = storeSystemRepo.save(store);

        StoreSystemDTO updatedDto = mapper.toDTO(updated);
        log.info("[End]Update Success: {}", updatedDto);
        return ResponseToData.success(updatedDto);
    }

    public CommonResponse changeStatusStore (Integer id){
        log.info("[Begin]Change Store Status:{}", id);
        StoreSystem store = storeSystemRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Store not found"));
        if(store.getStatus() == CommonConstant.ACTIVE_STATUS){
            store.setStatus(CommonConstant.INACTIVE_STATUS);
            storeSystemRepo.save(store);
        }else {
            store.setStatus(CommonConstant.ACTIVE_STATUS);
        }
        storeSystemRepo.save(store);
        log.info("[End]Change Status Success");
        return CommonResponse.response(CommonEnums.SUCCESS);
    }
}
