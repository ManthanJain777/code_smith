#!/usr/bin/env python3
"""
generate_demo_docs.py — Generate 100 mock compliance PDFs across 10 categories.
Each category folder gets 10 documents with realistic government/compliance content.
"""

import os
import random
import hashlib
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "demo_docs")

# ─── Data Templates ─────────────────────────────────────────────────────────

VENDORS = [
    ("Apex Pumps & Motors Pvt Ltd", "AAPCA1234B", "27AAPCA1234B1ZP", "UDYAM-MH-01-0012345", "SLR-APEX-001"),
    ("Bharat Heavy Valves Ltd", "AADCB5678C", "07AADCB5678C1ZQ", "UDYAM-DL-02-0054321", "SLR-BHARAT-002"),
    ("Crompton Flow Dynamics", "AABCC9012D", "33AABCC9012D1ZR", "UDYAM-TN-03-0098765", "SLR-CROMPTON-003"),
    ("TechnoServe Industrial Solutions", "AAFCT3456E", "29AAFCT3456E1ZS", "UDYAM-KA-04-0076543", "SLR-TECHNO-004"),
    ("National Water Engineering Corp", "AAECN7890F", "09AAECN7890F1ZT", "UDYAM-UP-05-0043210", "SLR-NATWATER-005"),
    ("Hindalco Pumps Division", "AABCH2345G", "06AABCH2345G1ZU", "UDYAM-HR-06-0021098", "SLR-HIND-006"),
    ("Sundaram Precision Engg", "AAICS6789H", "34AAICS6789H1ZV", "UDYAM-KL-07-0087654", "SLR-SUND-007"),
    ("Tata Industrial Components", "AACT1234J", "27AACT1234J1ZW", "UDYAM-MH-08-0065432", "SLR-TATA-008"),
    ("Godrej Process Equipment", "AADCG5678K", "27AADCG5678K1ZX", "UDYAM-MH-09-0043210", "SLR-GODREJ-009"),
    ("L&T EPC Heavy Engineering", "AABCL9012L", "27AABCL9012L1ZY", "UDYAM-MH-10-0021098", "SLR-LT-010"),
]

PERSONS = [
    "Aarav Sharma", "Priya Patel", "Rohit Verma", "Ananya Gupta", "Vikram Singh",
    "Meera Nair", "Arjun Rao", "Kavita Deshmukh", "Suresh Kumar", "Neha Joshi",
]

CATEGORIES = [
    ("01_aadhaar_identity", "Aadhaar Identity Verification"),
    ("02_pan_cards", "PAN Card Verification"),
    ("03_gst_registration", "GST Registration Certificate"),
    ("04_iso_certifications", "ISO Quality Certification"),
    ("05_bank_guarantees", "Bank Guarantee / EMD"),
    ("06_balance_sheets", "Audited Balance Sheet"),
    ("07_ca_turnover_certificates", "CA Turnover Certificate"),
    ("08_udyam_msme", "Udyam MSME Registration"),
    ("09_experience_certificates", "Experience / Work Order Certificate"),
    ("10_technical_specifications", "Technical Specification Compliance"),
]

def draw_header(c, title, subtitle, w, y_start):
    """Draw a professional government document header."""
    c.setFillColor(HexColor("#1B365D"))
    c.rect(20*mm, y_start - 5*mm, w - 40*mm, 22*mm, fill=1, stroke=0)
    c.setFillColor(HexColor("#FFFFFF"))
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(w/2, y_start + 10*mm, title)
    c.setFont("Helvetica", 9)
    c.drawCentredString(w/2, y_start + 3*mm, subtitle)

    # Tricolor strip
    strip_y = y_start - 6*mm
    third = (w - 40*mm) / 3
    c.setFillColor(HexColor("#FF9933"))
    c.rect(20*mm, strip_y, third, 2*mm, fill=1, stroke=0)
    c.setFillColor(HexColor("#FFFFFF"))
    c.rect(20*mm + third, strip_y, third, 2*mm, fill=1, stroke=0)
    c.setFillColor(HexColor("#138808"))
    c.rect(20*mm + 2*third, strip_y, third, 2*mm, fill=1, stroke=0)

    return strip_y - 8*mm

