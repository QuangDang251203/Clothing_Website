package com.example.clothing_store.controller;

import com.example.clothing_store.dto.ImportRecordDTO;
import com.example.clothing_store.response.ResponseToData;
import com.example.clothing_store.service.ImportRecord.ImportRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/importRecord")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ImportRecordController {
    private final ImportRecordService importRecordService;

    @PostMapping("/importGoods")
    public ResponseToData<ImportRecordDTO> importGoods(@RequestBody ImportRecordDTO importRecordDTO) {
        return importRecordService.importGoods(importRecordDTO);
    }

    @GetMapping("/importLookup/{productId}")
    public ResponseToData<List<ImportRecordDTO>> importLookupByProductId(@PathVariable Integer productId) {
        return importRecordService.importLookupByProductId(productId);
    }

    @GetMapping("/searchImport")
    public ResponseToData<List<ImportRecordDTO>> search(@RequestParam(required = false) Integer productId,
                                                        @RequestParam(required = false) String skuCode,
                                                        @RequestParam(required = false)
                                                        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
                                                        @RequestParam(required = false)
                                                        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to){
        return importRecordService.searchImportRecords(productId, skuCode, from, to);
    }
}
