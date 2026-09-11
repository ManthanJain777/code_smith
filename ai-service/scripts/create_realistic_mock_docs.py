"""
create_realistic_mock_docs.py
Generates ultra-realistic, high-fidelity government and vendor procurement PDF documents.
Features:
- Official Government GeM Tender Notice with emblem banner, specification tables, round seal
- Apex Pumps Centrifugal Pump Technical Datasheet with blue headers, specification tables, QA stamp
- Official Chartered Accountant Turnover Certificate with ICAI-style letterhead, UDIN, and blue ink stamp
- Audited Balance Sheet (FY25 Schedule III) with official financial tables and signatures
- ISO 9001:2015 Certificate of Registration with double gold border, IAF seal mark
- Official GST Registration Certificate (Form GST REG-06)
"""

import os
import pymupdf

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "demo_docs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Common Colors
NAVY = (0.08, 0.18, 0.36)
DARK_BLUE = (0.12, 0.25, 0.45)
GOLD = (0.78, 0.58, 0.12)
LIGHT_BLUE = (0.92, 0.95, 0.98)
SLATE = (0.3, 0.35, 0.4)
DARK_GRAY = (0.15, 0.15, 0.15)
LIGHT_GRAY = (0.95, 0.95, 0.95)
WHITE = (1, 1, 1)
EMERALD = (0.06, 0.45, 0.27)
MAROON = (0.5, 0.1, 0.1)


def draw_table(page, x, y, col_widths, row_height, headers, rows, header_bg=NAVY, header_fg=WHITE):
    total_w = sum(col_widths)
    # Header row
    page.draw_rect(pymupdf.Rect(x, y, x + total_w, y + row_height), color=header_bg, fill=header_bg)
    cur_x = x
    for i, h in enumerate(headers):
        w = col_widths[i]
        page.insert_textbox(
            pymupdf.Rect(cur_x + 4, y + 3, cur_x + w - 4, y + row_height - 2),
            h, fontsize=8, fontname="hebi", color=header_fg, align=pymupdf.TEXT_ALIGN_LEFT
        )
        cur_x += w
    cur_y = y + row_height

    # Data rows
    for r_idx, row in enumerate(rows):
        bg = LIGHT_GRAY if r_idx % 2 == 0 else WHITE
        page.draw_rect(pymupdf.Rect(x, cur_y, x + total_w, cur_y + row_height), color=(0.85, 0.85, 0.85), fill=bg, width=0.5)
        cur_x = x
        for c_idx, cell in enumerate(row):
            w = col_widths[c_idx]
            font = "hebi" if c_idx == 0 or (r_idx == len(rows)-1 and "Total" in row[0]) else "helv"
            page.insert_textbox(
                pymupdf.Rect(cur_x + 4, cur_y + 3, cur_x + w - 4, cur_y + row_height - 2),
                str(cell), fontsize=7.5, fontname=font, color=DARK_GRAY, align=pymupdf.TEXT_ALIGN_LEFT
            )
            # Vertical line
            if c_idx > 0:
                page.draw_line(pymupdf.Point(cur_x, cur_y), pymupdf.Point(cur_x, cur_y + row_height), color=(0.85, 0.85, 0.85), width=0.5)
            cur_x += w
        cur_y += row_height

    return cur_y


def draw_official_stamp(page, center_x, center_y, org_name="GOVERNMENT OF INDIA", inner_text="APPROVED / VERIFIED", color=NAVY):
    # Outer circle
    page.draw_circle(pymupdf.Point(center_x, center_y), 32, color=color, width=1.5)
    page.draw_circle(pymupdf.Point(center_x, center_y), 30, color=color, width=0.5)
    page.draw_circle(pymupdf.Point(center_x, center_y), 22, color=color, width=0.7)
    # Text in stamp
    page.insert_textbox(
        pymupdf.Rect(center_x - 30, center_y - 12, center_x + 30, center_y + 12),
        f"{inner_text}\n* GeM PORTAL *", fontsize=6, fontname="hebi", color=color, align=pymupdf.TEXT_ALIGN_CENTER
    )


