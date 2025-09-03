package com.example.clothing_store.service.Review;

import com.example.clothing_store.dto.ReviewDTO;
import com.example.clothing_store.response.ResponseToData;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ReviewService {
    ResponseToData<ReviewDTO> createReview(ReviewDTO dto);

    List<ReviewDTO> getReviewsProduct(int productId);

    List<ReviewDTO> getReviewByRating(int rating, int productId);

    ResponseToData<ReviewDTO> getReviewByOrderDetailId(int orderDetailId);
}
