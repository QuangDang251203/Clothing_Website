package com.example.clothing_store.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NewsDTO {
    private int id;

    @NotBlank(message = "newsCode is required")
    private String newsCode;

    @NotBlank(message = "title is required")
    private String title;

    @NotBlank(message = "detail is required")
    private String detail;

    private LocalDate createdAt;
    private LocalDate updatedAt;
    private List<NewsImageDTO> images;
}
