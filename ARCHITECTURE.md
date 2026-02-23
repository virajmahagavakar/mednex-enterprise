# Multi-Tenant SaaS Enterprise Hospital Management Platform

## 1. Enterprise Login & Registration Flow (JWT, Multi-Tenant)
Platform Architecture: One Platform -> Many Hospitals -> Many Branches -> Many Users

### Tenant Creation
- **Endpoint**: `POST /api/public/register-hospital`
- **Actions**: Validates license, creates tenant, default branch, admin user, subscriptions, audit log entry.
- **Tokens**: Temporary JWT issued upon verification.

### Subscriptions
- Free Trial (14 days), Standard, Enterprise.
- Payment successful -> Active hospital; Failed -> Restrict login.

### Login Flow
- **Endpoint**: `POST /api/auth/login`
- **Actions**: BCrypt validation, Hospital/Subscription/Branch/User activity checks.
- **Tokens**: Issues Access Token (15 min) & Refresh Token (7 days).

### Role + Permission Matrix
- Supports fine-grained RBAC instead of broad roles.
- `Role`, `Permission`, `Role_Permission`, `User_Role`, `User_Permission` (Overrides).
- Examples: `CREATE_APPOINTMENT`, `APPROVE_INSURANCE`, `VIEW_FINANCIAL_REPORT`.

## 2. Complete Stakeholder Structure
- **Platform**: SUPER_ADMIN, PLATFORM_SUPPORT, BILLING_SUPPORT
- **Hospital**: HOSPITAL_ADMIN, FINANCE_ADMIN, HR_ADMIN, COMPLIANCE_ADMIN, IT_ADMIN
- **Branch**: BRANCH_ADMIN, BRANCH_FINANCE, BRANCH_HR
- **Clinical**: DOCTOR, SURGEON, CONSULTANT, NURSE, ANESTHETIST, RADIOLOGIST, PATHOLOGIST
- **Diagnostic**: LAB_TECHNICIAN, LAB_MANAGER, RADIOLOGY_TECHNICIAN
- **Pharmacy**: PHARMACIST, PHARMACY_MANAGER
- **Financial**: BILLING_EXECUTIVE, CASHIER, INSURANCE_COORDINATOR, ACCOUNTANT
- **Operations**: RECEPTIONIST, WARD_MANAGER, ICU_MANAGER, BED_MANAGER, AMBULANCE_DRIVER
- **HR**: HR_MANAGER, PAYROLL_OFFICER
- **External**: PATIENT, INSURANCE_AGENT

## 3. Production-Ready HMS Modules
1. **Core Clinical Modules**: OPD, IPD, EMR/EHR, Prescriptions, Clinical Notes, Discharge.
2. **Appointment & Scheduling**: Online booking, Doctor calendar, multi-branch, token system.
3. **Billing**: Invoices, Insurance claims, TPA, Refunds, GST compliance.
4. **Pharmacy**: Inventory, Batch/Expiry, Suppliers, Auto-reorder.
5. **Laboratory**: Test orders, samples, reports, reference ranges.
6. **Radiology**: Imaging, DICOM, Reporting.
7. **Inventory**: Medical supplies, equipment, POs, vendors.
8. **HR**: Staff attendance, shift, leave, payroll.
9. **Bed/Ward**: Occupancy, ICU, live dashboard.
10. **Ambulance**: Emergency intake, Dispatch, Tracking.
11. **Insurance/TPA**: Claims submission, tracking, Pre-authorization.
12. **Analytics/BI**: Daily revenue, doctor performance, efficiency margins.
13. **Audit/Compliance**: Patient access logs, edit history, legal export.
14. **Multi-Branch Comparison**: Revenue, performance, efficiency stats.
15. **Patient Portal**: Appointments, reports, payments, teleconsultation.
16. **Telemedicine**: Video consultation, E-prescription.
17. **Notification**: SMS, Email, WhatsApp, In-app.

## 4. Technical Architecture
- **Backend**: Spring Boot, JWT (Access + Refresh), PostgreSQL, Redis, Docker
- **Security**: fine-grained RBAC, Tenant filtering, Encryption at rest, Audit logs, Rate limiting

## 5. Differentiating Factors
- Dynamic Role Creation
- Fine-grained permissions
- Real-time branch analytics
- AI-based patient risk scoring
- Predictive inventory alerts
- Doctor performance metrics
- Microservice-ready modular architecture (Package-by-Feature)
