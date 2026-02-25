package com.mednex.mednex_enterprise.config;

import com.mednex.mednex_enterprise.multitenancy.datasource.TenantDataSourceProvider;
import com.mednex.mednex_enterprise.multitenancy.datasource.TenantRoutingDataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;
import org.springframework.core.env.Environment;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

@Configuration
@EnableTransactionManagement
public class HibernateConfig {

    private final Environment env;

    public HibernateConfig(Environment env) {
        this.env = env;
    }

    @Bean
    @Primary
    public DataSource masterDataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(env.getProperty("spring.datasource.url"));
        config.setUsername(env.getProperty("spring.datasource.username"));
        config.setPassword(env.getProperty("spring.datasource.password"));
        config.setDriverClassName(env.getProperty("spring.datasource.driver-class-name", "org.postgresql.Driver"));
        return new HikariDataSource(config);
    }

    @Bean
    public DataSource tenantRoutingDataSource(
            @Qualifier("masterDataSource") DataSource masterDataSource,
            TenantDataSourceProvider tenantDataSourceProvider) {

        TenantRoutingDataSource routingDataSource = new TenantRoutingDataSource(tenantDataSourceProvider,
                masterDataSource);

        Map<Object, Object> dataSources = new HashMap<>();
        // At startup, we just know about the master.
        // The TenantRoutingDataSource will dynamically use the provider for tenants.
        dataSources.put("MASTER", masterDataSource);

        routingDataSource.setTargetDataSources(dataSources);
        routingDataSource.setDefaultTargetDataSource(masterDataSource);
        routingDataSource.afterPropertiesSet();

        return routingDataSource;
    }

}

