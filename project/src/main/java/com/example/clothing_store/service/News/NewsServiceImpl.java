package com.example.clothing_store.service.News;

import com.example.clothing_store.dto.NewsDTO;
import com.example.clothing_store.entity.News;
import com.example.clothing_store.entity.NewsImage;
import com.example.clothing_store.enums.CommonEnums;
import com.example.clothing_store.mapper.NewsMapper;
import com.example.clothing_store.repository.NewsImageRepository;
import com.example.clothing_store.repository.NewsRepository;
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
public class NewsServiceImpl implements NewsService {
    private static final Logger log = LoggerFactory.getLogger(NewsServiceImpl.class);
    private final NewsRepository newsRepository;
    private final NewsImageRepository newsImageRepository;
    private final NewsMapper newsMapper;
    private final StorageService storageService;


    public ResponseToData<List<NewsDTO>> getAllNews() {
        log.info("[Begin] Get All news");
        return ResponseToData.success(newsRepository.findAll()
                .stream()
                .map(newsMapper::toDTO)
                .collect(Collectors.toList()));
    }

    public ResponseToData<NewsDTO> getNewsById(Integer id) {
        log.info("[Begin] Get News by id: {}", id);
        News news = newsRepository.findById(id)
            .orElseThrow(()-> new RuntimeException("News not found with id :"+id));
        return ResponseToData.success(newsMapper.toDTO(news));
    }

    public ResponseToData<NewsDTO> createNews(NewsDTO newsDTO, List<MultipartFile> images) {
        log.info("[Begin] Create new news: {}", newsDTO);
        News news = newsMapper.toEntity(newsDTO);
        newsRepository.save(news);
        if(images == null || images.isEmpty()) {
            return ResponseToData.fail(CommonEnums.FAIL_UPLOAD_IMAGE);
        }
        List<NewsImage> IMGs = images.stream()
                        .map(file->{
                            String url = storageService.store(file);
                            return NewsImage.builder()
                                    .news(news)
                                    .imageUrl(url)
                                    .build();
                        }).collect(Collectors.toList());
        newsImageRepository.saveAll(IMGs);
        log.info("[End]Create successfully ");
        return ResponseToData.success(newsMapper.toDTO(news));
    }

    public ResponseToData<NewsDTO> updateNewsById(Integer id, NewsDTO newsDTO,List<MultipartFile> images) {
        log.info("[Begin] Update new news: {}", newsDTO);
        News existing = newsRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("News not found with id :"+id));
        existing.setNewsCode(newsDTO.getNewsCode());
        existing.setTitle(newsDTO.getTitle());
        existing.setDetail(newsDTO.getDetail());
        if(images == null || images.isEmpty()) {
            return ResponseToData.fail(CommonEnums.FAIL_UPLOAD_IMAGE);
        }
        if(images != null && !images.isEmpty()) {
            newsImageRepository.deleteAll(existing.getImages());
            existing.getImages().clear();
            List<NewsImage> IMGs = images.stream()
                    .map(file->{
                        String url = storageService.store(file);
                        return NewsImage.builder()
                                .news(existing)
                                .imageUrl(url)
                                .build();
                    }).collect(Collectors.toList());
            newsImageRepository.saveAll(IMGs);
            existing.getImages().addAll(IMGs);
        }
        News updated = newsRepository.save(existing);
        log.info("[End]Update successfully ");
        return ResponseToData.success(newsMapper.toDTO(updated));
    }

    @Override
    public void deleteNewsById(Integer id) {
        log.info("[Begin] Delete news by id: {}", id);
        if (!newsRepository.existsById(id)) {
            throw new RuntimeException("News not found with id :" + id);
        }
        newsRepository.deleteById(id);
        log.info("[End] Delete successfully ");
    }
}
