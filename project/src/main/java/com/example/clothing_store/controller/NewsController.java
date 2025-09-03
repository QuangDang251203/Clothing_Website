package com.example.clothing_store.controller;

import com.example.clothing_store.dto.NewsDTO;
import com.example.clothing_store.response.ResponseToData;
import com.example.clothing_store.service.News.NewsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/news")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class NewsController {
    private final NewsService newsService;

    @GetMapping("/getAllNews")
    public ResponseToData<List<NewsDTO>> getAllNews() {
        return newsService.getAllNews();
    }

    @GetMapping("/getNewsById")
    public ResponseToData<NewsDTO> getNewsById(@RequestParam("id") int id) {
        return newsService.getNewsById(id);
    }

    @PostMapping(path = "/createNews",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseToData<NewsDTO> createNews(@Valid @RequestPart("news") NewsDTO newsDTO,
                                              @RequestPart("images") List<MultipartFile> images) {
        return newsService.createNews(newsDTO, images);
    }

    @PutMapping(path = "/updateNewById/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseToData<NewsDTO> updateNewById(@RequestPart("news") NewsDTO newsDTO, @PathVariable Integer id,
                                                 @RequestPart("images") List<MultipartFile> images) {
        return newsService.updateNewsById(id, newsDTO,images);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteNewsById(@PathVariable("id") Integer id) {
        newsService.deleteNewsById(id);
    }
}