# ─────────────────────────────────────────────────────────────────────────────
# 1. TENDER NOTICE
# ─────────────────────────────────────────────────────────────────────────────
def create_tender_notice():
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842) # A4

    # Top Header Tricolor Accent Bar
    page.draw_rect(pymupdf.Rect(0, 0, 595, 6), color=(0.95, 0.45, 0.1), fill=(0.95, 0.45, 0.1)) # Saffron
    page.draw_rect(pymupdf.Rect(0, 6, 595, 9), color=WHITE, fill=WHITE)
    page.draw_rect(pymupdf.Rect(0, 9, 595, 15), color=EMERALD, fill=EMERALD) # Green

    # Government Header Block
    page.draw_rect(pymupdf.Rect(20, 25, 575, 80), color=NAVY, fill=NAVY)
    page.insert_textbox(
        pymupdf.Rect(35, 30, 480, 50),
        "GOVERNMENT OF INDIA | MINISTRY OF JAL SHAKTI",
        fontsize=11, fontname="hebi", color=WHITE
    )
    page.insert_textbox(
        pymupdf.Rect(35, 46, 480, 70),
        "CENTRAL WATER COMMISSION (CWC) | NEW DELHI",
        fontsize=9, fontname="hebi", color=(0.8, 0.9, 1.0)
    )
    page.insert_textbox(
        pymupdf.Rect(35, 64, 480, 98),
        "NOTICE INVITING TENDER (NIT) — GeM CUSTOM BID GEM/2026/B/90124",
        fontsize=12, fontname="hebi", color=(1.0, 0.85, 0.3)
    )

    # QR Graphic Placeholder at right of banner
    page.draw_rect(pymupdf.Rect(515, 35, 560, 80), color=WHITE, fill=WHITE)
    for qx in range(520, 555, 6):
        for qy in range(40, 75, 6):
            if (qx + qy) % 12 == 0 or (qx * qy) % 15 == 0:
                page.draw_rect(pymupdf.Rect(qx, qy, qx+4, qy+4), color=NAVY, fill=NAVY)

    # Tender Key Information Card
    page.draw_rect(pymupdf.Rect(20, 115, 575, 185), color=(0.8, 0.85, 0.9), fill=LIGHT_BLUE, width=1)
    
    info_pairs = [
        ("Tender Reference No:", "GEM/2026/B/90124 (TND-PUMP-001)", "Estimated Contract Value:", "INR 5,00,00,000 (5.00 Crore)"),
        ("Date of Publication:", "10-September-2026 (09:00 IST)", "Bid Submission Closing Date:", "25-September-2026 (17:00 IST)"),
        ("Procuring Division:", "CWC Regional Directorate - North", "Earnest Money Deposit (EMD):", "INR 10,00,000 (MSME Exempted)"),
        ("Procurement Title:", "Supply, Testing, Installation of Centrifugal Industrial Water Pumps (ISO 9906)", "", "")
    ]
    cur_y = 122
    for p in info_pairs:
        page.insert_textbox(pymupdf.Rect(30, cur_y, 160, cur_y+14), p[0], fontsize=7.5, fontname="hebi", color=SLATE)
        page.insert_textbox(pymupdf.Rect(165, cur_y, 310, cur_y+14), p[1], fontsize=7.5, fontname="hebi", color=DARK_GRAY)
        if p[2]:
            page.insert_textbox(pymupdf.Rect(320, cur_y, 450, cur_y+14), p[2], fontsize=7.5, fontname="hebi", color=SLATE)
            page.insert_textbox(pymupdf.Rect(455, cur_y, 570, cur_y+14), p[3], fontsize=7.5, fontname="hebi", color=DARK_GRAY)
        cur_y += 15

    # Section 1: Scope & Eligibility
    page.insert_textbox(
        pymupdf.Rect(20, 195, 575, 215),
        "SECTION I: SCOPE OF PROCUREMENT & MANDATORY QUALIFICATION CRITERIA",
        fontsize=9, fontname="hebi", color=NAVY
    )
    page.draw_line(pymupdf.Point(20, 212), pymupdf.Point(575, 212), color=NAVY, width=1)

    # Table of Requirements
    headers = ["Req Code", "Category", "Threshold / Criteria", "Standard / Evidence Required", "Mandatory"]
    col_w = [75, 75, 175, 175, 55]
    rows = [
        ["REQ-001", "Financial", "Annual Turnover >= INR 100 Crore in last 3 FYs", "Audited Balance Sheets (FY23, FY24, FY25) & CA Cert", "MANDATORY"],
        ["REQ-002", "Eligibility", "Valid GST & Permanent Account Number (PAN)", "Active GSTIN Registration Certificate & PAN Card", "MANDATORY"],
        ["REQ-003", "Technical", "Pump Hydraulic Efficiency >= 85% at BEP", "OEM Technical Datasheet / NABL Test Certificate", "MANDATORY"],
        ["REQ-004", "Technical", "Discharge >= 500 LPM at 40 meters head", "Pump Performance Curve (ISO 9906 Grade 2B)", "MANDATORY"],
        ["REQ-005", "Experience", "Minimum 5 years OEM experience with PSU orders", "Copies of 3+ Government Purchase Orders & Invoices", "MANDATORY"],
        ["REQ-006", "Quality", "Valid ISO 9001:2015 Quality Management System", "Accredited ISO Certificate active as on bid date", "MANDATORY"],
        ["REQ-007", "Legal", "No Debarment or Blacklisting by GeM / MoF", "Self-declaration + verified against DoE Portal", "MANDATORY"],
    ]
    cur_y = draw_table(page, 20, 220, col_w, 20, headers, rows, header_bg=NAVY)

    # Special Condition on Contradiction & Truthfulness
    cur_y += 15
    page.draw_rect(pymupdf.Rect(20, cur_y, 575, cur_y + 45), color=(0.85, 0.65, 0.2), fill=(1.0, 0.98, 0.92), width=1)
    page.insert_textbox(
        pymupdf.Rect(30, cur_y + 5, 565, cur_y + 40),
        "CRITICAL COMPLIANCE NOTICE TO BIDDERS:\n"
        "1. All numerical figures in CA Certificates will be verified against Audited Financial Statements. Discrepancies > 2% will lead to rejection.\n"
        "2. Evaluation is strictly evidence-based. Unsubstantiated claims will be classified as UNVERIFIED.",
        fontsize=7, fontname="hebi", color=MAROON
    )

    # Signature Block & Seal
    cur_y += 60
    page.insert_textbox(pymupdf.Rect(30, cur_y, 250, cur_y + 40), "Issued under authority of:\nMinistry of Jal Shakti, Government of India\nDigital GeM Integration Reference: CWC-2026-NIT-90124", fontsize=7, fontname="helv", color=SLATE)
    
    page.insert_textbox(pymupdf.Rect(380, cur_y, 570, cur_y + 40), "For and on behalf of Central Water Commission,\n\nSd/-\n(Rajeev Sharma, IRSE)\nChief Procurement Officer", fontsize=7.5, fontname="hebi", color=NAVY, align=pymupdf.TEXT_ALIGN_RIGHT)
    draw_official_stamp(page, 340, cur_y + 20, "CENTRAL WATER COMMISSION", "OFFICIAL SEAL", NAVY)

    # Bottom Footer
    page.draw_line(pymupdf.Point(20, 810), pymupdf.Point(575, 810), color=SLATE, width=0.5)
    page.insert_textbox(pymupdf.Rect(20, 815, 300, 830), "GeM Bid Document ID: TND-PUMP-001 | Page 1 of 1", fontsize=7, fontname="helv", color=SLATE)
    page.insert_textbox(pymupdf.Rect(350, 815, 575, 830), "Digitally Signed via NIC National CA Token | Verified", fontsize=7, fontname="hebi", color=EMERALD, align=pymupdf.TEXT_ALIGN_RIGHT)

    pdf_path = os.path.join(OUTPUT_DIR, "TND-PUMP-001_Tender_Notice.pdf")
    doc.save(pdf_path)
    doc.close()
    print(f"Created: {pdf_path}")


