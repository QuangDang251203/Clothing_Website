package com.example.clothing_store.service.Category;

import com.example.clothing_store.dto.CategoryDTO;
import com.example.clothing_store.response.CommonResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface CategoryService {
    List<CategoryDTO> getAllCategories();

    CommonResponse createCategory(CategoryDTO categoryDTO);

    CommonResponse updateCategory(String categoryCode, CategoryDTO categoryDTO);

    CommonResponse changeStatus(String categoryCode);

    List<CategoryDTO> getCategoriesByType(String type);
}
