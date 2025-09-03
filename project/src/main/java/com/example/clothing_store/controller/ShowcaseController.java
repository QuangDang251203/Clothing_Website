package com.example.clothing_store.controller;

import com.example.clothing_store.dto.ShowcaseDTO;
import com.example.clothing_store.dto.ShowcaseResponseDTO;
import com.example.clothing_store.enums.CommonEnums;
import com.example.clothing_store.response.ResponseToData;
import com.example.clothing_store.service.Showcase.ShowcaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/showcase")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ShowcaseController {
    private final ShowcaseService showcaseService;

    @GetMapping
    public ResponseToData<List<ShowcaseResponseDTO>> getAll() {
        return showcaseService.getAll();
    }

    /**
     * GET một showcase theo id
     */
    @GetMapping("/{id}")
    public ResponseToData<ShowcaseResponseDTO> getById(@PathVariable Integer id) {
        return showcaseService.getById(id);
    }

    @PostMapping
    // @PreAuthorize("hasRole('ADMIN')") // thêm nếu cần bảo mật
    public ResponseEntity<ResponseToData<ShowcaseResponseDTO>> create(
            @RequestParam("label") String label,
            @RequestParam("link") String link,
            @RequestParam("imageUrl") MultipartFile imageFile
    ) {
        try {
            ShowcaseDTO dto = ShowcaseDTO.builder()
                    .label(label)
                    .link(link)
                    .imageUrl(imageFile)
                    .build();
            ResponseToData<ShowcaseResponseDTO> resp = showcaseService.create(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(resp);
        } catch (RuntimeException ex) {
            // Trả 400 nếu lỗi do input
            return ResponseEntity.badRequest()
                    .body(ResponseToData.failExist(CommonEnums.FAIL_UPLOAD_IMAGE));
        }
    }

    @PutMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseToData<ShowcaseResponseDTO>> update(
            @PathVariable Integer id,
            @RequestParam(value = "label", required = false) String label,
            @RequestParam(value = "link", required = false) String link,
            @RequestParam(value = "imageUrl", required = false) MultipartFile imageFile
    ) {
        ShowcaseDTO dto = ShowcaseDTO.builder()
                .id(id)
                .label(label)
                .link(link)
                .imageUrl(imageFile)
                .build();
        try {
            ResponseToData<ShowcaseResponseDTO> resp = showcaseService.update(id, dto);
            return ResponseEntity.ok(resp);
        } catch (RuntimeException ex) {
            // Nếu không tìm thấy hoặc lỗi khác
            return ResponseEntity.badRequest()
                    .body(ResponseToData.failExist(CommonEnums.FAIL_UPLOAD_IMAGE));
        }
    }

    /**
     * DELETE xóa showcase theo id
     */
    @DeleteMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        try {
            showcaseService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}

