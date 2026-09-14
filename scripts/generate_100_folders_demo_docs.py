#!/usr/bin/env python3
"""
generate_100_folders_demo_docs.py
Generates exactly 100 different folders inside `demo_docs/`, each representing
a distinct compliance/procurement verification package across 10 core government document types:
  1. Aadhaar Identity Verifications (Folders 001 - 010)
  2. PAN Card Legal Tax Verifications (Folders 011 - 020)
  3. GST Registration & Active Filing (Folders 021 - 030)
  4. ISO Quality Management Certifications (Folders 031 - 040)
  5. Bank Guarantee & EMD Instruments (Folders 041 - 050)
  6. Audited Balance Sheets & Financials (Folders 051 - 060)
  7. CA Turnover Certificates with UDIN (Folders 061 - 070)
  8. Udyam MSME Registration Certificates (Folders 071 - 080)
  9. Past Experience & Work Orders (Folders 081 - 090)
 10. Technical Specification Compliance Sheets (Folders 091 - 100)

Every document features:
 - GeM Compliance Shield branding (No Ashoka Emblem)
 - Cryptographic SHA-256 hash stamp
 - Realistic government data fields (GSTIN, PAN, UDIN, Bank IFSC, SFMS, etc.)
 - Tamper-proof verification metadata JSON in each folder
"""

import os
import shutil
import hashlib
import json
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "demo_docs")

VENDORS = [
    ("Apex Pumps & Motors Pvt Ltd", "AAACA1234F", "07AAAAA0000A1Z5", "UDYAM-MH-01-0012345", "Aarav Sharma"),
    ("Bharat Heavy Valves Ltd", "AADCB5678C", "07AADCB5678C1ZQ", "UDYAM-DL-02-0054321", "Priya Patel"),
    ("Crompton Flow Dynamics", "AABCC9012D", "33AABCC9012D1ZR", "UDYAM-TN-03-0098765", "Rohit Verma"),
    ("TechnoServe Industrial Solutions", "AAFCT3456E", "29AAFCT3456E1ZS", "UDYAM-KA-04-0076543", "Ananya Gupta"),
    ("National Water Engineering Corp", "AAECN7890F", "09AAECN7890F1ZT", "UDYAM-UP-05-0043210", "Vikram Singh"),
    ("Hindalco Pumps Division", "AABCH2345G", "06AABCH2345G1ZU", "UDYAM-HR-06-0021098", "Meera Nair"),
    ("Sundaram Precision Engg", "AAICS6789H", "34AAICS6789H1ZV", "UDYAM-KL-07-0087654", "Arjun Rao"),
    ("Tata Industrial Components", "AACT1234J", "27AACT1234J1ZW", "UDYAM-MH-08-0065432", "Kavita Deshmukh"),
    ("Godrej Process Equipment", "AADCG5678K", "27AADCG5678K1ZX", "UDYAM-MH-09-0043210", "Suresh Kumar"),
    ("L&T EPC Heavy Engineering", "AABCL9012L", "27AABCL9012L1ZY", "UDYAM-MH-10-0021098", "Neha Joshi"),
]

TYPE_DEFS = [
    ("aadhaar_identity", "Aadhaar Identity Verification (UIDAI e-KYC)"),
    ("pan_card", "Permanent Account Number (PAN Card Record)"),
    ("gst_registration", "GST Registration Certificate (Form GST REG-06)"),
    ("iso_certification", "ISO Quality Management Certificate (ISO 9001:2015)"),
    ("bank_guarantee", "e-Bank Guarantee / EMD Security Instrument"),
    ("balance_sheet", "Audited Annual Balance Sheet & P&L Statement"),
    ("ca_turnover", "Chartered Accountant Turnover Certificate (UDIN Verified)"),
    ("udyam_msme", "Udyam MSME Registration Certificate"),
    ("experience_cert", "Past Performance & Work Order Completion Certificate"),
    ("technical_specs", "Technical Specification Compliance Matrix & Datasheet"),
]

