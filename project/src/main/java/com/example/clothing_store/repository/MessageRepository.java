package com.example.clothing_store.repository;

import com.example.clothing_store.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {
    List<Message> findByConversationIdOrderBySentAtAsc(Integer conversationId);
}
