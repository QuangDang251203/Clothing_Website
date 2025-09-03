package com.example.clothing_store.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "order_detail")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORDER_ID")
    @JsonBackReference
    private Orders order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "SKU_CODE",
            referencedColumnName = "SKU_CODE")
    private ProductVariant productVariant;

    private int quantity;
    private BigDecimal price;

    @Column(name = "REVIEWED", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean reviewed = false;

    @OneToOne(mappedBy = "orderDetail", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private Review review;
}
