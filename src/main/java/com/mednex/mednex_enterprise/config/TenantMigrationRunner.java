package com.mednex.mednex_enterprise.config;

import com.mednex.mednex_enterprise.multitenancy.datasource.TenantDataSourceProvider;
import com.mednex.mednex_enterprise.multitenancy.master.Tenant;
import com.mednex.mednex_enterprise.multitenancy.master.TenantRepository;
import org.flywaydb.core.Flyway;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import javax.sql.DataSource;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class TenantMigrationRunner {

    private final TenantRepository tenantRepository;
    private final TenantDataSourceProvider tenantDataSourceProvider;

    @EventListener(ApplicationReadyEvent.class)
    public void migrateAllTenants() {
        log.info("Starting Flyway migrations for all existing tenants...");
        List<Tenant> tenants = tenantRepository.findAll();

        for (Tenant tenant : tenants) {
            try {
                // Ensure data source is cached and accessible
                tenantDataSourceProvider.addDataSource(tenant);
                DataSource dataSource = tenantDataSourceProvider.getDataSource(tenant.getTenantId());

                Flyway flyway = Flyway.configure()
                        .dataSource(dataSource)
                        .locations("classpath:db/migration/tenant")
                        .baselineOnMigrate(true)
                        .validateOnMigrate(false) // Disable validation to ignore checksum mismatches
                        // Alternatively you can enable repair: .cleanDisabled(false) and then run
                        // flyway.repair() before migrate
                        .load();

                // flyway.repair(); // Use repair if you want to update the schema history with
                // new checksums
                flyway.migrate();
                log.info("Successfully migrated tenant: {}", tenant.getTenantId());
            } catch (Exception e) {
                log.error("Failed to migrate tenant '{}'", tenant.getTenantId(), e);
            }
        }
        log.info("Finished tenant migrations.");
    }
}
