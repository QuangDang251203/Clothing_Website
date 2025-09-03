package com.example.clothing_store.controller;

import com.example.clothing_store.dto.ReviewDTO;
import com.example.clothing_store.enums.CommonEnums;
import com.example.clothing_store.response.ResponseToData;
import com.example.clothing_store.service.StorageImage.StorageService;
import com.example.clothing_store.service.Review.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;

@RestController
@RequestMapping("/review")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;
    private final StorageService storageService;
    private final ObjectMapper objectMapper;

    /**
     * Tạo review kèm ảnh:
     * - Phần "review" là JSON string của ReviewDTO.
     * - Phần "images" là các file MultipartFile.
     */
    @PostMapping(path = "/createReview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseToData<ReviewDTO> createReview(
            @RequestPart("review") String reviewJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        try {
            // Parse JSON string to ReviewDTO
            ReviewDTO dto = objectMapper.readValue(reviewJson, ReviewDTO.class);

            // Validate required fields
            if (dto.getRating() == null || dto.getRating() < 1 || dto.getRating() > 5) {
                return ResponseToData.fail(CommonEnums.FAIL_UPLOAD_IMAGE);
            }

            List<String> imageUrls = new ArrayList<>();
            if (images != null && !images.isEmpty()) {
                for (MultipartFile file : images) {
                    if (!file.isEmpty()) {
                        // Validate file type
                        String contentType = file.getContentType();
                        if (contentType == null || !contentType.startsWith("image/")) {
                            return ResponseToData.fail(CommonEnums.FAIL_UPLOAD_IMAGE);
                        }

                        // Validate file size (10MB max)
                        if (file.getSize() > 10 * 1024 * 1024) {
                            return ResponseToData.fail(CommonEnums.FAIL_UPLOAD_IMAGE);
                        }

                        String url = storageService.store(file);
                        imageUrls.add(url);
                    }
                }
            }

            dto.setImageUrls(imageUrls);
            return reviewService.createReview(dto);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseToData.failReview("Error processing review: " + e.getMessage());
        }
    }

    /** Lấy tất cả review của một product, trả kèm imageUrls */
    @GetMapping("/{productId}/reviews")
    public ResponseToData<List<ReviewDTO>> getReviews(@PathVariable int productId) {
        return ResponseToData.success(reviewService.getReviewsProduct(productId));
    }

    /** Lấy review theo rating của product */
    @GetMapping("/getReviews/{productId}")
    public ResponseToData<List<ReviewDTO>> getReviewsByProductIdAndRating(
            @PathVariable int productId,
            @RequestParam("rating") int rating
    ) {
        return ResponseToData.success(reviewService.getReviewByRating(rating, productId));
    }

    /** Lấy review của một orderDetail */
    @GetMapping("/byOrderDetail/{orderDetailId}")
    public ResponseToData<ReviewDTO> getReviewByOrderDetailId(@PathVariable int orderDetailId) {
        return reviewService.getReviewByOrderDetailId(orderDetailId);
    }
}
