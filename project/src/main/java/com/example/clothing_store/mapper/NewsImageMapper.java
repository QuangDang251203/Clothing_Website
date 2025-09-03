package com.example.clothing_store.mapper;

import com.example.clothing_store.dto.NewsImageDTO;
import com.example.clothing_store.entity.NewsImage;
import org.springframework.stereotype.Component;

@Component
public class NewsImageMapper {
    public NewsImageDTO toDTO(NewsImage entity) {
        if (entity == null) return null;
        return NewsImageDTO.builder()
                .id(entity.getId())
                .newsId(entity.getNews() != null ? entity.getNews().getId() : 0)
                .imageUrl(entity.getImageUrl())
                .build();
    }

    public NewsImage toEntity(NewsImageDTO dto) {
        if (dto == null) return null;
        NewsImage entity = NewsImage.builder()
                .id(dto.getId())
                .imageUrl(dto.getImageUrl())
                .build();
        return entity;
    }
}
