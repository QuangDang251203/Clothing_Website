package com.example.clothing_store.repository;

import com.example.clothing_store.entity.ShippingAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShippingAddressRepository extends JpaRepository<ShippingAddress, Integer> {
    List<ShippingAddress> findByAccountId(Integer accountId);
    Optional<ShippingAddress> findById(int id);
}
