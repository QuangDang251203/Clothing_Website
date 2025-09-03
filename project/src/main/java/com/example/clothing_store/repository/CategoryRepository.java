package com.example.clothing_store.repository;

import com.example.clothing_store.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    Category findByCategoryCode(String categoryCode);
}
