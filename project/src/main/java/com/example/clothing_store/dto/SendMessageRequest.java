package com.example.clothing_store.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendMessageRequest {
    @NotBlank(message = "Content must not be blank")
    private String content;
}
