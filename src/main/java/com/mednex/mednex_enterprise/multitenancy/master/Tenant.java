package com.mednex.mednex_enterprise.multitenancy.master;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "tenants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant {
    @Id
    private String tenantId;

    private String dbName;
    private String dbUrl;
    private String dbUsername;
    private String dbPassword;

    private String hospitalName;
    private String subscriptionPlan;
    private boolean active;

    private String licenseNumber;
    private String countryState;
    private String primaryEmail;
    private String adminName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
