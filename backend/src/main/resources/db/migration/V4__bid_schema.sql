-- V4: Bids, Evidence Citations, and Expiry Tracking
-- Part of SIH26100 Full Feature Implementation

-- Bids table: links bidders to tenders
DROP TABLE IF EXISTS bids CASCADE;
CREATE TABLE bids (
    id              VARCHAR(64) PRIMARY KEY,
    tender_id       VARCHAR(64) NOT NULL REFERENCES tenders(id),
    bidder_name     VARCHAR(255) NOT NULL,
    bidder_gstin    VARCHAR(20),
    bidder_pan      VARCHAR(12),
    bidder_email    VARCHAR(255),
    bidder_phone    VARCHAR(20),
    bidder_address  TEXT,
    status          VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    risk_score      DECIMAL(5,2),
    risk_factors    TEXT,
    forgery_risk    DECIMAL(5,3),
    collusion_flags TEXT,
    debarment_status VARCHAR(20) DEFAULT 'CLEAR',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Evidence citations: exact document + page + snippet for every compliance result
CREATE TABLE IF NOT EXISTS evidence_citations (
    id                   VARCHAR(64) PRIMARY KEY,
    compliance_result_id VARCHAR(64) NOT NULL REFERENCES compliance_results(id),
    document_id          VARCHAR(64),
    document_name        VARCHAR(255) NOT NULL,
    page_num             INT NOT NULL DEFAULT 1,
    snippet              TEXT NOT NULL,
    extracted_value      DECIMAL(20,6),
    extracted_unit       VARCHAR(50),
    extraction_confidence DECIMAL(5,3) NOT NULL DEFAULT 0.85,
    created_at           TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Expiry tracking: certificate validity windows
CREATE TABLE IF NOT EXISTS certificate_expiry_checks (
    id               VARCHAR(64) PRIMARY KEY,
    bid_id           VARCHAR(64) NOT NULL,
    document_name    VARCHAR(255) NOT NULL,
    cert_type        VARCHAR(100),
    expiry_date      DATE,
    submission_date  DATE,
    status           VARCHAR(30),  -- VALID / EXPIRING_SOON / EXPIRED_AT_SUBMISSION
    days_remaining   INT,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Contradiction flags: cross-document conflicts
CREATE TABLE IF NOT EXISTS contradiction_flags (
    id               VARCHAR(64) PRIMARY KEY,
    bid_id           VARCHAR(64) NOT NULL,
    requirement_id   VARCHAR(64),
    document_a       VARCHAR(255) NOT NULL,
    document_b       VARCHAR(255) NOT NULL,
    value_a          DECIMAL(20,6),
    value_b          DECIMAL(20,6),
    page_a           INT,
    page_b           INT,
    severity         VARCHAR(20) NOT NULL DEFAULT 'HIGH',
    description      TEXT NOT NULL,
    resolved         BOOLEAN DEFAULT FALSE,
    resolved_by      VARCHAR(64),
    resolved_at      TIMESTAMP,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add blockchain fields to audit_logs
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS tx_hash VARCHAR(100);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS block_number BIGINT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS blockchain_anchored BOOLEAN DEFAULT FALSE;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS anchor_timestamp TIMESTAMP;

-- Add foreign key for bids in documents
ALTER TABLE documents ADD COLUMN IF NOT EXISTS bid_id VARCHAR(64);

-- Update compliance_results to reference bids properly
ALTER TABLE compliance_results ADD COLUMN IF NOT EXISTS bid_id_ref VARCHAR(64);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bids_tender_id ON bids(tender_id);
CREATE INDEX IF NOT EXISTS idx_evidence_citations_result ON evidence_citations(compliance_result_id);
CREATE INDEX IF NOT EXISTS idx_contradiction_flags_bid ON contradiction_flags(bid_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tx_hash ON audit_logs(tx_hash);
