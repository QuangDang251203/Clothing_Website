package com.example.clothing_store.repository;

import com.example.clothing_store.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrdersRepository extends JpaRepository<Orders, Integer> {
    Optional<Orders> findById(int id);
    List<Orders> findByAccountIdOrderByIdDesc(int accountId);


    @Query("SELECT COALESCE(SUM(o.totalPrice), 0) FROM Orders o " +
            "WHERE o.status <> :statusExcluded " +
            "AND o.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueByStatusNotAndCreatedAtBetween(
            @Param("statusExcluded") int statusExcluded,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    Integer countByStatus(int status);

    @Query(value = ""
            + "SELECT HOUR(o.created_at) as hour, IFNULL(SUM(o.total_price),0) as revenue "
            + "FROM orders o "
            + "WHERE DATE(o.created_at) = :date "
            + "  AND o.status <> :excludedStatus "
            + "GROUP BY HOUR(o.created_at) "
            + "ORDER BY HOUR(o.created_at)",
            nativeQuery = true)
    List<Object[]> findHourlyRevenueByDate(
            @Param("date") LocalDate date,
            @Param("excludedStatus") int excludedStatus
    );

    @Query(value = ""
            + "SELECT DATE(o.created_at) as date, IFNULL(SUM(o.total_price),0) as revenue "
            + "FROM orders o "
            + "WHERE DATE(o.created_at) BETWEEN :start AND :end "
            + "  AND o.status <> :excludedStatus "
            + "GROUP BY DATE(o.created_at) "
            + "ORDER BY DATE(o.created_at)",
            nativeQuery = true)
    List<Object[]> findDailyRevenueBetweenDates(
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("excludedStatus") int excludedStatus
    );

    @Query(value = ""
            + "SELECT MONTH(o.created_at) as month, IFNULL(SUM(o.total_price),0) as revenue "
            + "FROM orders o "
            + "WHERE YEAR(o.created_at) = :year "
            + "  AND o.status <> :excludedStatus "
            + "GROUP BY MONTH(o.created_at) "
            + "ORDER BY MONTH(o.created_at)",
            nativeQuery = true)
    List<Object[]> findMonthlyRevenueByYear(
            @Param("year") int year,
            @Param("excludedStatus") int excludedStatus
    );

}
