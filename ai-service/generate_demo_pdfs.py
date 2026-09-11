import os
import pymupdf

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "demo_docs")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def create_tender_notice():
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842)

    page.insert_text((50, 60), "GOVERNMENT OF INDIA - MINISTRY OF JAL SHAKTI", fontsize=12, fontname="helv", color=(0.1, 0.2, 0.5))
    page.insert_text((50, 80), "CENTRAL WATER COMMISSION - PROCUREMENT DIVISION", fontsize=10, fontname="helv")
    page.insert_text((50, 105), "NOTICE INVITING TENDER (NIT)", fontsize=16, fontname="helv")
    page.insert_text((50, 125), "Tender Ref: GEM/2026/B/90124 | ID: TND-PUMP-001", fontsize=10, fontname="courier")
    page.insert_text((50, 145), "Closing Date: 15-September-2026 | Estimated Value: Rs. 5.00 Crore", fontsize=10, fontname="helv")

    text = (
        "1. SCOPE OF PROCUREMENT:\n"
        "Supply, Installation, and Commissioning of Heavy-Duty Centrifugal Industrial Water Pumps.\n\n"
        "2. MANDATORY REQUIREMENTS & SPECIFICATIONS:\n"
        "• REQ-P001 (Financial): Bidder must have minimum Rs.100 crore annual turnover for each of the "
        "previous 3 financial years (FY 2022-23, FY 2023-24, FY 2024-25).\n"
        "• REQ-P002 (Eligibility): Valid GST Registration Certificate and PAN Card must be submitted.\n"
        "• REQ-P003 (Technical): Pump operational efficiency shall not be less than 85%.\n"
        "• REQ-P004 (Technical): Pump production capacity minimum 800 units per day.\n"
        "• REQ-P005 (Experience): Minimum 5 years of experience supplying to government entities.\n"
        "• REQ-P006 (Certification): ISO 9001:2015 Quality Management Certificate required. "
        "Certificate must be valid on the date of bid submission (2026-09-15).\n"
        "• REQ-P007 (Technical): Operating pressure rating must be at least 10 Bar.\n\n"
        "3. SUBMISSION GUIDELINES:\n"
        "All bids must be uploaded with verifiable citations and audited supporting documentation."
    )
    page.insert_textbox(pymupdf.Rect(50, 170, 545, 800), text, fontsize=10, fontname="helv")

    path = os.path.join(OUTPUT_DIR, "TND-PUMP-001_Tender_Notice.pdf")
    doc.save(path)
    doc.close()
    print(f"Generated: {path}")


def create_technical_datasheet():
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842)

    page.insert_text((50, 60), "APEX PUMPS & MOTORS PRIVATE LIMITED", fontsize=14, fontname="helv", color=(0.1, 0.4, 0.2))
    page.insert_text((50, 80), "TECHNICAL COMPLIANCE DATASHEET - MODEL: APX-5000", fontsize=11, fontname="helv")
    page.insert_text((50, 100), "Submitted for GeM Bid Ref: GEM/2026/B/90124", fontsize=9, fontname="courier")

    content = (
        "SPECIFICATION SHEET & LABORATORY TEST RESULTS:\n\n"
        "1. Pump Operational Efficiency: 88.4% at rated duty point (tested as per IS 1710).\n"
        "2. Pump Production Capacity: 800 units per day at Pune manufacturing facility.\n"
        "3. Operating Pressure Rating: 155 PSI (Equivalent to 10.69 Bar maximum continuous operating pressure).\n"
        "4. Motor Rating: 7.5 HP (5.5 kW), 415 V, 50 Hz, 3-Phase Squirrel Cage Induction Motor.\n"
        "5. Rated Discharge Capacity: 520 LPM at 40 meters head.\n"
        "6. Net Positive Suction Head (NPSHR): 4.8 meters.\n\n"
        "Authorized Signatory:\n"
        "Chief Technical Officer\n"
        "Apex Pumps & Motors Pvt Ltd"
    )
    page.insert_textbox(pymupdf.Rect(50, 130, 545, 800), content, fontsize=10, fontname="helv")

    path = os.path.join(OUTPUT_DIR, "Apex_Pumps_Technical_Datasheet.pdf")
    doc.save(path)
    doc.close()
    print(f"Generated: {path}")


