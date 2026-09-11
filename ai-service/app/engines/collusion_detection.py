"""
Collusion Signal Detection Engine
Detects shared identifiers across bids filed under different company names.
IMPORTANT: This engine only flags for human investigation — it never makes accusations.
Flags: shared bank account, address, contact, director names, registration numbers.
"""
import re
from typing import List, Dict, Any
from dataclasses import dataclass, field


@dataclass
class CollusionSignal:
    signal_type: str        # e.g. "SHARED_BANK_ACCOUNT"
    shared_value: str       # the actual shared identifier (masked for display)
    bid_ids: List[str]      # bids where this was found
    company_names: List[str]
    severity: str           # LOW / MEDIUM / HIGH
    description: str
    action_required: str = "REFER_TO_HUMAN_INVESTIGATOR"

    def dict(self):
        return {
            "signal_type": self.signal_type,
            "shared_value": self._mask(self.shared_value),
            "bid_ids": self.bid_ids,
            "company_names": self.company_names,
            "severity": self.severity,
            "description": self.description,
            "action_required": self.action_required,
            "disclaimer": "This is a flag for human investigation only — not an automated determination of collusion."
        }

    def _mask(self, value: str) -> str:
        """Partially mask sensitive identifiers in the UI."""
        if len(value) > 6:
            return value[:3] + "***" + value[-3:]
        return value[:2] + "***"


class CollusionDetectionEngine:

    # Patterns to extract identifiers from document text
    BANK_ACCOUNT_RE = re.compile(r'\b(\d{9,18})\b')
    IFSC_RE = re.compile(r'\b([A-Z]{4}0[A-Z0-9]{6})\b')
    PHONE_RE = re.compile(r'\b(\+?91[-\s]?)?([6-9]\d{9})\b')
    EMAIL_RE = re.compile(r'\b([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})\b')
    GST_RE = re.compile(r'\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b')
    PAN_RE = re.compile(r'\b([A-Z]{5}[0-9]{4}[A-Z]{1})\b')
    PIN_RE = re.compile(r'\b([1-9][0-9]{5})\b')  # Indian PIN codes

    @staticmethod
    def extract_identifiers(text: str) -> Dict[str, List[str]]:
        """Extract all identifiers from document text."""
        return {
            "bank_account": list(set(CollusionDetectionEngine.BANK_ACCOUNT_RE.findall(text))),
            "ifsc": list(set(CollusionDetectionEngine.IFSC_RE.findall(text))),
            "phone": list(set(["".join(m) for m in CollusionDetectionEngine.PHONE_RE.findall(text)])),
            "email": list(set([m.lower() for m in CollusionDetectionEngine.EMAIL_RE.findall(text)])),
            "gstin": list(set(CollusionDetectionEngine.GST_RE.findall(text))),
            "pan": list(set(CollusionDetectionEngine.PAN_RE.findall(text))),
            "pin_code": list(set(CollusionDetectionEngine.PIN_RE.findall(text))),
        }

    @staticmethod
    def detect(bid_profiles: List[Dict[str, Any]]) -> List[CollusionSignal]:
        """
        Detect shared identifiers across multiple bid profiles.
        Each profile: { bid_id, company_name, document_text }
        """
        signals = []
        identifier_index: Dict[str, Dict[str, List[str]]] = {}
        # identifier_index[id_type][value] = [bid_id, ...]

        for profile in bid_profiles:
            bid_id = profile.get("bid_id", "UNKNOWN")
            company = profile.get("company_name", "Unknown Company")
            text = profile.get("document_text", "")
            identifiers = CollusionDetectionEngine.extract_identifiers(text)

            for id_type, values in identifiers.items():
                if id_type not in identifier_index:
                    identifier_index[id_type] = {}
                for val in values:
                    if val not in identifier_index[id_type]:
                        identifier_index[id_type][val] = []
                    identifier_index[id_type][val].append((bid_id, company))

        # Now find any identifier shared across different companies
        SEVERITY_MAP = {
            "bank_account": "HIGH",
            "ifsc": "MEDIUM",
            "gstin": "HIGH",  # GST should be unique per company
            "pan": "HIGH",    # PAN should be unique per company
            "phone": "MEDIUM",
            "email": "MEDIUM",
            "pin_code": "LOW",
        }

        for id_type, value_map in identifier_index.items():
            for val, bid_list in value_map.items():
                # Check if same value appears across different companies
                companies = list(set([b[1] for b in bid_list]))
                bid_ids = list(set([b[0] for b in bid_list]))
                if len(companies) > 1:
                    severity = SEVERITY_MAP.get(id_type, "LOW")
                    signal = CollusionSignal(
                        signal_type=f"SHARED_{id_type.upper()}",
                        shared_value=val,
                        bid_ids=bid_ids,
                        company_names=companies,
                        severity=severity,
                        description=f"Shared {id_type.replace('_', ' ')} identifier detected across {len(companies)} different company names. Bids: {', '.join(bid_ids)}.",
                    )
                    signals.append(signal)

        # Sort by severity
        severity_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
        signals.sort(key=lambda s: severity_order.get(s.severity, 3))
        return signals
