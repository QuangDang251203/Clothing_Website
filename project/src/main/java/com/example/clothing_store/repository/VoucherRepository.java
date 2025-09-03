package com.example.clothing_store.repository;

import com.example.clothing_store.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Integer> {
    Optional<Voucher> findById(int voucherId);
    Optional<Voucher> findByVoucherCode(String voucherCode);
    Boolean existsByVoucherCode(String voucherCode);
}
