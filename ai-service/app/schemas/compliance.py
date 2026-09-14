from enum import Enum
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field


class ComplianceStatus(str, Enum):
    COMPLIANT = "COMPLIANT"
    PARTIALLY_COMPLIANT = "PARTIALLY_COMPLIANT"
    NON_COMPLIANT = "NON_COMPLIANT"
    UNVERIFIED = "UNVERIFIED"
    NOT_APPLICABLE = "NOT_APPLICABLE"


def canonical_compliance_status(val: Any) -> str:
    """
    Standardize compliance-status string serialization across all AI engines and responses,
    ensuring 1:1 match with Spring Boot Java backend ComplianceStatus enum.
    """
    if val is None:
        return ComplianceStatus.UNVERIFIED.value
    if isinstance(val, ComplianceStatus):
        return val.value
    clean = str(val).strip().upper()
    if clean.startswith("COMPLIANCESTATUS."):
        clean = clean.split(".", 1)[1]
    valid_statuses = {
        "COMPLIANT": ComplianceStatus.COMPLIANT.value,
        "PARTIALLY_COMPLIANT": ComplianceStatus.PARTIALLY_COMPLIANT.value,
        "NON_COMPLIANT": ComplianceStatus.NON_COMPLIANT.value,
        "UNVERIFIED": ComplianceStatus.UNVERIFIED.value,
        "NOT_APPLICABLE": ComplianceStatus.NOT_APPLICABLE.value,
    }
    return valid_statuses.get(clean, ComplianceStatus.UNVERIFIED.value)


class VerificationMethod(str, Enum):
    DETERMINISTIC = "deterministic"
    AI_LANGUAGE = "ai_language"
    HYBRID = "hybrid"


class RequirementType(str, Enum):
    NUMERIC_THRESHOLD = "numeric_threshold"
    DATE_EXPIRY = "date_expiry"
    DOCUMENT_PRESENCE = "document_presence"
    TEXT_QUALITATIVE = "text_qualitative"
    CERTIFICATION = "certification"
    DELIVERY = "delivery"
    QUALITY = "quality"
    COMMERCIAL = "commercial"
    LEGAL = "legal"


class RequirementParseRequest(BaseModel):
    tender_id: str
    raw_text: str


class ExtractedRequirement(BaseModel):
    requirement_id: str
    tender_id: str
    category: str = Field(description="Category: Technical, Financial, Eligibility, Experience, Certification, Legal, Documentary, Delivery, Quality, Commercial")
    text_raw: str
    type: RequirementType
    operator: Optional[str] = Field(default=None)
    threshold: Optional[float] = Field(default=None)
    unit: Optional[str] = Field(default=None)
    mandatory: bool = True
    source_page: int = 1


class DocumentParseRequest(BaseModel):
    document_id: str
    filename: str
    content_text: Optional[str] = None


class ExtractedEvidence(BaseModel):
    evidence_id: str
    bid_id: str
    requirement_id: Optional[str] = None
    document_id: str
    document_name: str
    page: int
    extracted_value: Optional[Any] = None
    extracted_unit: Optional[str] = None
    raw_snippet: str
    extraction_confidence: float = Field(ge=0.0, le=1.0)


class ComplianceEvaluateRequest(BaseModel):
    requirement: ExtractedRequirement
    evidences: List[ExtractedEvidence]


class Citation(BaseModel):
    document_id: str
    document_name: str
    page: int
    evidence_id: str
    snippet: str


class ComplianceEvaluateResponse(BaseModel):
    result_id: str
    requirement_id: str
    bid_id: str
    status: ComplianceStatus
    verification_method: VerificationMethod
    reasoning: str
    confidence: float = Field(ge=0.0, le=1.0)
    evidence_ids: List[str]
    citations: List[Citation]


class ContradictionFlag(BaseModel):
    flag_id: str
    bid_id: str
    requirement_id: Optional[str] = None
    document_a: str
    document_b: str
    value_a: Optional[float] = None
    value_b: Optional[float] = None
    page_a: Optional[int] = None
    page_b: Optional[int] = None
    description: str
    severity: str = "HIGH"


class JobStatus(BaseModel):
    job_id: str
    status: str  # QUEUED / PROCESSING / COMPLETED / FAILED
    progress: int = Field(default=0, ge=0, le=100)
    filename: Optional[str] = None
    pages_processed: int = 0
    chunks_indexed: int = 0
    error: Optional[str] = None


class ForgeryAnalysisRequest(BaseModel):
    bid_id: str
    filename: str


class CopilotQueryRequest(BaseModel):
    tender_id: str = "TND-PUMP-001"
    bid_id: str = ""
    question: str
    max_results: int = 5
    role: Optional[str] = "PROCUREMENT_OFFICER"
    user_name: Optional[str] = "Procurement Officer"
    compliance_results: Optional[List[Dict[str, Any]]] = None


class CopilotQueryResponse(BaseModel):
    answer: str
    source_results: List[str]  # requirement IDs used as sources
    confidence: float
    disclaimer: str = "Answer is grounded in verified compliance results only."
    model_used: Optional[str] = "qwen2.5:3b (Local AI)"
    citations: Optional[List[Dict[str, Any]]] = None


class DebarmentCheckRequest(BaseModel):
    company_name: str
    gstin: Optional[str] = None
    pan: Optional[str] = None
    director_names: Optional[List[str]] = None


class DebarmentResult(BaseModel):
    status: str  # CLEAR / FLAGGED
    matched_entries: List[str] = []
    risk_level: str = "NONE"  # NONE / LOW / HIGH
    message: str
