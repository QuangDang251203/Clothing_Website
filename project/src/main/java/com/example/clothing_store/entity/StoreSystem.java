package com.example.clothing_store.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Entity
@Table(name = "store_system")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreSystem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String merchantCode;
    private String merchantName;
    private int status;
    private String address;
    private String phone;
    public String getGoogleMapUrl(){
        if(this.address == null || this.address.isBlank()){
            return null;
        }
        String encoded = URLEncoder.encode(this.address, StandardCharsets.UTF_8);
        return "https://www.google.com/maps/dir/?api=1&destination=" + encoded;
    }
}
