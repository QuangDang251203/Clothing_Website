package com.example.clothing_store.service.Showcase;

import com.example.clothing_store.dto.ShowcaseDTO;
import com.example.clothing_store.dto.ShowcaseResponseDTO;
import com.example.clothing_store.response.ResponseToData;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ShowcaseService {
    ResponseToData<List<ShowcaseResponseDTO>> getAll();

    ResponseToData<ShowcaseResponseDTO> getById(Integer id);

    ResponseToData<ShowcaseResponseDTO> update(Integer id, ShowcaseDTO dto);

    ResponseToData<ShowcaseResponseDTO> create(ShowcaseDTO dto);

    void delete(Integer id);
}
