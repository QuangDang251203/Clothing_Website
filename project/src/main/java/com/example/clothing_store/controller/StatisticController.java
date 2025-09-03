package com.example.clothing_store.controller;

import com.example.clothing_store.dto.*;
import com.example.clothing_store.response.ResponseToData;
import com.example.clothing_store.service.Statistic.StatisticService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/statistic")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class StatisticController {
    private final StatisticService statisticService;

    @GetMapping("/revenue")
    public ResponseToData<BigDecimal> getRevenue(@RequestParam("start")
                                                 @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
                                                 @RequestParam("end")
                                                 @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return statisticService.getRevenue(start, end);
    }

    @GetMapping("/countByStatus/{status}")
    public ResponseToData<Integer> getCountByStatus(@PathVariable int status) {
        return statisticService.countByStatus(status);
    }

    @GetMapping("/getTotalProductInStorage")
    public ResponseToData<Integer> getTotalProductInStorage() {
        return statisticService.totalProductInStorage();
    }

    @GetMapping("/top-selling")
    public ResponseToData<List<TopSellingProductDTO>> getTopSelling(
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam("end")   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        if (start.isAfter(end)) return ResponseToData.failGetProductTop();
        // chuyển thành đầu ngày và cuối ngày
        LocalDateTime from = start.atStartOfDay();
        LocalDateTime to   = end.atTime(LocalTime.MAX);
        return statisticService.getTopSellingProducts(from, to, 99, 20);
    }

    @GetMapping("/revenue/hourly")
    public ResponseToData<List<RevenueByHourDTO>> getRevenueByHour(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return statisticService.getRevenueByHour(date);
    }

    /**
     * Thống kê doanh thu theo ngày trong khoảng.
     * Ví dụ: /statistic/revenue/daily?start=2025-06-01&end=2025-06-07
     */
    @GetMapping("/revenue/daily")
    public ResponseToData<List<RevenueByDateDTO>> getRevenueByDateRange(
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return statisticService.getRevenueByDateRange(start, end);
    }

    /**
     * Thống kê doanh thu theo ngày trong 1 tháng.
     * Ví dụ: /statistic/revenue/month?year=2025&month=6
     */
    @GetMapping("/revenue/month")
    public ResponseToData<List<RevenueByDateDTO>> getRevenueByMonth(
            @RequestParam("year") int year,
            @RequestParam("month") int month) {
        return statisticService.getRevenueByMonth(year, month);
    }

    /**
     * Thống kê doanh thu theo tháng trong 1 năm.
     * Ví dụ: /statistic/revenue/year?year=2025
     */
    @GetMapping("/revenue/year")
    public ResponseToData<List<RevenueByMonthDTO>> getRevenueByYear(
            @RequestParam("year") int year) {
        return statisticService.getRevenueByYear(year);
    }

    @GetMapping("/top-storage")
    public ResponseToData<List<SkuQuantityDTO>> getTopStorage(
            @RequestParam(name = "topN", defaultValue = "6") int topN) {
        return statisticService.getTopStorageVariants(topN);
    }

    @GetMapping("/profit/daily")
    public ResponseToData<List<RevenueByDateDTO>> profitDaily(
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        return statisticService.profitByDateRange(start, end);
    }

    // profit per hour in one day
    @GetMapping("/profit/hourly")
    public ResponseToData<List<RevenueByHourDTO>> profitHourly(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return statisticService.profitByHour(date);
    }

    // profit per month in one year
    @GetMapping("/profit/year")
    public ResponseToData<List<RevenueByMonthDTO>> profitYearly(
            @RequestParam("year") int year
    ) {
        return statisticService.profitByYear(year);
    }

    @GetMapping("/profit/month")
    public ResponseToData<List<RevenueByDateDTO>> profitMonthly(
            @RequestParam("year") int year,
            @RequestParam("month") int month
    ) {
        return statisticService.profitByMonth(year, month);
    }
}
