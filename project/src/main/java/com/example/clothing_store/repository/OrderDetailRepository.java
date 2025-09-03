package com.example.clothing_store.repository;

import com.example.clothing_store.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Integer> {
    List<OrderDetail> findByOrderId(int orderId);

    @Query("SELECT od.productVariant.skuCode AS skuCode, SUM(od.quantity) AS totalQuantity " +
            "FROM OrderDetail od " +
            "JOIN od.order o " +
            "WHERE o.createdAt BETWEEN :start AND :end " +
            "AND o.status <> :excludedStatus " +
            "GROUP BY od.productVariant.skuCode " +
            "ORDER BY SUM(od.quantity) DESC")
    List<Object[]> findTopSellingSkuBetweenDates(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("excludedStatus") int excludedStatus,
            Pageable pageable);

    // 1. Profit theo ngày trong khoảng start..end
    @Query(value = """
              SELECT
                DATE(o.created_at)                                              AS d,
                IFNULL(SUM((od.price - pv.average_cost) * od.quantity), 0)      AS profit
              FROM orders o
              JOIN order_detail od ON od.ORDER_ID = o.id
              JOIN product_variant pv ON pv.SKU_CODE = od.SKU_CODE
              WHERE o.status <> :excludedStatus
                AND DATE(o.created_at) BETWEEN :start AND :end
              GROUP BY DATE(o.created_at)
              ORDER BY DATE(o.created_at)
            """, nativeQuery = true)
    List<Object[]> findDailyProfitBetweenDates(
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("excludedStatus") int excludedStatus
    );

    // 2. Profit theo giờ trong 1 ngày
    @Query(value = """
              SELECT
                HOUR(o.created_at)                                              AS h,
                IFNULL(SUM((od.price - pv.average_cost) * od.quantity), 0)      AS profit
              FROM orders o
              JOIN order_detail od ON od.ORDER_ID = o.id
              JOIN product_variant pv ON pv.SKU_CODE = od.SKU_CODE
              WHERE o.status <> :excludedStatus
                AND DATE(o.created_at) = :date
              GROUP BY HOUR(o.created_at)
              ORDER BY HOUR(o.created_at)
            """, nativeQuery = true)
    List<Object[]> findHourlyProfitByDate(
            @Param("date") LocalDate date,
            @Param("excludedStatus") int excludedStatus
    );

    // 3. Profit theo tháng trong 1 năm
    @Query(value = """
              SELECT
                MONTH(o.created_at)                                             AS m,
                IFNULL(SUM((od.price - pv.average_cost) * od.quantity), 0)      AS profit
              FROM orders o
              JOIN order_detail od ON od.ORDER_ID = o.id
              JOIN product_variant pv ON pv.SKU_CODE = od.SKU_CODE
              WHERE o.status <> :excludedStatus
                AND YEAR(o.created_at) = :year
              GROUP BY MONTH(o.created_at)
              ORDER BY MONTH(o.created_at)
            """, nativeQuery = true)
    List<Object[]> findMonthlyProfitByYear(
            @Param("year") int year,
            @Param("excludedStatus") int excludedStatus
    );
}
