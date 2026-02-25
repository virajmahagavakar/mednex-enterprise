package com.mednex.mednex_enterprise.config;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import javax.sql.DataSource;

@Configuration
public class MasterFlywayConfig {

    private final DataSource masterDataSource;

    public MasterFlywayConfig(@Qualifier("masterDataSource") DataSource masterDataSource) {
        this.masterDataSource = masterDataSource;
    }

    @PostConstruct
    public void migrateMaster() {
        Flyway flyway = Flyway.configure()
                .dataSource(masterDataSource)
                .locations("classpath:db/migration/master")
                .baselineOnMigrate(true)
                .load();
        flyway.migrate();
    }
}

