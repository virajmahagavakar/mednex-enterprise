package com.mednex.mednex_enterprise.tenant.dto;

import lombok.Data;

@Data
public class HospitalRegistrationRequest {
    private String hospitalName;
    private String licenseNumber;
    private String gst;
    private String countryState;
    private String primaryEmail;
    private String adminName;
    private String password;
    private String subscriptionPlan;
}