def draw_field(c, label, value, x, y, w):
    """Draw a labeled field."""
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(HexColor("#64748b"))
    c.drawString(x, y, label)
    c.setFont("Helvetica", 10)
    c.setFillColor(HexColor("#1e293b"))
    c.drawString(x, y - 4*mm, str(value))
    return y - 12*mm

def draw_status_badge(c, status, x, y):
    """Draw a status badge (VALID/COMPLIANT/FLAGGED)."""
    is_valid = status in ("VALID", "COMPLIANT", "ACTIVE", "VERIFIED")
    bg = HexColor("#dcfce7") if is_valid else HexColor("#fef2f2")
    fg = HexColor("#166534") if is_valid else HexColor("#991b1b")
    c.setFillColor(bg)
    c.roundRect(x, y - 2*mm, 28*mm, 6*mm, 2*mm, fill=1, stroke=0)
    c.setFillColor(fg)
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(x + 14*mm, y, status)
    return y - 10*mm

def draw_hash_footer(c, doc_id, w, y):
    """Draw a blockchain hash verification footer."""
    hash_val = hashlib.sha256(doc_id.encode()).hexdigest()
    c.setFillColor(HexColor("#f1f5f9"))
    c.rect(20*mm, y - 2*mm, w - 40*mm, 14*mm, fill=1, stroke=0)
    c.setFillColor(HexColor("#64748b"))
    c.setFont("Courier", 7)
    c.drawString(22*mm, y + 7*mm, f"Document Hash (SHA-256): {hash_val}")
    c.drawString(22*mm, y + 2*mm, f"Verification ID: {doc_id}  |  Generated: {datetime.now().strftime('%d-%m-%Y %H:%M IST')}")
    c.drawString(22*mm, y - 1*mm, f"Blockchain Anchor: 0x{hash_val[:40]}  |  Block: #{random.randint(1000000, 9999999)}")

def gen_aadhaar(c, vendor, person, idx, w, h):
    doc_id = f"AADHAAR-{idx:03d}-{person.upper().replace(' ', '-')}"
    status = "VALID" if idx % 3 != 0 else "FLAGGED"
    aadhaar_num = f"{random.randint(1000,9999)} {random.randint(1000,9999)} {random.randint(1000,9999)}"
    y = draw_header(c, "Aadhaar Verification Report", "Unique Identification Authority of India (UIDAI)", w, h - 25*mm)
    y = draw_field(c, "Full Name (as per UIDAI)", person, 25*mm, y, w)
    y = draw_field(c, "Aadhaar Number", aadhaar_num, 25*mm, y, w)
    y = draw_field(c, "Date of Birth", f"{random.randint(1,28):02d}-{random.randint(1,12):02d}-{random.randint(1970,1995)}", 25*mm, y, w)
    y = draw_field(c, "Address", f"Plot {random.randint(1,500)}, Sector {random.randint(1,60)}, {random.choice(['New Delhi','Mumbai','Chennai','Bengaluru','Kolkata'])}", 25*mm, y, w)
    y = draw_field(c, "Verification Status", "", 25*mm, y, w)
    y = draw_status_badge(c, status, 25*mm, y + 8*mm)
    y = draw_field(c, "Associated Organization", vendor[0], 25*mm, y, w)
    y = draw_field(c, "PAN Cross-Reference", vendor[1], 25*mm, y, w)
    if status == "FLAGGED":
        y = draw_field(c, "Flag Reason", "Name mismatch between Aadhaar and PAN records", 25*mm, y, w)
    draw_hash_footer(c, doc_id, w, 30*mm)

