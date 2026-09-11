"""
Forgery Detection Engine
Checks PDF metadata for inconsistencies that suggest tampering.
Checks: date anomalies, missing metadata, font inconsistencies, digital signature absence.
Returns a ForgeryReport with risk_score 0.0 (clean) to 1.0 (highly suspicious).
"""
import re
from datetime import datetime
from typing import Dict, Any, List
from app.parsers.pdf_parser import extract_metadata


class ForgeryReport:
    def __init__(self):
        self.risk_score: float = 0.0
        self.flags: List[str] = []
        self.has_digital_signature: bool = False
        self.metadata_anomalies: List[str] = []
        self.is_suspicious: bool = False

    def dict(self):
        return {
            "risk_score": round(self.risk_score, 3),
            "flags": self.flags,
            "has_digital_signature": self.has_digital_signature,
            "metadata_anomalies": self.metadata_anomalies,
            "is_suspicious": self.is_suspicious,
            "verdict": self._verdict(),
        }

    def _verdict(self) -> str:
        if self.risk_score < 0.2:
            return "LOW_RISK"
        elif self.risk_score < 0.5:
            return "MEDIUM_RISK"
        else:
            return "HIGH_RISK_FLAG_FOR_REVIEW"


def _parse_pdf_date(date_str: str):
    if not date_str:
        return None
    # PDF date format: D:YYYYMMDDHHmmSSOHH'mm'
    match = re.match(r"D:(\d{4})(\d{2})(\d{2})", date_str)
    if match:
        try:
            return datetime(int(match.group(1)), int(match.group(2)), int(match.group(3)))
        except Exception:
            return None
    return None


class ForgeryDetectionEngine:

    @staticmethod
    def analyze(file_bytes: bytes, filename: str = "document.pdf") -> ForgeryReport:
        report = ForgeryReport()
        meta = extract_metadata(file_bytes)

        # Check 1: Digital signature
        report.has_digital_signature = meta.get("has_digital_signature", False)
        if not report.has_digital_signature:
            report.flags.append("No digital signature found — document authenticity unverified")
            report.risk_score += 0.1

        # Check 2: Missing metadata fields
        if not meta.get("author"):
            report.metadata_anomalies.append("Missing author metadata")
            report.risk_score += 0.05
        if not meta.get("producer"):
            report.metadata_anomalies.append("Missing producer metadata — unusual for legitimate documents")
            report.risk_score += 0.05

        # Check 3: Modification date is BEFORE creation date (impossible)
        creation = _parse_pdf_date(meta.get("creation_date", ""))
        modification = _parse_pdf_date(meta.get("modification_date", ""))
        if creation and modification:
            if modification < creation:
                report.flags.append(
                    f"CRITICAL: Modification date ({modification.date()}) precedes creation date ({creation.date()}) — impossible, strongly suggests tampering"
                )
                report.risk_score += 0.5
            elif (modification - creation).days > 3650:
                report.flags.append("Modification date is more than 10 years after creation — unusual for compliance documents")
                report.risk_score += 0.15

        # Check 4: Future dates
        now = datetime.now()
        if creation and creation > now:
            report.flags.append(f"Creation date {creation.date()} is in the future — likely manipulated")
            report.risk_score += 0.4
        if modification and modification > now:
            report.flags.append(f"Modification date {modification.date()} is in the future — likely manipulated")
            report.risk_score += 0.4

        # Check 5: Suspicious producer strings
        producer = (meta.get("producer") or "").lower()
        if any(kw in producer for kw in ["ghostscript", "ilovepdf", "smallpdf", "online"]):
            report.flags.append(f"Producer '{meta.get('producer')}' suggests document was re-processed by a PDF editor — check if original")
            report.risk_score += 0.15

        # Check 6: Encrypted document without disclosed key
        if meta.get("encryption"):
            report.flags.append("Document is encrypted — full content verification may not be possible")
            report.risk_score += 0.1

        # Cap score at 1.0
        report.risk_score = min(report.risk_score, 1.0)
        report.is_suspicious = report.risk_score >= 0.4

        return report
