#!/usr/bin/env python3
"""
Synthetic Specimen Document Generator for SIH26100 GeM Platform
Generates 8 realistic synthetic document types across 3-5 variants each.
Mandatory Safety Requirement:
Every page embeds prominent diagonal watermarks:
"SPECIMEN — FOR DEMONSTRATION PURPOSES ONLY — NOT A VALID GOVERNMENT DOCUMENT"
"""

import os
import pymupdf  # PyMuPDF
from typing import List, Dict

WATERMARK_TEXT = "SPECIMEN — FOR DEMONSTRATION PURPOSES ONLY — NOT A VALID GOVERNMENT DOCUMENT"

def add_watermark(page: pymupdf.Page):
    """Draw prominent diagonal specimen watermarks across the page."""
    rect = page.rect
    # Center diagonal watermark
    p1 = pymupdf.Point(40, rect.height - 80)
    p2 = pymupdf.Point(rect.width - 40, 80)
    
    # Secondary top and bottom specimen banners
    page.draw_rect(
        pymupdf.Rect(0, 0, rect.width, 22),
        color=(0.85, 0.2, 0.2),
        fill=(0.95, 0.85, 0.85)
    )
    page.insert_text(
        pymupdf.Point(20, 15),
        "*** DEMO SPECIMEN — NOT AN OFFICIAL GOVERNMENT DOCUMENT — FOR SIMULATION ONLY ***",
        fontsize=9,
        fontname="helv",
        fontfile=None,
        color=(0.8, 0.1, 0.1)
    )

    page.draw_rect(
        pymupdf.Rect(0, rect.height - 22, rect.width, rect.height),
        color=(0.85, 0.2, 0.2),
        fill=(0.95, 0.85, 0.85)
    )
    page.insert_text(
        pymupdf.Point(20, rect.height - 8),
        "*** DEMO SPECIMEN — NOT AN OFFICIAL GOVERNMENT DOCUMENT — FOR SIMULATION ONLY ***",
        fontsize=9,
        fontname="helv",
        fontfile=None,
        color=(0.8, 0.1, 0.1)
    )

    # Big diagonal text across the page body
    # Using morph matrix with -45 degree tilt
    diag_p1 = pymupdf.Point(40, rect.height / 2 + 100)
    mat1 = pymupdf.Matrix(-40)
    page.insert_text(
        diag_p1,
        WATERMARK_TEXT,
        fontsize=12,
        morph=(diag_p1, mat1),
        fontname="helv",
        color=(0.78, 0.2, 0.2)
    )

    diag_p2 = pymupdf.Point(60, rect.height / 2 - 40)
    mat2 = pymupdf.Matrix(-40)
    page.insert_text(
        diag_p2,
        "SPECIMEN SAMPLE ONLY — DO NOT DISTRIBUTE",
        fontsize=24,
        morph=(diag_p2, mat2),
        fontname="helv",
        color=(0.88, 0.7, 0.7)
    )

def create_aadhaar_specimen(output_path: str, name: str, uid: str, dob: str, address: str):
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842) # A4
    
    # Header
    page.draw_rect(pymupdf.Rect(40, 40, 555, 110), color=(0.2, 0.4, 0.7), fill=(0.93, 0.95, 0.99))
    page.insert_text(pymupdf.Point(60, 70), "UNIQUE IDENTIFICATION AUTHORITY OF INDIA (SPECIMEN)", fontsize=14, fontname="helv", color=(0.1, 0.2, 0.5))
    page.insert_text(pymupdf.Point(60, 95), "Government of India — Demonstration Identity Verification Card", fontsize=10, fontname="helv", color=(0.3, 0.3, 0.3))
    
    # Body Frame
    page.draw_rect(pymupdf.Rect(40, 130, 555, 340), color=(0.7, 0.7, 0.7), width=1)
    
    # Photo box placeholder
    page.draw_rect(pymupdf.Rect(60, 150, 160, 270), color=(0.6, 0.6, 0.6), fill=(0.9, 0.9, 0.9))
    page.insert_text(pymupdf.Point(75, 210), "[SPECIMEN AVATAR]", fontsize=10, fontname="helv", color=(0.4, 0.4, 0.4))
    
    # Details
    page.insert_text(pymupdf.Point(180, 170), f"Name: {name}", fontsize=13, fontname="helv", color=(0, 0, 0))
    page.insert_text(pymupdf.Point(180, 195), f"DOB: {dob} | Gender: Male / Female", fontsize=11, fontname="helv", color=(0.2, 0.2, 0.2))
    page.insert_text(pymupdf.Point(180, 220), f"Specimen UID: {uid}", fontsize=15, fontname="helv", color=(0.1, 0.1, 0.7))
    page.insert_text(pymupdf.Point(180, 245), "Address (Registered):", fontsize=10, fontname="helv", color=(0.3, 0.3, 0.3))
    page.insert_text(pymupdf.Point(180, 265), address[:50], fontsize=10, fontname="helv", color=(0.1, 0.1, 0.1))
    if len(address) > 50:
        page.insert_text(pymupdf.Point(180, 280), address[50:], fontsize=10, fontname="helv", color=(0.1, 0.1, 0.1))
        
    page.insert_text(pymupdf.Point(60, 315), "Enrolment ID: 2026/00000/99999 | Helpdesk: demo-support@gembid.local", fontsize=9, fontname="helv", color=(0.4, 0.4, 0.4))

    add_watermark(page)
    doc.save(output_path)
    doc.close()

