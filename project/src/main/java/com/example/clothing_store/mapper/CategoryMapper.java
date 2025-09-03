package com.example.clothing_store.mapper;

import com.example.clothing_store.dto.CategoryDTO;
import com.example.clothing_store.entity.Category;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {
    private static final ModelMapper modelMapper = new ModelMapper();
    public static Category toEntity(CategoryDTO dto) {
        return modelMapper.map(dto, Category.class);
    }
    public static CategoryDTO toDto(Category entity) {
        return modelMapper.map(entity, CategoryDTO.class);
    }
}
