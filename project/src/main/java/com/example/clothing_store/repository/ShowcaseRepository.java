package com.example.clothing_store.repository;

import com.example.clothing_store.entity.Showcase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShowcaseRepository extends JpaRepository<Showcase, Integer> {

}
