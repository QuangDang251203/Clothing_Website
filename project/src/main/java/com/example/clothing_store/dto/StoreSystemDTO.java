package com.example.clothing_store.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StoreSystemDTO {
    private Integer id;

    @NotBlank(message = "Merchant code must not be blank")
    private String merchantCode;

    @NotBlank(message = "Merchant name must not be blank")
    private String merchantName;

    @NotBlank(message = "Address must not be blank")
    private String address;

    private int status;

    @NotBlank(message = "phone must not be blank")
    private String phone;
    private String mapsUrl;
}
