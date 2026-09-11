"""
Contradiction Detection Engine — Full Implementation
Detects conflicting values for the same fact across different documents.
Example: Datasheet says 800 units/day, Brochure says 500 units/day.
"""
import re
from typing import List, Dict, Any, Tuple
from app.schemas.compliance import ExtractedEvidence, ContradictionFlag
import uuid


class ContradictionDetectionEngine:

    # Tolerance for numeric contradiction: values must differ by > this % to be flagged
    TOLERANCE_PERCENT = 5.0

    @staticmethod
    def detect_contradictions(bid_id: str, evidences: List[ExtractedEvidence]) -> List[ContradictionFlag]:
        """
        Scans evidence items from multiple documents and flags conflicting numeric values.
        Groups evidence by requirement_id, then compares values from different documents.
        """
        flags = []

        # Group evidences by requirement_id
        by_requirement: Dict[str, List[ExtractedEvidence]] = {}
        for ev in evidences:
            req_id = ev.requirement_id or "UNKNOWN"
            if req_id not in by_requirement:
                by_requirement[req_id] = []
            by_requirement[req_id].append(ev)

        for req_id, req_evidences in by_requirement.items():
            # Only check for contradictions when we have evidence from multiple documents
            docs = {}
            for ev in req_evidences:
                doc_key = ev.document_name or ev.document_id
                if doc_key not in docs:
                    docs[doc_key] = []
                docs[doc_key].append(ev)

            if len(docs) < 2:
                continue  # Need at least 2 documents to have a contradiction

            # Compare numeric values across documents
            numeric_by_doc = {
                doc: [e.extracted_value for e in evs if isinstance(e.extracted_value, (int, float))]
                for doc, evs in docs.items()
            }

            doc_names = list(numeric_by_doc.keys())
            for i in range(len(doc_names)):
                for j in range(i + 1, len(doc_names)):
                    doc_a, doc_b = doc_names[i], doc_names[j]
                    vals_a = numeric_by_doc[doc_a]
                    vals_b = numeric_by_doc[doc_b]

                    if not vals_a or not vals_b:
                        continue

                    # Compare representative values (use max to be conservative)
                    val_a = max(vals_a)
                    val_b = max(vals_b)

                    if val_a == 0 and val_b == 0:
                        continue

                    denom = max(abs(val_a), abs(val_b))
                    diff_percent = abs(val_a - val_b) / denom * 100

                    if diff_percent > ContradictionDetectionEngine.TOLERANCE_PERCENT:
                        evidence_a = next((e for e in docs[doc_a] if isinstance(e.extracted_value, (int, float))), None)
                        evidence_b = next((e for e in docs[doc_b] if isinstance(e.extracted_value, (int, float))), None)

                        flag = ContradictionFlag(
                            flag_id=f"CONTR-{uuid.uuid4().hex[:8]}",
                            bid_id=bid_id,
                            requirement_id=req_id,
                            document_a=doc_a,
                            document_b=doc_b,
                            value_a=val_a,
                            value_b=val_b,
                            page_a=evidence_a.page if evidence_a else None,
                            page_b=evidence_b.page if evidence_b else None,
                            description=(
                                f"CONTRADICTION: '{doc_a}' states {val_a} but '{doc_b}' states {val_b} "
                                f"for the same fact (difference: {diff_percent:.1f}%). "
                                f"Human reviewer must determine which document is authoritative."
                            ),
                            severity="HIGH" if diff_percent > 20 else "MEDIUM",
                        )
                        flags.append(flag)

        # Also detect text-level contradictions for document presence
        flags.extend(ContradictionDetectionEngine._detect_date_contradictions(bid_id, evidences))

        return flags

    @staticmethod
    def _detect_date_contradictions(bid_id: str, evidences: List[ExtractedEvidence]) -> List[ContradictionFlag]:
        """Detect contradictory date claims across documents (e.g. different incorporation years)."""
        flags = []
        year_pattern = re.compile(r'\b(19|20)\d{2}\b')
        year_by_topic: Dict[str, Dict[str, List[int]]] = {}

        for ev in evidences:
            if not ev.raw_snippet:
                continue
            text_lower = ev.raw_snippet.lower()

            # Check incorporation / establishment year
            if any(kw in text_lower for kw in ["incorporated", "established", "founded", "year of incorporation"]):
                years = [int(y) for y in year_pattern.findall(ev.raw_snippet) if 1950 <= int(y) <= 2025]
                if years:
                    topic = "incorporation_year"
                    if topic not in year_by_topic:
                        year_by_topic[topic] = {}
                    doc = ev.document_name or ev.document_id
                    year_by_topic[topic][doc] = years

        for topic, doc_years in year_by_topic.items():
            if len(doc_years) < 2:
                continue
            all_years = [(doc, min(years)) for doc, years in doc_years.items()]
            if len(set(y for _, y in all_years)) > 1:
                docs = [d for d, _ in all_years]
                years = [y for _, y in all_years]
                flag = ContradictionFlag(
                    flag_id=f"CONTR-DATE-{uuid.uuid4().hex[:8]}",
                    bid_id=bid_id,
                    requirement_id="GENERAL",
                    document_a=docs[0],
                    document_b=docs[1] if len(docs) > 1 else docs[0],
                    value_a=float(years[0]),
                    value_b=float(years[1]) if len(years) > 1 else float(years[0]),
                    page_a=None,
                    page_b=None,
                    description=f"Conflicting {topic.replace('_', ' ')} across documents: {dict(zip(docs, years))}",
                    severity="HIGH",
                )
                flags.append(flag)

        return flags