def gen_pan(c, vendor, person, idx, w, h):
    doc_id = f"PAN-{idx:03d}-{vendor[1]}"
    status = "VALID" if idx % 4 != 0 else "FLAGGED"
    y = draw_header(c, "PAN Card Verification Report", "Income Tax Department, Government of India", w, h - 25*mm)
    y = draw_field(c, "PAN Number", vendor[1], 25*mm, y, w)
    y = draw_field(c, "Name on PAN", vendor[0] if idx % 5 != 0 else person, 25*mm, y, w)
    y = draw_field(c, "Entity Type", random.choice(["Company", "LLP", "Proprietorship", "Partnership"]), 25*mm, y, w)
    y = draw_field(c, "Date of Incorporation", f"{random.randint(1,28):02d}-{random.randint(1,12):02d}-{random.randint(1990,2020)}", 25*mm, y, w)
    y = draw_field(c, "PAN Status", "", 25*mm, y, w)
    y = draw_status_badge(c, status, 25*mm, y + 8*mm)
    if status == "FLAGGED":
        y = draw_field(c, "Issue", "PAN name does not match registered entity name in bid documents", 25*mm, y, w)
    draw_hash_footer(c, doc_id, w, 30*mm)

def gen_gst(c, vendor, person, idx, w, h):
    doc_id = f"GST-{idx:03d}-{vendor[2]}"
    status = "ACTIVE" if idx % 5 != 0 else "FLAGGED"
    y = draw_header(c, "GST Registration Certificate (REG-06)", "Goods & Services Tax Network (GSTN)", w, h - 25*mm)
    y = draw_field(c, "GSTIN", vendor[2], 25*mm, y, w)
    y = draw_field(c, "Legal Name", vendor[0], 25*mm, y, w)
    y = draw_field(c, "Trade Name", vendor[0].split(" ")[0] + " Industries", 25*mm, y, w)
    y = draw_field(c, "Registration Date", f"01-04-{random.randint(2017,2024)}", 25*mm, y, w)
    y = draw_field(c, "Principal Place of Business", f"{random.choice(['Mumbai','Delhi','Chennai','Bengaluru','Hyderabad'])}, India", 25*mm, y, w)
    y = draw_field(c, "GST Status", "", 25*mm, y, w)
    y = draw_status_badge(c, status, 25*mm, y + 8*mm)
    if status == "FLAGGED":
        y = draw_field(c, "Flag Reason", "GST registration cancelled due to non-filing of returns for 6+ months", 25*mm, y, w)
    draw_hash_footer(c, doc_id, w, 30*mm)

def gen_iso(c, vendor, person, idx, w, h):
    doc_id = f"ISO-{idx:03d}-{vendor[4]}"
    status = "VALID" if idx % 4 != 0 else "FLAGGED"
    cert_type = random.choice(["ISO 9001:2015", "ISO 14001:2015", "ISO 45001:2018", "ISO 27001:2022"])
    expiry = datetime.now() + timedelta(days=random.randint(-180, 730))
    y = draw_header(c, f"{cert_type} Quality Certification", f"Certified by {random.choice(['Bureau Veritas','TÜV SÜD','SGS India','DNV GL','BSI Group'])}", w, h - 25*mm)
    y = draw_field(c, "Certificate Number", f"QMS-{random.randint(10000,99999)}-{random.randint(2024,2026)}", 25*mm, y, w)
    y = draw_field(c, "Organization", vendor[0], 25*mm, y, w)
    y = draw_field(c, "Standard", cert_type, 25*mm, y, w)
    y = draw_field(c, "Scope", f"Design, manufacture and supply of {random.choice(['industrial pumps','heavy valves','flow control systems','precision instruments'])}", 25*mm, y, w)
    y = draw_field(c, "Valid Until", expiry.strftime("%d-%m-%Y"), 25*mm, y, w)
    y = draw_field(c, "Certificate Status", "", 25*mm, y, w)
    actual_status = status if expiry > datetime.now() else "FLAGGED"
    y = draw_status_badge(c, actual_status, 25*mm, y + 8*mm)
    if actual_status == "FLAGGED":
        y = draw_field(c, "Flag Reason", f"Certificate expired on {expiry.strftime('%d-%m-%Y')}", 25*mm, y, w)
    draw_hash_footer(c, doc_id, w, 30*mm)

