package com.example.clothing_store.repository;

import com.example.clothing_store.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    Optional<Product> findByProductCode(String productCode);
    Page<Product> findAll(Pageable pageable);

    Optional<Product>  findById(int id);
    List<Product> findByCategory(String category);
}
