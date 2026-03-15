-- V6__add_patient_role.sql
-- Add PATIENT role to the tenant database

INSERT INTO roles (name, description) VALUES
('PATIENT', 'Mednex Enterprise Patient User')
ON CONFLICT (name) DO NOTHING;
