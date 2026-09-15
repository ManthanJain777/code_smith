-- SIH26100 Flyway Migration V13: Seed Comprehensive Mock Data for 10 Compliance Document Types
-- Types:
--  1. Aadhaar Identity Verification (UIDAI e-KYC)
--  2. PAN Card Verification (NSDL / Income Tax)
--  3. GST Registration Certificate (Form GST REG-06)
--  4. ISO Quality Management Certification (ISO 9001:2015)
--  5. e-Bank Guarantee / EMD Security Instrument (SFMS)
--  6. Audited Annual Balance Sheet & P&L Statement
--  7. CA Turnover Certificate with UDIN
--  8. Udyam MSME Registration (Rule 153 GFR)
--  9. Past Experience & Work Order Completion
-- 10. Technical Specification Compliance Matrix & Datasheet

-- 1. Seller Documents for Primary Demo Sellers
INSERT INTO seller_documents (id, seller_id, document_type, filename, checksum, parsed_data_json, verification_status) VALUES
('SDOC-001', 'SLR-APEX-001', 'AADHAAR_IDENTITY', 'aadhaar_aarav_sharma_valid.pdf', '0x8f2d3a9b1c7e4f5a6b0c1d2e3f4a5b6c7d8e9f0a', '{"aadhaar_masked":"XXXX-XXXX-4912","name":"Aarav Sharma","status":"AUTHENTICATED","connector":"UIDAI_DEPOSITORY"}', 'VERIFIED'),
('SDOC-002', 'SLR-APEX-001', 'PAN_CARD', 'pan_card_apex_pumps.pdf', '0x7c3b2e1a9f8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b', '{"pan":"AAACA1234F","entity":"Apex Pumps & Motors Pvt Ltd","status":"ACTIVE"}', 'VERIFIED'),
('SDOC-003', 'SLR-APEX-001', 'GST_REGISTRATION', 'gst_reg_apex_pumps.pdf', '0x6b2a1f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a', '{"gstin":"07AAAAA0000A1Z5","legal_name":"Apex Pumps & Motors Pvt Ltd","status":"ACTIVE_COMPLIANT"}', 'VERIFIED'),
('SDOC-004', 'SLR-APEX-001', 'ISO_CERTIFICATION', 'iso_9001_apex_pumps.pdf', '0x5a1f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f', '{"standard":"ISO 9001:2015","accreditation":"NABCB","cert_no":"ISO-001-QMS-2024","valid_till":"2027-08-31"}', 'VERIFIED'),
('SDOC-005', 'SLR-APEX-001', 'BANK_GUARANTEE', 'bank_guarantee_apex_valid.pdf', '0x4f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e', '{"bg_number":"BG/SBI/2026/0912","amount":2500000.00,"issuing_bank":"State Bank of India","sfms_status":"CONFIRMED"}', 'VERIFIED'),
('SDOC-006', 'SLR-APEX-001', 'BALANCE_SHEET', 'balance_sheet_apex_audited.pdf', '0x3e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d', '{"turnover_cr":112.50,"net_worth_cr":38.40,"working_capital_cr":18.20,"auditor":"R.K. Singhania & Associates"}', 'VERIFIED'),
('SDOC-007', 'SLR-APEX-001', 'CA_TURNOVER', 'ca_turnover_apex_compliant.pdf', '0x2d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c', '{"udin":"260019123A014918","3_yr_avg_cr":111.00,"fy23":112.00,"fy24":127.00,"fy25":94.00}', 'VERIFIED'),
('SDOC-008', 'SLR-APEX-001', 'UDYAM_MSME', 'udyam_msme_apex_pumps.pdf', '0x1c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b', '{"udyam_number":"UDYAM-MH-01-0012345","category":"MEDIUM","emd_waiver_eligible":true}', 'VERIFIED'),
('SDOC-009', 'SLR-APEX-001', 'EXPERIENCE_CERTIFICATE', 'past_experience_work_order_apex.pdf', '0x0b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a', '{"client":"NTPC Limited","wo_ref":"WO/NTPC/2023/881","value_inr":45000000.00,"rating":"SATISFACTORY"}', 'VERIFIED'),
('SDOC-010', 'SLR-APEX-001', 'TECHNICAL_SPECIFICATIONS', 'tech_specs_compliance_datasheet_apex.pdf', '0x9a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f', '{"efficiency":"88.4%","pressure":"10.69 Bar","npsh":"4.8m","capacity":"800 units/day"}', 'VERIFIED')
ON CONFLICT (id) DO NOTHING;

