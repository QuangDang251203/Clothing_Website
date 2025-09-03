package com.example.clothing_store.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewDTO {

    @NotNull(message = "orderDetailId is required")
    private int orderDetailId;

    @NotNull(message = "rating is required")
    @Max(value = 5,message = "Maximum rating is value 5")
    @Min(value = 1,message = "Minimum rating is value 1")
    private Integer rating;

    @Size(max = 2000)
    @NotBlank(message = "comment is required")
    private String comment;

    private List<@Size(max = 500) String> imageUrls;
    private int productId;
    private int accountId;

}