# ─────────────────────────────────────────────────────────────────────────────
# 2. APEX PUMPS TECHNICAL DATASHEET
# ─────────────────────────────────────────────────────────────────────────────
def create_technical_datasheet():
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842)

    # Corporate Header Banner
    page.draw_rect(pymupdf.Rect(20, 20, 575, 75), color=NAVY, fill=NAVY)
    page.draw_rect(pymupdf.Rect(20, 95, 575, 98), color=GOLD, fill=GOLD)
    page.insert_textbox(
        pymupdf.Rect(35, 28, 450, 50),
        "APEX PUMPS & MOTORS PRIVATE LIMITED",
        fontsize=14, fontname="hebi", color=WHITE
    )
    page.insert_textbox(
        pymupdf.Rect(35, 50, 500, 68),
        "An ISO 9001:2015 & ISO 14001 Certified OEM | BIS License No: BIS-LIC-54321",
        fontsize=8, fontname="helv", color=(0.85, 0.9, 1.0)
    )
    page.insert_textbox(
        pymupdf.Rect(35, 66, 500, 88),
        "Plant: Plot 42-44, Okhla Industrial Area Phase-III, New Delhi - 110020 | Web: www.apexpumps.com",
        fontsize=7, fontname="helv", color=(0.7, 0.8, 0.9)
    )

    # Datasheet Title
    page.insert_textbox(
        pymupdf.Rect(20, 110, 575, 130),
        "TECHNICAL SPECIFICATION & PRODUCT PERFORMANCE DATASHEET",
        fontsize=11, fontname="hebi", color=NAVY
    )
    page.insert_textbox(
        pymupdf.Rect(20, 126, 575, 142),
        "Model Series: ACP-400-H Heavy-Duty Industrial End-Suction Centrifugal Pump",
        fontsize=8.5, fontname="hebi", color=SLATE
    )

    # Specifications Table
    headers = ["Parameter / Specification", "Engineering Standard", "Tender Requirement", "Apex Offered Value", "Compliance"]
    col_w = [140, 100, 130, 135, 50]
    rows = [
        ["Operating Duty Point (Flow)", "ISO 9906:2012 Grade 2B", "Minimum 500 LPM at 40m", "520.0 LPM @ 40m Head", "COMPLIANT"],
        ["Hydraulic Efficiency at BEP", "ISO 9906 Class 1 Test", "Minimum 85.0%", "88.4% Efficiency", "COMPLIANT"],
        ["Electric Motor Rating", "IS 12615:2018 (IE3)", "7.5 HP (5.5 kW) 415V", "7.5 HP (5.5 kW) 415V 50Hz", "COMPLIANT"],
        ["Max Hydrostatic Pressure", "EN 733 / DIN 24255", "10.0 Bar", "155 PSI (10.68 Bar)", "COMPLIANT"],
        ["Casing & Impeller Metallurgy", "ASTM A351 / CF8M", "CF8M Stainless Steel", "CF8M Stainless Steel", "COMPLIANT"],
        ["Shaft Sealing", "API 682 Plan 11", "Mechanical Seal", "SiC vs SiC Mechanical Seal", "COMPLIANT"],
        ["Operational Temperature Range", "Standard Industrial", "0 to 60 deg C", "-10 deg C to 95 deg C", "COMPLIANT"],
        ["NPSH Required", "Hydraulic Institute", "< 3.5 meters", "2.8 meters at duty point", "COMPLIANT"],
    ]
    cur_y = draw_table(page, 20, 148, col_w, 20, headers, rows, header_bg=NAVY)

    # Pump Performance Curves Diagram Graphic
    cur_y += 15
    page.draw_rect(pymupdf.Rect(20, cur_y, 575, cur_y + 130), color=SLATE, fill=LIGHT_BLUE, width=1)
    page.insert_textbox(pymupdf.Rect(30, cur_y + 8, 300, cur_y + 24), "HYDRAULIC PERFORMANCE CURVE (ACP-400-H at 1450 RPM)", fontsize=8, fontname="hebi", color=NAVY)
    
    # Draw simple graph grid
    gx, gy, gw, gh = 40, cur_y + 30, 480, 80
    page.draw_rect(pymupdf.Rect(gx, gy, gx + gw, gy + gh), color=WHITE, fill=WHITE)
    for lx in range(gx, gx + gw, 40):
        page.draw_line(pymupdf.Point(lx, gy), pymupdf.Point(lx, gy + gh), color=(0.9, 0.9, 0.9), width=0.5)
    for ly in range(gy, gy + gh, 20):
        page.draw_line(pymupdf.Point(gx, ly), pymupdf.Point(gx + gw, ly), color=(0.9, 0.9, 0.9), width=0.5)
    
    # Head curve (downward curve)
    p_head = [pymupdf.Point(gx, gy + 15), pymupdf.Point(gx + 120, gy + 20), pymupdf.Point(gx + 260, gy + 35), pymupdf.Point(gx + gw, gy + 75)]
    for i in range(len(p_head)-1):
        page.draw_line(p_head[i], p_head[i+1], color=NAVY, width=2)
    page.insert_textbox(pymupdf.Rect(gx + gw - 90, gy + 60, gx + gw, gy + 75), "H-Q Curve", fontsize=7, fontname="hebi", color=NAVY)

    # Efficiency curve (inverted U)
    p_eff = [pymupdf.Point(gx, gy + 65), pymupdf.Point(gx + 160, gy + 25), pymupdf.Point(gx + 260, gy + 15), pymupdf.Point(gx + 400, gy + 40), pymupdf.Point(gx + gw, gy + 70)]
    for i in range(len(p_eff)-1):
        page.draw_line(p_eff[i], p_eff[i+1], color=EMERALD, width=2)
    page.insert_textbox(pymupdf.Rect(gx + 240, gy + 3, gx + 340, gy + 18), "BEP: 88.4% @ 520 LPM", fontsize=7, fontname="hebi", color=EMERALD)

    # Certification Block
    cur_y += 145
    page.draw_rect(pymupdf.Rect(20, cur_y, 575, cur_y + 80), color=(0.8, 0.8, 0.8), fill=WHITE, width=1)
    page.insert_textbox(
        pymupdf.Rect(30, cur_y + 8, 360, cur_y + 70),
        "OEM DECLARATION & WARRANTY:\n"
        "We hereby certify that the model ACP-400-H offered under GeM Bid GEM/2026/B/90124 meets and exceeds all technical parameters specified. Pumps are supplied with 24 months warranty from date of commissioning. Certified by CPRI / ERDA approved laboratory test.",
        fontsize=7, fontname="helv", color=DARK_GRAY
    )
    page.insert_textbox(
        pymupdf.Rect(400, cur_y + 8, 560, cur_y + 70),
        "For Apex Pumps & Motors Pvt Ltd\n\nSd/-\nDr. M. K. Narayanan\nChief Technical Officer (CTO)",
        fontsize=7.5, fontname="hebi", color=NAVY, align=pymupdf.TEXT_ALIGN_RIGHT
    )
    draw_official_stamp(page, 380, cur_y + 40, "APEX PUMPS & MOTORS", "QA PASS", NAVY)

    pdf_path = os.path.join(OUTPUT_DIR, "Apex_Pumps_Technical_Datasheet.pdf")
    doc.save(pdf_path)
    doc.close()
    print(f"Created: {pdf_path}")


