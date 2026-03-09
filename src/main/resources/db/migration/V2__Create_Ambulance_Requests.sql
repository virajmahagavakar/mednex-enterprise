-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Usually already available

CREATE TABLE IF NOT EXISTS ambulance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    address TEXT NOT NULL,
    emergency_type VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    dispatched_at TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE INDEX idx_ambulance_status ON ambulance_requests(status);
CREATE INDEX idx_ambulance_patient ON ambulance_requests(patient_id);
