package com.example.clothing_store.controller;

import com.example.clothing_store.dto.PageConfig;
import com.example.clothing_store.dto.ProductDTO;
import com.example.clothing_store.enums.ProductEnums;
import com.example.clothing_store.response.ProductResponse;
import com.example.clothing_store.response.ResponseToData;
import com.example.clothing_store.service.Product.ProductService;
import com.example.clothing_store.utils.ValidationGroups;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/product")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping(path = "/createProduct",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> createProduct(@Validated(ValidationGroups.Create.class)
                                         @RequestPart("product") ProductDTO dto,
                                        @RequestPart("images") List<MultipartFile> images) {
        try {
            ProductResponse resp = productService.createProduct(dto, images);
            // xử lý resp.getCode() như trước với PRODUCT_IS_EXIST
            return ResponseEntity.ok(resp);
        } catch (DataIntegrityViolationException ex) {
            // lỗi trùng key (có thể là SKU_CODE)
            ProductResponse resp = ProductResponse.fail("02", "Mã SKU đã tồn tại");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(resp);
        }
    }

    @PostMapping("/getAllProducts")
    public List<ProductDTO> getAllProducts(@RequestBody PageConfig pageProduct) {
        return productService.getAllProducts(pageProduct);
    }
    @GetMapping("/getAllProductsFull")
    public ResponseToData<List<ProductDTO>> getAllProductsFull() {
        return productService.getAllProductsFull();
    }

    @PutMapping("/changeStatusProduct/{productCode}")
    public ProductResponse changeStatusProduct(@PathVariable String productCode) {
        return productService.changeProductStatus(productCode);
    }


    @PutMapping(path = "/changeInfoProduct",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProductResponse changeInfoProduct(@Validated(ValidationGroups.Update.class)
                                             @RequestPart("product") ProductDTO productDTO,
                                             @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        return productService.changeInfoProduct(productDTO,images);
    }
    @GetMapping("/getProductByCode/{productCode}")
    public ResponseToData<ProductDTO> getProductByCode(@PathVariable String productCode) {
        return productService.getProductByCode(productCode);
    }

    @GetMapping("getProductByCategory/{category}")
    public ResponseToData<List<ProductDTO>> getProductByCategory(@PathVariable String category) {
        return productService.getProductsByCategory(category);
    }
}
