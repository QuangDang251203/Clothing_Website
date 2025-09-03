package com.example.clothing_store.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Random;
import java.util.Set;

@Data
@NoArgsConstructor
public class AccountDTO {

    private int id;
    @JsonProperty(access = Access.READ_ONLY)
    private String accountCode = generateAccountCode();

    @NotBlank(message = "phone is required")
    @Size(max = 10, min = 10, message = "phone must be 10 characters long")
    private String phone;

    @NotBlank(message = "pass is required")
    @Size(min = 6)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String pass;

    private String email;
    private String gender;
    private LocalDate birthday;
    private String username;

    private Set<String> roles;
    private String generateAccountCode() {
        Random random = new Random();
        return String.format("%06d", random.nextInt(1_000_000));
    }
}
