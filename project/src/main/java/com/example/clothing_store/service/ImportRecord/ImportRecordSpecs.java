package com.example.clothing_store.service.ImportRecord;

import com.example.clothing_store.entity.ImportRecord;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ImportRecordSpecs {
    public static Specification<ImportRecord> filter(
            Integer productId,
            String skuCode,
            LocalDateTime fromDate,
            LocalDateTime toDate
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (productId != null) {
                predicates.add(cb.equal(
                        root.get("productVariant").get("product").get("id"),
                        productId
                ));
            }

            if (skuCode != null && !skuCode.isBlank()) {
                predicates.add(cb.equal(
                        root.get("productVariant").get("skuCode"),
                        skuCode
                ));
            }

            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(
                        root.get("createdAt"),
                        fromDate
                ));
            }

            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(
                        root.get("createdAt"),
                        toDate
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
