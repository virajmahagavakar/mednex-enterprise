package com.mednex.mednex_enterprise.auth.dto;

import lombok.Data;

@Data
public class RefreshRequest {
    private String refreshToken;
    private String hospitalId;
}