-- 2. Direct Government Connector Verification Results for 10 Types
INSERT INTO seller_verification_results (id, seller_id, connector_name, status, response_json) VALUES
('VR-001', 'SLR-APEX-001', 'UIDAI_AADHAAR', 'MATCHED', '{"connector":"UIDAI e-KYC","signatory":"Aarav Sharma","aadhaar_masked":"XXXX-XXXX-4912","dob_verified":true,"auth_code":"AUTH-UIDAI-99120"}'),
('VR-002', 'SLR-APEX-001', 'MCA_PAN', 'MATCHED', '{"connector":"Income Tax e-Filing / NSDL","pan":"AAACA1234F","pan_status":"OPERATIVE","aadhaar_linked":true}'),
('VR-003', 'SLR-APEX-001', 'GSTN', 'MATCHED', '{"connector":"GSTN Portal API","gstin":"07AAAAA0000A1Z5","taxpayer_type":"Regular","status":"Active","returns_filed_3b":["Jul-2026","Aug-2026"]}'),
('VR-004', 'SLR-APEX-001', 'NABCB_ISO', 'MATCHED', '{"connector":"NABCB Accreditation Register","cert_number":"ISO-001-QMS-2024","standard":"ISO 9001:2015","valid":true}'),
('VR-005', 'SLR-APEX-001', 'SFMS_BG', 'MATCHED', '{"connector":"Structured Financial Messaging System (SFMS)","bg_ref":"BG/SBI/2026/0912","bank_branch":"SBI Industrial New Delhi","confirmation":"VERIFIED_LIVE"}'),
('VR-006', 'SLR-APEX-001', 'MCA21_FINANCIALS', 'MATCHED', '{"connector":"MCA21 Company Master Data","fy":"2024-25","turnover_reported":1125000000,"net_worth_positive":true,"roc_status":"Active"}'),
('VR-007', 'SLR-APEX-001', 'ICAI_UDIN', 'MATCHED', '{"connector":"ICAI UDIN Portal","udin":"260019123A014918","ca_membership":"091234","attestation":"Turnover Certificate Issued"}'),
('VR-008', 'SLR-APEX-001', 'UDYAM', 'MATCHED', '{"connector":"Udyam MSME Portal","reg_no":"UDYAM-MH-01-0012345","enterprise_type":"Medium","rule_153_eligible":true}'),
('VR-009', 'SLR-APEX-001', 'CENTRAL_PSU_EXPERIENCE', 'MATCHED', '{"connector":"CPWD/PSU Work Order Verification","wo_id":"WO/NTPC/2023/881","completion_acknowledged":true}'),
('VR-010', 'SLR-APEX-001', 'BIS_TECHNICAL_STANDARDS', 'MATCHED', '{"connector":"Bureau of Indian Standards (BIS)","is_standard":"IS 1520:1980 Centrifugal Pumps","license_status":"VALID"}')
ON CONFLICT (id) DO NOTHING;

