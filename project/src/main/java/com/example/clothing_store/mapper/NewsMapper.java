package com.example.clothing_store.mapper;

import com.example.clothing_store.dto.NewsDTO;
import com.example.clothing_store.dto.NewsImageDTO;
import com.example.clothing_store.entity.News;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class NewsMapper {
    private final NewsImageMapper imageMapper;

    public NewsDTO toDTO(News entity) {
        if (entity == null) return null;
        List<NewsImageDTO> images = entity.getImages() != null
                ? entity.getImages().stream()
                .map(imageMapper::toDTO)
                .collect(Collectors.toList())
                : Collections.emptyList();
        return NewsDTO.builder()
                .id(entity.getId())
                .newsCode(entity.getNewsCode())
                .title(entity.getTitle())
                .detail(entity.getDetail())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .images(images)
                .build();
    }

    public News toEntity(NewsDTO dto) {
        if (dto == null) return null;
        News entity = News.builder()
                .id(dto.getId())
                .newsCode(dto.getNewsCode())
                .title(dto.getTitle())
                .detail(dto.getDetail())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
        return entity;
    }
}