# ─────────────────────────────────────────────────────────────────────────────
# 3. APEX CA TURNOVER CERTIFICATE (THE CONTRADICTION CASE)
# ─────────────────────────────────────────────────────────────────────────────
def create_ca_certificate():
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842)

    # ICAI Letterhead Header
    page.draw_rect(pymupdf.Rect(20, 20, 575, 75), color=WHITE, fill=WHITE)
    page.draw_line(pymupdf.Point(20, 95), pymupdf.Point(575, 95), color=NAVY, width=2)
    page.draw_line(pymupdf.Point(20, 98), pymupdf.Point(575, 98), color=MAROON, width=0.8)

    page.insert_textbox(
        pymupdf.Rect(30, 25, 450, 45),
        "SHAH, KHANNA & ASSOCIATES",
        fontsize=15, fontname="hebi", color=NAVY
    )
    page.insert_textbox(
        pymupdf.Rect(30, 46, 450, 60),
        "CHARTERED ACCOUNTANTS | FIRM REGISTRATION NO: 109842W",
        fontsize=8, fontname="hebi", color=MAROON
    )
    page.insert_textbox(
        pymupdf.Rect(30, 62, 550, 85),
        "Head Office: 402, Mercantile House, 15 Kasturba Gandhi Marg, Connaught Place, New Delhi - 110001\nTel: +91-11-23318942 | Email: audit@shahkhanna.in | ICAI Member Reg: 084912",
        fontsize=7, fontname="helv", color=SLATE
    )

    # Document Header with UDIN Box
    page.draw_rect(pymupdf.Rect(360, 105, 575, 135), color=NAVY, fill=LIGHT_BLUE, width=1)
    page.insert_textbox(pymupdf.Rect(370, 110, 565, 130), "UDIN: 26084912AAAAAA9941\nDate of Certificate: 02-Sept-2026", fontsize=8, fontname="hebi", color=NAVY)

    page.insert_textbox(
        pymupdf.Rect(20, 140, 575, 160),
        "TO WHOMSOEVER IT MAY CONCERN",
        fontsize=12, fontname="hebi", color=NAVY, align=pymupdf.TEXT_ALIGN_CENTER
    )
    page.insert_textbox(
        pymupdf.Rect(20, 160, 575, 175),
        "ANNUAL TURNOVER AND NET WORTH CERTIFICATE",
        fontsize=10, fontname="hebi", color=MAROON, align=pymupdf.TEXT_ALIGN_CENTER
    )

    # Body Paragraph
    body_text = (
        "We have examined the audited books of accounts, statutory returns, and records produced before us by "
        "M/s APEX PUMPS & MOTORS PRIVATE LIMITED, having its Registered Office at Plot 42-44, Okhla Industrial Area "
        "Phase-III, New Delhi - 110020 (CIN: U45201DL2015PTC284910, PAN: AAACA1234F, GSTIN: 07AAAAA0000A1Z5). "
        "Based on our verification and management representations, we certify that the Annual Turnover from operations "
        "for the preceding three financial years is as set forth below:"
    )
    page.insert_textbox(pymupdf.Rect(30, 185, 565, 245), body_text, fontsize=8, fontname="helv", color=DARK_GRAY)

    # Certified Turnover Table
    headers = ["Financial Year", "Assessment Year", "Certified Annual Turnover (INR)", "Audited Net Worth (INR)", "Status"]
    col_w = [90, 85, 160, 140, 60]
    rows = [
        ["FY 2022-23", "AY 2023-24", "INR 104,50,00,000 (104.50 Cr)", "INR 42,10,00,000 (42.10 Cr)", "AUDITED"],
        ["FY 2023-24", "AY 2024-25", "INR 118,20,00,000 (118.20 Cr)", "INR 46,30,00,000 (46.30 Cr)", "AUDITED"],
        ["FY 2024-25", "AY 2025-26", "INR 112,40,00,000 (112.40 Cr)", "INR 48,20,00,000 (48.20 Cr)", "AUDITED*"],
        ["3-Year Average", "FY23 - FY25", "INR 111,70,00,000 (111.70 Cr)", "INR 45,53,33,333 (45.53 Cr)", "QUALIFIED"],
    ]
    cur_y = draw_table(page, 30, 255, col_w, 22, headers, rows, header_bg=NAVY)

    # Note highlighting the CA statement
    cur_y += 15
    page.insert_textbox(
        pymupdf.Rect(30, cur_y, 565, cur_y + 40),
        "* Note on FY 2024-25: Turnover includes provisional trade receipts and inter-unit supply transfers under reconciliations.\n"
        "This certificate is issued at the request of the client for submission to GeM Portal under Tender GEM/2026/B/90124.",
        fontsize=7, fontname="helv", color=SLATE
    )

    # Auditor Signature & Stamp
    cur_y += 60
    page.insert_textbox(
        pymupdf.Rect(340, cur_y, 565, cur_y + 80),
        "For SHAH, KHANNA & ASSOCIATES\nChartered Accountants\nFirm Reg No: 109842W\n\nSd/-\nCA. Pradeep Shah, FCA\nPartner | Membership No: 084912",
        fontsize=7.5, fontname="hebi", color=NAVY, align=pymupdf.TEXT_ALIGN_RIGHT
    )
    draw_official_stamp(page, 300, cur_y + 35, "SHAH KHANNA & ASSOCIATES", "CA SEAL", (0.1, 0.2, 0.6))

    pdf_path = os.path.join(OUTPUT_DIR, "Apex_CA_Turnover_Certificate.pdf")
    doc.save(pdf_path)
    doc.close()
    print(f"Created: {pdf_path}")