def create_pan_specimen(output_path: str, entity_name: str, pan: str, inc_date: str):
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842)
    
    # PAN Card container
    page.draw_rect(pymupdf.Rect(50, 60, 545, 360), color=(0.1, 0.3, 0.5), fill=(0.95, 0.98, 1.0), width=2)
    page.insert_text(pymupdf.Point(70, 95), "INCOME TAX DEPARTMENT - GOVT. OF INDIA (SPECIMEN)", fontsize=13, fontname="helv", color=(0.1, 0.2, 0.6))
    page.insert_text(pymupdf.Point(70, 115), "PERMANENT ACCOUNT NUMBER CARD", fontsize=11, fontname="helv", color=(0.3, 0.3, 0.3))
    
    # Details
    page.insert_text(pymupdf.Point(70, 165), "Permanent Account Number (PAN):", fontsize=10, fontname="helv", color=(0.4, 0.4, 0.4))
    page.insert_text(pymupdf.Point(70, 195), pan, fontsize=20, fontname="helv", color=(0.1, 0.1, 0.6))
    
    page.insert_text(pymupdf.Point(70, 235), "Name of Entity / Cardholder:", fontsize=10, fontname="helv", color=(0.4, 0.4, 0.4))
    page.insert_text(pymupdf.Point(70, 255), entity_name, fontsize=13, fontname="helv", color=(0, 0, 0))
    
    page.insert_text(pymupdf.Point(70, 295), f"Date of Incorporation / Issue: {inc_date}", fontsize=10, fontname="helv", color=(0.2, 0.2, 0.2))
    page.insert_text(pymupdf.Point(70, 325), "Category: COMPANY / CORPORATE ENTITY (DEMO)", fontsize=9, fontname="helv", color=(0.3, 0.3, 0.3))

    add_watermark(page)
    doc.save(output_path)
    doc.close()

def create_gst_specimen(output_path: str, legal_name: str, gstin: str, state: str, reg_date: str, status: str = "Active"):
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842)
    
    page.draw_rect(pymupdf.Rect(40, 40, 555, 120), color=(0.2, 0.5, 0.3), fill=(0.94, 0.98, 0.94))
    page.insert_text(pymupdf.Point(60, 70), "GOVERNMENT OF INDIA - GOODS AND SERVICES TAX", fontsize=14, fontname="helv", color=(0.1, 0.4, 0.2))
    page.insert_text(pymupdf.Point(60, 92), "FORM GST REG-06 [Registration Certificate - Specimen]", fontsize=11, fontname="helv", color=(0.2, 0.2, 0.2))
    page.insert_text(pymupdf.Point(60, 112), f"Jurisdiction: State of {state} | Status: {status}", fontsize=10, fontname="helv", color=(0.3, 0.3, 0.3))

    # Certificate Details
    page.insert_text(pymupdf.Point(60, 160), f"Registration Number (GSTIN): {gstin}", fontsize=14, fontname="helv", color=(0.1, 0.1, 0.7))
    page.insert_text(pymupdf.Point(60, 190), f"Legal Name of Business: {legal_name}", fontsize=12, fontname="helv", color=(0, 0, 0))
    page.insert_text(pymupdf.Point(60, 215), f"Trade Name: {legal_name}", fontsize=11, fontname="helv", color=(0.2, 0.2, 0.2))
    page.insert_text(pymupdf.Point(60, 240), f"Constitution of Business: Private Limited Company", fontsize=10, fontname="helv", color=(0.2, 0.2, 0.2))
    page.insert_text(pymupdf.Point(60, 265), f"Date of Liability / Registration: {reg_date}", fontsize=10, fontname="helv", color=(0.2, 0.2, 0.2))
    page.insert_text(pymupdf.Point(60, 290), f"Period of Validity: From {reg_date} to Perpetual", fontsize=10, fontname="helv", color=(0.2, 0.2, 0.2))
    page.insert_text(pymupdf.Point(60, 315), f"Type of Registration: Regular Taxpayer", fontsize=10, fontname="helv", color=(0.2, 0.2, 0.2))

    add_watermark(page)
    doc.save(output_path)
    doc.close()

