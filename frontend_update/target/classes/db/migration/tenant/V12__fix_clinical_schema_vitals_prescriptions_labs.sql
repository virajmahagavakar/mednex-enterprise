-- V12__fix_clinical_schema_vitals_prescriptions_labs.sql
-- Fixes missing tables and columns in the clinical module schema

-- ============================================================
-- ADMISSIONS (Add missing columns)
-- ============================================================
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS urgency_level VARCHAR(30);
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS department VARCHAR(100);

-- ============================================================
-- VITALS
-- ============================================================
CREATE TABLE IF NOT EXISTS vitals (
    id                  UUID PRIMARY KEY,
    patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    admission_id        UUID REFERENCES admissions(id) ON DELETE SET NULL,
    blood_pressure      VARCHAR(50),
    temperature         VARCHAR(50),
    heart_rate          VARCHAR(50),
    respiratory_rate    VARCHAR(50),
    oxygen_saturation   VARCHAR(50),
    height              VARCHAR(50),
    weight              VARCHAR(50),
    bmi                 VARCHAR(50),
    recorded_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CLINICAL PRESCRIPTIONS (Doctor-issued, separate from Pharmacy)
-- ============================================================
CREATE TABLE IF NOT EXISTS prescriptions (
    id                  UUID PRIMARY KEY,
    patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_id      UUID REFERENCES appointments(id) ON DELETE SET NULL,
    medicine_name       VARCHAR(255) NOT NULL,
    dosage              VARCHAR(100),
    frequency           VARCHAR(100),
    duration            VARCHAR(100),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- LAB TEST REQUESTS (Diagnostic orders)
-- ============================================================
CREATE TABLE IF NOT EXISTS lab_test_requests (
    id                  UUID PRIMARY KEY,
    patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_id      UUID REFERENCES appointments(id) ON DELETE SET NULL,
    test_type           VARCHAR(100) NOT NULL,
    priority            VARCHAR(30) DEFAULT 'NORMAL',
    notes               TEXT,
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    requested_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
