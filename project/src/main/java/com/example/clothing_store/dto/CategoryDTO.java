package com.example.clothing_store.dto;

import com.example.clothing_store.utils.ValidationGroups;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {
    @NotBlank(groups = ValidationGroups.Create.class
            , message = "Category is required")
    private String categoryCode;

    @NotBlank(message = "CategoryName is required")
    private String categoryName;

    private int status;
}