def create_udyam_specimen(output_path: str, enterprise_name: str, udyam_no: str, category: str):
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842)
    
    page.draw_rect(pymupdf.Rect(40, 40, 555, 110), color=(0.6, 0.3, 0.1), fill=(0.99, 0.96, 0.93))
    page.insert_text(pymupdf.Point(60, 70), "MINISTRY OF MICRO, SMALL & MEDIUM ENTERPRISES", fontsize=13, fontname="helv", color=(0.5, 0.2, 0.1))
    page.insert_text(pymupdf.Point(60, 95), "UDYAM REGISTRATION CERTIFICATE (SPECIMEN)", fontsize=12, fontname="helv", color=(0.2, 0.2, 0.2))

    page.insert_text(pymupdf.Point(60, 160), f"UDYAM REGISTRATION NUMBER: {udyam_no}", fontsize=13, fontname="helv", color=(0.1, 0.2, 0.6))
    page.insert_text(pymupdf.Point(60, 190), f"NAME OF ENTERPRISE: {enterprise_name}", fontsize=12, fontname="helv", color=(0, 0, 0))
    page.insert_text(pymupdf.Point(60, 215), f"TYPE OF ENTERPRISE: {category}", fontsize=11, fontname="helv", color=(0.2, 0.4, 0.2))
    page.insert_text(pymupdf.Point(60, 240), "MAJOR ACTIVITY: MANUFACTURING", fontsize=10, fontname="helv", color=(0.2, 0.2, 0.2))
    page.insert_text(pymupdf.Point(60, 265), "SOCIAL CATEGORY: GENERAL", fontsize=10, fontname="helv", color=(0.2, 0.2, 0.2))
    page.insert_text(pymupdf.Point(60, 290), "DATE OF INCORPORATION / REGISTRATION: 15/04/2018", fontsize=10, fontname="helv", color=(0.2, 0.2, 0.2))

    add_watermark(page)
    doc.save(output_path)
    doc.close()

def create_iso_specimen(output_path: str, org_name: str, scope: str, issue_date: str, expiry_date: str):
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842)
    
    page.draw_rect(pymupdf.Rect(40, 40, 555, 110), color=(0.1, 0.2, 0.5), fill=(0.94, 0.96, 1.0))
    page.insert_text(pymupdf.Point(60, 70), "INTERNATIONAL ACCREDITATION SERVICES (SPECIMEN)", fontsize=13, fontname="helv", color=(0.1, 0.2, 0.6))
    page.insert_text(pymupdf.Point(60, 95), "QUALITY MANAGEMENT SYSTEM CERTIFICATE — ISO 9001:2015", fontsize=11, fontname="helv", color=(0.2, 0.2, 0.2))

    page.insert_text(pymupdf.Point(60, 160), "This is to certify that the Quality Management System of:", fontsize=10, fontname="helv", color=(0.3, 0.3, 0.3))
    page.insert_text(pymupdf.Point(60, 185), org_name, fontsize=14, fontname="helv", color=(0, 0, 0))
    page.insert_text(pymupdf.Point(60, 215), "Has been assessed and found to comply with the requirements of ISO 9001:2015 for:", fontsize=10, fontname="helv", color=(0.2, 0.2, 0.2))
    page.insert_text(pymupdf.Point(60, 235), scope, fontsize=11, fontname="helv", color=(0.1, 0.3, 0.5))
    page.insert_text(pymupdf.Point(60, 275), f"Certificate Issue Date: {issue_date}", fontsize=10, fontname="helv", color=(0.2, 0.2, 0.2))
    page.insert_text(pymupdf.Point(60, 295), f"Certificate Expiry Date: {expiry_date}", fontsize=10, fontname="helv", color=(0.7, 0.1, 0.1) if "2023" in expiry_date else (0.1, 0.5, 0.1))

    add_watermark(page)
    doc.save(output_path)
    doc.close()

