package com.example.clothing_store.controller;

import com.example.clothing_store.dto.StoreSystemDTO;
import com.example.clothing_store.response.CommonResponse;
import com.example.clothing_store.response.ResponseToData;
import com.example.clothing_store.service.StoreSystem.StoreSystemService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/storeSystem")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class StoreSystemController {
    private final StoreSystemService storeSystemService;

    @GetMapping("/getStore/{id}")
    public ResponseToData<StoreSystemDTO> getStore(@PathVariable int id) {
        return storeSystemService.getStoreById(id);
    }

    @GetMapping("/getAllStore")
    public ResponseToData<List<StoreSystemDTO>> getAllStore() {
        return storeSystemService.getAllStoreSystems();
    }

    @PostMapping("/createStore")
    public ResponseToData<StoreSystemDTO> createStore(@RequestBody StoreSystemDTO storeSystemDTO) {
        return storeSystemService.createStore(storeSystemDTO);
    }
    @PutMapping("/updateStore/{id}")
    public ResponseToData<StoreSystemDTO> updateStore(@PathVariable int id, @RequestBody StoreSystemDTO storeSystemDTO) {
        return storeSystemService.updateStore(id, storeSystemDTO);
    }

    @PutMapping("/changeStatusStore/{id}")
    public CommonResponse changeStatusStore(@PathVariable int id) {
        return storeSystemService.changeStatusStore(id);
    }
}
