-- V7__add_clinical_and_pharmacy_tables.sql
-- Adds all clinical module tables that were created via Hibernate entities
-- but were never included in the Flyway migrations.

-- ============================================================
-- Drop old outdated patients table (was wrong schema in V1)
-- ============================================================
DROP TABLE IF EXISTS patients CASCADE;

-- ============================================================
-- PATIENTS (full schema matching current Patient entity)
-- ============================================================
CREATE TABLE IF NOT EXISTS patients (
    id                       UUID PRIMARY KEY,
    first_name               VARCHAR(100) NOT NULL,
    last_name                VARCHAR(100) NOT NULL,
    email                    VARCHAR(255) UNIQUE,
    phone                    VARCHAR(30),
    date_of_birth            VARCHAR(50),
    gender                   VARCHAR(20),
    blood_group              VARCHAR(10),
    address                  TEXT,
    emergency_contact_name   VARCHAR(150),
    emergency_contact_phone  VARCHAR(30),
    medical_history          TEXT,
    registered_branch_id     UUID REFERENCES branches(id) ON DELETE SET NULL,
    user_id                  UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- APPOINTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
    id                  UUID PRIMARY KEY,
    patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    branch_id           UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    appointment_time    TIMESTAMP NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    token_number        INTEGER,
    is_walk_in          BOOLEAN DEFAULT FALSE,
    reason_for_visit    TEXT,
    notes               TEXT,
    prescription        TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CLINICAL NOTES (SOAP Notes)
-- ============================================================
CREATE TABLE IF NOT EXISTS clinical_notes (
    id              UUID PRIMARY KEY,
    patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,
    doctor_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subjective      TEXT,
    objective       TEXT,
    assessment      TEXT,
    plan            TEXT,
    follow_up_date  TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- WARDS (IPD)
-- ============================================================
CREATE TABLE IF NOT EXISTS wards (
    id              UUID PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    branch_id       UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    total_capacity  INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- BEDS
-- ============================================================
CREATE TABLE IF NOT EXISTS beds (
    id          UUID PRIMARY KEY,
    ward_id     UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
    room_number VARCHAR(50),
    bed_number  VARCHAR(50) NOT NULL,
    status      VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE'
);

-- ============================================================
-- ADMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS admissions (
    id                    UUID PRIMARY KEY,
    patient_id            UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    admitting_doctor_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_bed_id        UUID REFERENCES beds(id) ON DELETE SET NULL,
    admission_date        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    discharge_date        TIMESTAMP,
    status                VARCHAR(30) NOT NULL DEFAULT 'ADMITTED',
    reason_for_admission  TEXT,
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DAILY ROUNDS
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_rounds (
    id              UUID PRIMARY KEY,
    admission_id    UUID NOT NULL REFERENCES admissions(id) ON DELETE CASCADE,
    doctor_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    round_date      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    clinical_notes  TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DIAGNOSTIC TEST CATALOG
-- ============================================================
CREATE TABLE IF NOT EXISTS diagnostic_test_catalog (
    id                          UUID PRIMARY KEY,
    test_code                   VARCHAR(50) NOT NULL UNIQUE,
    name                        VARCHAR(255) NOT NULL,
    description                 TEXT,
    type                        VARCHAR(30) NOT NULL,
    expected_turnaround_hours   INTEGER DEFAULT 24,
    price                       NUMERIC(10, 2) DEFAULT 0,
    default_reference_range     TEXT,
    active                      BOOLEAN DEFAULT TRUE,
    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DIAGNOSTIC ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS diagnostic_orders (
    id                  UUID PRIMARY KEY,
    order_number        VARCHAR(100) NOT NULL UNIQUE,
    patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id      UUID REFERENCES appointments(id) ON DELETE SET NULL,
    ordering_doctor_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    clinical_notes      TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DIAGNOSTIC ORDER LINE ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS diagnostic_order_line_items (
    id              UUID PRIMARY KEY,
    order_id        UUID NOT NULL REFERENCES diagnostic_orders(id) ON DELETE CASCADE,
    test_catalog_id UUID NOT NULL REFERENCES diagnostic_test_catalog(id),
    status          VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DIAGNOSTIC RESULTS
-- ============================================================
CREATE TABLE IF NOT EXISTS diagnostic_results (
    id                  UUID PRIMARY KEY,
    order_line_item_id  UUID NOT NULL UNIQUE REFERENCES diagnostic_order_line_items(id) ON DELETE CASCADE,
    result_value        TEXT,
    reference_range     TEXT,
    interpretation_flag VARCHAR(20),
    dicom_study_uid     VARCHAR(255),
    dicom_series_uid    VARCHAR(255),
    document_url        TEXT,
    remarks             TEXT,
    reported_by_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    result_date         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- OPERATION THEATRES
-- ============================================================
CREATE TABLE IF NOT EXISTS operation_theatres (
    id                UUID PRIMARY KEY,
    name              VARCHAR(255) NOT NULL,
    branch_id         UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    location          VARCHAR(255),
    equipment_notes   TEXT,
    active            BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SURGERY SCHEDULES
-- ============================================================
CREATE TABLE IF NOT EXISTS surgery_schedules (
    id                      UUID PRIMARY KEY,
    patient_id              UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    theatre_id              UUID NOT NULL REFERENCES operation_theatres(id) ON DELETE CASCADE,
    procedure_name          VARCHAR(255) NOT NULL,
    scheduled_start_time    TIMESTAMP NOT NULL,
    scheduled_end_time      TIMESTAMP NOT NULL,
    status                  VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    primary_surgeon_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    anesthetist_id          UUID REFERENCES users(id) ON DELETE SET NULL,
    pre_op_diagnosis        TEXT,
    post_op_diagnosis       TEXT,
    operation_performed     TEXT,
    surgeon_notes           TEXT,
    complications           TEXT,
    anesthesia_type         VARCHAR(100),
    medications_administered TEXT,
    patient_vitals_summary  TEXT,
    anesthetist_notes       TEXT,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PHARMACY: SUPPLIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id              UUID PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    contact_person  VARCHAR(255),
    email           VARCHAR(255),
    phone           VARCHAR(50),
    address         TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PHARMACY: MEDICINES
-- ============================================================
CREATE TABLE IF NOT EXISTS medicines (
    id                      UUID PRIMARY KEY,
    name                    VARCHAR(255) NOT NULL,
    generic_name            VARCHAR(255),
    category                VARCHAR(100),
    manufacturer            VARCHAR(255),
    unit                    VARCHAR(50),
    minimum_stock_level     INTEGER DEFAULT 10,
    requires_prescription   BOOLEAN DEFAULT FALSE,
    is_active               BOOLEAN DEFAULT TRUE,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PHARMACY: INVENTORY BATCHES
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_batches (
    id                  UUID PRIMARY KEY,
    medicine_id         UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    supplier_id         UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    batch_number        VARCHAR(100) NOT NULL,
    quantity_received   INTEGER NOT NULL DEFAULT 0,
    quantity_available  INTEGER NOT NULL DEFAULT 0,
    manufacturing_date  DATE,
    expiry_date         DATE NOT NULL,
    unit_cost_price     NUMERIC(10, 2) DEFAULT 0,
    unit_selling_price  NUMERIC(10, 2) DEFAULT 0,
    status              VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PHARMACY: PRESCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS pharmacy_prescriptions (
    id                  UUID PRIMARY KEY,
    patient_id          UUID REFERENCES patients(id) ON DELETE SET NULL,
    doctor_id           UUID REFERENCES users(id) ON DELETE SET NULL,
    appointment_id      UUID,
    prescription_date   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status              VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    total_amount        NUMERIC(10, 2),
    payment_status      VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PHARMACY: DISPENSED ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS dispensed_items (
    id                   UUID PRIMARY KEY,
    prescription_id      UUID NOT NULL REFERENCES pharmacy_prescriptions(id) ON DELETE CASCADE,
    medicine_id          UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    inventory_batch_id   UUID REFERENCES inventory_batches(id) ON DELETE SET NULL,
    prescribed_quantity  INTEGER NOT NULL DEFAULT 0,
    dispensed_quantity   INTEGER NOT NULL DEFAULT 0,
    dosage_instructions  TEXT,
    unit_price           NUMERIC(10, 2) DEFAULT 0,
    total_price          NUMERIC(10, 2) DEFAULT 0,
    discount_percent     NUMERIC(5, 2) DEFAULT 0,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- BILLING: INVOICES (placeholder)
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
    id                  UUID PRIMARY KEY,
    patient_id          UUID REFERENCES patients(id) ON DELETE SET NULL,
    appointment_id      UUID REFERENCES appointments(id) ON DELETE SET NULL,
    prescription_id     UUID REFERENCES pharmacy_prescriptions(id) ON DELETE SET NULL,
    invoice_number      VARCHAR(100) UNIQUE,
    total_amount        NUMERIC(10, 2) DEFAULT 0,
    paid_amount         NUMERIC(10, 2) DEFAULT 0,
    status              VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
