"""
Forgery Detection Unit and Fixture Tests
Verifies that PyMuPDF metadata analysis correctly identifies tampered PDF artifacts.
"""
import pytest
import pymupdf
from app.engines.forgery_detection import ForgeryDetectionEngine


def test_clean_pdf_analysis():
    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((50, 72), "Official Ministry of Petroleum & Natural Gas Statutory Document")
    doc.set_metadata({
        "author": "Government of India GeM Authority",
        "producer": "Adobe Acrobat Pro DC 2025",
        "creationDate": "D:20250110100000",
        "modDate": "D:20250112100000"
    })
    clean_bytes = doc.tobytes()
    doc.close()

    report = ForgeryDetectionEngine.analyze(clean_bytes, "clean_certificate.pdf")
    # Clean doc with author, valid dates, legitimate producer, only missing sig (+0.1)
    assert report.risk_score < 0.3
    assert report.is_suspicious is False
    assert report._verdict() in ["LOW_RISK", "MEDIUM_RISK"]


def test_tampered_pdf_inverted_dates_and_suspicious_producer():
    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((50, 72), "Manipulated CA Turnover Certificate")
    # Anomaly: modDate is 2023, creationDate is 2026 (impossible timeline)
    # Anomaly: producer is online editing tool
    doc.set_metadata({
        "author": "",
        "producer": "ilovepdf online editor v4",
        "creationDate": "D:20260515120000",
        "modDate": "D:20230101120000"
    })
    tampered_bytes = doc.tobytes()
    doc.close()

    report = ForgeryDetectionEngine.analyze(tampered_bytes, "tampered_certificate.pdf")
    assert report.risk_score >= 0.5
    assert report.is_suspicious is True
    assert report._verdict() == "HIGH_RISK_FLAG_FOR_REVIEW"
    assert any("precedes creation date" in f for f in report.flags)
    assert any("ilovepdf" in f for f in report.flags)


def test_future_creation_date():
    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((50, 72), "Document with future creation date")
    doc.set_metadata({
        "author": "Apex Pumps",
        "producer": "Standard PDF Tool",
        "creationDate": "D:20990101120000",
        "modDate": "D:20990102120000"
    })
    future_bytes = doc.tobytes()
    doc.close()

    report = ForgeryDetectionEngine.analyze(future_bytes, "future_doc.pdf")
    assert report.is_suspicious is True
    assert any("in the future" in f for f in report.flags)
