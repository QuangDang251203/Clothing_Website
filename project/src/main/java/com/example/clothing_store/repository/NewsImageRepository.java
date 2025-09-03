package com.example.clothing_store.repository;

import com.example.clothing_store.entity.NewsImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NewsImageRepository extends JpaRepository<NewsImage,Integer> {
}