# ─────────────────────────────────────────────────────────────────────────────
# 4. APEX AUDITED BALANCE SHEET FY25 (CONTRADICTION TARGET)
# ─────────────────────────────────────────────────────────────────────────────
def create_balance_sheet():
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842)

    # Company Header
    page.insert_textbox(
        pymupdf.Rect(30, 25, 565, 45),
        "APEX PUMPS & MOTORS PRIVATE LIMITED",
        fontsize=13, fontname="hebi", color=NAVY, align=pymupdf.TEXT_ALIGN_CENTER
    )
    page.insert_textbox(
        pymupdf.Rect(30, 45, 565, 60),
        "Regd. Office: Plot 42-44, Okhla Industrial Area Phase-III, New Delhi - 110020 | CIN: U45201DL2015PTC284910",
        fontsize=7.5, fontname="helv", color=SLATE, align=pymupdf.TEXT_ALIGN_CENTER
    )
    page.draw_line(pymupdf.Point(30, 68), pymupdf.Point(565, 68), color=NAVY, width=1.5)

    page.insert_textbox(
        pymupdf.Rect(30, 75, 565, 95),
        "EXTRACT OF AUDITED STATEMENT OF PROFIT AND LOSS FOR THE YEAR ENDED 31ST MARCH, 2025",
        fontsize=9, fontname="hebi", color=DARK_GRAY, align=pymupdf.TEXT_ALIGN_CENTER
    )
    page.insert_textbox(
        pymupdf.Rect(30, 93, 565, 105),
        "(Prepared in accordance with Schedule III of the Companies Act, 2013 and Ind AS)",
        fontsize=7, fontname="helv", color=SLATE, align=pymupdf.TEXT_ALIGN_CENTER
    )

    # Financial Table (The Row with 94.00 Cr vs CA Certificate 112.40 Cr)
    headers = ["Particulars / Line Item", "Note No.", "For FY 2024-25 (Audited)", "For FY 2023-24 (Audited)"]
    col_w = [235, 60, 120, 120]
    rows = [
        ["I. Revenue from Operations (Net Turnover)", "Note 18", "INR 94,00,00,000 (94.0 Cr)", "INR 118,20,00,000 (118.2 Cr)"],
        ["II. Other Income", "Note 19", "INR 3,20,00,000 (3.2 Cr)", "INR 2,80,00,000 (2.8 Cr)"],
        ["III. Total Income (I + II)", "", "INR 97,20,00,000 (97.2 Cr)", "INR 121,00,00,000 (121.0 Cr)"],
        ["IV. Expenses:", "", "", ""],
        ["   (a) Cost of Raw Materials Consumed", "Note 20", "INR 52,40,00,000", "INR 64,10,00,000"],
        ["   (b) Employee Benefits Expense", "Note 21", "INR 16,80,00,000", "INR 18,20,00,000"],
        ["   (c) Depreciation and Amortization", "Note 11", "INR 6,10,00,000", "INR 5,90,00,000"],
        ["   (d) Other Operating Expenses", "Note 22", "INR 10,45,00,000", "INR 12,10,00,000"],
        ["Total Expenses", "", "INR 85,75,00,000", "INR 100,30,00,000"],
        ["V. Profit Before Exceptional Items and Tax (III - IV)", "", "INR 11,45,00,000", "INR 20,70,00,000"],
        ["VI. Tax Expense (Current Tax + Deferred Tax)", "Note 23", "INR 3,00,00,000", "INR 5,40,00,000"],
        ["VII. Profit for the Year (Net Profit After Tax)", "", "INR 8,45,00,000", "INR 15,30,00,000"],
        ["VIII. Tangible Net Worth as on 31st March", "Schedule A", "INR 48,20,00,000 (48.2 Cr)", "INR 46,30,00,000 (46.3 Cr)"],
    ]
    cur_y = draw_table(page, 30, 115, col_w, 18, headers, rows, header_bg=NAVY)

    # Note 18 Explanation Box
    cur_y += 15
    page.draw_rect(pymupdf.Rect(30, cur_y, 565, cur_y + 40), color=SLATE, fill=LIGHT_BLUE, width=0.5)
    page.insert_textbox(
        pymupdf.Rect(38, cur_y + 4, 555, cur_y + 36),
        "Note 18 - Revenue from Operations:\n"
        "Domestic Sales of Industrial Centrifugal Pumps: INR 88.50 Cr | Export Sales: INR 5.50 Cr | Total Revenue from Operations: INR 94.00 Cr.\n"
        "(Auditor remark: Inter-branch branch allocations of INR 18.40 Cr are excluded as per Ind AS 115).",
        fontsize=6.8, fontname="helv", color=DARK_GRAY
    )

    # Board and Auditor Signatures
    cur_y += 50
    page.insert_textbox(
        pymupdf.Rect(30, cur_y, 250, cur_y + 70),
        "For and on behalf of the Board of Directors\n\nSd/-\nVikramaditya Singhania\nManaging Director (DIN: 01928410)",
        fontsize=7.5, fontname="hebi", color=NAVY
    )
    page.insert_textbox(
        pymupdf.Rect(340, cur_y, 565, cur_y + 70),
        "In terms of our report of even date attached\nFor SHAH, KHANNA & ASSOCIATES\nChartered Accountants (FRN: 109842W)\n\nSd/-\nCA. Pradeep Shah (M.No: 084912)",
        fontsize=7.5, fontname="hebi", color=NAVY, align=pymupdf.TEXT_ALIGN_RIGHT
    )
    draw_official_stamp(page, 300, cur_y + 30, "STATUTORY AUDITORS", "AUDITED FY25", (0.1, 0.2, 0.6))

    pdf_path = os.path.join(OUTPUT_DIR, "Apex_Audited_Balance_Sheet_FY25.pdf")
    doc.save(pdf_path)
    doc.close()
    print(f"Created: {pdf_path}")


