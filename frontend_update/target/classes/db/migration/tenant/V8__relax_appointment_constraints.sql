-- Migration to relax constraints for triage-based appointment workflow
-- This allows appointments to be created as "REQUESTED" without a doctor, branch, or slot assigned.

ALTER TABLE appointments ALTER COLUMN doctor_id DROP NOT NULL;
ALTER TABLE appointments ALTER COLUMN branch_id DROP NOT NULL;
ALTER TABLE appointments ALTER COLUMN appointment_time DROP NOT NULL;

-- Triage specific columns
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS symptoms TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS problem_description TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS department_preference VARCHAR(100);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS preferred_date TIMESTAMP;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS urgency_level VARCHAR(30);
