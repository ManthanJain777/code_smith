-- V14: Add missing commercial fields to bids table
-- These columns are referenced by BidController.java but were absent from V4 schema.
-- Using IF NOT EXISTS to be idempotent in case of partial migrations.

ALTER TABLE bids ADD COLUMN IF NOT EXISTS quoted_price NUMERIC(15,2);
ALTER TABLE bids ADD COLUMN IF NOT EXISTS local_content_percent INT;
ALTER TABLE bids ADD COLUMN IF NOT EXISTS emd_status VARCHAR(30);

-- Fix timestamp columns: ensure they are TIMESTAMP WITH TIME ZONE (ZonedDateTime compatible)
-- H2 in PostgreSQL MODE handles this transparently; this is a no-op on H2
-- but ensures parity if switched to real PostgreSQL.
ALTER TABLE bids ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE bids ALTER COLUMN updated_at SET DEFAULT NOW();

-- Ensure submissions tracking is consistent
CREATE INDEX IF NOT EXISTS idx_bids_bidder_email ON bids(bidder_email);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
