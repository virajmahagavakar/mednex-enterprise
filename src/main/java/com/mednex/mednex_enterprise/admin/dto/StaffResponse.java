package com.mednex.mednex_enterprise.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffResponse {
    private UUID id;
    private String name;
    private String email;
    private boolean active;
    private UUID primaryBranchId;
    private Set<UUID> branches;
    private Set<String> roles;
    private StaffProfileDTO profileDetails;
    private LocalDateTime createdAt;
}

