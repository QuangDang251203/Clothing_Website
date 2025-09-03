package com.example.clothing_store.mapper;

import com.example.clothing_store.dto.ReviewDTO;
import com.example.clothing_store.entity.OrderDetail;
import com.example.clothing_store.entity.Review;
import com.example.clothing_store.entity.ReviewImage;
import com.example.clothing_store.repository.OrderDetailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ReviewMapper {
    private final OrderDetailRepository detailRepo;

    public Review toEntity(ReviewDTO dto) {
        OrderDetail orderDetail = detailRepo.findById(dto.getOrderDetailId())
                .orElseThrow(() -> new RuntimeException("OrderDetail not found with ID: " + dto.getOrderDetailId()));

        Review review = Review.builder()
                .orderDetail(orderDetail)
                .rating(dto.getRating())
                .comment(dto.getComment())
                .product(orderDetail.getProductVariant().getProduct())
                .account(orderDetail.getOrder().getAccount())
                .build();
        if(dto.getImageUrls() != null) {
            dto.getImageUrls().forEach(imageUrl -> {
                review.getImages().add(
                        ReviewImage.builder()
                                .review(review)
                                .url(imageUrl)
                                .build()
                );
            });
        }
        return review;
    }
    public ReviewDTO toDto(Review review) {
        List<String> urls = review.getImages().stream()
                .map(ReviewImage::getUrl)
                .collect(Collectors.toList());
        return ReviewDTO.builder()
                .orderDetailId(review.getOrderDetail().getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .imageUrls(urls)
                .accountId(review.getAccount().getId())
                .productId(review.getProduct().getId())
                .build();
    }
}
