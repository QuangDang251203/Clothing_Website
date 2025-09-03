package com.example.clothing_store.service.Product;

import com.example.clothing_store.dto.PageConfig;
import com.example.clothing_store.dto.ProductDTO;
import com.example.clothing_store.response.ProductResponse;
import com.example.clothing_store.response.ResponseToData;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public interface ProductService {
    ProductResponse createProduct(ProductDTO productDTO, List<MultipartFile> images);

    List<ProductDTO> getAllProducts(PageConfig pageProduct);

    ProductResponse changeProductStatus(String productCode);

    ProductResponse changeInfoProduct(ProductDTO productDTO, List<MultipartFile> images);

    ResponseToData<ProductDTO> getProductByCode(String productCode);

    ResponseToData<List<ProductDTO>> getProductsByCategory(String category);

    ResponseToData<List<ProductDTO>> getAllProductsFull();
}