# ─────────────────────────────────────────────────────────────────────────────
# 5. ISO 9001:2015 CERTIFICATE
# ─────────────────────────────────────────────────────────────────────────────
def create_iso_certificate():
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842)

    # Double Gold & Navy Border
    page.draw_rect(pymupdf.Rect(15, 15, 580, 827), color=GOLD, width=3)
    page.draw_rect(pymupdf.Rect(20, 20, 575, 822), color=NAVY, width=1)
    page.draw_rect(pymupdf.Rect(24, 24, 571, 818), color=GOLD, width=0.5)

    # Header
    page.insert_textbox(
        pymupdf.Rect(30, 50, 565, 80),
        "GLOBAL CERTIFICATION SERVICES UK & INDIA",
        fontsize=14, fontname="hebi", color=NAVY, align=pymupdf.TEXT_ALIGN_CENTER
    )
    page.insert_textbox(
        pymupdf.Rect(30, 75, 565, 95),
        "Accreditation Board: NABCB / IAF Member Body | Cert Registration No: GCS/IND/QMS/9941",
        fontsize=7.5, fontname="helv", color=SLATE, align=pymupdf.TEXT_ALIGN_CENTER
    )

    page.insert_textbox(
        pymupdf.Rect(30, 130, 565, 160),
        "CERTIFICATE OF REGISTRATION",
        fontsize=16, fontname="hebi", color=GOLD, align=pymupdf.TEXT_ALIGN_CENTER
    )
    page.insert_textbox(
        pymupdf.Rect(30, 165, 565, 185),
        "This is to certify that the Quality Management System of:",
        fontsize=8.5, fontname="helv", color=DARK_GRAY, align=pymupdf.TEXT_ALIGN_CENTER
    )

    # Certified Entity
    page.draw_rect(pymupdf.Rect(50, 190, 545, 250), color=LIGHT_BLUE, fill=LIGHT_BLUE)
    page.insert_textbox(
        pymupdf.Rect(55, 198, 540, 222),
        "APEX PUMPS & MOTORS PRIVATE LIMITED",
        fontsize=13, fontname="hebi", color=NAVY, align=pymupdf.TEXT_ALIGN_CENTER
    )
    page.insert_textbox(
        pymupdf.Rect(55, 224, 540, 244),
        "Works: Plot 42-44, Okhla Industrial Area Phase-III, New Delhi - 110020, India",
        fontsize=8, fontname="helv", color=SLATE, align=pymupdf.TEXT_ALIGN_CENTER
    )

    # Standard Statement
    page.insert_textbox(
        pymupdf.Rect(30, 265, 565, 285),
        "Has been assessed and found to conform to the requirements of:",
        fontsize=8.5, fontname="helv", color=DARK_GRAY, align=pymupdf.TEXT_ALIGN_CENTER
    )
    page.insert_textbox(
        pymupdf.Rect(30, 285, 565, 320),
        "ISO 9001:2015",
        fontsize=22, fontname="hebi", color=EMERALD, align=pymupdf.TEXT_ALIGN_CENTER
    )
    page.insert_textbox(
        pymupdf.Rect(30, 320, 565, 340),
        "Quality Management Systems — Requirements",
        fontsize=9, fontname="hebi", color=SLATE, align=pymupdf.TEXT_ALIGN_CENTER
    )

    # Scope of Certification
    page.draw_rect(pymupdf.Rect(50, 350, 545, 410), color=WHITE, fill=WHITE, width=1)
    page.insert_textbox(
        pymupdf.Rect(60, 355, 535, 405),
        "SCOPE OF SUPPLY & OPERATIONS:\n"
        "Design, Development, Manufacture, Testing, Supply and Servicing of High-Efficiency Centrifugal, "
        "Submersible, and Multi-Stage Industrial Water Pumps and Induction Motors for Government & Commercial Applications.",
        fontsize=8, fontname="helv", color=DARK_GRAY, align=pymupdf.TEXT_ALIGN_CENTER
    )

    # Validity Table
    headers = ["Certificate Date", "Original Issue Date", "Current Expiry Date", "Surveillance Due Date"]
    col_w = [120, 120, 120, 135]
    rows = [
        ["12-August-2023", "12-August-2020", "11-August-2026", "11-August-2025 (Completed)"]
    ]
    cur_y = draw_table(page, 50, 425, col_w, 20, headers, rows, header_bg=NAVY)

    # IAF Ribbon Badge Graphic
    draw_official_stamp(page, 297, 540, "GLOBAL CERTIFICATION SERVICES", "IAF / NABCB", GOLD)

    # Signatures
    cur_y = 620
    page.insert_textbox(
        pymupdf.Rect(60, cur_y, 250, cur_y + 50),
        "Sd/-\nHead of Certification Audit\nNABCB Accreditation Board",
        fontsize=8, fontname="hebi", color=NAVY
    )
    page.insert_textbox(
        pymupdf.Rect(345, cur_y, 535, cur_y + 50),
        "Sd/-\nManaging Director\nGlobal Certification Services Ltd",
        fontsize=8, fontname="hebi", color=NAVY, align=pymupdf.TEXT_ALIGN_RIGHT
    )

    pdf_path = os.path.join(OUTPUT_DIR, "Apex_ISO_9001_Certificate.pdf")
    doc.save(pdf_path)
    doc.close()
    print(f"Created: {pdf_path}")


