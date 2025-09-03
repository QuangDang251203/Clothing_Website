package com.example.clothing_store.service.Product;

import com.example.clothing_store.constant.ProductConstant;
import com.example.clothing_store.dto.PageConfig;
import com.example.clothing_store.dto.ProductDTO;
import com.example.clothing_store.entity.Product;
import com.example.clothing_store.entity.ProductImage;
import com.example.clothing_store.enums.ProductEnums;
import com.example.clothing_store.mapper.ProductMapper;
import com.example.clothing_store.repository.ProductImageRepository;
import com.example.clothing_store.repository.ProductRepository;
import com.example.clothing_store.response.ProductResponse;
import com.example.clothing_store.response.ResponseToData;
import com.example.clothing_store.service.StorageImage.StorageService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private static final Logger log = LoggerFactory.getLogger(ProductServiceImpl.class);
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepo;
    private final StorageService storageService;
    private final ProductMapper mapper;

    @Transactional
    public ProductResponse createProduct(ProductDTO productDTO, List<MultipartFile> images) {
        log.info("[Begin]Creating product with data: {}", productDTO);
        if (productRepository.findByProductCode(productDTO.getProductCode()).isPresent()) {
            return ProductResponse.response(ProductEnums.PRODUCT_IS_EXIST);
        }
        log.info("Product Code is not exist");
        if (images == null || images.isEmpty()) {
            return ProductResponse.response(ProductEnums.PRODUCT_IS_EXIST);
        }
        productDTO.setStatus(ProductConstant.STATUS_BEGIN);
        productDTO.setNumberOfPurchase(0);
        Product product = mapper.toEntity(productDTO);
        productRepository.save(product);
        List<ProductImage> IMGs = images.stream().map(file ->{
            String url = storageService.store(file);
            return ProductImage.builder()
                    .product(product)
                    .url(url)
                    .build();
        }).collect(Collectors.toList());
        productImageRepo.saveAll(IMGs);
        return ProductResponse.response(ProductEnums.SUCCESS);
    }

    public ResponseToData<List<ProductDTO>> getAllProductsFull() {
        log.info("[Begin] GetAllProductsFull");
        List<ProductDTO> productDTOS = productRepository.findAll()
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
        log.info("[End] GetAllProductsFull with {} products", productDTOS.size());
        return ResponseToData.success(productDTOS);
    }

    public List<ProductDTO> getAllProducts(PageConfig page) {
        log.info("[Begin] GetAllProducts with {}", page);
        PageRequest pageRequest = PageRequest.of(page.getPage() - 1, page.getRow());
        Page<Product> products = productRepository.findAll(pageRequest);
        log.info("[End] GetAllProducts with {} products", products.getTotalElements());
        return products.getContent().stream().map(mapper::toDto).collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse changeProductStatus(String productCode) {
        log.info("[Begin] Change product status with productCode: {}", productCode);
        Product product = productRepository.findByProductCode(productCode)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (product.getStatus() == 1) {
            product.setStatus(0);
        } else {
            product.setStatus(1);
        }
        productRepository.save(product);
        log.info("[End] Change status product successfully");
        return ProductResponse.response(ProductEnums.SUCCESS);
    }



    @Transactional
    public ProductResponse changeInfoProduct(ProductDTO productDTO,List<MultipartFile> images) {
        log.info("[Begin] Change product info with data: {}", productDTO);
        Product product = productRepository.findByProductCode(productDTO.getProductCode())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setProductName(productDTO.getProductName());
        product.setProductCode(productDTO.getProductCode());
        product.setDescription(productDTO.getDescription());
        product.setCategory(productDTO.getCategory());
        if (images != null && !images.isEmpty()) {
            // xóa các ProductImage entity cũ
            productImageRepo.deleteAll(product.getImages());
            product.getImages().clear();

            // upload file và tạo entity mới
            List<ProductImage> newImgs = images.stream().map(file -> {
                String url = storageService.store(file);
                return ProductImage.builder()
                        .product(product)
                        .url(url)
                        .build();
            }).collect(Collectors.toList());

            productImageRepo.saveAll(newImgs);
            product.getImages().addAll(newImgs);
        }
        productRepository.save(product);
        log.info("[End] Change product info successfully ");
        return ProductResponse.response(ProductEnums.SUCCESS);
    }
    public ResponseToData<ProductDTO> getProductByCode(String productCode) {
        log.info("[Begin] getProduct with productCode: {}", productCode);
        ProductDTO dto = productRepository.findByProductCode(productCode)
                .map(mapper::toDto).orElseThrow(() -> new RuntimeException("Product not found"));
        log.info("dto{}",dto);
        return ResponseToData.success(dto);
    }
    public ResponseToData<List<ProductDTO>> getProductsByCategory(String category) {
        log.info("[Begin] getProductsByCategory with category: {}", category);
        List<ProductDTO> DTOs = productRepository.findByCategory(category)
                .stream().map(mapper::toDto).collect(Collectors.toList());
        if(DTOs.isEmpty()) {
            throw new RuntimeException("No products found");
        }
        return ResponseToData.success(DTOs);
    }
}
