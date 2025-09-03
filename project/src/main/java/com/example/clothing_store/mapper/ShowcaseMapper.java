package com.example.clothing_store.mapper;

import com.example.clothing_store.dto.ShowcaseDTO;
import com.example.clothing_store.dto.ShowcaseResponseDTO;
import com.example.clothing_store.entity.Showcase;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class ShowcaseMapper {
    private final ModelMapper modelMapper = new ModelMapper();

    public ShowcaseDTO toDTO(ShowcaseDTO dto) {
        return modelMapper.map(dto, ShowcaseDTO.class);
    }
    public Showcase toEntity(ShowcaseDTO dto) {
        return Showcase.builder()
                .id(dto.getId())
                .label(dto.getLabel())
                .imageUrl(String.valueOf(dto.getImageUrl()))
                .link(dto.getLink())
                .build();
    }
    public ShowcaseResponseDTO toResponseDTO(Showcase entity) {
        if (entity == null) return null;
        ShowcaseResponseDTO dto = new ShowcaseResponseDTO();
        dto.setId(entity.getId());
        dto.setLabel(entity.getLabel());
        dto.setImageUrl(entity.getImageUrl());
        dto.setLink(entity.getLink());
        return dto;
    }

    // Request DTO -> Entity (chỉ map label, link; imageUrl xử lý riêng sau khi upload file)
    // Với update: chúng ta nhận entity cũ từ DB rồi set các trường nếu không null
    public void updateEntityFromDTO(ShowcaseDTO dto, Showcase entity, String savedImageUrl) {
        // savedImageUrl: URL mới nếu upload file mới, hoặc null nếu không đổi
        if (dto.getLabel() != null) {
            entity.setLabel(dto.getLabel());
        }
        if (dto.getLink() != null) {
            entity.setLink(dto.getLink());
        }
        if (savedImageUrl != null) {
            entity.setImageUrl(savedImageUrl);
        }
    }

    public Showcase toEntityForCreate(ShowcaseDTO dto, String savedImageUrl) {
        Showcase entity = new Showcase();
        entity.setLabel(dto.getLabel());
        entity.setLink(dto.getLink());
        entity.setImageUrl(savedImageUrl);
        return entity;
    }
}
