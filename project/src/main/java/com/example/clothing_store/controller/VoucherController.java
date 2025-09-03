package com.example.clothing_store.controller;

import com.example.clothing_store.dto.VoucherDTO;
import com.example.clothing_store.response.CommonResponse;
import com.example.clothing_store.response.ResponseToData;
import com.example.clothing_store.service.Voucher.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/voucher")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class VoucherController {
    private final VoucherService voucherService;

    @GetMapping("/getAllVouchers")
    public ResponseToData<List<VoucherDTO>> getAllVouchers() {
        return voucherService.getVouchers();
    }

    @PostMapping("/createVoucher")
    public ResponseToData<VoucherDTO> createVoucher(@RequestBody VoucherDTO dto) {
        return voucherService.createVoucher(dto);
    }

    @PutMapping("/updateVoucher/{code}")
    public ResponseToData<VoucherDTO> updateVoucher(@PathVariable String code, @RequestBody VoucherDTO dto) {
        return voucherService.updateVoucher(code, dto);
    }

    @GetMapping("/getVoucherByCode/{code}")
    public ResponseToData<VoucherDTO> getVoucherByCode(@PathVariable String code) {
        return voucherService.getByVoucherCode(code);
    }

    @PutMapping("/changeStatus/{code}")
    public CommonResponse changeStatus(@PathVariable String code) {
        return voucherService.changeStatusVoucher(code);
    }

    @GetMapping("/getValidForCart")
    public ResponseToData<List<VoucherDTO>> getValidForCart(
            @RequestParam("cartTotal") BigDecimal cartTotal,
            @RequestParam("productIds") List<Integer> productIds) {
        return voucherService.getValidVouchersForCart(cartTotal, productIds);
    }
    @GetMapping("/getVoucherById")
    public ResponseToData<VoucherDTO> getVoucherById(@RequestParam("id") int id) {
       return voucherService.getVoucherById(id);
    }
}
