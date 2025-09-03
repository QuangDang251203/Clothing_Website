package com.example.clothing_store.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ConversationDTO {
    private Integer id;
    private Integer customerId;
    private String  customerName;
    private Integer staffId;
    private String  staffName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
