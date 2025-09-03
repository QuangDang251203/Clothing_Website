package com.example.clothing_store.controller;

import com.example.clothing_store.dto.MessageDTO;
import com.example.clothing_store.dto.SendMessageRequest;
import com.example.clothing_store.service.chat.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/{convId}/send")
    public void handleWebSocketMessage(
            @DestinationVariable Integer convId,
            @Payload MessageDTO message,
            Principal principal
    ) {
        if (principal == null) {
            throw new IllegalStateException("PRINCIPAL IS NULL on SEND frame");
        }

        SendMessageRequest req = new SendMessageRequest();
        req.setContent(message.getContent());

        MessageDTO saved = chatService.sendMessage(
                convId,
                principal.getName(),      // lấy username
                req
        );

        messagingTemplate.convertAndSend(
                "/topic/conversations/" + convId,
                saved
        );
    }
}
