-- V1__init_master_schema.sql
-- This creates the master 'tenants' table to track all registered hospitals

CREATE TABLE tenants (
    tenant_id VARCHAR(255) PRIMARY KEY,
    db_name VARCHAR(255) NOT NULL,
    db_url VARCHAR(255) NOT NULL,
    db_username VARCHAR(255) NOT NULL,
    db_password VARCHAR(255) NOT NULL,
    
    hospital_name VARCHAR(255) NOT NULL,
    subscription_plan VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT TRUE,

    license_number VARCHAR(255),
    country_state VARCHAR(255),
    primary_email VARCHAR(255),
    admin_name VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
