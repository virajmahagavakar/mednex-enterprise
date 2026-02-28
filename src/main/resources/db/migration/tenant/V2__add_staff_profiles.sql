-- V2__add_staff_profiles.sql

CREATE TABLE staff_profiles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    national_id_number VARCHAR(255) NOT NULL UNIQUE,
    residential_address VARCHAR(255) NOT NULL,
    blood_group VARCHAR(255),
    emergency_contact_number VARCHAR(255),
    medical_license_number VARCHAR(255) UNIQUE,
    qualification VARCHAR(255),
    specialization VARCHAR(255),
    sub_specialty VARCHAR(255),
    years_of_experience INTEGER,
    default_consultation_fee DECIMAL(19, 2),
    biography TEXT
);
