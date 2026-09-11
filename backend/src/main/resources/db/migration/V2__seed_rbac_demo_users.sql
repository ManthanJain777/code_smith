-- SIH26100 Flyway Migration V2: Seed Demo Users for RBAC Verification
-- Password for all demo accounts: Password123!
-- BCrypt Hash: $2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a

INSERT INTO users (id, organization_id, email, password_hash, full_name, role, is_active) VALUES 
('USR-DEMO-ADMIN', 'ORG-001', 'admin.demo@gembid.local', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'System Admin (Demo)', 'SYSTEM_ADMIN', true),
('USR-DEMO-PROC', 'ORG-001', 'procurement.demo@gembid.local', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Rajesh Kumar (Procurement Officer Demo)', 'PROCUREMENT_OFFICER', true),
('USR-DEMO-REV', 'ORG-001', 'reviewer.demo@gembid.local', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Anita Sharma (Compliance Reviewer Demo)', 'COMPLIANCE_REVIEWER', true),
('USR-DEMO-AUD', 'ORG-001', 'auditor.demo@gembid.local', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Vikram Sethi (Auditor Demo)', 'VIEWER', true),
('USR-DEMO-BID', 'ORG-001', 'bidder.demo@gembid.local', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Apex Pumps Vendor Representative', 'BIDDER_VENDOR', true)
;
