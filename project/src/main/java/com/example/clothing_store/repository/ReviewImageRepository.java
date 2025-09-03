package com.example.clothing_store.repository;

import com.example.clothing_store.entity.ReviewImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewImageRepository extends JpaRepository<ReviewImage, Integer> {
    List<ReviewImage> findByReviewId(Integer reviewId);
}
