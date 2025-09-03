package com.example.clothing_store.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShowcaseResponseDTO {
    private Integer id;
    private String label;
    private String imageUrl; // ví dụ "/images/{filename}" hoặc full URL nếu dùng domain cố định
    private String link;
}