# ─────────────────────────────────────────────────────────────────────────────
# 6. GST REGISTRATION CERTIFICATE (FORM GST REG-06)
# ─────────────────────────────────────────────────────────────────────────────
def create_gst_certificate():
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842)

    # Government Tricolor Banner
    page.draw_rect(pymupdf.Rect(20, 20, 575, 24), color=(0.95, 0.45, 0.1), fill=(0.95, 0.45, 0.1))
    page.draw_rect(pymupdf.Rect(20, 24, 575, 28), color=WHITE, fill=WHITE)
    page.draw_rect(pymupdf.Rect(20, 28, 575, 32), color=EMERALD, fill=EMERALD)

    page.insert_textbox(
        pymupdf.Rect(30, 40, 565, 60),
        "GOVERNMENT OF INDIA | GOODS AND SERVICES TAX NETWORK",
        fontsize=10, fontname="hebi", color=NAVY, align=pymupdf.TEXT_ALIGN_CENTER
    )
    page.insert_textbox(
        pymupdf.Rect(30, 60, 565, 75),
        "Form GST REG-06 [See Rule 10(1)]",
        fontsize=8, fontname="helv", color=SLATE, align=pymupdf.TEXT_ALIGN_CENTER
    )
    page.insert_textbox(
        pymupdf.Rect(30, 75, 565, 95),
        "REGISTRATION CERTIFICATE",
        fontsize=13, fontname="hebi", color=MAROON, align=pymupdf.TEXT_ALIGN_CENTER
    )

    # GSTIN Big Box
    page.draw_rect(pymupdf.Rect(30, 105, 565, 140), color=NAVY, fill=LIGHT_BLUE, width=1.5)
    page.insert_textbox(
        pymupdf.Rect(40, 112, 555, 135),
        "Goods and Services Tax Identification Number (GSTIN): 07AAAAA0000A1Z5",
        fontsize=11, fontname="hebi", color=NAVY, align=pymupdf.TEXT_ALIGN_CENTER
    )

    # Registration Details Table
    headers = ["Sl No.", "Registration Detail Item", "Verified Regulatory Record"]
    col_w = [45, 220, 270]
    rows = [
        ["1.", "Legal Name of Business", "APEX PUMPS & MOTORS PRIVATE LIMITED"],
        ["2.", "Trade Name (if any)", "Apex Industrial Pump Systems"],
        ["3.", "Constitution of Business", "Private Limited Company"],
        ["4.", "Address of Principal Place of Business", "Plot 42-44, Okhla Industrial Area Phase-III, New Delhi, 110020"],
        ["5.", "Date of Liability", "01/07/2017"],
        ["6.", "Period of Validity", "From 01/07/2017 to Continuing"],
        ["7.", "Type of Registration", "Regular Taxpayer"],
        ["8.", "State / Jurisdiction", "Delhi | Ward 42 | Central Goods and Services Tax"],
        ["9.", "Permanent Account Number (PAN)", "AAACA1234F (Verified & Active)"],
    ]
    cur_y = draw_table(page, 30, 150, col_w, 22, headers, rows, header_bg=NAVY)

    # Bottom Seal & Approving Authority
    cur_y += 20
    page.draw_rect(pymupdf.Rect(30, cur_y, 565, cur_y + 80), color=SLATE, fill=WHITE, width=0.5)
    page.insert_textbox(
        pymupdf.Rect(40, cur_y + 10, 300, cur_y + 70),
        "Jurisdictional Office:\nAssistant Commissioner of State Tax\nWard 42, CGST Bhavan, Bhikaji Cama Place, New Delhi\nDigital Verification Ref: GSTN/DL/2017/07AAAAA0000A1Z5",
        fontsize=7, fontname="helv", color=SLATE
    )
    page.insert_textbox(
        pymupdf.Rect(340, cur_y + 10, 555, cur_y + 70),
        "Digitally approved by:\n\nSd/-\nSuperintendent of Taxes\nDepartment of Revenue, Ministry of Finance",
        fontsize=7.5, fontname="hebi", color=NAVY, align=pymupdf.TEXT_ALIGN_RIGHT
    )
    draw_official_stamp(page, 310, cur_y + 40, "DEPARTMENT OF REVENUE", "GSTN VERIFIED", EMERALD)

    pdf_path = os.path.join(OUTPUT_DIR, "Apex_GST_Registration_Certificate.pdf")
    doc.save(pdf_path)
    doc.close()
    print(f"Created: {pdf_path}")


if __name__ == "__main__":
    print("Generating ultra-realistic procurement and vendor PDF documents...")
    create_tender_notice()
    create_technical_datasheet()
    create_ca_certificate()
    create_balance_sheet()
    create_iso_certificate()
    create_gst_certificate()
    print("All 6 realistic demo documents generated successfully in ai-service/demo_docs/!")