-- 3. Certificate Expiry Checks (10 types)
INSERT INTO certificate_expiry_checks (id, bid_id, document_name, cert_type, expiry_date, submission_date, status, days_remaining) VALUES
('EXP-001', 'BID-APEX-001', 'aadhaar_aarav_sharma_valid.pdf', 'AADHAAR_KYC', '2035-12-31', '2026-09-14', 'VALID', 3395),
('EXP-002', 'BID-APEX-001', 'pan_card_apex_pumps.pdf', 'PAN_TAX_CARD', '2040-12-31', '2026-09-14', 'VALID', 5222),
('EXP-003', 'BID-APEX-001', 'gst_reg_apex_pumps.pdf', 'GST_REGISTRATION', '2030-03-31', '2026-09-14', 'VALID', 1294),
('EXP-004', 'BID-APEX-001', 'iso_9001_apex_pumps.pdf', 'ISO_9001_QMS', '2027-08-31', '2026-09-14', 'VALID', 351),
('EXP-005', 'BID-APEX-001', 'bank_guarantee_apex_valid.pdf', 'BANK_GUARANTEE_EMD', '2027-03-14', '2026-09-14', 'VALID', 181),
('EXP-006', 'BID-APEX-001', 'balance_sheet_apex_audited.pdf', 'AUDITED_BALANCE_SHEET', '2026-09-30', '2026-09-14', 'VALID', 16),
('EXP-007', 'BID-APEX-001', 'ca_turnover_apex_compliant.pdf', 'CA_TURNOVER_UDIN', '2027-03-31', '2026-09-14', 'VALID', 198),
('EXP-008', 'BID-APEX-001', 'udyam_msme_apex_pumps.pdf', 'UDYAM_MSME_CERTIFICATE', '2032-12-31', '2026-09-14', 'VALID', 2299),
('EXP-009', 'BID-APEX-001', 'past_experience_work_order_apex.pdf', 'EXPERIENCE_CERTIFICATE', '2028-12-31', '2026-09-14', 'VALID', 839),
('EXP-010', 'BID-APEX-001', 'tech_specs_compliance_datasheet_apex.pdf', 'TECHNICAL_DATASHEET', '2027-06-30', '2026-09-14', 'VALID', 289)
ON CONFLICT (id) DO NOTHING;

-- 4. Evidence Citations (10 types linked to requirements)
INSERT INTO evidence_citations (id, compliance_result_id, document_id, document_name, page_num, snippet, extracted_value, extracted_unit, extraction_confidence) VALUES
('EVD-CIT-001', 'RES-A-002', 'DOC-01', 'aadhaar_aarav_sharma_valid.pdf', 1, 'UIDAI Signatory Aarav Sharma e-KYC Verified', 1.000000, 'BOOLEAN', 0.990),
('EVD-CIT-002', 'RES-A-002', 'DOC-02', 'pan_card_apex_pumps.pdf', 1, 'Income Tax Permanent Account Number AAACA1234F Active', 1.000000, 'BOOLEAN', 0.990),
('EVD-CIT-003', 'RES-A-002', 'DOC-03', 'gst_reg_apex_pumps.pdf', 1, 'GSTIN 07AAAAA0000A1Z5 Active & In Good Standing', 1.000000, 'BOOLEAN', 0.990),
('EVD-CIT-004', 'RES-A-006', 'DOC-04', 'iso_9001_apex_pumps.pdf', 1, 'NABCB Accredited ISO 9001:2015 Quality Management System', 1.000000, 'BOOLEAN', 0.980),
('EVD-CIT-005', 'RES-A-002', 'DOC-05', 'bank_guarantee_apex_valid.pdf', 1, 'State Bank of India SFMS EMD BG Amount INR 25,00,000.00', 2500000.000000, 'INR', 0.995),
('EVD-CIT-006', 'RES-A-001', 'DOC-06', 'balance_sheet_apex_audited.pdf', 3, 'Audited Balance Sheet FY 2024-25 Positive Net Worth Rs 38.40 Cr', 38.400000, 'Cr', 0.980),
('EVD-CIT-007', 'RES-A-001', 'DOC-07', 'ca_turnover_apex_compliant.pdf', 1, '3-Year Average Annual Turnover certified at Rs 111.00 Crores with UDIN 260019123A014918', 111.000000, 'Cr', 0.990),
('EVD-CIT-008', 'RES-A-002', 'DOC-08', 'udyam_msme_apex_pumps.pdf', 1, 'Udyam Registration UDYAM-MH-01-0012345 Medium Enterprise EMD Exempt', 1.000000, 'BOOLEAN', 0.990),
('EVD-CIT-009', 'RES-A-005', 'DOC-09', 'past_experience_work_order_apex.pdf', 2, 'NTPC High Pressure Pumping Station Satisfactory Completion Order Value INR 4,50,00,000.00', 5.000000, 'Years', 0.950),
('EVD-CIT-010', 'RES-A-003', 'DOC-10', 'tech_specs_compliance_datasheet_apex.pdf', 4, 'Centrifugal Pump Operating Efficiency 88.4% and Pressure 10.69 Bar (155 PSI)', 88.400000, '%', 0.980)
ON CONFLICT (id) DO NOTHING;

