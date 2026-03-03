-- V4__add_branch_admin_role.sql

INSERT INTO roles (name, description) VALUES
('BRANCH_ADMIN', 'Administrator for a specific hospital branch');

-- Assign a subset of permissions to BRANCH_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'BRANCH_ADMIN' AND p.name IN ('CREATE_APPOINTMENT', 'VIEW_PATIENT', 'ACCESS_ICU_DASHBOARD');
