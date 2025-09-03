package com.example.clothing_store.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShippingAddressDTO {
    private Integer  id;
    @NotNull(message = "accountId is required")
    private int accountId;

    @NotBlank(message = "address is required")
    private String address;

    @NotBlank(message = "mobile is required")
    @Size(max = 10, min = 10, message = "mobile is required")
    private String mobile;

    @NotBlank(message = "consigneeName is required")
    private String consigneeName;
}
