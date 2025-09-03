package com.example.clothing_store.mapper;

import com.example.clothing_store.dto.ConversationDTO;
import com.example.clothing_store.entity.Conversation;
import org.springframework.stereotype.Component;

@Component
public class ConversationMapper {
    public static ConversationDTO toDTO(Conversation conv) {
        ConversationDTO dto = new ConversationDTO();
        dto.setId(conv.getId());
        dto.setCustomerId(conv.getCustomer().getId());
        dto.setCustomerName(conv.getCustomer().getFullName());
        dto.setStaffId(conv.getStaff().getId());
        dto.setStaffName(conv.getStaff().getFullName());
        dto.setCreatedAt(conv.getCreatedAt());
        dto.setUpdatedAt(conv.getUpdatedAt());
        return dto;
    }
}
