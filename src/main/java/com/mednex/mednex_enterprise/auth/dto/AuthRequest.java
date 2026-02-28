package com.mednex.mednex_enterprise.auth.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String password;
    private String hospitalId; // To identify the tenant context
}

