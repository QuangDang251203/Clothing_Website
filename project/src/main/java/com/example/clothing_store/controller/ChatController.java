package com.example.clothing_store.controller;

import com.example.clothing_store.dto.ConversationDTO;
import com.example.clothing_store.dto.MessageDTO;
import com.example.clothing_store.dto.SendMessageRequest;
import com.example.clothing_store.service.chat.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    /** Danh sách conversation của người đang login **/
    @GetMapping("/conversations")
    public List<ConversationDTO> listConversations(@AuthenticationPrincipal UserDetails user) {
        return chatService.listConversations(user.getUsername());
    }

    /** Mở hoặc tạo conversation mới với staffId **/
    @PostMapping("/conversations/{staffId}")
    public ConversationDTO openConversation(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Integer staffId) {
        return chatService.getOrCreateConversation(user.getUsername(), staffId);
    }

    /** Lấy lịch sử tin nhắn **/
    @GetMapping("/conversations/{convId}/messages")
    public List<MessageDTO> getMessages(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Integer convId) throws AccessDeniedException {
        return chatService.getMessages(convId, user);
    }

    /** Gửi tin nhắn **/
    @PostMapping("/conversations/{convId}/messages")
    public MessageDTO sendMessage(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Integer convId,
            @RequestBody SendMessageRequest req) {
        return chatService.sendMessage(convId, user.getUsername(), req);
    }

    @GetMapping("/conversations/all")
    public List<ConversationDTO> listAllConversations(@AuthenticationPrincipal UserDetails user) throws AccessDeniedException {
        // Kiểm tra role
        boolean isStaffOrAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF")
                        || a.getAuthority().equals("ROLE_ADMIN"));
        if (!isStaffOrAdmin) {
            throw new AccessDeniedException("Only staff or admin can view all conversations");
        }
        return chatService.listAllConversations();
    }
}
