-- V6: Seed Bids and Compliance Results for IT Equipment and Office Furniture Tenders
-- Completes comprehensive multi-tender, multi-bidder scenario coverage across the platform

-- ═══════════════════════════════════════════════════════
-- TENDER 2: IT Hardware Procurement (TND-IT-002)
-- ═══════════════════════════════════════════════════════

-- BIDDER 1: TechBytes Solutions Ltd (Fully Compliant)
INSERT INTO bids (id, tender_id, bidder_name, bidder_gstin, bidder_pan, bidder_email, status, risk_score, debarment_status)
VALUES ('BID-TECH-002', 'TND-IT-002', 'TechBytes Solutions Ltd', '06AAACT1122D1Z4', 'AAACT1122D', 'bids@techbytes.in', 'ACCEPTED', 12.0, 'CLEAR');

INSERT INTO compliance_results (id, requirement_id, bid_id, status, verification_method, reasoning, confidence, evidence_ids, review_status)
VALUES
('RES-IT-001','REQ-IT001','BID-TECH-002','COMPLIANT','deterministic',
 'Server specification datasheet confirms 128GB DDR5 ECC RAM per node, exceeding the 64GB mandatory threshold.', 0.99, 'EVD-IT-001', 'APPROVED'),
('RES-IT-002','REQ-IT002','BID-TECH-002','COMPLIANT','deterministic',
 'Audited financial statements document FY2024-25 turnover of Rs. 82.5 Cr >= Rs. 50 Cr mandatory threshold.', 0.98, 'EVD-IT-002', 'APPROVED'),
('RES-IT-003','REQ-IT003','BID-TECH-002','COMPLIANT','deterministic',
 'Valid Udyam Registration Certificate submitted (UDYAM-HR-01-0012489). Registered as Medium Enterprise.', 0.99, 'EVD-IT-003', 'APPROVED');

-- BIDDER 2: SysCore Infrastructure Pvt Ltd (Disqualified on RAM & Turnover)
INSERT INTO bids (id, tender_id, bidder_name, bidder_gstin, bidder_pan, bidder_email, status, risk_score, debarment_status)
VALUES ('BID-SYS-002', 'TND-IT-002', 'SysCore Infrastructure Pvt Ltd', '07AABCS3344E1Z8', 'AABCS3344E', 'tenders@syscore.co.in', 'DISQUALIFIED', 78.0, 'CLEAR');

INSERT INTO compliance_results (id, requirement_id, bid_id, status, verification_method, reasoning, confidence, evidence_ids, review_status)
VALUES
('RES-IT-004','REQ-IT001','BID-SYS-002','NON_COMPLIANT','deterministic',
 'Submitted server configuration lists 32GB RAM per node, which fails the mandatory 64GB threshold.', 0.99, 'EVD-IT-004', 'PENDING'),
('RES-IT-005','REQ-IT002','BID-SYS-002','NON_COMPLIANT','deterministic',
 'Audited turnover for FY2024-25 is Rs. 38.20 Cr, failing the mandatory Rs. 50 Cr requirement.', 0.98, 'EVD-IT-005', 'PENDING'),
('RES-IT-006','REQ-IT003','BID-SYS-002','UNVERIFIED','deterministic',
 'No MSME or Udyam certificate submitted in the bid dossier.', 0.90, '', 'PENDING');


-- ═══════════════════════════════════════════════════════
-- TENDER 3: Office Furniture (TND-FURN-003)
-- ═══════════════════════════════════════════════════════

-- BIDDER 1: Royal Ergonomics Pvt Ltd (Compliant)
INSERT INTO bids (id, tender_id, bidder_name, bidder_gstin, bidder_pan, bidder_email, status, risk_score, debarment_status)
VALUES ('BID-ROYAL-003', 'TND-FURN-003', 'Royal Ergonomics Pvt Ltd', '27AAACR5566F1Z1', 'AAACR5566F', 'gov@royalergonomics.com', 'ACCEPTED', 15.0, 'CLEAR');

INSERT INTO compliance_results (id, requirement_id, bid_id, status, verification_method, reasoning, confidence, evidence_ids, review_status)
VALUES
('RES-F-001','REQ-F001','BID-ROYAL-003','COMPLIANT','deterministic',
 'Valid Bureau of Indian Standards (BIS) license mark IS 1003:2018 verified active on Manakonline registry.', 0.99, 'EVD-F-001', 'APPROVED'),
('RES-F-002','REQ-F002','BID-ROYAL-003','COMPLIANT','deterministic',
 'Audited turnover FY2024-25 recorded at Rs. 18.5 Cr >= Rs. 10 Cr threshold.', 0.99, 'EVD-F-002', 'APPROVED');

-- BIDDER 2: Modular Space Concepts LLP (Under Evaluation)
INSERT INTO bids (id, tender_id, bidder_name, bidder_gstin, bidder_pan, bidder_email, status, risk_score, debarment_status)
VALUES ('BID-MOD-003', 'TND-FURN-003', 'Modular Space Concepts LLP', '29AAAFM7788G1Z5', 'AAAFM7788G', 'bids@modularspace.in', 'UNDER_EVALUATION', 45.0, 'CLEAR');

INSERT INTO compliance_results (id, requirement_id, bid_id, status, verification_method, reasoning, confidence, evidence_ids, review_status)
VALUES
('RES-F-003','REQ-F001','BID-MOD-003','UNVERIFIED','deterministic',
 'Bidder submitted an acknowledgement slip of BIS application rather than the final IS 1003 certification mark. Requires committee verification.', 0.92, 'EVD-F-003', 'PENDING'),
('RES-F-004','REQ-F002','BID-MOD-003','COMPLIANT','deterministic',
 'Audited turnover FY2024-25 is Rs. 14.2 Cr >= Rs. 10 Cr threshold.', 0.98, 'EVD-F-004', 'APPROVED');