def create_ca_turnover_specimen(output_path: str, entity_name: str, fy_turnovers: Dict[str, str], avg_turnover: str, udin: str):
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842)
    
    page.draw_rect(pymupdf.Rect(40, 40, 555, 110), color=(0.4, 0.4, 0.4), fill=(0.97, 0.97, 0.97))
    page.insert_text(pymupdf.Point(60, 70), "CHARTERED ACCOUNTANTS STATUTORY CERTIFICATE (SPECIMEN)", fontsize=13, fontname="helv", color=(0.2, 0.2, 0.2))
    page.insert_text(pymupdf.Point(60, 95), "TURNOVER & FINANCIAL SOUNDNESS COMPLIANCE CERTIFICATE", fontsize=11, fontname="helv", color=(0.3, 0.3, 0.3))

    page.insert_text(pymupdf.Point(60, 160), f"Certified in respect of: {entity_name}", fontsize=12, fontname="helv", color=(0, 0, 0))
    page.insert_text(pymupdf.Point(60, 185), "We have examined the audited financial statements and confirm annual turnovers as under:", fontsize=10, fontname="helv", color=(0.2, 0.2, 0.2))

    y = 220
    for fy, val in fy_turnovers.items():
        page.insert_text(pymupdf.Point(80, y), f"Financial Year {fy}: Turnover of {val}", fontsize=11, fontname="helv", color=(0.1, 0.1, 0.6))
        y += 25

    page.insert_text(pymupdf.Point(60, y + 10), f"Three-Year Average Annual Turnover: {avg_turnover}", fontsize=12, fontname="helv", color=(0, 0.5, 0.2))
    page.insert_text(pymupdf.Point(60, y + 40), f"ICAI Unique Document Identification Number (UDIN): {udin}", fontsize=10, fontname="helv", color=(0.3, 0.3, 0.3))

    add_watermark(page)
    doc.save(output_path)
    doc.close()

def create_balance_sheet_specimen(output_path: str, entity_name: str, fy_turnovers: Dict[str, str], net_worth: str, net_profit: str):
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842)
    
    page.draw_rect(pymupdf.Rect(40, 40, 555, 110), color=(0.2, 0.3, 0.4), fill=(0.95, 0.96, 0.98))
    page.insert_text(pymupdf.Point(60, 70), "AUDITED FINANCIAL STATEMENTS — SCHEDULE III (SPECIMEN)", fontsize=13, fontname="helv", color=(0.1, 0.2, 0.4))
    page.insert_text(pymupdf.Point(60, 95), "Balance Sheet & Profit & Loss Statement as per Companies Act 2013", fontsize=10, fontname="helv", color=(0.3, 0.3, 0.3))

    page.insert_text(pymupdf.Point(60, 160), f"Entity Legal Name: {entity_name}", fontsize=12, fontname="helv", color=(0, 0, 0))
    page.insert_text(pymupdf.Point(60, 185), "Summary of Audited Financials (INR Crores):", fontsize=10, fontname="helv", color=(0.2, 0.2, 0.2))

    y = 220
    for fy, val in fy_turnovers.items():
        page.insert_text(pymupdf.Point(80, y), f"Revenue from Operations ({fy}): {val}", fontsize=10, fontname="helv", color=(0.1, 0.1, 0.6))
        y += 22

    page.insert_text(pymupdf.Point(80, y + 10), f"Net Worth as on March 31, 2024: {net_worth}", fontsize=11, fontname="helv", color=(0.7, 0.1, 0.1) if "-" in net_worth else (0.1, 0.5, 0.2))
    page.insert_text(pymupdf.Point(80, y + 30), f"Profit After Tax (PAT) FY 2023-24: {net_profit}", fontsize=10, fontname="helv", color=(0.2, 0.2, 0.2))

    add_watermark(page)
    doc.save(output_path)
    doc.close()