-- 5. Audit Log Ledger Records for 10 Types
ALTER TABLE audit_logs ALTER COLUMN details TYPE TEXT USING details::text;

INSERT INTO audit_logs (id, actor_id, actor_role, organization_id, action, resource_type, resource_id, timestamp, details) VALUES
('AUD-TYPE-001', 'SYSTEM', 'DIGILOCKER_CONNECTOR', 'ORG-001', 'AADHAAR_KYC_VERIFIED', 'SELLER_DOC', 'SDOC-001', CURRENT_TIMESTAMP, 'UIDAI depository verified signatory Aarav Sharma (Aadhaar ending 4912).'),
('AUD-TYPE-002', 'SYSTEM', 'ITD_NSDL_CONNECTOR', 'ORG-001', 'PAN_STATUS_CONFIRMED', 'SELLER_DOC', 'SDOC-002', CURRENT_TIMESTAMP, 'PAN AAACA1234F verified active with Income Tax Department e-filing register.'),
('AUD-TYPE-003', 'SYSTEM', 'GSTN_API_CONNECTOR', 'ORG-001', 'GST_RETURN_VERIFIED', 'SELLER_DOC', 'SDOC-003', CURRENT_TIMESTAMP, 'GSTIN 07AAAAA0000A1Z5 active; 3B filing current for Q1-Q2 2026.'),
('AUD-TYPE-004', 'SYSTEM', 'NABCB_VERIFIER', 'ORG-001', 'ISO_STANDARD_CONFIRMED', 'SELLER_DOC', 'SDOC-004', CURRENT_TIMESTAMP, 'ISO 9001:2015 verified active with National Accreditation Board.'),
('AUD-TYPE-005', 'SYSTEM', 'SFMS_E_GATEWAY', 'ORG-001', 'BANK_GUARANTEE_LOCKED', 'SELLER_DOC', 'SDOC-005', CURRENT_TIMESTAMP, 'SFMS advice message received from State Bank of India for INR 25,00,000.'),
('AUD-TYPE-006', 'SYSTEM', 'MCA21_CONNECTOR', 'ORG-001', 'BALANCE_SHEET_ANALYZED', 'SELLER_DOC', 'SDOC-006', CURRENT_TIMESTAMP, 'Audited financial statements analyzed: positive net worth Rs. 38.40 Cr confirmed.'),
('AUD-TYPE-007', 'SYSTEM', 'ICAI_UDIN_CONNECTOR', 'ORG-001', 'UDIN_AUTHENTICATED', 'SELLER_DOC', 'SDOC-007', CURRENT_TIMESTAMP, 'ICAI portal confirmed UDIN 260019123A014918 for 3-year turnover attestation.'),
('AUD-TYPE-008', 'SYSTEM', 'MSME_UDYAM_GATEWAY', 'ORG-001', 'UDYAM_CLASSIFICATION_VERIFIED', 'SELLER_DOC', 'SDOC-008', CURRENT_TIMESTAMP, 'Udyam registration UDYAM-MH-01-0012345 confirmed Medium Enterprise status under Rule 153.'),
('AUD-TYPE-009', 'SYSTEM', 'PSU_WORK_ORDER_DB', 'ORG-001', 'EXPERIENCE_VERIFIED', 'SELLER_DOC', 'SDOC-009', CURRENT_TIMESTAMP, 'NTPC work order completion certificate cross-referenced and validated.'),
('AUD-TYPE-010', 'SYSTEM', 'AI_SPEC_EXTRACTOR', 'ORG-001', 'TECHNICAL_PARAM_MATCHED', 'SELLER_DOC', 'SDOC-010', CURRENT_TIMESTAMP, 'Pump operational efficiency (88.4%) and operating pressure (10.69 Bar) validated against technical schedule.')
ON CONFLICT (id) DO NOTHING;