def gen_bank_guarantee(c, vendor, person, idx, w, h):
    doc_id = f"BG-{idx:03d}-{vendor[4]}"
    status = "VALID" if idx % 3 != 0 else "FLAGGED"
    amount = random.randint(5, 50) * 100000
    y = draw_header(c, "Bank Guarantee / EMD Certificate", f"{random.choice(['State Bank of India','Bank of Baroda','Punjab National Bank','ICICI Bank','HDFC Bank'])}", w, h - 25*mm)
    y = draw_field(c, "BG Number", f"BG/{random.randint(2024,2026)}/{random.randint(100000,999999)}", 25*mm, y, w)
    y = draw_field(c, "Beneficiary", vendor[0], 25*mm, y, w)
    y = draw_field(c, "Amount (INR)", f"₹{amount:,.2f}", 25*mm, y, w)
    y = draw_field(c, "Issued Date", f"{random.randint(1,28):02d}-{random.randint(1,6):02d}-2026", 25*mm, y, w)
    validity = datetime.now() + timedelta(days=random.randint(-30, 365))
    y = draw_field(c, "Validity Period", f"Until {validity.strftime('%d-%m-%Y')}", 25*mm, y, w)
    y = draw_field(c, "Guarantee Status", "", 25*mm, y, w)
    y = draw_status_badge(c, status, 25*mm, y + 8*mm)
    if status == "FLAGGED":
        y = draw_field(c, "Flag", "Bank guarantee validity period shorter than tender requirement", 25*mm, y, w)
    draw_hash_footer(c, doc_id, w, 30*mm)

def gen_balance_sheet(c, vendor, person, idx, w, h):
    doc_id = f"BS-{idx:03d}-{vendor[4]}"
    status = "COMPLIANT" if idx % 4 != 0 else "FLAGGED"
    fy = random.randint(2022, 2025)
    turnover = random.randint(50, 500) * 1000000
    net_worth = random.randint(-20, 200) * 1000000
    y = draw_header(c, f"Audited Balance Sheet FY {fy}-{fy+1}", f"Audited by {random.choice(['Deloitte India','KPMG India','EY India','Grant Thornton','BDO India'])}", w, h - 25*mm)
    y = draw_field(c, "Organization", vendor[0], 25*mm, y, w)
    y = draw_field(c, "Financial Year", f"FY {fy}-{str(fy+1)[-2:]}", 25*mm, y, w)
    y = draw_field(c, "Total Revenue", f"₹{turnover:,.0f}", 25*mm, y, w)
    y = draw_field(c, "Net Worth", f"₹{net_worth:,.0f}", 25*mm, y, w)
    y = draw_field(c, "Profit After Tax", f"₹{random.randint(-5,30)*1000000:,.0f}", 25*mm, y, w)
    y = draw_field(c, "Auditor Opinion", random.choice(["Unqualified", "Qualified", "Adverse"]), 25*mm, y, w)
    y = draw_field(c, "Compliance Status", "", 25*mm, y, w)
    actual_status = status if net_worth > 0 else "FLAGGED"
    y = draw_status_badge(c, actual_status, 25*mm, y + 8*mm)
    if actual_status == "FLAGGED":
        y = draw_field(c, "Flag", "Negative net worth detected — does not meet minimum financial eligibility", 25*mm, y, w)
    draw_hash_footer(c, doc_id, w, 30*mm)

