package com.example.clothing_store.repository;

import com.example.clothing_store.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Integer> {
    Optional<Conversation> findByCustomerIdAndStaffId(Integer customerId, Integer staffId);
    List<Conversation> findByCustomerId(Integer customerId);
    List<Conversation> findByStaffId(Integer staffId);
    Optional<Conversation> findTopByCustomerIdAndStaffIdOrderByUpdatedAtDesc(int customerId, int staffId);

}