def draw_gem_header(c, title, subtitle, w, y_top):
    """Draw clean GeM platform branding header (without Ashoka emblem)."""
    # Navy top banner
    c.setFillColor(HexColor("#1B365D"))
    c.rect(15*mm, y_top - 2*mm, w - 30*mm, 20*mm, fill=1, stroke=0)

    # Gold accent line
    c.setFillColor(HexColor("#D97706"))
    c.rect(15*mm, y_top - 3*mm, w - 30*mm, 1*mm, fill=1, stroke=0)

    # Title & Subtitle
    c.setFillColor(HexColor("#FFFFFF"))
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(w / 2, y_top + 10*mm, title)
    c.setFont("Helvetica", 8)
    c.drawCentredString(w / 2, y_top + 3*mm, subtitle)

def draw_blockchain_footer(c, w, doc_hash, folder_name):
    """Draw tamper-evident blockchain verification footer."""
    c.setStrokeColor(HexColor("#CBD5E1"))
    c.setLineWidth(0.5)
    c.line(15*mm, 22*mm, w - 15*mm, 22*mm)

    c.setFillColor(HexColor("#475569"))
    c.setFont("Helvetica-Bold", 7)
    c.drawString(15*mm, 17*mm, "GeM CRYPTOGRAPHIC INTEGRITY PROOF")
    c.setFont("Helvetica", 6.5)
    c.drawString(15*mm, 12*mm, f"Folder: {folder_name}  |  SHA-256: {doc_hash}")
    c.drawString(15*mm, 8*mm, "Tamper Status: IMMUTABLE ON-CHAIN LEDGER RECORD | Public Verification Key: 0x5FbDB2315678afecb367f032d93F642f64180aa3")

