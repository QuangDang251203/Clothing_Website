package com.example.clothing_store.repository;

import com.example.clothing_store.entity.ImportRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ImportRecordRepository extends JpaRepository<ImportRecord, Integer>, JpaSpecificationExecutor<ImportRecord> {
    List<ImportRecord> findAllByProductVariant_SkuCode(String skuCode);

    List<ImportRecord> findAll();

}
