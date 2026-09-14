import pymupdf
import os

out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "public", "demo_docs"))
os.makedirs(out_dir, exist_ok=True)

def make_pdf(filename, title, content_lines, metadata):
    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((50, 60), title, fontsize=14)
    y = 90
    for line in content_lines:
        page.insert_text((50, y), line, fontsize=10)
        y += 20
    doc.set_metadata(metadata)
    path = os.path.join(out_dir, filename)
    doc.save(path)
    doc.close()
    print(f"Created {path}")

# 1. St. John Balance Sheet
make_pdf(
    "balance_sheet_stjohn_audited.pdf",
    "St. John Technologies Ltd - Audited Financial Statements FY 2024-25",
    [
        "CIN: U72200MH2018PLC312456 | Registered under Companies Act, 2013",
        "Audited Balance Sheet as at March 31, 2025",
        "Annual Turnover (FY 2024-25): INR 128.50 Crores",
        "Annual Turnover (FY 2023-24): INR 114.20 Crores",
        "Annual Turnover (FY 2022-23): INR 102.80 Crores",
        "Net Worth: INR 48.60 Crores (Positive)",
        "Statutory Auditor: M/s Joshi & Deshmukh Chartered Accountants"
    ],
    {"author": "St. John Technologies Ltd", "producer": "Adobe Acrobat Pro 2025", "creationDate": "D:20250620100000", "modDate": "D:20250620103000"}
)

# 2. St. John GST Registration
make_pdf(
    "gst_reg06_stjohn_tech_valid.pdf",
    "Government of India - Form GST REG-06 Registration Certificate",
    [
        "Registration Number (GSTIN): 27AAACS1234F1Z8",
        "Legal Name: St. John Technologies Ltd",
        "Trade Name: St. John Technologies Ltd",
        "Constitution of Business: Public Limited Company",
        "Principal Place of Business: Tech Park 4, Hinjewadi Phase 2, Pune - 411057",
        "Date of Liability: 01/07/2018 | Period of Validity: Regular"
    ],
    {"author": "Goods and Services Tax Network", "producer": "GSTN Portal Engine", "creationDate": "D:20180701090000", "modDate": "D:20240101090000"}
)

# 3. St. John PAN
make_pdf(
    "pan_stjohn_tech_valid.pdf",
    "Income Tax Department, Government of India - Permanent Account Number",
    [
        "Permanent Account Number: AAACS1234F",
        "Name: ST. JOHN TECHNOLOGIES LTD",
        "Date of Incorporation: 14/03/2018",
        "Category: Company"
    ],
    {"author": "Income Tax Department", "producer": "NSDL e-Gov", "creationDate": "D:20180314100000", "modDate": "D:20180314100000"}
)

# 4. St. John ISO 9001
make_pdf(
    "iso9001_stjohn_valid.pdf",
    "Quality Management System Certificate - ISO 9001:2015",
    [
        "Certificate No: QMS-IND-2024-8871",
        "Issued to: St. John Technologies Ltd",
        "Scope: Design, Development, and Integration of Automation & Monitoring Systems",
        "Valid From: 15-Jan-2024 | Expiry Date: 14-Jan-2027",
        "Accreditation: NABCB / IAF MLA Signatory"
    ],
    {"author": "International Quality Certification Authority", "producer": "CertPDF v2", "creationDate": "D:20240115110000", "modDate": "D:20240115110000"}
)

# 5. St. John CA Turnover Certificate
make_pdf(
    "ca_turnover_stjohn_compliant.pdf",
    "Chartered Accountant Certificate - Annual Financial Turnover",
    [
        "To Whom It May Concern",
        "This is to certify that M/s St. John Technologies Ltd (GSTIN: 27AAACS1234F1Z8)",
        "has achieved the following annual turnover based on verified books of account:",
        "FY 2024-25: INR 128.50 Crores",
        "FY 2023-24: INR 114.20 Crores",
        "FY 2022-23: INR 102.80 Crores",
        "Average Annual Turnover: INR 115.17 Crores",
        "UDIN: 25123456AAAAAB9876 | Signing Date: 15-May-2025"
    ],
    {"author": "CA S. M. Deshmukh", "producer": "ICAI Document Generator", "creationDate": "D:20250515140000", "modDate": "D:20250515140000"}
)

print("All St. John Technologies demo documents successfully generated.")
