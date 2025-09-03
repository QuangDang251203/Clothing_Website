package com.example.clothing_store.response;

import com.example.clothing_store.enums.CommonEnums;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommonResponse {
    private String code;
    private String message;

    public static CommonResponse response(CommonEnums commonEnums) {
        return new CommonResponse(commonEnums.getCode(), commonEnums.getMessage());
    }
}
