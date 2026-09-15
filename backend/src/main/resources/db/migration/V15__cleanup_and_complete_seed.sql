-- V15: Clean up test data and complete seed with all bid compliance results

-- 1. REMOVE STALE TEST TENDERS (created via UI testing)
DELETE FROM bids WHERE tender_id IN (
    SELECT id FROM tenders
    WHERE title IN ('complete workflow', 'test1', 'gokuuu', 'demo 1')
       OR (id NOT LIKE 'TND-%' AND title NOT LIKE '%Pump%' AND title NOT LIKE '%Server%' AND title NOT LIKE '%Furniture%')
);
DELETE FROM tenders
WHERE title IN ('complete workflow', 'test1', 'gokuuu', 'demo 1')
   OR (id NOT LIKE 'TND-%' AND title NOT LIKE '%Pump%' AND title NOT LIKE '%Server%' AND title NOT LIKE '%Furniture%');

-- 2. ADD MISSING BIDS
INSERT INTO bids (id, tender_id, bidder_name, bidder_gstin, bidder_pan, bidder_email, status, risk_score, quoted_price, debarment_status)
VALUES
('BID-BHARAT-002', 'TND-PUMP-001', 'Bharat Heavy Valves Ltd', '27AABCB8765D1Z4', 'AABCB8765D', 'procurement@bharatheavy.com', 'UNDER_EVALUATION', 18.0, 58900000.00, 'CLEAR'),
('BID-CROMPTON-003', 'TND-PUMP-001', 'Crompton Flow Dynamics', '06AADCC1234E1Z7', 'AADCC1234E', 'bids@cromptonflow.in', 'UNDER_EVALUATION', 22.0, 62400000.00, 'CLEAR')
ON CONFLICT (id) DO NOTHING;

-- 3. BHARAT COMPLIANCE RESULTS
INSERT INTO compliance_results (id, requirement_id, bid_id, status, verification_method, reasoning, confidence, evidence_ids, review_status)
VALUES
('RES-C-001','REQ-P001','BID-BHARAT-002','COMPLIANT','deterministic','FY2023=Rs.142Cr, FY2024=Rs.165Cr, FY2025=Rs.178Cr. All 3 years exceed the Rs.100Cr threshold.',0.99,'EVD-C-001','APPROVED'),
('RES-C-002','REQ-P002','BID-BHARAT-002','COMPLIANT','deterministic','GSTIN 27AABCB8765D1Z4 verified active on GSTN. PAN AABCB8765D verified.',0.99,'EVD-C-002','APPROVED'),
('RES-C-003','REQ-P003','BID-BHARAT-002','COMPLIANT','deterministic','Technical brochure states 87.3% pump efficiency. 87.3% >= 85% threshold.',0.97,'EVD-C-003','APPROVED'),
('RES-C-004','REQ-P004','BID-BHARAT-002','COMPLIANT','deterministic','Manufacturing capacity certificate confirms 950 units/day. 950 >= 800.',0.98,'EVD-C-004','APPROVED'),
('RES-C-005','REQ-P005','BID-BHARAT-002','COMPLIANT','ai_language','8 government purchase orders covering FY2016-FY2026. Experience >= 10 years.',0.94,'EVD-C-005','APPROVED'),
('RES-C-006','REQ-P006','BID-BHARAT-002','COMPLIANT','deterministic','ISO 9001:2015 certificate valid until 2027-12-31. Valid at submission date.',0.99,'EVD-C-006','APPROVED'),
('RES-C-007','REQ-P007','BID-BHARAT-002','COMPLIANT','deterministic','Pump rated at 12 Bar. 12 >= 10 Bar threshold.',0.99,'EVD-C-007','APPROVED')
ON CONFLICT (id) DO NOTHING;

-- 4. CROMPTON COMPLIANCE RESULTS
INSERT INTO compliance_results (id, requirement_id, bid_id, status, verification_method, reasoning, confidence, evidence_ids, review_status)
VALUES
('RES-D-001','REQ-P001','BID-CROMPTON-003','PARTIALLY_COMPLIANT','deterministic','FY2023=Rs.88Cr (FAIL), FY2024=Rs.103Cr (PASS), FY2025=Rs.115Cr (PASS). FY2023 below threshold.',0.99,'EVD-D-001','PENDING'),
('RES-D-002','REQ-P002','BID-CROMPTON-003','COMPLIANT','deterministic','GSTIN 06AADCC1234E1Z7 verified. PAN AADCC1234E verified. Both present.',0.99,'EVD-D-002','APPROVED'),
('RES-D-003','REQ-P003','BID-CROMPTON-003','COMPLIANT','deterministic','Factory test: pump efficiency 86.2%. 86.2% >= 85%.',0.96,'EVD-D-003','APPROVED'),
('RES-D-004','REQ-P004','BID-CROMPTON-003','NON_COMPLIANT','deterministic','Production capacity 650 units/day in factory inspection. 650 < 800. NON_COMPLIANT.',0.99,'EVD-D-004','APPROVED'),
('RES-D-005','REQ-P005','BID-CROMPTON-003','COMPLIANT','ai_language','6 government supply orders FY2019-FY2026. >= 7 years experience.',0.90,'EVD-D-005','APPROVED'),
('RES-D-006','REQ-P006','BID-CROMPTON-003','COMPLIANT','deterministic','ISO 9001:2015 valid until 2028-06-30. Valid at submission.',0.99,'EVD-D-006','APPROVED'),
('RES-D-007','REQ-P007','BID-CROMPTON-003','COMPLIANT','deterministic','Operating pressure 11.5 Bar. 11.5 >= 10 Bar.',0.98,'EVD-D-007','APPROVED')
ON CONFLICT (id) DO NOTHING;

-- 5. FIX SELLER VERIFICATION STATUSES
UPDATE sellers SET verification_status = 'VERIFIED' WHERE verification_status IS NULL AND is_debarred = false;
UPDATE sellers SET verification_status = 'HIGH_RISK' WHERE id IN ('SLR-DS-B','SLR-DS-D','SLR-DS-E','SLR-DS-F');
UPDATE sellers SET verification_status = 'SUSPECTED_SHELL' WHERE id = 'SLR-DS-C';

-- 6. FIX TND-IT-002 TITLE
UPDATE tenders SET
    title = 'Supply of High-Density Enterprise Compute Servers & SAN Storage',
    description = 'Procurement of rack-mounted servers (min 64GB RAM, dual 10GbE SFP+) and enterprise SAN storage for state data center.',
    issuing_authority = 'National Informatics Centre'
WHERE id = 'TND-IT-002';
