package com.mednex.mednex_enterprise.onboarding.service;

import com.mednex.mednex_enterprise.multitenancy.master.Tenant;
import com.mednex.mednex_enterprise.multitenancy.master.TenantRepository;
import com.mednex.mednex_enterprise.multitenancy.context.TenantContext;
import com.mednex.mednex_enterprise.onboarding.dto.HospitalRegistrationRequest;
import com.mednex.mednex_enterprise.core.entity.Branch;
import com.mednex.mednex_enterprise.core.entity.Role;
import com.mednex.mednex_enterprise.core.entity.User;
import com.mednex.mednex_enterprise.core.repository.BranchRepository;
import com.mednex.mednex_enterprise.core.repository.RoleRepository;
import com.mednex.mednex_enterprise.core.repository.UserRepository;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
public class TenantProvisioningService {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private Environment env;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Registers a new hospital, provisions its database, and creates default
     * entities.
     */
    @Transactional("masterTransactionManager")
    public String registerNewHospital(HospitalRegistrationRequest request) {
        // 1. Generate unique Tenant ID based on Hospital Name
        String tenantId = generateTenantId(request.getHospitalName());

        if (tenantRepository.existsById(tenantId)) {
            throw new RuntimeException("Hospital already exists.");
        }

        // 2. Setup the tenant DB credentials
        String dbName = "mednex_tenant_" + tenantId;
        String dbUsername = env.getProperty("spring.datasource.username");
        String dbPassword = env.getProperty("spring.datasource.password");

        // This is assuming Postgres running locally or dynamically created.
        String dbUrl = env.getProperty("spring.datasource.url");
        String baseDbUrl = dbUrl.substring(0, dbUrl.lastIndexOf("/"));
        String newTenantDbUrl = baseDbUrl + "/" + dbName;

        // 3. Create the Database physically in PostgreSQL
        createNewDatabase(baseDbUrl, dbUsername, dbPassword, dbName);

        // 4. Run Flyway Migrations for the new Tenant DB
        runFlywayMigrations(newTenantDbUrl, dbUsername, dbPassword);

        // 5. Store Tenant in Master DB
        Tenant tenant = Tenant.builder()
                .tenantId(tenantId)
                .dbName(dbName)
                .dbUrl(newTenantDbUrl)
                .dbUsername(dbUsername)
                .dbPassword(dbPassword)
                .hospitalName(request.getHospitalName())
                .subscriptionPlan(request.getSubscriptionPlan())
                .active(true)
                .licenseNumber(request.getLicenseNumber())
                .countryState(request.getCountryState())
                .primaryEmail(request.getPrimaryEmail())
                .adminName(request.getAdminName())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        tenantRepository.save(tenant);

        // 6. Initialize default Branch and User strictly inside the newly created
        // Tenant DB context.
        initializeTenantData(tenantId, request);

        return tenantId;
    }

    private void createNewDatabase(String baseDbUrl, String username, String password, String dbName) {
        try (Connection connection = DriverManager.getConnection(baseDbUrl + "/postgres", username, password);
                Statement statement = connection.createStatement()) {
            statement.execute("CREATE DATABASE " + dbName);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create isolated tenant database", e);
        }
    }

    private void runFlywayMigrations(String dbUrl, String username, String password) {
        Flyway flyway = Flyway.configure()
                .dataSource(dbUrl, username, password)
                .locations("classpath:db/migration/tenant")
                .load();
        flyway.migrate();
    }

    /**
     * Set the context to the new tenant, and create the required Branch and Admin.
     */
    private void initializeTenantData(String tenantId, HospitalRegistrationRequest request) {
        String previousTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant(tenantId);

            // Note: Since this executes in the master transaction currently, we might need
            // a separate service execution to trigger the JPA routing for tenant entities.
            // For now, we will assume the entity manager successfully routes if the
            // transaction opens or handles it manually.

            // A. Create Default Main Branch
            Branch mainBranch = Branch.builder()
                    .name("Main Branch")
                    .code("MAIN")
                    .address(request.getCountryState())
                    .active(true)
                    .build();
            mainBranch = branchRepository.save(mainBranch);

            // B. Fetch HOSPITAL_ADMIN Role
            Role adminRole = roleRepository.findByName("HOSPITAL_ADMIN")
                    .orElseThrow(() -> new RuntimeException("HOSPITAL_ADMIN role not found in schema"));

            // C. Create First Admin User
            User adminUser = User.builder()
                    .name(request.getAdminName())
                    .email(request.getPrimaryEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .primaryBranch(mainBranch)
                    .branches(Collections.singleton(mainBranch))
                    .roles(Collections.singleton(adminRole))
                    .active(true)
                    .build();
            userRepository.save(adminUser);

        } finally {
            if (previousTenant != null) {
                TenantContext.setCurrentTenant(previousTenant);
            } else {
                TenantContext.clear();
            }
        }
    }

    private String generateTenantId(String hospitalName) {
        return hospitalName.toLowerCase().replaceAll("[^a-z0-9]", "_") + "_" + System.currentTimeMillis() % 10000;
    }
}

