package com.example.clothing_store.repository;

import com.example.clothing_store.entity.Account;
import com.example.clothing_store.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findById(int id);
    Optional<Account> findByAccountCode(String accountCode);
    Page<Account> findAll(Pageable pageable);
    Optional<Account> findByPhone(String phone);

    // Thêm method này để tìm theo email
    Optional<Account> findByEmail(String email);

    // Thêm method này để tìm theo googleId
    Optional<Account> findByGoogleId(String googleId);
    @Query("SELECT a FROM Account a JOIN a.roles r WHERE r = :role")
    List<Account> findByRole(Role role);
}
