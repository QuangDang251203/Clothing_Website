package com.example.clothing_store.repository;

import com.example.clothing_store.entity.VoucherProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoucherProductRepository extends JpaRepository<VoucherProduct, Integer> {
    List<VoucherProduct> findByVoucherId(int voucherId);
}
