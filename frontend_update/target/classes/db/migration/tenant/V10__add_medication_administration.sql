CREATE TABLE medication_administrations (
    id UUID PRIMARY KEY,
    admission_id UUID NOT NULL REFERENCES admissions(id),
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    route VARCHAR(50),
    administered_by UUID NOT NULL REFERENCES users(id),
    administered_at TIMESTAMP NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_med_admin_admission ON medication_administrations(admission_id);
CREATE INDEX idx_med_admin_date ON medication_administrations(administered_at);
