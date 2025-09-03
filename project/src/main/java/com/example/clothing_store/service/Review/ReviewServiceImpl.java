package com.example.clothing_store.service.Review;

import com.example.clothing_store.constant.StatusOrderConstant;
import com.example.clothing_store.dto.ReviewDTO;
import com.example.clothing_store.entity.OrderDetail;
import com.example.clothing_store.entity.Orders;
import com.example.clothing_store.entity.Review;
import com.example.clothing_store.enums.CommonEnums;
import com.example.clothing_store.mapper.ReviewMapper;
import com.example.clothing_store.repository.OrderDetailRepository;
import com.example.clothing_store.repository.ReviewRepository;
import com.example.clothing_store.response.ResponseToData;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository reviewRepo;
    private final ReviewMapper mapper;
    private final OrderDetailRepository orderDetailRepo;
    private static final Logger log = LoggerFactory.getLogger(ReviewServiceImpl.class);

    @Transactional
    public ResponseToData<ReviewDTO> createReview(ReviewDTO dto) {
        log.info("[Begin] Create review with data request:{}", dto);
        OrderDetail detail = orderDetailRepo.findById(dto.getOrderDetailId())
                .orElseThrow(()->new RuntimeException("OrderDetail not found"));
        if (detail.isReviewed()) {
            throw new RuntimeException("This product in the order has already been reviewed.");
        }

        Orders order = detail.getOrder();
        if(!(StatusOrderConstant.RECEIVED == order.getStatus())){
            throw new RuntimeException("Order is not received yet");
        }
        log.info("Order is received");
        if(order.getUpdatedAt() == null||
        order.getUpdatedAt().isBefore(LocalDateTime.now().minusDays(15))){
            throw new RuntimeException("Review window of 15 days after delivery has expired");
        }
        log.info("Order received in less than 15 days");
        Review review = mapper.toEntity(dto);
        review = reviewRepo.save(review);
        detail.setReviewed(true);
        orderDetailRepo.save(detail);

        return ResponseToData.success(mapper.toDto(review));
    }

    @Transactional
    public List<ReviewDTO> getReviewsProduct(int productId) {
        log.info("[Begin] Get reviews product with id:{}", productId);
        List<Review> reviews = reviewRepo.findAllByProductId(productId);
        log.info("Size of list reviews:{}", reviews.size());
        return reviews.stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<ReviewDTO> getReviewByRating(int rating, int productId) {
        log.info("[Begin] Get reviews by rating:{} of product ID {}", rating,productId);
        List<ReviewDTO> allReviews = getReviewsProduct(productId);
        return allReviews.stream()
                .filter(dto -> dto.getRating() == rating)
                .collect(Collectors.toList());
    }

    @Transactional
    public ResponseToData<ReviewDTO> getReviewByOrderDetailId(int orderDetailId) {
        log.info("[Begin] Get review by orderDetailId:{}", orderDetailId);
        Optional<Review> reviewOptional = reviewRepo.findByOrderDetailId(orderDetailId);
        if (reviewOptional.isEmpty()) {
            return ResponseToData.failExist(CommonEnums.CODE_IS_NOT_EXIST);
        }
        return ResponseToData.success(mapper.toDto(reviewOptional.get()));
    }

}
