package com.example.clothing_store.service.Category;

import com.example.clothing_store.entity.Category;
import com.example.clothing_store.repository.CategoryRepository;
import com.example.clothing_store.response.CommonResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CategoryServiceHelper {
    private static final Logger log = LoggerFactory.getLogger(CategoryServiceHelper.class);
    @Autowired
    private final CategoryRepository categoryRepository;

    public CategoryServiceHelper(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public boolean checkCategoryCode(String categoryCode) {
        log.info("[Begin]Check category code {}", categoryCode);
        Category category = categoryRepository.findByCategoryCode(categoryCode);
        return category != null;
    }
}
