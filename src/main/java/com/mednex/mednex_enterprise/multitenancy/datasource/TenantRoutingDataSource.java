package com.mednex.mednex_enterprise.multitenancy.datasource;

import com.mednex.mednex_enterprise.multitenancy.context.TenantContext;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

import javax.sql.DataSource;

public class TenantRoutingDataSource extends AbstractRoutingDataSource {

    private final TenantDataSourceProvider tenantDataSourceProvider;
    private final DataSource defaultDataSource;

    public TenantRoutingDataSource(TenantDataSourceProvider tenantDataSourceProvider, DataSource defaultDataSource) {
        this.tenantDataSourceProvider = tenantDataSourceProvider;
        this.defaultDataSource = defaultDataSource;
    }

    @Override
    protected Object determineCurrentLookupKey() {
        return TenantContext.getCurrentTenant();
    }

    @Override
    protected DataSource determineTargetDataSource() {
        String tenantId = (String) determineCurrentLookupKey();

        if (tenantId == null) {
            return defaultDataSource; // Routing straight to Master DB if no tenant
        }

        DataSource tenantDataSource = tenantDataSourceProvider.getDataSource(tenantId);
        if (tenantDataSource != null) {
            return tenantDataSource;
        }

        throw new IllegalStateException("Cannot determine target DataSource for tenant: " + tenantId);
    }
}
