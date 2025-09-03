package com.example.clothing_store.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsImageDTO {
    private int id;
    private int newsId;
    @NotBlank(message = "ImageURL is required")
    private String imageUrl;
}
