package com.example.clothing_store.repository;

import com.example.clothing_store.entity.StoreSystem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StoreSystemRepository extends JpaRepository<StoreSystem, Integer> {
    Optional<StoreSystem> findById(Integer id);

    boolean existsByMerchantCode(String merchantCode);

    Optional<StoreSystem> findByMerchantCode(String merchantCode);
}
