package com.example.clothing_store.service.Voucher;

import com.example.clothing_store.dto.VoucherDTO;
import com.example.clothing_store.response.CommonResponse;
import com.example.clothing_store.response.ResponseToData;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public interface VoucherService {
    ResponseToData<VoucherDTO> createVoucher(VoucherDTO dto);

    CommonResponse changeStatusVoucher(String code);

    ResponseToData<List<VoucherDTO>> getVouchers();

    ResponseToData<VoucherDTO> getByVoucherCode(String code);

    ResponseToData<VoucherDTO> updateVoucher(String code, VoucherDTO dto);

    ResponseToData<VoucherDTO> getVoucherById(int id);

    ResponseToData<List<VoucherDTO>> getValidVouchersForCart(BigDecimal cartTotal, List<Integer> productIds);
}
