-- V14__add_infrastructure_hierarchy.sql
-- Establishes a production-grade hierarchical location model and asset tracking

-- 1. BUILDINGS
CREATE TABLE buildings (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    branch_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_building_branch FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- 2. FLOORS
CREATE TABLE floors (
    id UUID PRIMARY KEY,
    floor_number INTEGER NOT NULL,
    name VARCHAR(255),
    building_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_floor_building FOREIGN KEY (building_id) REFERENCES buildings(id)
);

-- 3. ROOMS
CREATE TABLE rooms (
    id UUID PRIMARY KEY,
    room_number VARCHAR(255) NOT NULL,
    room_type VARCHAR(50) NOT NULL, -- PRIVATE, SEMI_PRIVATE, GENERAL
    ward_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, MAINTENANCE
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. UPDATE WARDS
-- First, add floor_id column
ALTER TABLE wards ADD COLUMN floor_id UUID;
ALTER TABLE wards ADD COLUMN ward_type VARCHAR(50); -- ICU, GENERAL, MATERNITY, etc.

-- 5. UPDATE BEDS
-- Add room_id and remove ward_id dependency eventually
ALTER TABLE beds ADD COLUMN room_id UUID;
ALTER TABLE beds ADD COLUMN bed_type VARCHAR(50); -- ICU, GENERAL, HDU, etc.
ALTER TABLE beds ADD COLUMN coordinates_x INTEGER;
ALTER TABLE beds ADD COLUMN coordinates_y INTEGER;

-- 6. MEDICAL ASSETS
CREATE TABLE medical_assets (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(255) NOT NULL,
    serial_number VARCHAR(255) UNIQUE NOT NULL,
    manufacturer VARCHAR(255),
    purchase_date DATE,
    warranty_expiry DATE,
    maintenance_cycle_days INTEGER,
    last_maintenance_date DATE,
    status VARCHAR(50) NOT NULL, -- PROCURED, ACTIVE, ASSIGNED, MAINTENANCE_DUE, etc.
    current_location_type VARCHAR(50), -- BED, ROOM, WARD, STORAGE
    current_location_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. CLEANING & MAINTENANCE TASKS
CREATE TABLE cleaning_tasks (
    id UUID PRIMARY KEY,
    bed_id UUID NOT NULL,
    assigned_to_id UUID,
    status VARCHAR(50) NOT NULL, -- PENDING, IN_PROGRESS, COMPLETED
    start_time TIMESTAMP,
    completed_time TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cleaning_bed FOREIGN KEY (bed_id) REFERENCES beds(id)
);

CREATE TABLE maintenance_tasks (
    id UUID PRIMARY KEY,
    asset_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL, -- PREVENTIVE, REPAIR
    status VARCHAR(50) NOT NULL, -- SCHEDULED, IN_PROGRESS, COMPLETED
    technician_id UUID,
    scheduled_date DATE,
    completed_date DATE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_maintenance_asset FOREIGN KEY (asset_id) REFERENCES medical_assets(id)
);
