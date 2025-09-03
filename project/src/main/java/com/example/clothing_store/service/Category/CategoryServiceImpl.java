package com.example.clothing_store.service.Category;

import com.example.clothing_store.constant.CommonConstant;
import com.example.clothing_store.dto.CategoryDTO;
import com.example.clothing_store.entity.Category;
import com.example.clothing_store.enums.CommonEnums;
import com.example.clothing_store.mapper.CategoryMapper;
import com.example.clothing_store.repository.CategoryRepository;
import com.example.clothing_store.response.CommonResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private static final Logger log = LoggerFactory.getLogger(CategoryServiceImpl.class);
    private final CategoryRepository categoryRepository;
    private final CategoryServiceHelper categoryServiceHelper;

    public List<CategoryDTO> getAllCategories() {
        log.info("[Begin]GetAllCategories");
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(cat -> new CategoryDTO(cat.getCategoryCode(), cat.getCategoryName(), cat.getStatus()))
                .collect(Collectors.toList());
    }

    @Transactional
    public CommonResponse createCategory(CategoryDTO categoryDTO) {
        log.info("[Begin]CreateCategory with data request: {}", categoryDTO);
        if (categoryServiceHelper.checkCategoryCode(categoryDTO.getCategoryCode())) {
            log.info("CategoryCode is exist");
            return CommonResponse.response(CommonEnums.CODE_IS_EXIST);
        }
        log.info("CategoryCode is not exist");
        categoryDTO.setStatus(CommonConstant.ACTIVE_STATUS);
        Category category = CategoryMapper.toEntity(categoryDTO);
        categoryRepository.save(category);
        log.info("[End]Category created");
        return CommonResponse.response(CommonEnums.SUCCESS);
    }

    @Transactional
    public CommonResponse updateCategory(String categoryCode, CategoryDTO categoryDTO) {
        log.info("[Begin]UpdateCategory with data request: {}", categoryDTO);
        Category category = categoryRepository.findByCategoryCode(categoryCode);
        if (category == null) {
            log.info("CategoryCode is not exist");
            return CommonResponse.response(CommonEnums.CODE_IS_NOT_EXIST);
        }
        log.info("CategoryCode is exist");
        category.setCategoryName(categoryDTO.getCategoryName());
        categoryRepository.save(category);
        log.info("[End]Category updated");
        return CommonResponse.response(CommonEnums.SUCCESS);
    }

    @Override
    public CommonResponse changeStatus(String categoryCode) {
        log.info("[Begin]ChangeStatus with categoryCode: {}", categoryCode);
        Category category = categoryRepository.findByCategoryCode(categoryCode);
        if (category == null) {
            log.info("CategoryCode {} is not exist", categoryCode);
            return CommonResponse.response(CommonEnums.CODE_IS_NOT_EXIST);
        }
        log.info("CategoryCode {} is exist", categoryCode);
        int newStatus = category.getStatus() == CommonConstant.ACTIVE_STATUS
                ? CommonConstant.INACTIVE_STATUS : CommonConstant.ACTIVE_STATUS;
        category.setStatus(newStatus);
        categoryRepository.save(category);
        log.info("[End]ChangeStatus updated");
        return CommonResponse.response(CommonEnums.SUCCESS);
    }

    public List<CategoryDTO> getCategoriesByType(String type) {
        log.info("[Begin] Lấy categories theo type: {}", type);
        List<CategoryDTO> all = getAllCategories();
        switch (type.toLowerCase()) {
            case "t-shirt":
                // Mã bắt đầu bằng "T"
                return all.stream()
                        .filter(c -> c.getCategoryCode().startsWith("T")
                                && c.getStatus() == CommonConstant.ACTIVE_STATUS)
                        .collect(Collectors.toList());
            case "pants":
                // Mã bắt đầu bằng "P"
                return all.stream()
                        .filter(c -> c.getCategoryCode().startsWith("P")
                                && c.getStatus() == CommonConstant.ACTIVE_STATUS)
                        .collect(Collectors.toList());
            case "accessory":
            default:
                // Các mã khác
                return all.stream()
                        .filter(c -> {
                            String code = c.getCategoryCode();
                            return !code.startsWith("T")
                                    && !code.startsWith("P")
                                    && c.getStatus() == CommonConstant.ACTIVE_STATUS;
                        })
                        .collect(Collectors.toList());
        }
    }
}
