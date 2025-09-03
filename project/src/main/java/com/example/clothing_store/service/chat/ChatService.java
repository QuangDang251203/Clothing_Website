package com.example.clothing_store.service.chat;

import com.example.clothing_store.dto.ConversationDTO;
import com.example.clothing_store.dto.MessageDTO;
import com.example.clothing_store.dto.SendMessageRequest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;
import java.util.List;

@Service
public interface ChatService {
    ConversationDTO getOrCreateConversation(String customerPhone, Integer staffId);

    List<ConversationDTO> listConversations(String phone);

    List<MessageDTO> getMessages(Integer convId, UserDetails requester) throws AccessDeniedException;

    MessageDTO sendMessage(Integer convId, String senderPhone, SendMessageRequest req);

    List<ConversationDTO> listAllConversations();
}
