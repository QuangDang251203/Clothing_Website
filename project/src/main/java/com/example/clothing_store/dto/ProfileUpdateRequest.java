package com.example.clothing_store.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ProfileUpdateRequest {
    private String pass;
    private String email;
    private String gender;
    private LocalDate birthday;
    private String username;
}
