package com.example.clothing_store.config;

import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${app.storage.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Khi client gọi http://localhost:8080/files/{filename}
        // Spring sẽ tìm trong thư mục C:/uploads/{filename}
        registry
                .addResourceHandler("/files/**")
                .addResourceLocations("file:" + uploadDir + "/");
    }
}
