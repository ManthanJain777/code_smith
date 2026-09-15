import uuid
from typing import List
from app.schemas.compliance import (
    ExtractedRequirement,
    ExtractedEvidence,
    ComplianceEvaluateResponse,
    ComplianceStatus,
    VerificationMethod,
    Citation,
    RequirementType
)


class ComplianceReasoningEngine:

    @staticmethod
    def evaluate(requirement: ExtractedRequirement, evidences: List[ExtractedEvidence], bid_id: str) -> ComplianceEvaluateResponse:
        result_id = f"RES-{uuid.uuid4().hex[:8]}"

        # Rule 1: No evidence available -> Return UNVERIFIED (Never invent evidence)
        if not evidences:
            return ComplianceEvaluateResponse(
                result_id=result_id,
                requirement_id=requirement.requirement_id,
                bid_id=bid_id,
                status=ComplianceStatus.UNVERIFIED,
                verification_method=VerificationMethod.DETERMINISTIC,
                reasoning="No evidence document or snippet found matching this requirement.",
                confidence=0.95,
                evidence_ids=[],
                citations=[]
            )

        citations = [
            Citation(
                document_id=e.document_id,
                document_name=e.document_name,
                page=e.page,
                evidence_id=e.evidence_id,
                snippet=e.raw_snippet
            ) for e in evidences
        ]
        evidence_ids = [e.evidence_id for e in evidences]

        # Rule 2: Numeric Threshold Verification (Deterministic)
        if requirement.type == RequirementType.NUMERIC_THRESHOLD and requirement.threshold is not None:
            extracted_numbers = [e.extracted_value for e in evidences if isinstance(e.extracted_value, (int, float))]

            if not extracted_numbers:
                return ComplianceEvaluateResponse(
                    result_id=result_id,
                    requirement_id=requirement.requirement_id,
                    bid_id=bid_id,
                    status=ComplianceStatus.UNVERIFIED,
                    verification_method=VerificationMethod.DETERMINISTIC,
                    reasoning=f"Evidence found but no valid numeric value could be extracted to compare against threshold {requirement.threshold} {requirement.unit or ''}.",
                    confidence=0.85,
                    evidence_ids=evidence_ids,
                    citations=citations
                )

            threshold = requirement.threshold
            operator = (requirement.operator or ">=").strip()
            norm_op = operator.lower()

            compliant_count = 0
            non_compliant_count = 0

            for val in extracted_numbers:
                # Direct or floating-point equality tolerance
                is_equal = abs(val - threshold) < 1e-5 or val == threshold

                if norm_op in (">=", "gte") and (val >= threshold or is_equal):
                    compliant_count += 1
                elif norm_op in (">", "gt") and val > threshold:
                    compliant_count += 1
                elif norm_op in ("<=", "lte") and (val <= threshold or is_equal):
                    compliant_count += 1
                elif norm_op in ("<", "lt") and val < threshold:
                    compliant_count += 1
                elif norm_op in ("==", "=", "eq", "equals") and is_equal:
                    compliant_count += 1
                elif is_equal and norm_op in ("==", "=", "eq"):
                    # Explicit equality guard before else
                    compliant_count += 1
                else:
                    non_compliant_count += 1

            if non_compliant_count > 0 and compliant_count == 0:
                status = ComplianceStatus.NON_COMPLIANT
                reason = f"Extracted value(s) {extracted_numbers} failed the requirement threshold ({operator} {threshold} {requirement.unit or ''})."
            elif non_compliant_count > 0 and compliant_count > 0:
                status = ComplianceStatus.PARTIALLY_COMPLIANT
                reason = f"Some extracted values satisfy the threshold ({operator} {threshold}) but others fall below required standard. Values: {extracted_numbers}."
            else:
                status = ComplianceStatus.COMPLIANT
                reason = f"Extracted value(s) {extracted_numbers} clearly satisfy the required threshold ({operator} {threshold} {requirement.unit or ''})."

            return ComplianceEvaluateResponse(
                result_id=result_id,
                requirement_id=requirement.requirement_id,
                bid_id=bid_id,
                status=status,
                verification_method=VerificationMethod.DETERMINISTIC,
                reasoning=reason,
                confidence=0.98,
                evidence_ids=evidence_ids,
                citations=citations
            )

        # Rule 3: Document Presence Verification (Deterministic)
        if requirement.type == RequirementType.DOCUMENT_PRESENCE:
            has_document = any(e.raw_snippet and len(e.raw_snippet.strip()) > 10 for e in evidences)
            if has_document:
                return ComplianceEvaluateResponse(
                    result_id=result_id,
                    requirement_id=requirement.requirement_id,
                    bid_id=bid_id,
                    status=ComplianceStatus.COMPLIANT,
                    verification_method=VerificationMethod.DETERMINISTIC,
                    reasoning=f"Required document '{requirement.text_raw}' is present and verified.",
                    confidence=0.99,
                    evidence_ids=evidence_ids,
                    citations=citations
                )
            else:
                return ComplianceEvaluateResponse(
                    result_id=result_id,
                    requirement_id=requirement.requirement_id,
                    bid_id=bid_id,
                    status=ComplianceStatus.NON_COMPLIANT,
                    verification_method=VerificationMethod.DETERMINISTIC,
                    reasoning=f"Required document '{requirement.text_raw}' is missing from bidder submission.",
                    confidence=0.99,
                    evidence_ids=evidence_ids,
                    citations=citations
                )

        # Rule 4: Qualitative Text Requirement Verification (Strict Evidence-Backed Guard)
        # Avoid false positives: return UNVERIFIED unless substantial semantic overlap is proven.
        stop_words = {
            "shall", "should", "must", "submit", "submitted", "required", "requirement",
            "minimum", "provide", "provided", "under", "clause", "valid", "tender",
            "bidder", "bidders", "with", "from", "that", "this", "have", "been", "will"
        }
        req_substantive = {w.strip(".,;:()") for w in requirement.text_raw.lower().split() if len(w) > 3 and w not in stop_words}

        strong_matches = []
        for e in evidences:
            if not e.raw_snippet:
                continue
            snippet_words = {w.strip(".,;:()") for w in e.raw_snippet.lower().split()}
            matched_words = req_substantive.intersection(snippet_words)
            overlap_ratio = len(matched_words) / len(req_substantive) if req_substantive else 0
            if (len(matched_words) >= 3 or overlap_ratio >= 0.6) and len(matched_words) > 0:
                strong_matches.append((e, matched_words))

        if strong_matches:
            matched_ev, matched_terms = strong_matches[0]
            return ComplianceEvaluateResponse(
                result_id=result_id,
                requirement_id=requirement.requirement_id,
                bid_id=bid_id,
                status=ComplianceStatus.COMPLIANT,
                verification_method=VerificationMethod.AI_LANGUAGE,
                reasoning=f"Evidence passage verified: matches required terms {list(matched_terms)[:4]} in document '{matched_ev.document_name}'.",
                confidence=0.92,
                evidence_ids=evidence_ids,
                citations=citations
            )
        else:
            return ComplianceEvaluateResponse(
                result_id=result_id,
                requirement_id=requirement.requirement_id,
                bid_id=bid_id,
                status=ComplianceStatus.UNVERIFIED,
                verification_method=VerificationMethod.AI_LANGUAGE,
                reasoning=f"Qualitative condition '{requirement.text_raw}' lacks sufficient verified evidence in submitted documents. Referred to Human Reviewer under GFR 2017 Rule 173.",
                confidence=0.60,
                evidence_ids=evidence_ids,
                citations=citations
            )
