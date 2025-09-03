package com.example.clothing_store.dto;

import com.example.clothing_store.utils.ValidationGroups;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductDTO {

    private Integer id;
    @NotBlank(message = "productCode is required")
    private String productCode;

    @NotBlank(message = "productName is required")
    private String productName;

    @NotBlank(message = "description is required")
    private String description;

    private int numberOfPurchase;
    private int status;

    @NotNull(message = "category is required")
    private String category;

    @Valid
    @NotEmpty(message = "imageURLs is required")
    private List<@Valid ProductImageDTO> imageURLs;

    @Valid
    @NotEmpty(groups = ValidationGroups.Create.class
            , message = "Must be 1 variant when create")
    private List<@Valid ProductVariantDTO> variants;


}
