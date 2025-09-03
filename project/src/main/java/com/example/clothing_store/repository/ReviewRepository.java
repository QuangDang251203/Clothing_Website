package com.example.clothing_store.repository;

import com.example.clothing_store.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByOrderDetail_OrderId(int orderId);

    @Query("""
      SELECT r\s
      FROM Review r
      JOIN r.orderDetail od
      JOIN ProductVariant pv
        ON od.productVariant.skuCode = pv.skuCode
      WHERE pv.product.id = :productId
     \s""")
    List<Review> findAllByProductId(@Param("productId") Integer productId);

    Optional<Review> findByOrderDetailId(int orderDetailId);
}
