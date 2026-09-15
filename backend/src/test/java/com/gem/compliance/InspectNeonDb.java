package com.gem.compliance;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class InspectNeonDb {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:postgresql://ep-dawn-cell-b377xf50-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
        String user = "neondb_owner";
        String pass = "npg_qISke7Erx6ho";
        
        System.out.println("Connecting to Neon PostgreSQL...");
        try (Connection conn = DriverManager.getConnection(url, user, pass);
             Statement stmt = conn.createStatement()) {
            System.out.println("Connected successfully!");
            
            // Generate real BCrypt hash for Password123!
            org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = 
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
            String realHash = encoder.encode("Password123!");
            System.out.println("Generated real BCrypt hash for Password123!: " + realHash);
            System.out.println("Verification matches: " + encoder.matches("Password123!", realHash));
            
            // Update all users password_hash with real BCrypt hash
            stmt.executeUpdate("UPDATE users SET password_hash = '" + realHash + "'");
            System.out.println("Updated all users in DB with verified BCrypt hash for Password123!");

            // List all UUID columns
            try (ResultSet rs = stmt.executeQuery(
                "SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public' AND data_type = 'uuid'")) {
                System.out.println("\n--- All UUID Columns in Neon ---");
                while (rs.next()) {
                    System.out.printf("%s.%s\n", rs.getString("table_name"), rs.getString("column_name"));
                }
            } catch (Exception e) {
                System.out.println("Error querying UUID columns: " + e.getMessage());
            }

            // Convert UUID columns to VARCHAR(64)
            System.out.println("\nConverting UUID columns to VARCHAR(64)...");
            try {
                // 1. Drop FKs
                stmt.execute("ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey");
                stmt.execute("ALTER TABLE tenders DROP CONSTRAINT IF EXISTS tenders_created_by_fkey");
                stmt.execute("ALTER TABLE bids DROP CONSTRAINT IF EXISTS bids_vendor_id_fkey");
                stmt.execute("ALTER TABLE bids DROP CONSTRAINT IF EXISTS bids_tender_id_fkey");
                stmt.execute("ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_actor_id_fkey");

                // 2. Alter column types
                stmt.execute("ALTER TABLE users ALTER COLUMN id TYPE VARCHAR(64)");
                stmt.execute("ALTER TABLE user_roles ALTER COLUMN user_id TYPE VARCHAR(64)");
                stmt.execute("ALTER TABLE tenders ALTER COLUMN id TYPE VARCHAR(64)");
                stmt.execute("ALTER TABLE tenders ALTER COLUMN created_by TYPE VARCHAR(64)");
                stmt.execute("ALTER TABLE bids ALTER COLUMN id TYPE VARCHAR(64)");
                stmt.execute("ALTER TABLE bids ALTER COLUMN tender_id TYPE VARCHAR(64)");
                stmt.execute("ALTER TABLE bids ALTER COLUMN vendor_id TYPE VARCHAR(64)");
                stmt.execute("ALTER TABLE audit_logs ALTER COLUMN id TYPE VARCHAR(64)");
                stmt.execute("ALTER TABLE audit_logs ALTER COLUMN actor_id TYPE VARCHAR(64)");

                System.out.println("Successfully converted all UUID columns to VARCHAR(64)!");
            } catch (Exception e) {
                System.out.println("Error converting UUID columns: " + e.getMessage());
            }

            // Align tenders table columns
            System.out.println("Aligning tenders table columns...");
            try {
                stmt.execute("ALTER TABLE tenders ADD COLUMN IF NOT EXISTS organization_id VARCHAR(64)");
                stmt.execute("ALTER TABLE tenders ADD COLUMN IF NOT EXISTS issuing_authority VARCHAR(255) DEFAULT 'GeM Authority'");
                stmt.execute("ALTER TABLE tenders ADD COLUMN IF NOT EXISTS category VARCHAR(128) DEFAULT 'Industrial Equipment'");
                stmt.execute("ALTER TABLE tenders ADD COLUMN IF NOT EXISTS estimated_value NUMERIC(15,2)");
                stmt.execute("ALTER TABLE tenders ADD COLUMN IF NOT EXISTS status VARCHAR(64) DEFAULT 'IN_EVALUATION'");
                stmt.execute("UPDATE tenders SET estimated_value = COALESCE(budget, 50000000.00) WHERE estimated_value IS NULL");
                stmt.execute("UPDATE tenders SET status = 'IN_EVALUATION' WHERE status IS NULL");
                stmt.execute("UPDATE tenders SET issuing_authority = 'GeM Authority' WHERE issuing_authority IS NULL");
                stmt.execute("UPDATE tenders SET category = 'Industrial Equipment' WHERE category IS NULL");
                System.out.println("tenders table columns aligned successfully!");
            } catch (Exception e) {
                System.out.println("Error aligning tenders: " + e.getMessage());
            }

            // Seed Organizations
            try {
                stmt.execute("INSERT INTO organizations (id, name, code) VALUES ('ORG-001', 'Central Water Commission', 'ORG-CWC-001') ON CONFLICT (id) DO NOTHING");
                stmt.execute("INSERT INTO organizations (id, name, code) VALUES ('SLR-APEX-001', 'Apex Pumps & Motors Pvt Ltd', 'ORG-APEX-001') ON CONFLICT (id) DO NOTHING");
                stmt.execute("INSERT INTO organizations (id, name, code) VALUES ('SLR-BHARAT-002', 'Bharat Heavy Valves Ltd', 'ORG-BHARAT-002') ON CONFLICT (id) DO NOTHING");
                stmt.execute("INSERT INTO organizations (id, name, code) VALUES ('SLR-CROMPTON-003', 'Crompton Flow Dynamics', 'ORG-CROMPTON-003') ON CONFLICT (id) DO NOTHING");
                stmt.execute("INSERT INTO organizations (id, name, code) VALUES ('SLR-STJOHN-001', 'St. John Technologies Ltd', 'ORG-STJOHN-001') ON CONFLICT (id) DO NOTHING");
                System.out.println("Organizations seeded!");
            } catch (Exception e) {
                System.out.println("Error seeding organizations: " + e.getMessage());
            }

            // Drop legacy NOT NULL constraints on users, tenders, bids
            try {
                stmt.execute("ALTER TABLE users ALTER COLUMN first_name DROP NOT NULL");
                stmt.execute("ALTER TABLE users ALTER COLUMN last_name DROP NOT NULL");
                stmt.execute("ALTER TABLE tenders ALTER COLUMN budget DROP NOT NULL");
                stmt.execute("ALTER TABLE tenders ALTER COLUMN status_id DROP NOT NULL");
                stmt.execute("ALTER TABLE tenders ALTER COLUMN category_id DROP NOT NULL");
                stmt.execute("ALTER TABLE bids ALTER COLUMN vendor_id DROP NOT NULL");
                stmt.execute("ALTER TABLE bids ALTER COLUMN proposed_amount DROP NOT NULL");
                stmt.execute("ALTER TABLE bids ALTER COLUMN proposal_summary DROP NOT NULL");
                System.out.println("Legacy NOT NULL constraints dropped successfully!");
            } catch (Exception e) {
                System.out.println("Error dropping NOT NULL constraints: " + e.getMessage());
            }

            // Seed Demo Users with verified hash
            try {
                stmt.execute("INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, full_name, role, is_active) VALUES " +
                    "('USR-DEMO-ADMIN', 'ORG-001', 'admin.demo@gembid.local', '" + realHash + "', 'System', 'Admin', 'System Admin (Demo)', 'SYSTEM_ADMIN', true), " +
                    "('USR-DEMO-PROC', 'ORG-001', 'procurement.demo@gembid.local', '" + realHash + "', 'Rajesh', 'Kumar', 'Rajesh Kumar (Procurement Officer Demo)', 'PROCUREMENT_OFFICER', true), " +
                    "('USR-DEMO-REV', 'ORG-001', 'reviewer.demo@gembid.local', '" + realHash + "', 'Anita', 'Sharma', 'Anita Sharma (Compliance Reviewer Demo)', 'COMPLIANCE_REVIEWER', true), " +
                    "('USR-DEMO-AUD', 'ORG-001', 'auditor.demo@gembid.local', '" + realHash + "', 'Vikram', 'Sethi', 'Vikram Sethi (Auditor Demo)', 'AUDITOR', true), " +
                    "('USR-DEMO-BID', 'SLR-APEX-001', 'bidder.demo@gembid.local', '" + realHash + "', 'Aarav', 'Sharma', 'Apex Pumps Vendor Representative', 'BIDDER_VENDOR', true) " +
                    "ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, full_name = EXCLUDED.full_name");
                stmt.execute("UPDATE users SET password_hash = '" + realHash + "'");
                System.out.println("Demo users seeded and passwords set to Password123!");
            } catch (Exception e) {
                System.out.println("Error seeding demo users: " + e.getMessage());
            }

            // Seed TND-001 and clean orphan requirements
            try {
                stmt.execute("INSERT INTO tenders (id, organization_id, tender_number, title, description, issuing_authority, category, estimated_value, budget, status, created_by) " +
                    "VALUES ('TND-001', 'ORG-001', 'GEM/2026/B/10001', 'IT Infrastructure & Computing Hardware', 'Procurement of Server Infrastructure', 'Ministry of Electronics and IT', 'IT Hardware', 25000000.00, 25000000.00, 'IN_EVALUATION', 'USR-DEMO-PROC') " +
                    "ON CONFLICT (id) DO NOTHING");
                System.out.println("TND-001 seeded successfully!");
            } catch (Exception e) {
                System.out.println("Error seeding TND-001: " + e.getMessage());
            }

            // Clean any orphan requirements
            try {
                int deleted = stmt.executeUpdate("DELETE FROM requirements WHERE tender_id NOT IN (SELECT id FROM tenders)");
                System.out.println("Deleted " + deleted + " orphan requirements.");
            } catch (Exception e) {
                System.out.println("Error cleaning orphan requirements: " + e.getMessage());
            }

            // Seed Sellers (Apex Pumps)
            try {
                stmt.execute("INSERT INTO sellers (id, organization_name, cin_or_pan, gstin, udyam_registration, dpiit_number, bis_license, epfo_code, registered_address, category, is_debarred, trust_score, verification_status) " +
                    "VALUES ('SLR-APEX-001', 'Apex Pumps & Motors Pvt Ltd', 'U29120MH2010PTC201842 / AAACA1234F', '07AAAAA0000A1Z5', 'UDYAM-MH-01-0012345', 'DPIIT-2021-MSME-9981', 'BIS-LIC-44512', 'MH/PUN/0099881', 'Plot 42, Sector 8, PCMC Industrial Area, Bhosari, Pune, Maharashtra - 411026', 'Industrial Equipment & Water Pumps OEM', false, 87.50, 'VERIFIED') " +
                    "ON CONFLICT (id) DO NOTHING");
                System.out.println("Apex Pumps seller seeded!");
            } catch (Exception e) {
                System.out.println("Error seeding Apex seller: " + e.getMessage());
            }

            // Seed BID-APEX-001
            try {
                stmt.execute("INSERT INTO bids (id, tender_id, vendor_id, bidder_name, bidder_gstin, bidder_pan, bidder_email, status, risk_score, debarment_status, total_amount, quoted_price, proposed_amount) " +
                    "VALUES ('BID-APEX-001', 'TND-PUMP-001', 'USR-DEMO-BID', 'Apex Pumps & Motors Pvt Ltd', '07AAAAA0000A1Z5', 'AAACA1234F', 'apex@apexpumps.com', 'UNDER_EVALUATION', 65.0, 'CLEAR', 48500000.00, 48500000.00, 48500000.00) " +
                    "ON CONFLICT (id) DO NOTHING");
                System.out.println("BID-APEX-001 seeded!");
            } catch (Exception e) {
                System.out.println("Error seeding BID-APEX-001: " + e.getMessage());
            }

            // Seed V5 Compliance Results for BID-APEX-001
            try {
                stmt.execute("INSERT INTO compliance_results (id, requirement_id, bid_id, status, verification_method, reasoning, confidence, evidence_ids, review_status) VALUES " +
                    "('RES-A-001','REQ-P001','BID-APEX-001','PARTIALLY_COMPLIANT','deterministic','FY2023=Rs.112Cr (PASS), FY2024=Rs.127Cr (PASS), FY2025=Rs.94Cr (FAIL). 2 of 3 years compliant.',0.98,'EVD-A-001','PENDING_REVIEW'), " +
                    "('RES-A-002','REQ-P002','BID-APEX-001','COMPLIANT','deterministic','GSTIN active on GSTN portal. PAN card matches Income Tax DB.',0.99,'EVD-A-002','APPROVED'), " +
                    "('RES-A-003','REQ-P003','BID-APEX-001','COMPLIANT','deterministic','Centrifugal pump efficiency rated at 87.2% >= 85%.',0.97,'EVD-A-003','APPROVED'), " +
                    "('RES-A-004','REQ-P004','BID-APEX-001','NON_COMPLIANT','deterministic','Capacity certified at 720 units/day. Minimum 800 required.',0.99,'EVD-A-004','PENDING_REVIEW'), " +
                    "('RES-A-005','REQ-P005','BID-APEX-001','COMPLIANT','deterministic','Supplied to NTPC, NHPC for 7 years >= 5 years required.',0.96,'EVD-A-005','APPROVED'), " +
                    "('RES-A-006','REQ-P006','BID-APEX-001','UNVERIFIED','ai_agent','ISO Certificate submitted but QR code unreadable.',0.62,'EVD-A-006','PENDING_REVIEW'), " +
                    "('RES-A-007','REQ-P007','BID-APEX-001','COMPLIANT','deterministic','Operating pressure rating is 12 Bar >= 10 Bar threshold.',0.98,'EVD-A-007','APPROVED') " +
                    "ON CONFLICT (id) DO NOTHING");
                System.out.println("Apex compliance results seeded!");
            } catch (Exception e) {
                System.out.println("Error seeding Apex compliance results: " + e.getMessage());
            }

            // Print bids rows
            try (ResultSet rs = stmt.executeQuery("SELECT * FROM bids LIMIT 5")) {
                System.out.println("\n--- Sample Bids in Neon ---");
                int colCount = rs.getMetaData().getColumnCount();
                while (rs.next()) {
                    for (int i = 1; i <= colCount; i++) {
                        System.out.print(rs.getMetaData().getColumnName(i) + "=" + rs.getString(i) + " | ");
                    }
                    System.out.println();
                }
            } catch (Exception e) {
                System.out.println("Error querying bids: " + e.getMessage());
            }

            // Align schema: Add missing columns to users
            System.out.println("Aligning users table columns...");
            try {
                stmt.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id VARCHAR(64)");
                stmt.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255)");
                stmt.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(64)");
                stmt.execute("UPDATE users SET full_name = COALESCE(NULLIF(TRIM(first_name || ' ' || COALESCE(last_name, '')), ''), 'Administrator') WHERE full_name IS NULL");
                stmt.execute("UPDATE users SET role = CASE " +
                    "WHEN email LIKE 'admin%' THEN 'SYSTEM_ADMIN' " +
                    "WHEN email LIKE 'procurement%' THEN 'PROCUREMENT_OFFICER' " +
                    "WHEN email LIKE 'audit%' THEN 'AUDITOR' " +
                    "ELSE 'BIDDER_VENDOR' END WHERE role IS NULL");
                System.out.println("users table columns aligned successfully!");
            } catch (Exception e) {
                System.out.println("Error adding columns to users: " + e.getMessage());
            }

            // Align schema: Add missing columns to bids
            System.out.println("Aligning bids table columns...");
            try {
                stmt.execute("ALTER TABLE bids ADD COLUMN IF NOT EXISTS bidder_name VARCHAR(255)");
                stmt.execute("ALTER TABLE bids ADD COLUMN IF NOT EXISTS bidder_gstin VARCHAR(20)");
                stmt.execute("ALTER TABLE bids ADD COLUMN IF NOT EXISTS bidder_pan VARCHAR(12)");
                stmt.execute("ALTER TABLE bids ADD COLUMN IF NOT EXISTS bidder_email VARCHAR(255)");
                stmt.execute("ALTER TABLE bids ADD COLUMN IF NOT EXISTS bidder_phone VARCHAR(20)");
                stmt.execute("ALTER TABLE bids ADD COLUMN IF NOT EXISTS bidder_address TEXT");
                stmt.execute("ALTER TABLE bids ADD COLUMN IF NOT EXISTS risk_score DECIMAL(5,2)");
                stmt.execute("ALTER TABLE bids ADD COLUMN IF NOT EXISTS risk_factors TEXT");
                stmt.execute("ALTER TABLE bids ADD COLUMN IF NOT EXISTS forgery_risk DECIMAL(5,3)");
                stmt.execute("ALTER TABLE bids ADD COLUMN IF NOT EXISTS collusion_flags TEXT");
                stmt.execute("ALTER TABLE bids ADD COLUMN IF NOT EXISTS debarment_status VARCHAR(20) DEFAULT 'CLEAR'");
                stmt.execute("ALTER TABLE bids ADD COLUMN IF NOT EXISTS total_amount NUMERIC(15,2)");
                stmt.execute("ALTER TABLE bids ADD COLUMN IF NOT EXISTS quoted_price NUMERIC(15,2)");
                System.out.println("bids table columns aligned successfully!");
            } catch (Exception e) {
                System.out.println("Error adding columns to bids: " + e.getMessage());
            }

            // Print all columns and data types for every table
            try (ResultSet rs = stmt.executeQuery(
                "SELECT table_name, column_name, data_type " +
                "FROM information_schema.columns " +
                "WHERE table_schema = 'public' " +
                "ORDER BY table_name, ordinal_position")) {
                System.out.println("\n--- All table columns and types ---");
                String currentTable = "";
                while (rs.next()) {
                    String tbl = rs.getString("table_name");
                    if (!tbl.equals(currentTable)) {
                        currentTable = tbl;
                        System.out.println("\nTABLE: " + tbl);
                    }
                    System.out.printf("  %s: %s\n", rs.getString("column_name"), rs.getString("data_type"));
                }
            } catch (Exception e) {
                System.out.println("Could not inspect columns: " + e.getMessage());
            }
        }
    }
}