def gen_ca_turnover(c, vendor, person, idx, w, h):
    doc_id = f"CA-{idx:03d}-{vendor[4]}"
    status = "COMPLIANT" if idx % 3 != 0 else "FLAGGED"
    fy = random.randint(2022, 2025)
    turnover = random.randint(20, 300) * 1000000
    y = draw_header(c, "Chartered Accountant Turnover Certificate", "Issued under the Chartered Accountants Act, 1949", w, h - 25*mm)
    y = draw_field(c, "Firm Name", vendor[0], 25*mm, y, w)
    y = draw_field(c, "CA Firm", f"{random.choice(['Sharma','Gupta','Patel','Mehta'])} & Associates, Chartered Accountants", 25*mm, y, w)
    y = draw_field(c, "ICAI Membership No.", f"M-{random.randint(100000, 999999)}", 25*mm, y, w)
    y = draw_field(c, f"Annual Turnover FY {fy}-{str(fy+1)[-2:]}", f"₹{turnover:,.0f}", 25*mm, y, w)
    y = draw_field(c, f"Annual Turnover FY {fy-1}-{str(fy)[-2:]}", f"₹{random.randint(20,300)*1000000:,.0f}", 25*mm, y, w)
    y = draw_field(c, f"Annual Turnover FY {fy-2}-{str(fy-1)[-2:]}", f"₹{random.randint(20,300)*1000000:,.0f}", 25*mm, y, w)
    y = draw_field(c, "Threshold Compliance", "", 25*mm, y, w)
    y = draw_status_badge(c, status, 25*mm, y + 8*mm)
    if status == "FLAGGED":
        y = draw_field(c, "Issue", "Turnover figures contradict balance sheet revenue — arithmetic inconsistency", 25*mm, y, w)
    draw_hash_footer(c, doc_id, w, 30*mm)

def gen_udyam(c, vendor, person, idx, w, h):
    doc_id = f"UDYAM-{idx:03d}-{vendor[3]}"
    status = "ACTIVE" if idx % 5 != 0 else "FLAGGED"
    y = draw_header(c, "Udyam Registration Certificate", "Ministry of MSME, Government of India", w, h - 25*mm)
    y = draw_field(c, "Udyam Registration Number", vendor[3], 25*mm, y, w)
    y = draw_field(c, "Enterprise Name", vendor[0], 25*mm, y, w)
    y = draw_field(c, "Enterprise Type", random.choice(["Micro", "Small", "Medium"]), 25*mm, y, w)
    y = draw_field(c, "Category", random.choice(["Manufacturing", "Services"]), 25*mm, y, w)
    y = draw_field(c, "Date of Registration", f"{random.randint(1,28):02d}-{random.randint(1,12):02d}-{random.randint(2020,2025)}", 25*mm, y, w)
    y = draw_field(c, "Investment in Plant & Machinery", f"₹{random.randint(10,500)*100000:,.0f}", 25*mm, y, w)
    y = draw_field(c, "Annual Turnover", f"₹{random.randint(50,2500)*100000:,.0f}", 25*mm, y, w)
    y = draw_field(c, "Registration Status", "", 25*mm, y, w)
    y = draw_status_badge(c, status, 25*mm, y + 8*mm)
    if status == "FLAGGED":
        y = draw_field(c, "Flag", "Udyam registration validity lapsed — renewal pending", 25*mm, y, w)
    draw_hash_footer(c, doc_id, w, 30*mm)

def gen_experience(c, vendor, person, idx, w, h):
    doc_id = f"EXP-{idx:03d}-{vendor[4]}"
    status = "VERIFIED" if idx % 4 != 0 else "FLAGGED"
    y = draw_header(c, "Experience / Work Order Certificate", f"Issued by {random.choice(['Central Water Commission','ONGC','Indian Railways','NTPC','BHEL','GAIL'])}", w, h - 25*mm)
    y = draw_field(c, "Vendor", vendor[0], 25*mm, y, w)
    y = draw_field(c, "Work Order No.", f"WO/{random.randint(2018,2025)}/{random.randint(1000,9999)}", 25*mm, y, w)
    y = draw_field(c, "Project Description", f"Supply of {random.choice(['industrial pumps','valves','flow meters','pressure gauges'])} for {random.choice(['Phase-I','Phase-II','Expansion','Maintenance'])}", 25*mm, y, w)
    y = draw_field(c, "Contract Value", f"₹{random.randint(10,100)*1000000:,.0f}", 25*mm, y, w)
    y = draw_field(c, "Completion Date", f"{random.randint(1,28):02d}-{random.randint(1,12):02d}-{random.randint(2020,2025)}", 25*mm, y, w)
    y = draw_field(c, "Performance Rating", f"{random.choice(['Excellent','Good','Satisfactory'])}", 25*mm, y, w)
    y = draw_field(c, "Verification Status", "", 25*mm, y, w)
    y = draw_status_badge(c, status, 25*mm, y + 8*mm)
    if status == "FLAGGED":
        y = draw_field(c, "Issue", "Work order issuing authority could not be independently verified", 25*mm, y, w)
    draw_hash_footer(c, doc_id, w, 30*mm)