def generate_pdf_content(c, type_key, vendor, folder_num, folder_name, w, h):
    company, pan, gstin, udyam, signatory = vendor

    # Body layout
    y = h - 45*mm

    c.setFillColor(HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 11)

    if type_key == "aadhaar_identity":
        c.drawString(20*mm, y, f"1. SIGNATORY IDENTITY VERIFICATION — {signatory.upper()}")
        y -= 8*mm
        c.setFont("Helvetica", 9)
        c.drawString(20*mm, y, f"Designation: Authorized Key Managerial Personnel (KMP)")
        y -= 6*mm
        c.drawString(20*mm, y, f"Company: {company}")
        y -= 6*mm
        masked_aadhaar = f"XXXX-XXXX-{1000 + folder_num*37 % 9000}"
        c.drawString(20*mm, y, f"Aadhaar Number: {masked_aadhaar} (UIDAI e-KYC Verified)")
        y -= 6*mm
        c.drawString(20*mm, y, f"e-KYC Reference: KYC-{folder_num:03d}-2026-UIDAI-OK")
        y -= 6*mm
        c.drawString(20*mm, y, f"Verification Status: AUTHENTICATED VIA AADHAAR XML DEPOSITORY")

    elif type_key == "pan_card":
        c.drawString(20*mm, y, f"2. INCOME TAX DEPARTMENT PERMANENT ACCOUNT NUMBER RECORD")
        y -= 8*mm
        c.setFont("Helvetica", 9)
        c.drawString(20*mm, y, f"Entity Name: {company}")
        y -= 6*mm
        c.drawString(20*mm, y, f"PAN Number: {pan}")
        y -= 6*mm
        c.drawString(20*mm, y, f"Category: Company / Corporate Entity")
        y -= 6*mm
        c.drawString(20*mm, y, f"PAN Status: ACTIVE & SEEDED WITH GSTN PORTAL")
        y -= 6*mm
        c.drawString(20*mm, y, f"Assessing Officer Code: WARD 12(3) / MUMBAI CENTRAL")

    elif type_key == "gst_registration":
        c.drawString(20*mm, y, f"3. GOODS AND SERVICES TAX REGISTRATION (FORM GST REG-06)")
        y -= 8*mm
        c.setFont("Helvetica", 9)
        c.drawString(20*mm, y, f"Legal Name: {company}")
        y -= 6*mm
        c.drawString(20*mm, y, f"GSTIN / UIN: {gstin}")
        y -= 6*mm
        c.drawString(20*mm, y, f"Constitution of Business: Private Limited Company")
        y -= 6*mm
        c.drawString(20*mm, y, f"Principal Place of Business: Plot {folder_num*12}, Phase II, Industrial Estate")
        y -= 6*mm
        c.drawString(20*mm, y, f"Registration Status: ACTIVE & IN GOOD STANDING (All 3B returns filed)")

    elif type_key == "iso_certification":
        c.drawString(20*mm, y, f"4. ISO 9001:2015 QUALITY MANAGEMENT SYSTEM CERTIFICATION")
        y -= 8*mm
        c.setFont("Helvetica", 9)
        c.drawString(20*mm, y, f"Certified Organization: {company}")
        y -= 6*mm
        c.drawString(20*mm, y, f"Standard: ISO 9001:2015 / ISO 14001:2015 Quality & Environmental")
        y -= 6*mm
        c.drawString(20*mm, y, f"Scope: Design, Manufacture, Testing & Supply of Industrial Equipment")
        y -= 6*mm
        c.drawString(20*mm, y, f"Certificate No: ISO-{folder_num:03d}-QMS-2024-9981")
        y -= 6*mm
        c.drawString(20*mm, y, f"Accreditation Body: NABCB (National Accreditation Board for Certification Bodies)")

    elif type_key == "bank_guarantee":
        c.drawString(20*mm, y, f"5. EARNEST MONEY DEPOSIT (EMD) / e-BANK GUARANTEE INSTRUMENT")
        y -= 8*mm
        c.setFont("Helvetica", 9)
        c.drawString(20*mm, y, f"Guarantor Bank: State Bank of India / Industrial Finance Branch")
        y -= 6*mm
        c.drawString(20*mm, y, f"Beneficiary: Government e Marketplace (GeM) Procurement Authority")
        y -= 6*mm
        c.drawString(20*mm, y, f"Applicant: {company}")
        y -= 6*mm
        c.drawString(20*mm, y, f"BG Amount: INR {(folder_num * 150000 + 2500000):,.2f}")
        y -= 6*mm
        c.drawString(20*mm, y, f"SFMS Confirmation: SFMS-ACK-SBI-{folder_num:03d}-2026 (Verified)")

    elif type_key == "balance_sheet":
        c.drawString(20*mm, y, f"6. AUDITED FINANCIAL BALANCE SHEET & NET WORTH STATEMENT")
        y -= 8*mm
        c.setFont("Helvetica", 9)
        c.drawString(20*mm, y, f"Company: {company}")
        y -= 6*mm
        c.drawString(20*mm, y, f"Reporting Period: Financial Year 2024-2025 (Audited)")
        y -= 6*mm
        turnover = 80.0 + (folder_num * 5.4) % 60
        networth = 25.0 + (folder_num * 2.1) % 30
        c.drawString(20*mm, y, f"Annual Turnover: Rs. {turnover:.2f} Crores")
        y -= 6*mm
        c.drawString(20*mm, y, f"Net Worth: Rs. {networth:.2f} Crores (Positive Net Worth Confirmed)")
        y -= 6*mm
        c.drawString(20*mm, y, f"Statutory Auditor: R.K. Singhania & Associates, Chartered Accountants")

    elif type_key == "ca_turnover":
        c.drawString(20*mm, y, f"7. CHARTERED ACCOUNTANT 3-YEAR ANNUAL TURNOVER CERTIFICATE")
        y -= 8*mm
        c.setFont("Helvetica", 9)
        c.drawString(20*mm, y, f"To Whom It May Concern — Client: {company}")
        y -= 6*mm
        t1 = 95.0 + (folder_num * 3) % 40
        t2 = 105.0 + (folder_num * 4) % 40
        t3 = 115.0 + (folder_num * 5) % 40
        avg = (t1 + t2 + t3) / 3
        c.drawString(20*mm, y, f"FY 2022-23: Rs. {t1:.2f} Cr  |  FY 2023-24: Rs. {t2:.2f} Cr  |  FY 2024-25: Rs. {t3:.2f} Cr")
        y -= 6*mm
        c.drawString(20*mm, y, f"Three-Year Average Turnover: Rs. {avg:.2f} Crores")
        y -= 6*mm
        udin = f"26{folder_num:03d}9123A{folder_num:02d}4918"
        c.drawString(20*mm, y, f"UDIN: {udin} (Verified on ICAI Official UDIN Portal)")

    elif type_key == "udyam_msme":
        c.drawString(20*mm, y, f"8. MINISTRY OF MICRO, SMALL & MEDIUM ENTERPRISES (UDYAM CERTIFICATE)")
        y -= 8*mm
        c.setFont("Helvetica", 9)
        c.drawString(20*mm, y, f"Enterprise Name: {company}")
        y -= 6*mm
        c.drawString(20*mm, y, f"Udyam Registration Number: {udyam}")
        y -= 6*mm
        c.drawString(20*mm, y, f"Enterprise Classification: MEDIUM ENTERPRISE (Manufacturing)")
        y -= 6*mm
        c.drawString(20*mm, y, f"Major Activity: Manufacture of Industrial Pumps, Valves & Power Systems")
        y -= 6*mm
        c.drawString(20*mm, y, f"MSME Exemption Status: Eligible for EMD & Tender Fee Waiver (Rule 153 GFR)")

    elif type_key == "experience_cert":
        c.drawString(20*mm, y, f"9. PAST PERFORMANCE & WORK ORDER COMPLETION CERTIFICATE")
        y -= 8*mm
        c.setFont("Helvetica", 9)
        c.drawString(20*mm, y, f"Contractor / Supplier: {company}")
        y -= 6*mm
        c.drawString(20*mm, y, f"Client Organization: National Thermal Power Corporation (NTPC) / PSU")
        y -= 6*mm
        c.drawString(20*mm, y, f"Work Order Ref: WO/NTPC/PUMP-ENG/{folder_num:03d}/2023-24")
        y -= 6*mm
        c.drawString(20*mm, y, f"Contract Value: INR {(folder_num * 8000000 + 45000000):,.2f}")
        y -= 6*mm
        c.drawString(20*mm, y, f"Performance Rating: SATISFACTORY & COMPLETED WITHIN STIPULATED TIMELINE")

    elif type_key == "technical_specs":
        c.drawString(20*mm, y, f"10. TECHNICAL SPECIFICATION COMPLIANCE MATRIX & DATASHEET")
        y -= 8*mm
        c.setFont("Helvetica", 9)
        c.drawString(20*mm, y, f"OEM / Manufacturer: {company}")
        y -= 6*mm
        c.drawString(20*mm, y, f"Equipment Model: Model Titan-X{folder_num:02d} High Pressure Centrifugal")
        y -= 6*mm
        c.drawString(20*mm, y, f"Operational Efficiency: 89.2% (Tender Threshold: >= 85.0%) -> PASS")
        y -= 6*mm
        c.drawString(20*mm, y, f"Operating Pressure: 12.5 Bar (Tender Threshold: >= 10.0 Bar) -> PASS")
        y -= 6*mm
        c.drawString(20*mm, y, f"Production Capacity: 950 units/day (Tender Threshold: >= 800 units/day) -> PASS")

    # Compliance Certification Stamp
    y -= 15*mm
    c.setStrokeColor(HexColor("#059669"))
    c.setLineWidth(1)
    c.setFillColor(HexColor("#F0FDF4"))
    c.roundRect(20*mm, y - 10*mm, w - 40*mm, 18*mm, 3*mm, fill=1, stroke=1)

    c.setFillColor(HexColor("#065F46"))
    c.setFont("Helvetica-Bold", 8.5)
    c.drawString(25*mm, y + 2*mm, "✓ GeM STATUTORY COMPLIANCE VALIDATION PASSED")
    c.setFont("Helvetica", 7.5)
    c.drawString(25*mm, y - 4*mm, f"Document evaluated against Rule 144/153 of General Financial Rules (GFR 2017).")
    c.drawString(25*mm, y - 8*mm, f"Verified Authorized Representative: {signatory} | Digital Signature Verified")

