-- SIH26100 Flyway Migration V7: Portal Verification + Compliance Scoring Schema
-- Implements SIH Expected Solution: multi-portal audit records and compliance score persistence

-- Table: Portal-level verification audit records (one row per portal per seller per run)
CREATE TABLE IF NOT EXISTS portal_verification_runs (
    id VARCHAR(64) PRIMARY KEY,
    seller_id VARCHAR(64) REFERENCES sellers(id) ON DELETE CASCADE,
    portal_name VARCHAR(128) NOT NULL,
    connector VARCHAR(128) NOT NULL,
    status VARCHAR(64) NOT NULL,          -- VERIFIED, RISK_IDENTIFIED, NOT_REGISTERED, NOT_APPLICABLE
    finding TEXT,
    risk_contribution NUMERIC(4,3) DEFAULT 0.000,
    response_json TEXT,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_portal_runs_seller ON portal_verification_runs(seller_id);

-- Table: Bid-level compliance score snapshots
CREATE TABLE IF NOT EXISTS bid_compliance_scores (
    id VARCHAR(64) PRIMARY KEY,
    bid_id VARCHAR(64) NOT NULL,
    compliance_score NUMERIC(5,2) NOT NULL,   -- 0.00 – 100.00
    risk_level VARCHAR(16) NOT NULL,           -- LOW, MEDIUM, HIGH, CRITICAL
    total_requirements INTEGER DEFAULT 0,
    compliant_count INTEGER DEFAULT 0,
    partially_compliant_count INTEGER DEFAULT 0,
    non_compliant_count INTEGER DEFAULT 0,
    unverified_count INTEGER DEFAULT 0,
    not_applicable_count INTEGER DEFAULT 0,
    pending_human_review_count INTEGER DEFAULT 0,
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bid_compliance_scores_bid ON bid_compliance_scores(bid_id);

-- Table: AI recommendation records (one per bid per generation)
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id VARCHAR(64) PRIMARY KEY,
    bid_id VARCHAR(64) NOT NULL,
    recommendation_type VARCHAR(64) NOT NULL,  -- RECOMMEND_QUALIFY, RECOMMEND_REJECT, REFER_FOR_REVIEW
    summary TEXT NOT NULL,
    gaps_json TEXT,
    strengths_json TEXT,
    basis TEXT,
    confidence_score NUMERIC(4,3),
    disclaimer TEXT,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_bid ON ai_recommendations(bid_id);
