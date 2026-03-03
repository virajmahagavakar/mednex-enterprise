package com.mednex.mednex_enterprise.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BranchRequest {

    @NotBlank(message = "Branch name is required")
    private String name;

    private String code;

    private String address;
}