def create_bank_guarantee_specimen(output_path: str, issuing_bank: str, beneficiary: str, amount: str, expiry_date: str):
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842)
    
    page.draw_rect(pymupdf.Rect(40, 40, 555, 110), color=(0.1, 0.4, 0.6), fill=(0.94, 0.98, 1.0))
    page.insert_text(pymupdf.Point(60, 70), f"BANK GUARANTEE / EARNEST MONEY DEPOSIT (SPECIMEN)", fontsize=13, fontname="helv", color=(0.1, 0.3, 0.5))
    page.insert_text(pymupdf.Point(60, 95), f"ISSUING INSTITUTION: {issuing_bank.upper()}", fontsize=11, fontname="helv", color=(0.2, 0.2, 0.2))

    page.insert_text(pymupdf.Point(60, 160), f"Beneficiary: {beneficiary}", fontsize=11, fontname="helv", color=(0, 0, 0))
    page.insert_text(pymupdf.Point(60, 185), f"Guarantee Instrument Reference: BG-SPECIMEN-2026-9912", fontsize=10, fontname="helv", color=(0.3, 0.3, 0.3))
    page.insert_text(pymupdf.Point(60, 215), f"Guarantee Amount: {amount} (Rupees Only)", fontsize=13, fontname="helv", color=(0.1, 0.5, 0.2))
    page.insert_text(pymupdf.Point(60, 245), f"Validity Expiry Date: {expiry_date}", fontsize=11, fontname="helv", color=(0.7, 0.1, 0.1) if "2026" in expiry_date and "10" in expiry_date else (0.2, 0.2, 0.2))
    page.insert_text(pymupdf.Point(60, 275), "Claim Lodgement Period: Minimum 30 days beyond expiry date.", fontsize=10, fontname="helv", color=(0.3, 0.3, 0.3))

    add_watermark(page)
    doc.save(output_path)
    doc.close()


