-- SIH26100 Flyway Migration V16: Link Demo Bidder User to Apex Pumps & Motors
-- Ensures bidder.demo@gembid.local is linked to SLR-APEX-001 and BID-APEX-001

UPDATE users 
SET organization_id = 'SLR-APEX-001' 
WHERE id = 'USR-DEMO-BID' OR email = 'bidder.demo@gembid.local';

UPDATE bids 
SET bidder_email = 'bidder.demo@gembid.local' 
WHERE id = 'BID-APEX-001';
