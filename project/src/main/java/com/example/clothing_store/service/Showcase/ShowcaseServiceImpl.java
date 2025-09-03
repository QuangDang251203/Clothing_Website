package com.example.clothing_store.service.Showcase;

import com.example.clothing_store.dto.ShowcaseDTO;
import com.example.clothing_store.dto.ShowcaseResponseDTO;
import com.example.clothing_store.entity.Showcase;
import com.example.clothing_store.mapper.ShowcaseMapper;
import com.example.clothing_store.repository.ShowcaseRepository;
import com.example.clothing_store.response.ResponseToData;
import com.example.clothing_store.service.StorageImage.StorageService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShowcaseServiceImpl implements ShowcaseService{
    private final ShowcaseRepository showcaseRepository;
    private final ShowcaseMapper showcaseMapper;
    private final StorageService storageService;
    private static final Logger log = LoggerFactory.getLogger(ShowcaseServiceImpl.class);

    public ResponseToData<List<ShowcaseResponseDTO>> getAll(){
        log.info("[Begin] Get all showcases");
        return ResponseToData.success(showcaseRepository.findAll().stream()
                .map(showcaseMapper::toResponseDTO)
                .collect(Collectors.toList()));
    }

    public ResponseToData<ShowcaseResponseDTO> getById(Integer id) {
        log.info("[Begin] Get showcase by id: {}", id);
        Showcase entity = showcaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Showcase với id " + id));
        return ResponseToData.success(showcaseMapper.toResponseDTO(entity));
    }

    public ResponseToData<ShowcaseResponseDTO> update(Integer id, ShowcaseDTO dto) {
        log.info("[Begin] Update showcase with request data: {} and id: {}",dto,id);
        Showcase entity = showcaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Showcase với id " + id));

        MultipartFile file = dto.getImageUrl();
        if (file != null && !file.isEmpty()) {
            String url = storageService.store(file);
            showcaseMapper.updateEntityFromDTO(dto, entity, url);
        } else {
            showcaseMapper.updateEntityFromDTO(dto, entity, null);
        }
        log.info("[End] Update successfully");
        Showcase saved = showcaseRepository.save(entity);
        return ResponseToData.success(showcaseMapper.toResponseDTO(saved));
    }

    public ResponseToData<ShowcaseResponseDTO> create(ShowcaseDTO dto) {
        log.info("[Begin] Create showcase with request data: {}",dto);
        MultipartFile file = dto.getImageUrl();
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Cần upload ảnh khi tạo mới");
        }
        String url = storageService.store(file);

        Showcase entity = showcaseMapper.toEntityForCreate(dto, url);
        Showcase saved = showcaseRepository.save(entity);
        log.info("[End] Create successfully");
        return ResponseToData.success(showcaseMapper.toResponseDTO(saved));
    }

    public void delete(Integer id) {
        Showcase entity = showcaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Showcase với id " + id));
        // Xóa file cũ nếu StorageService hỗ trợ delete
        showcaseRepository.delete(entity);
    }

}
