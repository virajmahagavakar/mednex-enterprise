package com.mednex.mednex_enterprise.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientRegistrationRequest {
    private String hospitalId;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phoneNumber;
}
