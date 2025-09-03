package com.example.clothing_store.service.chat;

import com.example.clothing_store.dto.ConversationDTO;
import com.example.clothing_store.dto.MessageDTO;
import com.example.clothing_store.dto.SendMessageRequest;
import com.example.clothing_store.entity.Account;
import com.example.clothing_store.entity.Conversation;
import com.example.clothing_store.entity.Message;
import com.example.clothing_store.mapper.ConversationMapper;
import com.example.clothing_store.mapper.MessageMapper;
import com.example.clothing_store.repository.AccountRepository;
import com.example.clothing_store.repository.ConversationRepository;
import com.example.clothing_store.repository.MessageRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {
    private final ConversationRepository convRepo;
    private final MessageRepository msgRepo;
    private final AccountRepository accRepo;

    /** Lấy hoặc tạo conversation giữa customer và staffId **/
    @Transactional
    public ConversationDTO getOrCreateConversation(String customerPhone, Integer staffId) {
        Account customer = accRepo.findByPhone(customerPhone)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        Account staff = accRepo.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        // Thử tìm conversation duy nhất
        Optional<Conversation> existing = convRepo.findTopByCustomerIdAndStaffIdOrderByUpdatedAtDesc(
                customer.getId(), staff.getId());
        Conversation conv = existing.orElseGet(() -> {
            Conversation c = Conversation.builder()
                    .customer(customer)
                    .staff(staff)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            return convRepo.save(c);
        });
        return ConversationMapper.toDTO(conv);
    }

    /** Lấy danh sách conversation của người dùng hiện tại **/
    public List<ConversationDTO> listConversations(String phone) {
        Account me = accRepo.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isStaff = me.getRoles().stream()
                .anyMatch(r -> r.name().startsWith("ROLE_STAFF") || r.name().startsWith("ROLE_ADMIN"));

        List<Conversation> convs = isStaff
                ? convRepo.findByStaffId(me.getId())
                : convRepo.findByCustomerId(me.getId());

        return convs.stream()
                .map(ConversationMapper::toDTO)
                .collect(Collectors.toList());
    }

    /** Lấy lịch sử tin nhắn **/
    @Override
    public List<MessageDTO> getMessages(Integer convId, UserDetails requester) throws AccessDeniedException {
        Conversation conv = convRepo.findById(convId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        boolean isAdmin = requester.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isStaff = requester.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF"));

        String phone = requester.getUsername();
        boolean isCustomerOfConv = conv.getCustomer().getPhone().equals(phone);

        // Admin and any Staff can view all conversations
        // Admin and any Staff can view all conversations
        if (!isAdmin && !isStaff && !isCustomerOfConv) {
            throw new AccessDeniedException("Bạn không có quyền truy cập cuộc trò chuyện này");
        }

        return msgRepo.findByConversationIdOrderBySentAtAsc(convId)
                .stream()
                .map(MessageMapper::toDTO)
                .collect(Collectors.toList());
    }

    /** Gửi tin nhắn **/
    @Transactional
    public MessageDTO sendMessage(Integer convId, String senderPhone, SendMessageRequest req) {
        Conversation conv = convRepo.findById(convId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        Account sender = accRepo.findByPhone(senderPhone)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        Message m = Message.builder()
                .conversation(conv)
                .sender(sender)
                .content(req.getContent())
                .sentAt(LocalDateTime.now())
                .readFlag(false)
                .build();
        Message saved = msgRepo.save(m);

        conv.setUpdatedAt(LocalDateTime.now());
        convRepo.save(conv);

        return MessageMapper.toDTO(saved);
    }
    public List<ConversationDTO> listAllConversations() {
        return convRepo.findAll().stream()
                .map(ConversationMapper::toDTO)
                .collect(Collectors.toList());
    }
}
