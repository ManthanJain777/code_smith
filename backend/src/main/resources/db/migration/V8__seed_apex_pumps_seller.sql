-- SIH26100 Flyway Migration V8: Seed Apex Pumps & Motors Private Limited
-- Primary vendor profile for BIDDER_VENDOR account and canonical clean OEM

INSERT INTO sellers (
    id, organization_name, cin_or_pan, gstin, udyam_registration, 
    dpiit_number, bis_license, epfo_code, registered_address, 
    category, is_debarred, trust_score, verification_status
) VALUES (
    'SLR-APEX-001',
    'Apex Pumps & Motors Private Limited',
    'U45201DL2015PTC284910 / AAACA1234F',
    '07AAAAA0000A1Z5',
    'UDYAM-DL-01-0012345',
    'DPIIT-2023-PUMP-8841',
    'BIS-LIC-54321',
    'DL/CPM/998877',
    'Plot 42-44, Okhla Industrial Area Phase-III, New Delhi - 110020',
    'Industrial Machinery & Fluid Systems OEM',
    false,
    92.50,
    'VERIFIED'
);
