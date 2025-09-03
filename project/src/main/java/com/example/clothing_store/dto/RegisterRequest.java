package com.example.clothing_store.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
@Data
public class RegisterRequest {
    @NotBlank
    @Size(min=10, max=10)
    private String phone;

    @NotBlank @Size(min=6)
    private String pass;

    private String email;
    private String gender;
    private LocalDate birthday;

    private String username;
    private String role;
}
