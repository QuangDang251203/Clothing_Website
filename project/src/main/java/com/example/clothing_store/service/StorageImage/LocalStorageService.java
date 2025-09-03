package com.example.clothing_store.service.StorageImage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class LocalStorageService implements StorageService {
    @Value("${app.storage.upload-dir}")
    private String uploadDir;

    // Thêm property base URL:
    @Value("${app.storage.base-url}")
    private String baseUrl;  // ví dụ: http://localhost:8080

    @Override
    public String store(MultipartFile file) {
        String filename = UUID.randomUUID() + "-" + StringUtils.cleanPath(file.getOriginalFilename());
        Path target = Paths.get(uploadDir).resolve(filename).toAbsolutePath();
        try {
            Files.createDirectories(target.getParent());
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            // Trả về URL đầy đủ
            return baseUrl + "/files/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Không lưu được file", e);
        }
    }
}