def main():
    print(f"Creating 100 distinct demo folders in: {BASE_DIR}")
    os.makedirs(BASE_DIR, exist_ok=True)

    # Clean previous 10 category directories if present
    for i in range(1, 11):
        old_cat = os.path.join(BASE_DIR, f"{i:02d}_*")
    
    # We will generate folders 001 to 100
    w, h = A4

    created_folders = []

    for folder_idx in range(1, 101):
        # Determine category (1-10) and vendor (1-10)
        type_idx = (folder_idx - 1) // 10  # 0 to 9
        vendor_idx = (folder_idx - 1) % 10 # 0 to 9

        type_key, type_title = TYPE_DEFS[type_idx]
        vendor = VENDORS[vendor_idx]
        company_slug = vendor[0].split()[0].lower()

        folder_name = f"folder_{folder_idx:03d}_{type_key}_{company_slug}"
        folder_path = os.path.join(BASE_DIR, folder_name)
        os.makedirs(folder_path, exist_ok=True)

        pdf_filename = f"{type_key}_{company_slug}_doc.pdf"
        pdf_path = os.path.join(folder_path, pdf_filename)

        # Temporary hash computation
        seed_str = f"{folder_idx}:{type_key}:{vendor[0]}:{vendor[1]}"
        doc_hash = hashlib.sha256(seed_str.encode()).hexdigest()

        # Generate PDF
        c = canvas.Canvas(pdf_path, pagesize=A4)
        c.setTitle(f"GeM Compliance - {type_title} - {vendor[0]}")
        c.setAuthor("Government e Marketplace AI Verification Engine")

        # Draw Header
        draw_gem_header(
            c,
            "GOVERNMENT e MARKETPLACE (GeM) — COMPLIANCE VERIFICATION DOSSIER",
            f"Official Statutory Review Document | Category {type_idx + 1:02d}: {type_title}",
            w,
            h - 22*mm
        )

        # Draw Content
        generate_pdf_content(c, type_key, vendor, folder_idx, folder_name, w, h)

        # Draw Blockchain Proof Footer
        draw_blockchain_footer(c, w, doc_hash, folder_name)

        c.save()

        # Real hash after PDF creation
        with open(pdf_path, "rb") as f:
            real_hash = hashlib.sha256(f.read()).hexdigest()

        # Write metadata.json in each folder for easy programmatic inspection
        meta = {
            "folder_number": folder_idx,
            "folder_name": folder_name,
            "document_type_index": type_idx + 1,
            "document_type": type_key,
            "document_title": type_title,
            "vendor_name": vendor[0],
            "pan": vendor[1],
            "gstin": vendor[2],
            "udyam_id": vendor[3],
            "signatory": vendor[4],
            "pdf_file": pdf_filename,
            "sha256_hash": real_hash,
            "compliance_status": "COMPLIANT",
            "blockchain_network": "GeM Private Ethereum / Proof-of-Authority",
            "contract_address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
            "verified_at": "2026-09-14T12:00:00Z"
        }
        with open(os.path.join(folder_path, "verification_metadata.json"), "w", encoding="utf-8") as mf:
            json.dump(meta, mf, indent=2)

        created_folders.append(folder_name)

    print(f"Successfully created all {len(created_folders)} demo folders in {BASE_DIR}!")

if __name__ == "__main__":
    main()
