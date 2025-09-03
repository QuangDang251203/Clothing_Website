package com.example.clothing_store.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum CommonEnums {
    SUCCESS("00","Success"),
    CODE_IS_EXIST("01","Code is exist"),
    CODE_IS_NOT_EXIST("02","Code is not exist"),
    FAIL_CANCEL("03","Fail Cancel"),
    FAIL_CHANGE_PASS("04","Fail Change Pass"),
    FAIL_BANKING("05","Fail Banking"),
    FAIL_UNAUTHORIZED("06","Fail Unauthorized"),
    FAIL_UPLOAD_IMAGE("07","Fail Upload Image"),
    FAIL_LOAD_REVENUE("08","Fail Load Revenue"),;
    private final String code;
    private final String message;
}
