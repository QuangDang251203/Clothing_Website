package com.example.clothing_store.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MessageDTO {
    private Integer id;
    private Integer conversationId;
    private Integer senderId;
    private String  senderName;
    private String  content;
    private LocalDateTime sentAt;
    private Boolean readFlag;
}
