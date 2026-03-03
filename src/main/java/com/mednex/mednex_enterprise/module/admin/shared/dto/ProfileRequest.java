package com.mednex.mednex_enterprise.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfileRequest {
    @NotBlank(message = "Name is required")
    private String name;

    // Using Emergency Contact Number as the primary clinical contact
    @NotBlank(message = "Contact number is required")
    private String contactNumber;
}
