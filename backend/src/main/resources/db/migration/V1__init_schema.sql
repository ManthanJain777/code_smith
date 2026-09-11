-- SIH26100 Master DB Migration: V1 Initial Schema
-- Enforces RBAC model, Tender Domain, Evidence Tracking, 5 Compliance States, Audit Trail

CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    organization_id VARCHAR(64) REFERENCES organizations(id),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(64) NOT NULL, -- SYSTEM_ADMIN, PROCUREMENT_OFFICER, COMPLIANCE_REVIEWER, BIDDER_VENDOR, VIEWER, AI_SERVICE
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenders (
    id VARCHAR(64) PRIMARY KEY,
    organization_id VARCHAR(64) REFERENCES organizations(id),
    tender_number VARCHAR(128) NOT NULL UNIQUE,
    title VARCHAR(512) NOT NULL,
    description TEXT,
    issuing_authority VARCHAR(255) NOT NULL,
    category VARCHAR(128),
    estimated_value NUMERIC(15,2),
    status VARCHAR(64) NOT NULL DEFAULT 'DRAFT', -- DRAFT, PUBLISHED, IN_EVALUATION, COMPLETED, ARCHIVED
    created_by VARCHAR(64) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS requirements (
    id VARCHAR(64) PRIMARY KEY,
    tender_id VARCHAR(64) REFERENCES tenders(id) ON DELETE CASCADE,
    req_code VARCHAR(64) NOT NULL,
    category VARCHAR(128) NOT NULL, -- Technical, Financial, Eligibility, Experience, Legal
    raw_text TEXT NOT NULL,
    req_type VARCHAR(64) NOT NULL, -- NUMERIC_THRESHOLD, DATE_EXPIRY, DOCUMENT_PRESENCE, TEXT_QUALITATIVE
    operator VARCHAR(16), -- >=, <=, ==, contains
    threshold NUMERIC(15,2),
    unit VARCHAR(64),
    is_mandatory BOOLEAN DEFAULT TRUE,
    source_page INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bidders (
    id VARCHAR(64) PRIMARY KEY,
    organization_name VARCHAR(255) NOT NULL,
    cin_or_pan VARCHAR(128),
    udyam_registration VARCHAR(128),
    gstin VARCHAR(128),
    contact_email VARCHAR(255),
    is_debarred BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bids (
    id VARCHAR(64) PRIMARY KEY,
    tender_id VARCHAR(64) REFERENCES tenders(id) ON DELETE CASCADE,
    bidder_id VARCHAR(64) REFERENCES bidders(id) ON DELETE CASCADE,
    bid_number VARCHAR(128) NOT NULL UNIQUE,
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    overall_status VARCHAR(64) DEFAULT 'PENDING_EVALUATION',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(64) PRIMARY KEY,
    bid_id VARCHAR(64) REFERENCES bids(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(64) NOT NULL,
    file_size_bytes BIGINT,
    checksum VARCHAR(128),
    storage_path VARCHAR(512),
    page_count INT DEFAULT 1,
    processing_status VARCHAR(64) DEFAULT 'PENDING', -- PENDING, PARSED, FAILED
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_pages (
    id VARCHAR(64) PRIMARY KEY,
    document_id VARCHAR(64) REFERENCES documents(id) ON DELETE CASCADE,
    page_number INT NOT NULL,
    raw_text TEXT,
    ocr_confidence NUMERIC(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evidence (
    id VARCHAR(64) PRIMARY KEY,
    bid_id VARCHAR(64) REFERENCES bids(id) ON DELETE CASCADE,
    document_id VARCHAR(64) REFERENCES documents(id) ON DELETE CASCADE,
    requirement_id VARCHAR(64) REFERENCES requirements(id) ON DELETE SET NULL,
    page_number INT NOT NULL,
    extracted_value NUMERIC(15,2),
    extracted_unit VARCHAR(64),
    raw_snippet TEXT NOT NULL,
    confidence NUMERIC(5,4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_results (
    id VARCHAR(64) PRIMARY KEY,
    requirement_id VARCHAR(64) REFERENCES requirements(id) ON DELETE CASCADE,
    bid_id VARCHAR(64) REFERENCES bids(id) ON DELETE CASCADE,
    status VARCHAR(64) NOT NULL, -- COMPLIANT, PARTIALLY_COMPLIANT, NON_COMPLIANT, UNVERIFIED, NOT_APPLICABLE
    verification_method VARCHAR(64) NOT NULL, -- DETERMINISTIC, AI_LANGUAGE, HYBRID
    reasoning TEXT NOT NULL,
    confidence NUMERIC(5,4) NOT NULL,
    evidence_ids TEXT, -- Comma-separated or JSON array of evidence IDs
    review_status VARCHAR(64) DEFAULT 'PENDING', -- PENDING, APPROVED, OVERRIDDEN
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(64) PRIMARY KEY,
    compliance_result_id VARCHAR(64) REFERENCES compliance_results(id) ON DELETE CASCADE,
    reviewer_id VARCHAR(64) REFERENCES users(id),
    original_status VARCHAR(64) NOT NULL,
    final_status VARCHAR(64) NOT NULL,
    reviewer_note TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    actor_id VARCHAR(64) NOT NULL,
    actor_role VARCHAR(64) NOT NULL,
    organization_id VARCHAR(64),
    action VARCHAR(128) NOT NULL,
    resource_type VARCHAR(128) NOT NULL,
    resource_id VARCHAR(128) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    details TEXT
);

-- Initial Seed Data for GeM Procurement Officer Demo
INSERT INTO organizations (id, name, code) VALUES ('ORG-001', 'Ministry of Public Procurement', 'GEM-ORG-01') ;

INSERT INTO users (id, organization_id, email, password_hash, full_name, role) VALUES 
('USR-ADMIN-01', 'ORG-001', 'admin@gem.gov.in', '$2a$10$wE1qS5z7dG0m1Z2X3Y4Z5.N7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2', 'System Administrator', 'SYSTEM_ADMIN'),
('USR-PROC-01', 'ORG-001', 'officer@gem.gov.in', '$2a$10$wE1qS5z7dG0m1Z2X3Y4Z5.N7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2', 'Rajesh Kumar (Procurement Officer)', 'PROCUREMENT_OFFICER'),
('USR-REV-01', 'ORG-001', 'auditor@gem.gov.in', '$2a$10$wE1qS5z7dG0m1Z2X3Y4Z5.N7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2', 'Anita Sharma (Auditor)', 'COMPLIANCE_REVIEWER')
;

-- Canonical Worked Demo Tender
INSERT INTO tenders (id, organization_id, tender_number, title, description, issuing_authority, category, estimated_value, status, created_by) VALUES
('TND-001', 'ORG-001', 'GEM/2026/B/90124', 'Supply & Installation of High-Efficiency Water Pumps', 'Procurement of industrial-grade centrifugal pumps for public infrastructure.', 'Central Water Commission', 'Industrial Equipment', 50000000.00, 'IN_EVALUATION', 'USR-PROC-01')
;

INSERT INTO requirements (id, tender_id, req_code, category, raw_text, req_type, operator, threshold, unit, is_mandatory, source_page) VALUES
('REQ-001', 'TND-001', 'REQ-001', 'Financial', 'Bidder must have minimum ₹100 crore annual turnover for each of the previous 3 financial years.', 'NUMERIC_THRESHOLD', '>=', 100.00, 'Cr', true, 1),
('REQ-002', 'TND-001', 'REQ-002', 'Eligibility', 'Valid GST Registration Certificate & PAN Card must be submitted.', 'DOCUMENT_PRESENCE', '==', NULL, NULL, true, 2),
('REQ-003', 'TND-001', 'REQ-003', 'Technical', 'Pump operational efficiency shall not be less than 85%.', 'NUMERIC_THRESHOLD', '>=', 85.00, '%', true, 3),
('REQ-004', 'TND-001', 'REQ-004', 'Experience', 'Minimum 5 years of experience supplying government entities.', 'NUMERIC_THRESHOLD', '>=', 5.00, 'Years', true, 4)
;

INSERT INTO bidders (id, organization_name, cin_or_pan, gstin, is_debarred) VALUES
('BDR-001', 'Apex Pumps & Motors Pvt Ltd', 'AAACA1234F', '07AAAAA0000A1Z5', false),
('BDR-002', 'Vortex Heavy Engineering Corp', 'AAACB5678G', '08BBBBB1111B1Z2', false)
;

INSERT INTO bids (id, tender_id, bidder_id, bid_number, overall_status) VALUES
('BID-A-01', 'TND-001', 'BDR-001', 'BID-APEX-2026-01', 'EVALUATION_IN_PROGRESS'),
('BID-B-01', 'TND-001', 'BDR-002', 'BID-VORTEX-2026-02', 'EVALUATION_IN_PROGRESS')
;
