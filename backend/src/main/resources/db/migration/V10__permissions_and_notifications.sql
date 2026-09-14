-- SIH26100 Flyway Migration V10: Dynamic Permissions, Notifications Engine & Multi-Tenancy Bidders
-- Stores dynamic permissions matrix, notification triggers, notifications table, and seeds 3 distinct bidders

-- 1. Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
    id VARCHAR(64) PRIMARY KEY,
    role VARCHAR(64) NOT NULL,
    feature_key VARCHAR(64) NOT NULL,
    access_level VARCHAR(32) NOT NULL, -- FULL, READ, OWN, SCOPED, READ_ONLY, BLOCKED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_role_feature UNIQUE (role, feature_key)
);

-- 2. Notification Triggers Table
CREATE TABLE IF NOT EXISTS notification_triggers (
    id VARCHAR(64) PRIMARY KEY,
    role VARCHAR(64) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Notifications Table (Explicitly addressed per user_id)
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(64) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'INFO', -- ERROR, WARNING, INFO, SUCCESS
    action_url VARCHAR(255),
    resource_id VARCHAR(128),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notif_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notif_event_res ON notifications(event_type, resource_id);

-- 4. Seed Dynamic Permissions
INSERT INTO permissions (id, role, feature_key, access_level) VALUES
-- SYSTEM_ADMIN
('PRM-ADM-01', 'SYSTEM_ADMIN', 'admin_dashboard', 'FULL'),
('PRM-ADM-02', 'SYSTEM_ADMIN', 'tender_spec', 'FULL'),
('PRM-ADM-03', 'SYSTEM_ADMIN', 'compliance_matrix', 'FULL'),
('PRM-ADM-04', 'SYSTEM_ADMIN', 'portal_verification', 'FULL'),
('PRM-ADM-05', 'SYSTEM_ADMIN', 'multi_bidder_compare', 'FULL'),
('PRM-ADM-06', 'SYSTEM_ADMIN', 'copilot_query', 'FULL'),
('PRM-ADM-07', 'SYSTEM_ADMIN', 'seller_queue', 'FULL'),
('PRM-ADM-08', 'SYSTEM_ADMIN', 'human_review', 'FULL'),
('PRM-ADM-09', 'SYSTEM_ADMIN', 'compliance_reports', 'FULL'),
('PRM-ADM-10', 'SYSTEM_ADMIN', 'analytics_overview', 'FULL'),
('PRM-ADM-11', 'SYSTEM_ADMIN', 'blockchain_audit', 'FULL'),
('PRM-ADM-12', 'SYSTEM_ADMIN', 'bid_upload', 'FULL'),
('PRM-ADM-13', 'SYSTEM_ADMIN', 'contradiction_resolve', 'FULL'),

-- PROCUREMENT_OFFICER
('PRM-OFF-01', 'PROCUREMENT_OFFICER', 'admin_dashboard', 'BLOCKED'),
('PRM-OFF-02', 'PROCUREMENT_OFFICER', 'tender_spec', 'FULL'),
('PRM-OFF-03', 'PROCUREMENT_OFFICER', 'compliance_matrix', 'FULL'),
('PRM-OFF-04', 'PROCUREMENT_OFFICER', 'portal_verification', 'FULL'),
('PRM-OFF-05', 'PROCUREMENT_OFFICER', 'multi_bidder_compare', 'FULL'),
('PRM-OFF-06', 'PROCUREMENT_OFFICER', 'copilot_query', 'FULL'),
('PRM-OFF-07', 'PROCUREMENT_OFFICER', 'seller_queue', 'FULL'),
('PRM-OFF-08', 'PROCUREMENT_OFFICER', 'human_review', 'FULL'),
('PRM-OFF-09', 'PROCUREMENT_OFFICER', 'compliance_reports', 'FULL'),
('PRM-OFF-10', 'PROCUREMENT_OFFICER', 'analytics_overview', 'FULL'),
('PRM-OFF-11', 'PROCUREMENT_OFFICER', 'blockchain_audit', 'FULL'),
('PRM-OFF-12', 'PROCUREMENT_OFFICER', 'bid_upload', 'BLOCKED'),
('PRM-OFF-13', 'PROCUREMENT_OFFICER', 'contradiction_resolve', 'BLOCKED'),

-- COMPLIANCE_REVIEWER
('PRM-REV-01', 'COMPLIANCE_REVIEWER', 'admin_dashboard', 'BLOCKED'),
('PRM-REV-02', 'COMPLIANCE_REVIEWER', 'tender_spec', 'READ'),
('PRM-REV-03', 'COMPLIANCE_REVIEWER', 'compliance_matrix', 'READ'),
('PRM-REV-04', 'COMPLIANCE_REVIEWER', 'portal_verification', 'READ'),
('PRM-REV-05', 'COMPLIANCE_REVIEWER', 'multi_bidder_compare', 'BLOCKED'),
('PRM-REV-06', 'COMPLIANCE_REVIEWER', 'copilot_query', 'SCOPED'),
('PRM-REV-07', 'COMPLIANCE_REVIEWER', 'seller_queue', 'READ'),
('PRM-REV-08', 'COMPLIANCE_REVIEWER', 'human_review', 'FULL'),
('PRM-REV-09', 'COMPLIANCE_REVIEWER', 'compliance_reports', 'READ'),
('PRM-REV-10', 'COMPLIANCE_REVIEWER', 'analytics_overview', 'BLOCKED'),
('PRM-REV-11', 'COMPLIANCE_REVIEWER', 'blockchain_audit', 'BLOCKED'),
('PRM-REV-12', 'COMPLIANCE_REVIEWER', 'bid_upload', 'BLOCKED'),
('PRM-REV-13', 'COMPLIANCE_REVIEWER', 'contradiction_resolve', 'FULL'),

-- AUDITOR / VIEWER
('PRM-AUD-01', 'AUDITOR', 'admin_dashboard', 'BLOCKED'),
('PRM-AUD-02', 'AUDITOR', 'tender_spec', 'READ'),
('PRM-AUD-03', 'AUDITOR', 'compliance_matrix', 'READ'),
('PRM-AUD-04', 'AUDITOR', 'portal_verification', 'BLOCKED'),
('PRM-AUD-05', 'AUDITOR', 'multi_bidder_compare', 'BLOCKED'),
('PRM-AUD-06', 'AUDITOR', 'copilot_query', 'READ_ONLY'),
('PRM-AUD-07', 'AUDITOR', 'seller_queue', 'BLOCKED'),
('PRM-AUD-08', 'AUDITOR', 'human_review', 'BLOCKED'),
('PRM-AUD-09', 'AUDITOR', 'compliance_reports', 'READ'),
('PRM-AUD-10', 'AUDITOR', 'analytics_overview', 'BLOCKED'),
('PRM-AUD-11', 'AUDITOR', 'blockchain_audit', 'FULL'),
('PRM-AUD-12', 'AUDITOR', 'bid_upload', 'BLOCKED'),
('PRM-AUD-13', 'AUDITOR', 'contradiction_resolve', 'BLOCKED'),

-- BIDDER_VENDOR
('PRM-BID-01', 'BIDDER_VENDOR', 'admin_dashboard', 'BLOCKED'),
('PRM-BID-02', 'BIDDER_VENDOR', 'tender_spec', 'READ'),
('PRM-BID-03', 'BIDDER_VENDOR', 'compliance_matrix', 'OWN'),
('PRM-BID-04', 'BIDDER_VENDOR', 'portal_verification', 'BLOCKED'),
('PRM-BID-05', 'BIDDER_VENDOR', 'multi_bidder_compare', 'BLOCKED'),
('PRM-BID-06', 'BIDDER_VENDOR', 'copilot_query', 'SCOPED'),
('PRM-BID-07', 'BIDDER_VENDOR', 'seller_queue', 'BLOCKED'),
('PRM-BID-08', 'BIDDER_VENDOR', 'human_review', 'BLOCKED'),
('PRM-BID-09', 'BIDDER_VENDOR', 'compliance_reports', 'OWN'),
('PRM-BID-10', 'BIDDER_VENDOR', 'analytics_overview', 'BLOCKED'),
('PRM-BID-11', 'BIDDER_VENDOR', 'blockchain_audit', 'BLOCKED'),
('PRM-BID-12', 'BIDDER_VENDOR', 'bid_upload', 'FULL'),
('PRM-BID-13', 'BIDDER_VENDOR', 'contradiction_resolve', 'BLOCKED');

-- 5. Seed Notification Triggers
INSERT INTO notification_triggers (id, role, event_type, description) VALUES
('TRG-01', 'SYSTEM_ADMIN', 'health_failure', 'Microservice health check status returned DOWN or STANDBY'),
('TRG-02', 'SYSTEM_ADMIN', 'injection_attempt', 'Adversarial prompt injection neutralized by Sentinel'),
('TRG-03', 'PROCUREMENT_OFFICER', 'processing_complete', 'Tender compliance evaluation pipeline finished'),
('TRG-04', 'PROCUREMENT_OFFICER', 'high_risk_flag', 'Bid risk score evaluated as HIGH or CRITICAL'),
('TRG-05', 'COMPLIANCE_REVIEWER', 'contradiction_detected', 'Cross-document discrepancy detected in evaluation'),
('TRG-06', 'AUDITOR', 'override_recorded', 'Human reviewer recorded status override anchored on blockchain'),
('TRG-07', 'BIDDER_VENDOR', 'status_change', 'Bid submission status transitioned to UNDER_EVALUATION'),
('TRG-08', 'BIDDER_VENDOR', 'cert_expiring', 'Statutory credential expires within 60 days'),
('TRG-09', 'BIDDER_VENDOR', 'resubmission_received', 'Corrected annexure or document uploaded and logged');

-- 6. Seed Multi-Tenancy Bidders: Bharat Heavy Valves & Crompton Flow Dynamics
-- BCrypt password for Password123!: $2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a
INSERT INTO organizations (id, name, code) VALUES
('SLR-BHARAT-002', 'Bharat Heavy Valves Ltd', 'ORG-BHARAT-002'),
('SLR-CROMPTON-003', 'Crompton Flow Dynamics', 'ORG-CROMPTON-003');

INSERT INTO users (id, organization_id, email, password_hash, full_name, role, is_active) VALUES
('USR-BID-BHARAT', 'SLR-BHARAT-002', 'bharat.valves@gembid.local', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Bharat Heavy Valves Representative', 'BIDDER_VENDOR', true),
('USR-BID-CROMPTON', 'SLR-CROMPTON-003', 'crompton.flow@gembid.local', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Crompton Flow Dynamics Representative', 'BIDDER_VENDOR', true);

INSERT INTO sellers (
    id, organization_name, cin_or_pan, gstin, udyam_registration, 
    dpiit_number, bis_license, epfo_code, registered_address, 
    category, is_debarred, trust_score, verification_status
) VALUES
(
    'SLR-BHARAT-002',
    'Bharat Heavy Valves Ltd',
    'U29120MH2014PLC256789 / AAACB5678G',
    '27AAACB5678G1Z5',
    'UDYAM-MH-01-0088991',
    'DPIIT-2022-VALVE-7712',
    'BIS-LIC-88123',
    'MH/PUN/554433',
    'Plot 18, MIDC Industrial Area, Bhosari, Pune - 411026',
    'Heavy Industrial Valves & Actuators',
    false,
    94.00,
    'VERIFIED'
),
(
    'SLR-CROMPTON-003',
    'Crompton Flow Dynamics',
    'U31100DL2018PTC334455 / AAACC9012K',
    '07AAACC9012K1Z2',
    'UDYAM-DL-02-0044556',
    'DPIIT-2024-FLOW-3390',
    'BIS-LIC-99456',
    'DL/MAY/112244',
    'B-12, Mayapuri Industrial Area Phase-I, New Delhi - 110064',
    'Hydraulic & Centrifugal Fluid Dynamics',
    false,
    88.50,
    'VERIFIED'
);

-- Seed Bids for Bharat & Crompton against TND-PUMP-001
INSERT INTO bids (id, tender_id, bidder_name, bidder_gstin, bidder_pan, bidder_email, status, risk_score, debarment_status)
VALUES
('BID-BHARAT-002', 'TND-PUMP-001', 'Bharat Heavy Valves Ltd', '27AAACB5678G1Z5', 'AAACB5678G', 'bharat.valves@gembid.local', 'UNDER_EVALUATION', 18.0, 'CLEAR'),
('BID-CROMPTON-003', 'TND-PUMP-001', 'Crompton Flow Dynamics', '07AAACC9012K1Z2', 'AAACC9012K', 'crompton.flow@gembid.local', 'UNDER_EVALUATION', 22.0, 'CLEAR');

-- Seed Compliance Results for Bharat (All Compliant)
INSERT INTO compliance_results (id, requirement_id, bid_id, status, verification_method, reasoning, confidence, evidence_ids, review_status)
VALUES
('RES-BHARAT-001', 'REQ-P001', 'BID-BHARAT-002', 'COMPLIANT', 'deterministic', 'FY2023=Rs.140Cr, FY2024=Rs.155Cr, FY2025=Rs.168Cr. All 3 years satisfy >= Rs.100Cr turnover requirement.', 0.99, 'EVD-BH-01', 'APPROVED'),
('RES-BHARAT-002', 'REQ-P002', 'BID-BHARAT-002', 'COMPLIANT', 'deterministic', 'GSTIN 27AAACB5678G1Z5 active on GSTN. PAN AAACB5678G verified.', 0.99, 'EVD-BH-02', 'APPROVED'),
('RES-BHARAT-003', 'REQ-P003', 'BID-BHARAT-002', 'COMPLIANT', 'deterministic', 'Pump efficiency 89.2% >= 85.0% threshold. COMPLIANT.', 0.98, 'EVD-BH-03', 'APPROVED'),
('RES-BHARAT-004', 'REQ-P004', 'BID-BHARAT-002', 'COMPLIANT', 'deterministic', 'Daily output capacity 950 units/day >= 800 units/day. COMPLIANT.', 0.98, 'EVD-BH-04', 'APPROVED'),
('RES-BHARAT-005', 'REQ-P005', 'BID-BHARAT-002', 'COMPLIANT', 'deterministic', 'Supplied over 8 years to Indian Oil and ONGC. >= 5 years required.', 0.96, 'EVD-BH-05', 'APPROVED'),
('RES-BHARAT-006', 'REQ-P006', 'BID-BHARAT-002', 'COMPLIANT', 'deterministic', 'ISO 9001:2015 valid until 2027-10-30. Valid on submission date.', 0.99, 'EVD-BH-06', 'APPROVED'),
('RES-BHARAT-007', 'REQ-P007', 'BID-BHARAT-002', 'COMPLIANT', 'deterministic', 'Operating pressure rating 14 Bar >= 10 Bar threshold.', 0.98, 'EVD-BH-07', 'APPROVED');

-- Seed Compliance Results for Crompton (All Compliant)
INSERT INTO compliance_results (id, requirement_id, bid_id, status, verification_method, reasoning, confidence, evidence_ids, review_status)
VALUES
('RES-CROMP-001', 'REQ-P001', 'BID-CROMPTON-003', 'COMPLIANT', 'deterministic', 'FY2023=Rs.108Cr, FY2024=Rs.115Cr, FY2025=Rs.122Cr. Exceeds Rs.100Cr.', 0.99, 'EVD-CR-01', 'APPROVED'),
('RES-CROMP-002', 'REQ-P002', 'BID-CROMPTON-003', 'COMPLIANT', 'deterministic', 'GSTIN 07AAACC9012K1Z2 active on GSTN. PAN AAACC9012K verified.', 0.99, 'EVD-CR-02', 'APPROVED'),
('RES-CROMP-003', 'REQ-P003', 'BID-CROMPTON-003', 'COMPLIANT', 'deterministic', 'Pump efficiency 86.5% >= 85.0% threshold. COMPLIANT.', 0.97, 'EVD-CR-03', 'APPROVED'),
('RES-CROMP-004', 'REQ-P004', 'BID-CROMPTON-003', 'COMPLIANT', 'deterministic', 'Production capacity 820 units/day >= 800 units/day threshold.', 0.98, 'EVD-CR-04', 'APPROVED'),
('RES-CROMP-005', 'REQ-P005', 'BID-CROMPTON-003', 'COMPLIANT', 'deterministic', '6 years continuous supply to Delhi Jal Board infrastructure.', 0.95, 'EVD-CR-05', 'APPROVED'),
('RES-CROMP-006', 'REQ-P006', 'BID-CROMPTON-003', 'COMPLIANT', 'deterministic', 'ISO 9001:2015 valid until 2026-12-15. Valid on submission date.', 0.99, 'EVD-CR-06', 'APPROVED'),
('RES-CROMP-007', 'REQ-P007', 'BID-CROMPTON-003', 'COMPLIANT', 'deterministic', 'Operating pressure rating 11 Bar >= 10 Bar threshold.', 0.97, 'EVD-CR-07', 'APPROVED');

-- Seed Initial Verified Notifications Addressed to Specific Users
INSERT INTO notifications (id, user_id, role, event_type, title, message, type, action_url, is_read) VALUES
('NTF-ADM-01', 'USR-DEMO-ADMIN', 'SYSTEM_ADMIN', 'health_failure', 'Microservice Health Notice', 'FastAPI AI Engine operational on :8000; Ollama GPU standby active.', 'WARNING', '/', false),
('NTF-ADM-02', 'USR-DEMO-ADMIN', 'SYSTEM_ADMIN', 'injection_attempt', 'Prompt-Injection Sentinel Catch', 'Neutralized injection pattern ''IGNORE_PREVIOUS_INSTRUCTIONS''.', 'ERROR', '/', false),
('NTF-PROC-01', 'USR-DEMO-PROC', 'PROCUREMENT_OFFICER', 'processing_complete', 'Tender Bids Ingested', 'Automated evaluation completed for Tender GEM/2026/B/90125 (3 Bidders).', 'SUCCESS', '/compliance', false),
('NTF-PROC-02', 'USR-DEMO-PROC', 'PROCUREMENT_OFFICER', 'high_risk_flag', 'Contradiction Review Required', 'Turnover variance identified between Balance Sheet and CA Certificate.', 'WARNING', '/reviews', false),
('NTF-REV-01', 'USR-DEMO-REV', 'COMPLIANCE_REVIEWER', 'contradiction_detected', 'Discrepancy in Tender Queue', 'Financial turnover discrepancy pending statutory document selection.', 'WARNING', '/reviews', false),
('NTF-AUD-01', 'USR-DEMO-AUD', 'AUDITOR', 'override_recorded', 'Auditable Override Anchored', 'Officer recorded status override on REQ-P003 with cryptographic proof.', 'INFO', '/audit', false),
('NTF-BID-01', 'USR-DEMO-BID', 'BIDDER_VENDOR', 'status_change', 'Bid Dossier Under Review', 'Your bid dossier BID-APEX-001 has been received for technical review.', 'INFO', '/compliance', false),
('NTF-BID-02', 'USR-DEMO-BID', 'BIDDER_VENDOR', 'cert_expiring', 'ISO Certificate Notice', 'Statutory certificate expires within 60 days. Please ensure timely renewal.', 'WARNING', '/compliance', false);
