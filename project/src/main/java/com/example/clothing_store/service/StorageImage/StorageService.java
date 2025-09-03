package com.example.clothing_store.service.StorageImage;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public interface StorageService {
    String store(MultipartFile file);
}
