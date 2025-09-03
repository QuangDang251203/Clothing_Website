package com.example.clothing_store.service.Statistic;

import com.example.clothing_store.dto.*;
import com.example.clothing_store.enums.CommonEnums;
import com.example.clothing_store.repository.AccountRepository;
import com.example.clothing_store.repository.OrderDetailRepository;
import com.example.clothing_store.repository.OrdersRepository;
import com.example.clothing_store.repository.ProductVariantRepository;
import com.example.clothing_store.response.ResponseToData;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatisticServiceImpl implements StatisticService {
    private final OrdersRepository ordersRepo;
    private final OrderDetailRepository orderDetailRepo;
    private final AccountRepository accountRepo;
    private final ProductVariantRepository productVariantRepo;
    private final int EXCLUDED_STATUS = 99;
    private static final Logger log = LoggerFactory.getLogger(StatisticServiceImpl.class);

    public ResponseToData<BigDecimal> getRevenue(LocalDate startDate, LocalDate endDate) {
        log.info("[Begin]GetRevenue with start {} and end {}", startDate, endDate);
        int statusExcluded = 99;
        return ResponseToData.success(ordersRepo.sumRevenueByStatusNotAndCreatedAtBetween(statusExcluded, startDate, endDate));
    }

    public ResponseToData<Integer> countByStatus(int status) {
        log.info("[Begin]CountByStatus with status {}", status);
        return ResponseToData.success(ordersRepo.countByStatus(status));
    }

    public ResponseToData<Integer> totalProductInStorage() {
        return ResponseToData.success(productVariantRepo.sumTotalQuantity());
    }

    public ResponseToData<List<TopSellingProductDTO>> getTopSellingProducts(
            LocalDateTime start, LocalDateTime end, int excludedStatus, int topN) {
        // Tạo pageable để giới hạn topN
        PageRequest pageable = PageRequest.of(0, topN);
        List<Object[]> rawResults = orderDetailRepo.findTopSellingSkuBetweenDates(
                start, end, excludedStatus, pageable);

        List<TopSellingProductDTO> dtos = new ArrayList<>();
        for (Object[] row : rawResults) {
            String skuCode = (String) row[0];
            // SUM(od.quantity) thường trả về Long
            Long totalQty = row[1] != null ? (Long) row[1] : 0L;
            dtos.add(new TopSellingProductDTO(skuCode, totalQty));
        }
        return ResponseToData.success(dtos);
    }

    @Override
    public ResponseToData<List<RevenueByHourDTO>> getRevenueByHour(LocalDate date) {
        log.info("[Begin]GetRevenueByHour with data request :{}", date);
        List<Object[]> raw = ordersRepo.findHourlyRevenueByDate(date, EXCLUDED_STATUS);
        // Chuyển thành map hour->revenue
        Map<Integer, BigDecimal> map = new HashMap<>();
        for (Object[] row : raw) {
            Integer hour = ((Number) row[0]).intValue();
            BigDecimal rev = row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO;
            map.put(hour, rev);
        }
        List<RevenueByHourDTO> result = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            BigDecimal rev = map.getOrDefault(h, BigDecimal.ZERO);
            result.add(new RevenueByHourDTO(h, rev));
        }
        return ResponseToData.success(result);
    }

    @Override
    public ResponseToData<List<RevenueByDateDTO>> getRevenueByDateRange(LocalDate start, LocalDate end) {
        log.info("[Begin]GetRevenueByDateRange with start:{} and end: {}", start, end);
        if (start.isAfter(end)) {
            log.error("[Error] Time is not valid");
            return ResponseToData.fail(CommonEnums.FAIL_LOAD_REVENUE);
        }
        List<Object[]> raw = ordersRepo.findDailyRevenueBetweenDates(start, end, EXCLUDED_STATUS);
        Map<LocalDate, BigDecimal> map = new HashMap<>();
        for (Object[] row : raw) {
            // row[0] là java.sql.Date -> chuyển thành LocalDate
            LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
            BigDecimal rev = row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO;
            map.put(date, rev);
        }
        List<RevenueByDateDTO> result = new ArrayList<>();
        LocalDate curr = start;
        while (!curr.isAfter(end)) {
            BigDecimal rev = map.getOrDefault(curr, BigDecimal.ZERO);
            result.add(new RevenueByDateDTO(curr, rev));
            curr = curr.plusDays(1);
        }
        return ResponseToData.success(result);
    }

    /**
     * Thống kê doanh thu theo ngày trong 1 tháng: year và month.
     */
    @Override
    public ResponseToData<List<RevenueByDateDTO>> getRevenueByMonth(int year, int month) {
        log.info("[Begin]GetRevenueByMonth with month: {}", month);
        // Kiểm tra month hợp lệ 1..12
        if (month < 1 || month > 12) {
            log.error("[Error] Month is not valid");
            return ResponseToData.fail(CommonEnums.FAIL_LOAD_REVENUE);
        }
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();
        return getRevenueByDateRange(start, end);
    }

    /**
     * Thống kê doanh thu theo tháng trong 1 năm: trả về 12 phần tử (1..12).
     */
    @Override
    public ResponseToData<List<RevenueByMonthDTO>> getRevenueByYear(int year) {
        log.info("[Begin]GetRevenueByYear with month: {}", year);
        List<Object[]> raw = ordersRepo.findMonthlyRevenueByYear(year, EXCLUDED_STATUS);
        Map<Integer, BigDecimal> map = new HashMap<>();
        for (Object[] row : raw) {
            Integer month = ((Number) row[0]).intValue(); // 1..12
            BigDecimal rev = row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO;
            map.put(month, rev);
        }
        List<RevenueByMonthDTO> result = new ArrayList<>();
        // Điền đủ 1..12
        for (int m = 1; m <= 12; m++) {
            BigDecimal rev = map.getOrDefault(m, BigDecimal.ZERO);
            result.add(new RevenueByMonthDTO(m, rev));
        }
        return ResponseToData.success(result);
    }

    @Override
    public ResponseToData<List<SkuQuantityDTO>> getTopStorageVariants(int topN) {
        log.info("[Begin]GetTopStorageVariants with topN: {}", topN);
        var page = PageRequest.of(0, topN);
        List<Object[]> raw = productVariantRepo.findTop6ByQuantity(page);
        List<SkuQuantityDTO> result = new ArrayList<>();
        for (Object[] row : raw) {
            SkuQuantityDTO dto = new SkuQuantityDTO();
            String sku = (String) row[0];
            int quantity = ((Number) row[1]).intValue();
            result.add(new SkuQuantityDTO(sku, quantity));
        }
        return ResponseToData.success(result);
    }

    @Override
    public ResponseToData<List<RevenueByDateDTO>> profitByDateRange(LocalDate start, LocalDate end) {
        List<Object[]> raw = orderDetailRepo.findDailyProfitBetweenDates(start, end, EXCLUDED_STATUS);
        List<RevenueByDateDTO> list = new ArrayList<>();
        for (Object[] r : raw) {
            LocalDate d = ((java.sql.Date) r[0]).toLocalDate();
            BigDecimal p = (BigDecimal) r[1];
            list.add(new RevenueByDateDTO(d, p));
        }
        return ResponseToData.success(list);
    }

    @Override
    public ResponseToData<List<RevenueByHourDTO>> profitByHour(LocalDate date) {
        List<Object[]> raw = orderDetailRepo.findHourlyProfitByDate(date, EXCLUDED_STATUS);
        Map<Integer, BigDecimal> map = new HashMap<>();
        for (Object[] r : raw) {
            map.put(((Number) r[0]).intValue(), (BigDecimal) r[1]);
        }
        List<RevenueByHourDTO> hours = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            hours.add(new RevenueByHourDTO(h, map.getOrDefault(h, BigDecimal.ZERO)));
        }
        return ResponseToData.success(hours);
    }

    @Override
    public ResponseToData<List<RevenueByMonthDTO>> profitByYear(int year) {
        List<Object[]> raw = orderDetailRepo.findMonthlyProfitByYear(year, EXCLUDED_STATUS);
        List<RevenueByMonthDTO> months = new ArrayList<>();
        for (Object[] r : raw) {
            int m = ((Number) r[0]).intValue();
            BigDecimal p = (BigDecimal) r[1];
            months.add(new RevenueByMonthDTO(m, p));
        }
        return ResponseToData.success(months);
    }

    @Override
    public ResponseToData<List<RevenueByDateDTO>> profitByMonth(int year, int month) {
        // Xác định ngày đầu và cuối của tháng
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();
        // Gọi lại profitByDateRange để tận dụng native query đã viết
        return profitByDateRange(start, end);
    }
}
