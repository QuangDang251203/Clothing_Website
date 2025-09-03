package com.example.clothing_store.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowcaseDTO {
    private Integer id;
    private String label;
    private MultipartFile imageUrl;
    private String link;
}
