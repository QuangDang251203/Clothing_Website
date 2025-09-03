package com.example.clothing_store.repository;

import com.example.clothing_store.entity.ProductVariant;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Integer> {
    //    Optional<ProductVariant> findByProductId(Integer integer);
    Optional<ProductVariant> findBySkuCode(String skuCode);
//
//    Page<ProductVariant> getAll(Pageable pageable);

    List<ProductVariant> findByProductId(Integer productId);

    boolean existsBySkuCode(@NotBlank(message = "skuCode is required") String skuCode);

    @Query("SELECT COALESCE(SUM(pv.quantity), 0) FROM ProductVariant pv")
    Integer sumTotalQuantity();

    @Query("SELECT pv.skuCode, pv.quantity FROM ProductVariant pv ORDER BY pv.quantity DESC")
    List<Object[]> findTop6ByQuantity(Pageable pageable);
}
