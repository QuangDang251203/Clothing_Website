package com.example.clothing_store.service.News;

import com.example.clothing_store.dto.NewsDTO;
import com.example.clothing_store.response.ResponseToData;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public interface NewsService {
    ResponseToData<List<NewsDTO>> getAllNews();

    ResponseToData<NewsDTO> getNewsById(Integer id);

    ResponseToData<NewsDTO> createNews(NewsDTO dto, List<MultipartFile> images);

    ResponseToData<NewsDTO> updateNewsById(Integer id, NewsDTO newsDTO,List<MultipartFile> images);

    void deleteNewsById(Integer id);
}