def create_audited_balance_sheet():
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842)

    page.insert_text((50, 60), "STATUTORY AUDITORS REPORT & ANNUAL ACCOUNTS", fontsize=12, fontname="helv")
    page.insert_text((50, 80), "M/S APEX PUMPS & MOTORS PVT LTD | CIN: U29100MH2012PTC234567", fontsize=9, fontname="helv")
    page.insert_text((50, 110), "FINANCIAL STATEMENT EXTRACTS - REVENUE FROM OPERATIONS", fontsize=11, fontname="helv")

    content = (
        "Extract of Audited Financials for the preceding three financial years:\n\n"
        "• Financial Year 2022-2023:\n"
        "  Revenue from Operations: Rs. 112.40 Crore (Compliant)\n\n"
        "• Financial Year 2023-2024:\n"
        "  Revenue from Operations: Rs. 127.80 Crore (Compliant)\n\n"
        "• Financial Year 2024-2025:\n"
        "  Revenue from Operations: Rs. 94.20 Crore (Deficit against Rs. 100 Cr threshold)\n\n"
        "Total 3-Year Average Revenue: Rs. 111.46 Crore\n"
        "Annual Average Requirement: Minimum Rs. 100 Crore in each year.\n\n"
        "Audited by: R.K. Associates & Co., Chartered Accountants\n"
        "FRN: 104523W | UDIN: 25104523AAAAAB1234"
    )
    page.insert_textbox(pymupdf.Rect(50, 140, 545, 800), content, fontsize=10, fontname="helv")

    path = os.path.join(OUTPUT_DIR, "Apex_Audited_Balance_Sheet_FY25.pdf")
    doc.save(path)
    doc.close()
    print(f"Generated: {path}")


def create_ca_certificate():
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842)

    page.insert_text((50, 60), "R.K. ASSOCIATES & CO. - CHARTERED ACCOUNTANTS", fontsize=12, fontname="helv", color=(0.5, 0.1, 0.1))
    page.insert_text((50, 80), "TO WHOMSOEVER IT MAY CONCERN", fontsize=11, fontname="helv")
    page.insert_text((50, 110), "ANNUAL TURNOVER COMPLIANCE CERTIFICATE", fontsize=12, fontname="helv")

    content = (
        "This is to certify that M/s Apex Pumps & Motors Pvt Ltd has achieved the following "
        "turnover figures from industrial water equipment:\n\n"
        "1. FY 2022-23: Rs. 112.40 Crore\n"
        "2. FY 2023-24: Rs. 127.80 Crore\n"
        "3. FY 2024-25: Rs. 110.00 Crore (CONTRADICTION with Audited Balance Sheet)\n\n"
        "Average Annual Turnover: Rs. 116.73 Crore.\n"
        "We certify that the bidder complies with the turnover eligibility.\n\n"
        "Signed & Sealed:\n"
        "Partner, R.K. Associates & Co.\n"
        "Membership No: 045129"
    )
    page.insert_textbox(pymupdf.Rect(50, 140, 545, 800), content, fontsize=10, fontname="helv")

    path = os.path.join(OUTPUT_DIR, "Apex_CA_Turnover_Certificate.pdf")
    doc.save(path)
    doc.close()
    print(f"Generated: {path}")


def create_iso_certificate():
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842)

    page.insert_text((50, 60), "INTERNATIONAL ACCREDITATION SERVICES", fontsize=12, fontname="helv")
    page.insert_text((50, 85), "CERTIFICATE OF REGISTRATION - ISO 9001:2015", fontsize=14, fontname="helv", color=(0.1, 0.2, 0.6))

    content = (
        "This certifies that the Quality Management System of:\n\n"
        "APEX PUMPS & MOTORS PRIVATE LIMITED\n"
        "Plot No. 42, MIDC Industrial Area, Bhosari, Pune - 411026\n\n"
        "has been audited and found to meet the requirements of ISO 9001:2015.\n\n"
        "Certificate Number: QMS-IND-2023-9091\n"
        "Date of Original Issue: 01-August-2023\n"
        "Date of Expiry: 31-July-2026 (EXPIRED before bid closing 15-September-2026)\n\n"
        "Status: EXPIRED\n"
        "Registrar Signature & Seal"
    )
    page.insert_textbox(pymupdf.Rect(50, 130, 545, 800), content, fontsize=10, fontname="helv")

    path = os.path.join(OUTPUT_DIR, "Apex_ISO_9001_Certificate.pdf")
    doc.save(path)
    doc.close()
    print(f"Generated: {path}")


if __name__ == "__main__":
    create_tender_notice()
    create_technical_datasheet()
    create_audited_balance_sheet()
    create_ca_certificate()
    create_iso_certificate()
    print("All demo synthetic documents generated successfully!")
