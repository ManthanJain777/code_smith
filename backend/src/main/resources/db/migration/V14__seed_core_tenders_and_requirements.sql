-- V14: Seed Core Demo Tenders, Requirements, Bids and Compliance Results for End-to-End Operation

-- Ensure closing_date does not block legacy seeds
ALTER TABLE tenders ALTER COLUMN closing_date DROP NOT NULL;

-- ═══════════════════════════════════════════════════════
-- TENDERS
-- ═══════════════════════════════════════════════════════
INSERT INTO tenders (id, organization_id, tender_number, title, description, issuing_authority, category, estimated_value, status, created_by, closing_date)
VALUES 
(
    'TND-PUMP-001', 'ORG-001',
    'GEM/2026/B/90125',
    'Supply & Installation of High-Efficiency Industrial Water Pumps',
    'Procurement of centrifugal pumps (800 units/day capacity) for Central Water Commission infrastructure. Minimum pump efficiency 85%, NPSH 6m, operating pressure 10 bar.',
    'Central Water Commission', 'Industrial Equipment', 50000000.00, 'IN_EVALUATION', 'USR-PROC-01',
    NOW() + INTERVAL '30 days'
),
(
    'TND-IT-002', 'ORG-001', 
    'GEM/2026/IT/30210', 
    'Supply of Servers and Network Equipment', 
    'Procurement of rack-mounted servers (min 64GB RAM) and enterprise network switches.', 
    'National Informatics Centre', 'IT Equipment', 80000000.00, 'OPEN', 'USR-PROC-01',
    NOW() + INTERVAL '30 days'
),
(
    'TND-FURN-003', 'ORG-001', 
    'GEM/2026/F/10050', 
    'Supply of Ergonomic Office Furniture', 
    'Office chairs and desks meeting BIS standards for 500 workstations.', 
    'Department of Science & Engineering', 'Office Furniture', 15000000.00, 'OPEN', 'USR-PROC-01',
    NOW() + INTERVAL '30 days'
)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════
-- REQUIREMENTS FOR TND-PUMP-001, IT & FURNITURE
-- ═══════════════════════════════════════════════════════
INSERT INTO requirements (id, tender_id, req_code, category, raw_text, req_type, operator, threshold, unit, is_mandatory, source_page)
VALUES
  ('REQ-P001','TND-PUMP-001','REQ-P001','Financial','Bidder must have minimum Rs.100 crore annual turnover for each of the previous 3 financial years.','NUMERIC_THRESHOLD','>=',100,'Cr',true,2),
  ('REQ-P002','TND-PUMP-001','REQ-P002','Eligibility','Valid GST Registration Certificate and PAN Card must be submitted.','DOCUMENT_PRESENCE','==',null,null,true,3),
  ('REQ-P003','TND-PUMP-001','REQ-P003','Technical','Pump operational efficiency shall not be less than 85%.','NUMERIC_THRESHOLD','>=',85,'%',true,4),
  ('REQ-P004','TND-PUMP-001','REQ-P004','Technical','Pump production capacity minimum 800 units per day.','NUMERIC_THRESHOLD','>=',800,'units/day',true,5),
  ('REQ-P005','TND-PUMP-001','REQ-P005','Experience','Minimum 5 years of experience supplying to government entities.','NUMERIC_THRESHOLD','>=',5,'Years',true,6),
  ('REQ-P006','TND-PUMP-001','REQ-P006','Certification','ISO 9001:2015 Quality Management Certificate required. Certificate must be valid on the date of bid submission (2026-09-15).','DOCUMENT_PRESENCE','==',null,null,true,7),
  ('REQ-P007','TND-PUMP-001','REQ-P007','Technical','Operating pressure rating must be at least 10 Bar.','NUMERIC_THRESHOLD','>=',10,'Bar',true,8),
  ('REQ-IT001','TND-IT-002','REQ-IT001','Technical','Server RAM must be at least 64GB per node.','NUMERIC_THRESHOLD','>=',64,'GB',true,1),
  ('REQ-IT002','TND-IT-002','REQ-IT002','Financial','Bidder annual turnover must be minimum Rs.50 crore.','NUMERIC_THRESHOLD','>=',50,'Cr',true,2),
  ('REQ-IT003','TND-IT-002','REQ-IT003','Eligibility','MSME/Udyam Registration Certificate required.','DOCUMENT_PRESENCE','==',null,null,false,3),
  ('REQ-F001','TND-FURN-003','REQ-F001','Quality','All furniture must carry BIS certification mark IS 1003.','DOCUMENT_PRESENCE','==',null,null,true,1),
  ('REQ-F002','TND-FURN-003','REQ-F002','Financial','Minimum annual turnover Rs.10 crore.','NUMERIC_THRESHOLD','>=',10,'Cr',true,2)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════