def gen_technical(c, vendor, person, idx, w, h):
    doc_id = f"TECH-{idx:03d}-{vendor[4]}"
    status = "COMPLIANT" if idx % 3 != 0 else "FLAGGED"
    y = draw_header(c, "Technical Specification Compliance Report", "GeM AI Compliance Verification Engine", w, h - 25*mm)
    y = draw_field(c, "Vendor", vendor[0], 25*mm, y, w)
    y = draw_field(c, "Product Category", random.choice(["Centrifugal Pumps","Gate Valves","Flow Meters","Pressure Transmitters","Heat Exchangers"]), 25*mm, y, w)

    specs = [
        (f"Efficiency", f"{random.randint(78,95)}%", "≥ 85%"),
        (f"Capacity", f"{random.randint(500,1200)} units/day", "≥ 800 units/day"),
        (f"Operating Pressure", f"{random.randint(6,15)} Bar", "≥ 10 Bar"),
        (f"NPSH Required", f"{random.randint(3,9)}m", "≤ 6m"),
    ]

    y = draw_field(c, "Technical Parameters", "", 25*mm, y, w)
    for spec_name, actual, required in specs:
        c.setFont("Helvetica", 8)
        c.setFillColor(HexColor("#475569"))
        c.drawString(30*mm, y + 3*mm, f"• {spec_name}: {actual} (Required: {required})")
        y -= 5*mm

    y -= 3*mm
    y = draw_field(c, "Overall Technical Compliance", "", 25*mm, y, w)
    y = draw_status_badge(c, status, 25*mm, y + 8*mm)
    if status == "FLAGGED":
        y = draw_field(c, "Non-Compliance", "One or more technical parameters below tender specification threshold", 25*mm, y, w)
    draw_hash_footer(c, doc_id, w, 30*mm)


GENERATORS = [gen_aadhaar, gen_pan, gen_gst, gen_iso, gen_bank_guarantee,
              gen_balance_sheet, gen_ca_turnover, gen_udyam, gen_experience, gen_technical]


def main():
    total = 0
    for cat_idx, (folder_name, cat_label) in enumerate(CATEGORIES):
        folder_path = os.path.join(BASE_DIR, folder_name)
        os.makedirs(folder_path, exist_ok=True)

        gen_fn = GENERATORS[cat_idx]

        for doc_idx in range(10):
            vendor = VENDORS[doc_idx % len(VENDORS)]
            person = PERSONS[doc_idx % len(PERSONS)]

            status_tag = "valid" if doc_idx % 3 != 0 else "flagged"
            filename = f"{folder_name[3:]}_{vendor[0].lower().replace(' ', '_').replace('&', 'and')[:20]}_{status_tag}_{doc_idx+1:02d}.pdf"
            filepath = os.path.join(folder_path, filename)

            w, h = A4
            c_pdf = canvas.Canvas(filepath, pagesize=A4)
            c_pdf.setTitle(f"{cat_label} - {vendor[0]}")
            c_pdf.setAuthor("GeM AI Compliance Platform")
            c_pdf.setSubject(f"SIH26100 Demo Document - {cat_label}")

            gen_fn(c_pdf, vendor, person, doc_idx + 1, w, h)
            c_pdf.save()
            total += 1
            print(f"  [{total:3d}/100] {folder_name}/{filename}")

    print(f"\n✅ Generated {total} demo compliance PDFs in {BASE_DIR}")


if __name__ == "__main__":
    main()
