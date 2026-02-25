package com.mednex.mednex_enterprise.multitenancy.service;

import com.mednex.mednex_enterprise.multitenancy.datasource.TenantDataSourceProvider;
import com.mednex.mednex_enterprise.multitenancy.master.Tenant;
import com.mednex.mednex_enterprise.multitenancy.master.TenantRepository;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;
import java.time.LocalDateTime;

// @Service
public class TenantProvisioningService {

    private final TenantRepository tenantRepository;
    private final TenantDataSourceProvider tenantDataSourceProvider;
    private final DataSource masterDataSource;

    // We will inject properties from env to construct default DB URL
    private final String dbHost;
    private final String dbPort;

    @Autowired
    public TenantProvisioningService(
            TenantRepository tenantRepository,
            TenantDataSourceProvider tenantDataSourceProvider,
            @Qualifier("masterDataSource") DataSource masterDataSource,
            Environment env) {
        this.tenantRepository = tenantRepository;
        this.tenantDataSourceProvider = tenantDataSourceProvider;
        this.masterDataSource = masterDataSource;

        // Example: extract host and port from master URL. For production, inject clean
        // properties.
        this.dbHost = "localhost";
        this.dbPort = "5432";
    }

    public Tenant provisionNewTenant(String hospitalName, String adminEmail, String plan) {
        // 1. Generate unique DB name and Tenant ID
        String cleanName = hospitalName.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        String tenantId = "tenant_" + cleanName + "_" + System.currentTimeMillis();
        String dbName = "db_" + tenantId;

        // To isolate effectively, each tenant should ideally have their own postgres
        // user,
        // but for simplicity we will use the master 'postgres' user for all tenant DBs
        // initially.
        String dbUsername = "postgres";
        String dbPassword = "password";
        String dbUrl = "jdbc:postgresql://" + dbHost + ":" + dbPort + "/" + dbName;

        System.out.println("Starting provisioning for: " + tenantId);

        // 2. Execute CREATE DATABASE statement on PostgreSQL Server (using Master
        // connection)
        try (Connection connection = masterDataSource.getConnection();
                Statement statement = connection.createStatement()) {
            // In Postgres, CREATE DATABASE cannot execute inside a transaction block
            connection.setAutoCommit(true);
            statement.execute("CREATE DATABASE " + dbName);
            System.out.println("Created Database: " + dbName);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create database for tenant: " + tenantId, e);
        }

        // 3. Save Tenant metadata to Master DB
        Tenant newTenant = Tenant.builder()
                .tenantId(tenantId)
                .dbName(dbName)
                .dbUrl(dbUrl)
                .dbUsername(dbUsername)
                .dbPassword(dbPassword)
                .hospitalName(hospitalName)
                .subscriptionPlan(plan)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        tenantRepository.save(newTenant);

        // 4. Update the DataSource provider cache
        tenantDataSourceProvider.addDataSource(newTenant);

        // 5. Run Flyway Migrations specifically on the NEW Tenant Database
        DataSource newTenantDataSource = tenantDataSourceProvider.getDataSource(tenantId);

        Flyway flyway = Flyway.configure()
                .dataSource(newTenantDataSource)
                .locations("classpath:db/migration/tenant")
                .load();

        flyway.migrate();
        System.out.println("Ran Flyway migrations for Database: " + dbName);

        // Optional: you could insert the adminEmail into the newly migrated tenant DB's
        // user table here

        return newTenant;
    }
}

