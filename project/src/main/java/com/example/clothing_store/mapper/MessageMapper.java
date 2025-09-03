package com.example.clothing_store.mapper;

import com.example.clothing_store.dto.MessageDTO;
import com.example.clothing_store.entity.Message;
import org.springframework.stereotype.Component;

@Component
public class MessageMapper {
    public static MessageDTO toDTO(Message msg) {
        MessageDTO dto = new MessageDTO();
        dto.setId(msg.getId());
        dto.setConversationId(msg.getConversation().getId());
        dto.setSenderId(msg.getSender().getId());
        dto.setSenderName(msg.getSender().getFullName());
        dto.setContent(msg.getContent());
        dto.setSentAt(msg.getSentAt());
        dto.setReadFlag(msg.getReadFlag());
        return dto;
    }
}
