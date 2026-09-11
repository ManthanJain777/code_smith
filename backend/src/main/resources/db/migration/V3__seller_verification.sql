-- SIH26100 Flyway Migration V3: Phase 2.5 Seller Verification & Risk Engine Schema
-- Stores Seller Profiles, Dynamic Document Checklists, Government Connector Responses, and Human Risk Overrides

CREATE TABLE IF NOT EXISTS sellers (
    id VARCHAR(64) PRIMARY KEY,
    organization_name VARCHAR(255) NOT NULL,
    cin_or_pan VARCHAR(128),
    gstin VARCHAR(128),
    udyam_registration VARCHAR(128),
    dpiit_number VARCHAR(128),
    bis_license VARCHAR(128),
    epfo_code VARCHAR(128),
    registered_address TEXT,
    category VARCHAR(128),
    is_debarred BOOLEAN DEFAULT FALSE,
    trust_score NUMERIC(5,2) DEFAULT 0.00,
    verification_status VARCHAR(64) DEFAULT 'PENDING_VERIFICATION', -- VERIFIED, HIGH_RISK, SUSPECTED_SHELL, PENDING_VERIFICATION, HUMAN_OVERRIDDEN
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seller_documents (
    id VARCHAR(64) PRIMARY KEY,
    seller_id VARCHAR(64) REFERENCES sellers(id) ON DELETE CASCADE,
    document_type VARCHAR(128) NOT NULL, -- GST_RETURN, MCA_ANNUAL_RETURN, UDYAM_CERTIFICATE, FINANCIAL_AUDIT, EPFO_ECR
    filename VARCHAR(255) NOT NULL,
    checksum VARCHAR(128),
    parsed_data_json TEXT,
    verification_status VARCHAR(64) DEFAULT 'VERIFIED',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seller_verification_results (
    id VARCHAR(64) PRIMARY KEY,
    seller_id VARCHAR(64) REFERENCES sellers(id) ON DELETE CASCADE,
    connector_name VARCHAR(128) NOT NULL, -- GSTN, MCA21, UDYAM, DPIIT, BIS, EPFO, DIGILOCKER
    status VARCHAR(64) NOT NULL, -- MATCHED, MISMATCHED, NOT_FOUND, WARNING
    response_json TEXT NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seller_risk_overrides (
    id VARCHAR(64) PRIMARY KEY,
    seller_id VARCHAR(64) REFERENCES sellers(id) ON DELETE CASCADE,
    reviewer_id VARCHAR(64) REFERENCES users(id),
    original_score NUMERIC(5,2) NOT NULL,
    override_decision VARCHAR(64) NOT NULL, -- APPROVED_OVERRIDE, REJECTED_OVERRIDE
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Synthetic Datasets A - G
-- Dataset A: Canonical Clean Seller — XYZ Infrastructure Pvt Ltd
INSERT INTO sellers (id, organization_name, cin_or_pan, gstin, udyam_registration, dpiit_number, bis_license, epfo_code, registered_address, category, is_debarred, trust_score, verification_status) VALUES
('SLR-DS-A', 'XYZ Infrastructure Pvt Ltd', 'U45201DL2015PTC284910', '07AAACX1234A1Z8', 'UDYAM-DL-01-0012345', 'DPIIT98765', 'BIS-LIC-54321', 'DL/CPM/998877', '102, Barakhamba Road, Connaught Place, New Delhi - 110001', 'Industrial Infrastructure', false, 96.50, 'VERIFIED'),
('SLR-DS-B', 'ABC Infra Pvt Ltd (Name Mismatch)', 'AAACB5678G', '08BBBBB1111B1Z2', 'UDYAM-RJ-02-0054321', NULL, NULL, 'RJ/JPR/112233', 'Plot 45, Industrial Area, Jaipur, Rajasthan', 'Construction & Machinery', false, 68.00, 'HIGH_RISK'),
('SLR-DS-C', 'Apex Global Holdings (Suspected Shell)', 'AAACG9999K', '09CCCCC9999C1Z9', NULL, NULL, NULL, NULL, 'Co-working Box #4, Virtual Hub, Lucknow', 'General Supplier', false, 32.00, 'SUSPECTED_SHELL'),
('SLR-DS-D', 'Vortex Corp (Lapsed GST / Tax Default)', 'AAACV4444M', '27DDDDD4444D1Z4', 'UDYAM-MH-03-0099887', NULL, 'BIS-LIC-11223', 'MH/MUM/445566', '801, Bandra Kurla Complex, Mumbai, Maharashtra', 'Heavy Machinery', false, 45.00, 'HIGH_RISK'),
('SLR-DS-E', 'MicroTech Supplies (Udyam Benefit Misrepresentation)', 'AAACM7777P', '06EEEEE7777E1Z1', 'UDYAM-HR-04-0044556', 'DPIIT11223', NULL, 'HR/GGN/778899', 'Sector 18, Gurugram, Haryana', 'Electronics & IT', false, 58.50, 'HIGH_RISK'),
('SLR-DS-F', 'Zenith Enterprises (Inconsistent Financial Audit)', 'AAACZ3333R', '03FFFFF3333F1Z7', 'UDYAM-PB-05-0066778', NULL, NULL, 'PB/LDH/334455', 'GT Road, Ludhiana, Punjab', 'Manufacturing', false, 62.00, 'HIGH_RISK'),
('SLR-DS-G', 'Bharat Heavy Pumps Ltd (Pending Audit)', 'AAACB1111S', '10GGGGG1111G1Z3', 'UDYAM-BR-06-0011223', NULL, 'BIS-LIC-88990', 'BR/PAT/556677', 'Boring Road, Patna, Bihar', 'Pumping Systems', false, 84.00, 'PENDING_VERIFICATION')
;