-- BIDS
-- ═══════════════════════════════════════════════════════
INSERT INTO bids (id, tender_id, bidder_name, bidder_gstin, bidder_pan, bidder_email, status, risk_score, debarment_status)
VALUES 
('BID-APEX-001', 'TND-PUMP-001', 'Apex Pumps & Motors Pvt Ltd', '07AAAAA0000A1Z5', 'AAACA1234F', 'apex@apexpumps.com', 'UNDER_EVALUATION', 65.0, 'CLEAR'),
('BID-GFL-001', 'TND-PUMP-001', 'GlobalFlow Engineers Ltd', '29BBBBB1111B2Z6', 'BBACA5678G', 'bid@globalflow.in', 'UNDER_EVALUATION', 15.0, 'CLEAR')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════
-- COMPLIANCE RESULTS
-- ═══════════════════════════════════════════════════════
INSERT INTO compliance_results (id, requirement_id, bid_id, status, verification_method, reasoning, confidence, evidence_ids, review_status)
VALUES
('RES-A-001','REQ-P001','BID-APEX-001','PARTIALLY_COMPLIANT','deterministic',
 'FY2023=Rs.112Cr (PASS), FY2024=Rs.127Cr (PASS), FY2025=Rs.94Cr (FAIL). FY2025 turnover Rs.94 Cr is below the required Rs.100 Cr threshold. 2 of 3 years compliant.',
 0.99, 'EVD-A-001,EVD-A-002,EVD-A-003', 'PENDING'),
('RES-A-002','REQ-P002','BID-APEX-001','COMPLIANT','deterministic',
 'GST Registration Certificate (07AAAAA0000A1Z5) verified active via GSTN. PAN Card (AAACA1234F) verified. Both documents present and valid.',
 0.99, 'EVD-A-004,EVD-A-005', 'APPROVED'),
('RES-A-003','REQ-P003','BID-APEX-001','COMPLIANT','deterministic',
 'Technical Datasheet states pump efficiency 88.4%. 88.4% >= 85.0% threshold. COMPLIANT.',
 0.98, 'EVD-A-006', 'APPROVED'),
('RES-A-004','REQ-P004','BID-APEX-001','PARTIALLY_COMPLIANT','deterministic',
 'CONTRADICTION DETECTED: Technical_Datasheet.pdf (page 12) states 800 units/day. Company_Brochure.pdf (page 3) states 500 units/day. Human reviewer must determine authoritative document.',
 0.60, 'EVD-A-007,EVD-A-008', 'PENDING'),
('RES-A-005','REQ-P005','BID-APEX-001','UNVERIFIED','deterministic',
 'No government purchase order documents found in submitted bid covering 5+ years of government supply experience. System returns UNVERIFIED — not a guess.',
 0.92, '', 'PENDING'),
('RES-A-006','REQ-P006','BID-APEX-001','NON_COMPLIANT','deterministic',
 'ISO 9001:2015 Certificate expiry date: 2026-07-31. Bid submission date: 2026-09-15. Certificate was expired 46 days before submission. NON_COMPLIANT.',
 0.99, 'EVD-A-009', 'PENDING'),
('RES-A-007','REQ-P007','BID-APEX-001','COMPLIANT','deterministic',
 'Datasheet states operating pressure 155 PSI. Unit normalization: 155 PSI = 10.69 Bar. 10.69 Bar >= 10 Bar threshold. COMPLIANT after unit normalization.',
 0.97, 'EVD-A-010', 'APPROVED'),
('RES-B-001','REQ-P001','BID-GFL-001','COMPLIANT','deterministic','FY2023=Rs.185Cr, FY2024=Rs.201Cr, FY2025=Rs.220Cr. All 3 years exceed the Rs.100Cr threshold.',0.99,'EVD-B-001','APPROVED'),
('RES-B-002','REQ-P002','BID-GFL-001','COMPLIANT','deterministic','GST and PAN verified. Documents present and active.',0.99,'EVD-B-002','APPROVED'),
('RES-B-003','REQ-P003','BID-GFL-001','COMPLIANT','deterministic','Pump efficiency 91.2% >= 85% threshold. COMPLIANT.',0.99,'EVD-B-003','APPROVED'),
('RES-B-004','REQ-P004','BID-GFL-001','COMPLIANT','deterministic','Production capacity 1200 units/day >= 800 units/day. COMPLIANT.',0.99,'EVD-B-004','APPROVED'),
('RES-B-005','REQ-P005','BID-GFL-001','COMPLIANT','ai_language','15 government purchase orders spanning FY2011-FY2026. Experience >= 15 years. COMPLIANT.',0.95,'EVD-B-005','APPROVED'),
('RES-B-006','REQ-P006','BID-GFL-001','COMPLIANT','deterministic','ISO 9001:2015 Certificate valid until 2028-03-15. Valid at submission date 2026-09-15. COMPLIANT.',0.99,'EVD-B-006','APPROVED'),
('RES-B-007','REQ-P007','BID-GFL-001','COMPLIANT','deterministic','Operating pressure 16 Bar >= 10 Bar. COMPLIANT.',0.99,'EVD-B-007','APPROVED')
ON CONFLICT (id) DO NOTHING;
