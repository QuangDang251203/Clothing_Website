package com.example.clothing_store.exception;

import com.example.clothing_store.constant.ProductConstant;
import com.example.clothing_store.response.ProductResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.stream.Collectors;

@ControllerAdvice
public class HandleException extends RuntimeException {
    private static final Logger log = LoggerFactory.getLogger(HandleException.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProductResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex) {
        log.error("", ex);
        String error = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(e -> {
                    String field = e.getField();
                    String message = e.getDefaultMessage();
                    return field + ": " + message;
                })
                .collect(Collectors.joining(","));
        ProductResponse productResponse = ProductResponse.fail(ProductConstant.FAIL_VALIDATION, error);
        return new ResponseEntity<>(productResponse, HttpStatus.BAD_REQUEST);
    }
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ProductResponse> handleRuntimeException(RuntimeException ex) {
        log.error("", ex);
        ProductResponse productResponse = ProductResponse.fail(ProductConstant.FAIL_VALIDATION, ex.getMessage());
        return new ResponseEntity<>(productResponse, HttpStatus.BAD_REQUEST);
    }
}
