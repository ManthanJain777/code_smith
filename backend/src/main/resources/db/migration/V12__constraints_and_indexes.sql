-- SIH26100 Flyway Migration V12: Database Constraints, Critical Indexes, and 3rd Isolated Bidder Seed

-- 1. Performance and Query Integrity Indexes
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_role VARCHAR(64) DEFAULT 'SYSTEM';
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS organization_id VARCHAR(64);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS tx_hash VARCHAR(128);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS block_number BIGINT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS blockchain_anchored BOOLEAN DEFAULT FALSE;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS anchor_timestamp TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_bids_tender_id ON bids (tender_id);
CREATE INDEX IF NOT EXISTS idx_compliance_results_bid_id ON compliance_results (bid_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_timestamp ON audit_logs (action, timestamp);

-- 2. Constraints (Enforced via Unique Indexes across H2 & PostgreSQL)
CREATE UNIQUE INDEX IF NOT EXISTS uq_bid_bidder_tender ON bids (bidder_email, tender_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_sellers_gstin ON sellers (gstin);

-- Insert organizations for vendors if not present
INSERT INTO organizations (id, name, code) VALUES ('SLR-APEX-001', 'Apex Pumps & Motors Pvt Ltd', 'ORG-APEX-001') ON CONFLICT (id) DO NOTHING;
INSERT INTO organizations (id, name, code) VALUES ('SLR-STJOHN-001', 'St. John Technologies Ltd', 'ORG-STJOHN-001') ON CONFLICT (id) DO NOTHING;

-- 3. Associate Primary Demo Bidder with Apex Pumps Seller Profile
UPDATE users SET organization_id = 'SLR-APEX-001' WHERE email = 'bidder.demo@gembid.local';

-- 4. Seed 3rd Real Bidder Account (St. John Technologies Ltd) to guarantee multi-bidder data isolation
INSERT INTO sellers (
    id, organization_name, cin_or_pan, gstin, udyam_registration, 
    dpiit_number, bis_license, epfo_code, registered_address, 
    category, is_debarred, trust_score, verification_status
) VALUES (
    'SLR-STJOHN-001',
    'St. John Technologies Ltd',
    'U72200MH2018PLC312456 / AAACS1234F',
    '27AAACS1234F1Z8',
    'UDYAM-MH-02-0044556',
    'DPIIT-2024-TECH-1092',
    'BIS-LIC-99881',
    'MH/PUN/554433',
    'Tech Park 4, Hinjewadi Phase 2, Pune, Maharashtra - 411057',
    'IT Solutions & Industrial Automation OEM',
    false,
    89.00,
    'VERIFIED'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO users (
    id, organization_id, email, password_hash, full_name, role, is_active
) VALUES (
    'USR-BIDDER-STJOHN',
    'SLR-STJOHN-001',
    'stjohn@stjohntech.com',
    '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a',
    'St. John Technologies Representative',
    'BIDDER_VENDOR',
    true
) ON CONFLICT (id) DO NOTHING;
