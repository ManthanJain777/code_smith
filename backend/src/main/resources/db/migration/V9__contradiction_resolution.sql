-- SIH26100 Flyway Migration V9: Contradiction Resolution Table
-- Stores formal statutory/legal contradiction resolutions submitted by Compliance Reviewers

CREATE TABLE IF NOT EXISTS contradiction_resolutions (
    id VARCHAR(64) PRIMARY KEY,
    bid_id VARCHAR(64) NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
    requirement_id VARCHAR(64) NOT NULL,
    precedent_document VARCHAR(255) NOT NULL,
    rationale TEXT NOT NULL,
    resolved_by VARCHAR(64) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tx_hash VARCHAR(128),
    block_number BIGINT
);

CREATE INDEX IF NOT EXISTS idx_contradiction_res_bid ON contradiction_resolutions(bid_id);
CREATE INDEX IF NOT EXISTS idx_contradiction_res_req ON contradiction_resolutions(requirement_id);
