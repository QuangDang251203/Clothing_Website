package com.example.clothing_store.service.Statistic;

import com.example.clothing_store.dto.*;
import com.example.clothing_store.response.ResponseToData;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public interface StatisticService {
    ResponseToData<BigDecimal> getRevenue(LocalDate startDate, LocalDate endDate);

    ResponseToData<Integer> countByStatus(int status);

    ResponseToData<Integer> totalProductInStorage();

    ResponseToData<List<TopSellingProductDTO>> getTopSellingProducts(
            LocalDateTime start, LocalDateTime end, int excludedStatus, int topN);

    ResponseToData<List<RevenueByHourDTO>> getRevenueByHour(LocalDate date);

    ResponseToData<List<RevenueByDateDTO>> getRevenueByDateRange(LocalDate start, LocalDate end);

    ResponseToData<List<RevenueByDateDTO>> getRevenueByMonth(int year, int month);

    ResponseToData<List<RevenueByMonthDTO>> getRevenueByYear(int year);

    ResponseToData<List<SkuQuantityDTO>> getTopStorageVariants(int topN);

    ResponseToData<List<RevenueByDateDTO>> profitByDateRange(LocalDate start, LocalDate end);

    ResponseToData<List<RevenueByHourDTO>> profitByHour(LocalDate date);

    ResponseToData<List<RevenueByMonthDTO>> profitByYear(int year);

    ResponseToData<List<RevenueByDateDTO>> profitByMonth(int year, int month);
}
