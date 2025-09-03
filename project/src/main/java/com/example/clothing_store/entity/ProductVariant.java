package com.example.clothing_store.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product_variant")
@NoArgsConstructor
@Data
@AllArgsConstructor
@Builder
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PRODUCT_ID")
    private Product product;
    private String size;
    private String color;

    @Column(name = "SKU_CODE", unique = true, nullable = false)
    private String skuCode;
    private BigDecimal price;
    private BigDecimal averageCost;
    private int quantity;
    private LocalDate createdAt;
    private LocalDate updatedAt;

    @OneToMany(mappedBy = "productVariant",cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<CartItem> cartItems = new ArrayList<>();

    @OneToMany(mappedBy = "productVariant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ImportRecord> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDate.now();
    }
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDate.now();
    }
}
