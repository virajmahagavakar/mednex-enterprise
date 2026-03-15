-- Add missing columns for triage-based appointments
-- This is necessary because V8 might have been applied without these columns.

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS symptoms TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS problem_description TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS department_preference VARCHAR(100);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS preferred_date TIMESTAMP;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS urgency_level VARCHAR(30);
