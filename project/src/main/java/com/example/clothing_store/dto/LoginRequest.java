package com.example.clothing_store.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Phone is required")
    private String phone;
    @NotBlank(message = "Password is required")
    private String pass;
}
