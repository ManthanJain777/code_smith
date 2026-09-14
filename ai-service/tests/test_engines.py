from app.schemas.compliance import (
    ExtractedRequirement,
    RequirementType,
    ExtractedEvidence,
    ComplianceStatus,
    VerificationMethod
)
from app.engines.tender_understanding import TenderUnderstandingEngine
from app.engines.compliance_reasoning import ComplianceReasoningEngine
from app.engines.contradiction_detection import ContradictionDetectionEngine


def test_tender_understanding_turnover():
    text = "Requirement 1: Bidder must have minimum 100 crore annual turnover for each of the previous 3 financial years."
    reqs = TenderUnderstandingEngine.extract_requirements("TND-001", text)
    assert len(reqs) >= 1
    req = reqs[0]
    assert req.category == "Financial"
    assert req.type == RequirementType.NUMERIC_THRESHOLD
    assert req.threshold == 100.0
    assert req.operator == ">="


def test_compliance_reasoning_non_compliant_turnover():
    # Canonical worked demo case from README.md Section 12:
    # Requirement: >= 100 Cr turnover
    # Evidence: 94 Cr in FY25
    req = ExtractedRequirement(
        requirement_id="REQ-014",
        tender_id="TND-001",
        category="Financial",
        text_raw="Pump efficiency / Turnover shall not be less than 100 Crore",
        type=RequirementType.NUMERIC_THRESHOLD,
        operator=">=",
        threshold=100.0,
        unit="Cr",
        mandatory=True,
        source_page=22
    )

    evidences = [
        ExtractedEvidence(
            evidence_id="EVD-091",
            bid_id="BID-A-01",
            document_id="DOC-07",
            document_name="Financial_Statements.pdf",
            page=37,
            extracted_value=94.0,
            extracted_unit="Cr",
            raw_snippet="FY2025 Turnover: ₹94 Crore",
            extraction_confidence=0.99
        )
    ]

    res = ComplianceReasoningEngine.evaluate(req, evidences, "BID-A-01")
    assert res.status == ComplianceStatus.NON_COMPLIANT
    assert res.verification_method == VerificationMethod.DETERMINISTIC
    assert "94.0" in res.reasoning
    assert res.confidence >= 0.95
    assert len(res.citations) == 1
    assert res.citations[0].document_name == "Financial_Statements.pdf"


def test_compliance_reasoning_unverified_when_no_evidence():
    req = ExtractedRequirement(
        requirement_id="REQ-002",
        tender_id="TND-001",
        category="Eligibility",
        text_raw="ISO 9001 Certification required",
        type=RequirementType.DOCUMENT_PRESENCE,
        mandatory=True,
        source_page=1
    )

    res = ComplianceReasoningEngine.evaluate(req, [], "BID-A-01")
    assert res.status == ComplianceStatus.UNVERIFIED
    assert len(res.citations) == 0


def test_contradiction_detection():
    ev1 = ExtractedEvidence(
        evidence_id="EVD-001",
        bid_id="BID-01",
        document_id="DOC-A",
        document_name="Technical_Datasheet.pdf",
        page=5,
        extracted_value=800.0,
        extracted_unit="units/day",
        raw_snippet="Production capacity: 800 units/day",
        extraction_confidence=0.95
    )

    ev2 = ExtractedEvidence(
        evidence_id="EVD-002",
        bid_id="BID-01",
        document_id="DOC-B",
        document_name="Product_Brochure.pdf",
        page=2,
        extracted_value=500.0,
        extracted_unit="units/day",
        raw_snippet="Rated output: 500 units/day",
        extraction_confidence=0.90
    )

    flags = ContradictionDetectionEngine.detect_contradictions("BID-01", [ev1, ev2])
    assert len(flags) == 1
    assert flags[0].severity == "HIGH"
    assert "800.0" in flags[0].description and "500.0" in flags[0].description


def test_numeric_threshold_exact_equality():
    """Regression test for operator '==' exact equality edge case."""
    req = ExtractedRequirement(
        requirement_id="REQ-EQ-001",
        tender_id="TND-001",
        category="Technical",
        text_raw="Pump discharge port diameter must equal exactly 150 mm",
        type=RequirementType.NUMERIC_THRESHOLD,
        operator="==",
        threshold=150.0,
        unit="mm",
        mandatory=True,
        source_page=5
    )

    evidences = [
        ExtractedEvidence(
            evidence_id="EVD-EQ-01",
            bid_id="BID-A-01",
            document_id="DOC-08",
            document_name="Technical_Specs.pdf",
            page=4,
            extracted_value=150.0,
            extracted_unit="mm",
            raw_snippet="Flange Discharge Diameter: 150.0 mm",
            extraction_confidence=0.99
        )
    ]

    res = ComplianceReasoningEngine.evaluate(req, evidences, "BID-A-01")
    # Must be COMPLIANT, NOT Non-Compliant fall-through
    assert res.status == ComplianceStatus.COMPLIANT
    assert res.verification_method == VerificationMethod.DETERMINISTIC
    assert "150.0" in res.reasoning


def test_canonical_compliance_status_serializer():
    from app.schemas.compliance import canonical_compliance_status
    assert canonical_compliance_status(ComplianceStatus.COMPLIANT) == "COMPLIANT"
    assert canonical_compliance_status("compliant") == "COMPLIANT"
    assert canonical_compliance_status("NON_COMPLIANT") == "NON_COMPLIANT"
    assert canonical_compliance_status("Partially_Compliant") == "PARTIALLY_COMPLIANT"
    assert canonical_compliance_status(None) == "UNVERIFIED"
    assert canonical_compliance_status("unknown_status") == "UNVERIFIED"


def test_copilot_database_transcripts_persistence():
    from app.engines.copilot import ProcurementCopilotEngine
    from app.schemas.compliance import CopilotQueryRequest

    req = CopilotQueryRequest(
        tender_id="TND-TEST-001",
        bid_id="BID-TEST-001",
        question="What is the testing status of the pumps?",
        user_name="Testing Officer",
        role="PROCUREMENT_OFFICER"
    )

    resp = ProcurementCopilotEngine.answer_query(req)
    assert resp is not None
    assert resp.answer is not None

    transcripts = ProcurementCopilotEngine.get_query_transcripts()
    assert len(transcripts) >= 1
    latest = transcripts[0]
    assert latest["question"] == "What is the testing status of the pumps?"
    assert latest["user_name"] == "Testing Officer"

