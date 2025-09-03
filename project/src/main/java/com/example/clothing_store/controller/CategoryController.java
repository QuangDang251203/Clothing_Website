package com.example.clothing_store.controller;

import com.example.clothing_store.dto.CategoryDTO;
import com.example.clothing_store.response.CommonResponse;
import com.example.clothing_store.service.Category.CategoryService;
import com.example.clothing_store.utils.ValidationGroups;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("category")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping("/getAllCategory")
    public List<CategoryDTO> getAllCategory() {
        return categoryService.getAllCategories();
    }

    @PostMapping("/createCategory")
    public CommonResponse createCategory(@Valid @RequestBody CategoryDTO categoryDTO) {
        return categoryService.createCategory(categoryDTO);
    }

    @PutMapping("/changeInfoCategory/{categoryCode}")
    public CommonResponse changeInfoCategory(@Validated(ValidationGroups.Update.class)
                                             @Valid @RequestBody CategoryDTO categoryDTO,
                                             @PathVariable String categoryCode) {
        return categoryService.updateCategory(categoryCode, categoryDTO);
    }

    @PutMapping("/changeStatusCategory/{categoryCode}")
    public CommonResponse changeStatusCategory(@PathVariable String categoryCode) {
        return categoryService.changeStatus(categoryCode);
    }

    @GetMapping("/byType/{type}")
    public List<CategoryDTO> getByType(@PathVariable String type) {
        return categoryService.getCategoriesByType(type);
    }
}
