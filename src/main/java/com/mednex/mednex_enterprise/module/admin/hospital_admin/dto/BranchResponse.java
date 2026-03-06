package com.mednex.mednex_enterprise.module.admin.hospital_admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BranchResponse {
    private UUID id;
    private String name;
    private String code;
    private String address;
    private boolean active;
    private LocalDateTime createdAt;

    // Branch Admin details (if assigned)
    private UUID branchAdminId;
    private String branchAdminName;
    private String branchAdminEmail;
}
