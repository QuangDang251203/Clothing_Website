package com.example.clothing_store.controller;

import com.example.clothing_store.dto.ShippingAddressDTO;
import com.example.clothing_store.response.CommonResponse;
import com.example.clothing_store.response.ResponseToData;
import com.example.clothing_store.service.ShippingAddress.ShippingAddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shippingAddress")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ShippingAddressController {
    private final ShippingAddressService shippingAddressService;

    @PostMapping("/addShippingAddress")
    public CommonResponse addShippingAddress(@Valid @RequestBody ShippingAddressDTO dto) {
        return shippingAddressService.addShippingAddress(dto);
    }

    @GetMapping("/getByAccountId/{accountId}")
    public List<ShippingAddressDTO> getByAccountId(@PathVariable Integer accountId) {
        return shippingAddressService.getByAccountId(accountId);
    }

    @PutMapping("/changeInfoShippingAddress/{id}")
    public CommonResponse changeInfoShippingAddress(@PathVariable Integer id,
                                                    @RequestBody ShippingAddressDTO dto) {
        return shippingAddressService.updateShippingAddress(id,dto);
    }

    @DeleteMapping("/deleteShippingAddress/{id}")
    public CommonResponse deleteShippingAddress(@PathVariable Integer id) {
        return shippingAddressService.deleteShippingAddress(id);
    }

    @GetMapping("/getShippingAddressById")
    public ResponseToData<ShippingAddressDTO> getShippingAddressById(@RequestParam("id") Integer id) {
        return shippingAddressService.getShippingAddressById(id);
    }
}
