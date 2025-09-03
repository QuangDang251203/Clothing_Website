package com.example.clothing_store.service.ImportRecord;

import com.example.clothing_store.dto.ImportRecordDTO;
import com.example.clothing_store.response.ResponseToData;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public interface ImportRecordService {
    ResponseToData<ImportRecordDTO> importGoods(ImportRecordDTO importRecordDTO);

    ResponseToData<List<ImportRecordDTO>> importLookupByProductId(int productId);

    ResponseToData<List<ImportRecordDTO>> searchImportRecords(
            Integer productId,
            String skuCode,
            LocalDateTime fromDate,
            LocalDateTime toDate
    );
}
