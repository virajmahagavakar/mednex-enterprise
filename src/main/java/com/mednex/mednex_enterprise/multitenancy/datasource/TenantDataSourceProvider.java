package com.mednex.mednex_enterprise.multitenancy.datasource;

import com.mednex.mednex_enterprise.multitenancy.master.Tenant;
import com.mednex.mednex_enterprise.multitenancy.master.TenantRepository;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TenantDataSourceProvider {

    private final TenantRepository tenantRepository;

    // Cache of DataSources
    private final Map<String, DataSource> dataSources = new ConcurrentHashMap<>();

    @Autowired
    public TenantDataSourceProvider(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    @PostConstruct
    public void loadAllTenants() {
        List<Tenant> tenants = tenantRepository.findAll();
        for (Tenant tenant : tenants) {
            if (tenant.isActive()) {
                dataSources.put(tenant.getTenantId(), createDataSource(tenant));
            }
        }
    }

    public DataSource getDataSource(String tenantId) {
        if (!dataSources.containsKey(tenantId)) {
            // Lazy load if not in cache
            return tenantRepository.findByTenantIdAndActiveIsTrue(tenantId)
                    .map(tenant -> {
                        DataSource ds = createDataSource(tenant);
                        dataSources.put(tenantId, ds);
                        return ds;
                    })
                    .orElse(null);
        }
        return dataSources.get(tenantId);
    }

    public void addDataSource(Tenant tenant) {
        dataSources.put(tenant.getTenantId(), createDataSource(tenant));
    }

    private DataSource createDataSource(Tenant tenant) {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(tenant.getDbUrl());
        config.setUsername(tenant.getDbUsername());
        config.setPassword(tenant.getDbPassword());
        config.setDriverClassName("org.postgresql.Driver");

        // Optional HikariCP settings for per-tenant configs
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(30000);
        config.setPoolName("Hikari-" + tenant.getTenantId());

        return new HikariDataSource(config);
    }
}
