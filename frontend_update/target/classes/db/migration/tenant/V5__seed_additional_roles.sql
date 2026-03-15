-- V2__seed_additional_roles.sql
-- Seed extra roles defined in architecture.md

INSERT INTO roles (name, description) VALUES
('SURGEON', 'Surgical practitioner'),
('CONSULTANT', 'Expert medical consultant'),
('NURSE', 'Registered Nurse'),
('ANESTHETIST', 'Anesthesia specialist'),
('RADIOLOGIST', 'Radiology specialist'),
('PATHOLOGIST', 'Pathology specialist'),
('LAB_TECHNICIAN', 'Laboratory Technician'),
('LAB_MANAGER', 'Laboratory Manager'),
('RADIOLOGY_TECHNICIAN', 'Radiology Technician'),
('PHARMACIST', 'Pharmacist'),
('PHARMACY_MANAGER', 'Pharmacy Manager'),
('BILLING_EXECUTIVE', 'Billing and invoicing'),
('CASHIER', 'Handles payments'),
('INSURANCE_COORDINATOR', 'Insurance claims processing'),
('ACCOUNTANT', 'Hospital accountant'),
('RECEPTIONIST', 'Front-desk receptionist'),
('WARD_MANAGER', 'Manages hospital wards'),
('ICU_MANAGER', 'Manages ICU'),
('BED_MANAGER', 'Manages bed allocation'),
('AMBULANCE_DRIVER', 'Ambulance operation'),
('HR_MANAGER', 'Human Resources Manager'),
('PAYROLL_OFFICER', 'Handles staff payroll')
ON CONFLICT (name) DO NOTHING;
