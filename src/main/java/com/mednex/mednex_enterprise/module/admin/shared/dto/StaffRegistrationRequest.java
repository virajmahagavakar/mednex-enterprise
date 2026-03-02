package com.mednex.mednex_enterprise.admin.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffRegistrationRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required for temporary access")
    private String password; // Temporary password for first setup

    private UUID primaryBranchId;

    @NotEmpty(message = "Staff must be assigned to at least one branch")
    private Set<UUID> branches;

    @NotEmpty(message = "Staff must have at least one role")
    private Set<Long> roleIds;

    @Valid
    private StaffProfileDTO profileDetails;
}

