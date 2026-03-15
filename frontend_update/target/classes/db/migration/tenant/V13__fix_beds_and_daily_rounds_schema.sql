-- V13__fix_beds_and_daily_rounds_schema.sql
-- Fixes missing columns in beds and daily_rounds tables

-- ============================================================
-- BEDS (Add missing audit columns)
-- ============================================================
ALTER TABLE beds ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE beds ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- ============================================================
-- DAILY ROUNDS (Add missing clinical and audit columns)
-- ============================================================
ALTER TABLE daily_rounds ADD COLUMN IF NOT EXISTS temperature VARCHAR(50);
ALTER TABLE daily_rounds ADD COLUMN IF NOT EXISTS blood_pressure VARCHAR(50);
ALTER TABLE daily_rounds ADD COLUMN IF NOT EXISTS heart_rate VARCHAR(50);
ALTER TABLE daily_rounds ADD COLUMN IF NOT EXISTS medication_adjustment TEXT;
ALTER TABLE daily_rounds ADD COLUMN IF NOT EXISTS next_step TEXT;
ALTER TABLE daily_rounds ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