def generate_all_datasets(dest_dirs: List[str]):
    for d in dest_dirs:
        os.makedirs(d, exist_ok=True)
    
    # Define files to generate
    specimens = [
        # 1. Aadhaar
        ("aadhaar_aarav_sharma_valid.pdf", lambda p: create_aadhaar_specimen(p, "Aarav Sharma - Specimen", "9999-0000-1111", "14/08/1985", "Plot 101, Industrial Model Township, Manesar, Haryana - 122051")),
        ("aadhaar_rohit_verma_valid.pdf", lambda p: create_aadhaar_specimen(p, "Rohit Verma - Specimen", "9999-0000-2222", "22/11/1990", "Flat 4B, Sector 62, Noida, Uttar Pradesh - 201301")),
        ("aadhaar_priya_patel_valid.pdf", lambda p: create_aadhaar_specimen(p, "Priya Patel - Specimen", "9999-0000-3333", "05/03/1988", "Plot 12, GIDC Electronic Estate, Gandhinagar, Gujarat - 382028")),

        # 2. PAN
        ("pan_apex_pumps_valid.pdf", lambda p: create_pan_specimen(p, "APEX PUMPS AND MOTORS PRIVATE LIMITED", "ABCDE1234F", "12/04/2014")),
        ("pan_bharat_valves_valid.pdf", lambda p: create_pan_specimen(p, "BHARAT HEAVY VALVES LIMITED", "BCDEF2345G", "18/09/2010")),
        ("pan_mismatch_flagged.pdf", lambda p: create_pan_specimen(p, "GLOBAL FLOW ENTERPRISES", "CDEFG3456H", "02/02/2021")),

        # 3. GST REG-06
        ("gst_reg06_apex_pumps_valid.pdf", lambda p: create_gst_specimen(p, "Apex Pumps & Motors Pvt Ltd", "27AABCA1234F1Z5", "Maharashtra", "01/07/2017", "Active")),
        ("gst_reg06_bharat_valves_valid.pdf", lambda p: create_gst_specimen(p, "Bharat Heavy Valves Ltd", "07AAACB2345G1Z8", "Delhi", "01/07/2017", "Active")),
        ("gst_reg06_cancelled_flagged.pdf", lambda p: create_gst_specimen(p, "Precision Hydrotech LLC", "27DDDDD0000D1Z1", "Maharashtra", "15/03/2019", "CANCELLED SUO-MOTO")),

        # 4. Udyam
        ("udyam_apex_pumps_small.pdf", lambda p: create_udyam_specimen(p, "Apex Pumps & Motors Pvt Ltd", "UDYAM-MH-01-0012345", "Small Enterprise")),
        ("udyam_bharat_valves_medium.pdf", lambda p: create_udyam_specimen(p, "Bharat Heavy Valves Ltd", "UDYAM-DL-02-0054321", "Medium Enterprise")),
        ("udyam_lapsed_validity.pdf", lambda p: create_udyam_specimen(p, "Hydra Flow Systems", "UDYAM-KA-03-0099999", "Provisional Expired")),

        # 5. ISO 9001
        ("iso9001_apex_valid.pdf", lambda p: create_iso_specimen(p, "Apex Pumps & Motors Pvt Ltd", "Design, Manufacture and Supply of Industrial Centrifugal and Submersible Pumps", "15/01/2024", "14/01/2027")),
        ("iso9001_bharat_valid.pdf", lambda p: create_iso_specimen(p, "Bharat Heavy Valves Ltd", "Design and Manufacture of High-Pressure Industrial Valves", "10/06/2023", "09/06/2026")),
        ("iso9001_expired_flagged.pdf", lambda p: create_iso_specimen(p, "Apex Pumps & Motors Pvt Ltd", "Supply of Mechanical Pumps", "15/01/2020", "14/01/2023")),

        # 6. CA Turnover
        ("ca_turnover_apex_compliant.pdf", lambda p: create_ca_turnover_specimen(p, "Apex Pumps & Motors Pvt Ltd", {"2021-22": "INR 14.50 Crores", "2022-23": "INR 18.20 Crores", "2023-24": "INR 22.80 Crores"}, "INR 18.50 Crores", "24058921AAAAAA1234")),
        ("ca_turnover_apex_contradictory.pdf", lambda p: create_ca_turnover_specimen(p, "Apex Pumps & Motors Pvt Ltd", {"2021-22": "INR 14.50 Crores", "2022-23": "INR 18.20 Crores", "2023-24": "INR 35.00 Crores"}, "INR 22.56 Crores", "24058921BBBBBB5678")),
        ("ca_turnover_bharat_compliant.pdf", lambda p: create_ca_turnover_specimen(p, "Bharat Heavy Valves Ltd", {"2021-22": "INR 42.00 Crores", "2022-23": "INR 48.50 Crores", "2023-24": "INR 55.20 Crores"}, "INR 48.57 Crores", "24012345CCCCCC9876")),

        # 7. Balance Sheet
        ("balance_sheet_apex_audited.pdf", lambda p: create_balance_sheet_specimen(p, "Apex Pumps & Motors Pvt Ltd", {"2021-22": "14.50", "2022-23": "18.20", "2023-24": "22.80"}, "INR 12.40 Crores", "INR 2.10 Crores")),
        ("balance_sheet_bharat_audited.pdf", lambda p: create_balance_sheet_specimen(p, "Bharat Heavy Valves Ltd", {"2021-22": "42.00", "2022-23": "48.50", "2023-24": "55.20"}, "INR 31.20 Crores", "INR 5.80 Crores")),
        ("balance_sheet_negative_worth_flagged.pdf", lambda p: create_balance_sheet_specimen(p, "Delta Submersibles Ltd", {"2021-22": "8.10", "2022-23": "8.20", "2023-24": "8.20"}, "-INR 1.50 Crores", "-INR 0.80 Crores")),

        # 8. Bank Guarantee
        ("bank_guarantee_apex_valid.pdf", lambda p: create_bank_guarantee_specimen(p, "State Bank of India", "Government e-Marketplace / Procuring Dept", "INR 15,00,000", "31/12/2026")),
        ("bank_guarantee_bharat_valid.pdf", lambda p: create_bank_guarantee_specimen(p, "Punjab National Bank", "Government e-Marketplace", "INR 25,00,000", "31/03/2027")),
        ("bank_guarantee_short_validity_flagged.pdf", lambda p: create_bank_guarantee_specimen(p, "HDFC Bank", "Government e-Marketplace", "INR 10,00,000", "15/10/2026")),
    ]

    for fname, generator in specimens:
        for d in dest_dirs:
            target = os.path.join(d, fname)
            generator(target)
            print(f"Generated specimen: {target}")

if __name__ == "__main__":
    primary_dir = os.path.abspath("demo_docs")
    ai_service_dir = os.path.abspath("ai-service/demo_docs")
    generate_all_datasets([primary_dir, ai_service_dir])
    print(f"Successfully generated 24 synthetic specimen documents in {primary_dir} and {ai_service_dir}")
