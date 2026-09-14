from typing import List, Dict, Any, Optional
import datetime
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.schemas.compliance import (
    RequirementParseRequest, ExtractedRequirement,
    ExtractedEvidence, ComplianceEvaluateRequest, ComplianceEvaluateResponse,
    ContradictionFlag, DebarmentCheckRequest, DebarmentResult,
    CopilotQueryRequest, CopilotQueryResponse,
)
from app.engines.tender_understanding import TenderUnderstandingEngine
from app.engines.document_intelligence import DocumentIntelligenceEngine
from app.engines.compliance_reasoning import ComplianceReasoningEngine
from app.engines.contradiction_detection import ContradictionDetectionEngine
from app.engines.forgery_detection import ForgeryDetectionEngine
from app.engines.collusion_detection import CollusionDetectionEngine
from app.engines.unit_normalizer import UnitNormalizer
from app.engines.seller_verification import SellerVerificationEngine, SellerVerificationRequest, SellerVerificationResponse
from app.engines.copilot import ProcurementCopilotEngine
from app.workers.document_worker import DocumentJobWorker
from app.retrieval.evidence_retriever import HybridEvidenceRetriever
from app.parsers.pdf_parser import extract_text_from_bytes
from app.engines.government_portal_engine import run_portal_verification, PortalVerificationReport
from app.engines.recommendation_engine import generate_recommendation, AiRecommendation

app = FastAPI(
    title="SIH26100 AI Intelligence API",
    description=(
        "FastAPI Microservice for GeM Bid Compliance Verification: "
        "Document Ingestion, RAG Evidence Retrieval, Deterministic Compliance Verification, "
        "Contradiction & Forgery Detection, Collusion Signals, Unit Normalization. "
        "Evidence-first. Deterministic-first. Human-in-the-loop."
    ),
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

import os
import re

ALLOWED_ORIGINS_ENV = os.environ.get("ALLOWED_ORIGINS")
ALLOWED_ORIGINS = [orig.strip() for orig in ALLOWED_ORIGINS_ENV.split(",")] if ALLOWED_ORIGINS_ENV else [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".xls", ".xlsx"}
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50MB

def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal and shell injection attacks."""
    clean = os.path.basename(filename.replace("\\", "/"))
    clean = re.sub(r"[^\w\.\-]", "_", clean)
    return clean

async def validate_upload_file(file: UploadFile) -> bytes:
    """Validates file existence, 50MB size boundary, allowed extensions, and path safety."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file must include a valid filename.")
    clean_name = sanitize_filename(file.filename)
    file.filename = clean_name
    ext = os.path.splitext(clean_name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File extension '{ext}' is not permitted. Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )
    content = await file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed upload size of 50MB (received {len(content)} bytes)."
        )
    return content


@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "UP", "service": "ai-service", "version": "3.1.0",
        "engines": [
            "TenderUnderstanding", "DocumentIntelligence", "ComplianceReasoning",
            "ContradictionDetection", "ForgeryDetection", "CollusionDetection",
            "UnitNormalizer", "HybridRAG",
            "GovernmentPortalVerification",  # NEW — 13 SIH-mandated portals
            "AiRecommendationEngine",         # NEW — structured procurement recommendations
        ]
    }


@app.post("/api/v1/ai/tender/parse", response_model=List[ExtractedRequirement], tags=["Tender Understanding"])
def parse_tender_requirements(request: RequirementParseRequest):
    try:
        return TenderUnderstandingEngine.extract_requirements(request.tender_id, request.raw_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/ai/tender/upload-pdf", tags=["Tender Understanding"])
async def upload_and_parse_tender_pdf(file: UploadFile = File(...), tender_id: str = Form("TND-001")):
    try:
        file_bytes = await validate_upload_file(file)
        pages = extract_text_from_bytes(file_bytes, file.filename)
        full_text = "\n".join(p["text"] for p in pages)
        requirements = TenderUnderstandingEngine.extract_requirements(tender_id, full_text)
        return {
            "tender_id": tender_id, "filename": file.filename,
            "page_count": len(pages), "requirements_extracted": len(requirements),
            "requirements": [r.model_dump() for r in requirements], "pages": pages,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/ai/documents/upload-async", tags=["Document Intelligence Pipeline"])
async def upload_document_async(file: UploadFile = File(...), bid_id: str = Form("BID-A-01")):
    try:
        file_bytes = await validate_upload_file(file)
        job_id = DocumentJobWorker.create_job(file.filename, file_bytes, bid_id)
        return {"job_id": job_id, "filename": file.filename, "status": "QUEUED"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/ai/jobs/{job_id}", tags=["Document Intelligence Pipeline"])
def get_job_status(job_id: str):
    s = DocumentJobWorker.get_job_status(job_id)
    if s["status"] == "NOT_FOUND":
        raise HTTPException(status_code=404, detail="Job not found")
    return s


@app.post("/api/v1/ai/evidence/search", response_model=List[ExtractedEvidence], tags=["RAG Evidence Retrieval"])
def search_evidence_rag(requirement: ExtractedRequirement, bid_id: str = "BID-A-01"):
    try:
        vector_index = DocumentJobWorker.get_vector_index()
        evidences = HybridEvidenceRetriever.retrieve_candidates(bid_id, requirement, vector_index)
        # Evidence-first principle: Never fabricate evidence if none is found
        return evidences if evidences is not None else []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/ai/compliance/evaluate", response_model=ComplianceEvaluateResponse, tags=["Compliance Verifier"])
def evaluate_compliance(request: ComplianceEvaluateRequest, bid_id: str = "BID-A-01"):
    try:
        return ComplianceReasoningEngine.evaluate(request.requirement, request.evidences, bid_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/ai/contradictions/detect", tags=["Contradiction Flags"])
def detect_contradictions(evidences: List[ExtractedEvidence], bid_id: str = "BID-A-01"):
    try:
        flags = ContradictionDetectionEngine.detect_contradictions(bid_id, evidences)
        return {"flags": [f.model_dump() for f in flags], "count": len(flags)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/ai/documents/forgery-check", tags=["Document Integrity"])
async def check_document_forgery(file: UploadFile = File(...)):
    try:
        file_bytes = await validate_upload_file(file)
        report = ForgeryDetectionEngine.analyze(file_bytes, file.filename)
        return report.dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/ai/bids/collusion-check", tags=["Collusion Signals"])
def detect_collusion_signals(bid_profiles: List[Dict[str, Any]]):
    try:
        signals = CollusionDetectionEngine.detect(bid_profiles)
        return {
            "signals": [s.dict() for s in signals], "count": len(signals),
            "disclaimer": "Flags for human investigation only. No automated accusation is made."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/ai/units/normalize", tags=["Unit Normalizer"])
def normalize_unit(value: float, unit: str):
    normalized_value, canonical_unit = UnitNormalizer.normalize(value, unit)
    return {
        "original_value": value, "original_unit": unit,
        "normalized_value": round(normalized_value, 4),
        "canonical_unit": canonical_unit,
        "unit_family": UnitNormalizer.get_family(unit),
    }


@app.post("/api/v1/ai/sellers/verify", response_model=SellerVerificationResponse, tags=["Seller Verification Engine"])
def verify_seller_ai(request: SellerVerificationRequest):
    try:
        return SellerVerificationEngine.verify_seller_ai(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/ai/copilot/query", response_model=CopilotQueryResponse, tags=["Procurement Copilot"])
@app.post("/copilot/query", response_model=CopilotQueryResponse, tags=["Procurement Copilot"])
def query_copilot(request: CopilotQueryRequest):
    try:
        role = (request.role or "").upper()
        question_lower = request.question.lower()

        if "BIDDER" in role:
            if "compare" in question_lower or "competitor" in question_lower or "other bid" in question_lower:
                return CopilotQueryResponse(
                    answer="Access Denied (GFR Rule 173): Bidders are strictly prohibited from inspecting competitor bids or comparative compliance data.",
                    source_results=[],
                    confidence=1.0
                )
            
        if "REVIEWER" in role:
            if "compare" in question_lower or "competitor" in question_lower:
                return CopilotQueryResponse(
                    answer="Scope Refusal: Reviewers are restricted to their assigned queue. Cross-bidder comparison is reserved for Procurement Officers.",
                    source_results=[],
                    confidence=1.0
                )

        DocumentJobWorker.ensure_demo_indexed()
        index = DocumentJobWorker.get_vector_index()
        
        # Scoped search in vector index
        retrieved_chunks = index.search(request.question, top_k=request.max_results, bid_id=request.bid_id)
        if not retrieved_chunks and role not in ["BIDDER", "BIDDER_VENDOR", "REVIEWER"]:
            # Fallback across all chunks if specific bid chunk didn't match and not restricted
            retrieved_chunks = index.search(request.question, top_k=request.max_results)

        return ProcurementCopilotEngine.answer_query(
            request=request,
            compliance_results=getattr(request, 'compliance_results', None),
            retrieved_evidence=retrieved_chunks
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/ai/copilot/transcript", tags=["Procurement Copilot"])
@app.get("/copilot/transcript", tags=["Procurement Copilot"])
def get_copilot_transcripts():
    """Returns past queries asked by officers and committee members for Vigilance/Auditor review."""
    return {"transcripts": ProcurementCopilotEngine.get_query_transcripts()}



@app.post("/documents/extract", tags=["Document Intelligence Pipeline"])
@app.post("/api/v1/ai/documents/extract", tags=["Document Intelligence Pipeline"])
async def extract_document_sync(file: UploadFile = File(...), bid_id: str = Form("")):
    try:
        file_bytes = await validate_upload_file(file)
        pages = extract_text_from_bytes(file_bytes, file.filename)
        return {
            "filename": file.filename,
            "bid_id": bid_id,
            "page_count": len(pages),
            "pages": pages,
            "status": "PARSED"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/ai/security/injection-logs", tags=["Security Sentinel"])
def get_injection_logs():
    return {"logs": ProcurementCopilotEngine.get_sanitization_logs()}


@app.post("/api/v1/ai/security/test-injection", tags=["Security Sentinel"])
def test_prompt_injection(payload: Dict[str, str]):
    text = payload.get("text", "")
    sanitized, was_injected = ProcurementCopilotEngine.sanitize_prompt(text, source="Adversarial Injection Test Harness")
    return {
        "original_text": text,
        "sanitized_text": sanitized,
        "injection_detected": was_injected,
        "action_taken": "STRIPPED_AND_LOGGED" if was_injected else "PASSED_CLEAN",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat() if hasattr(datetime, "timezone") else ""
    }



@app.get("/api/v1/ai/demo-documents", tags=["Demo Datasets"])
def list_demo_documents():
    """Lists all available realistic synthetic PDF documents for testing."""
    import os
    docs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "demo_docs")
    if not os.path.exists(docs_dir):
        return {"documents": []}
    files = [f for f in os.listdir(docs_dir) if f.endswith(".pdf")]
    return {
        "documents": [
            {
                "filename": f,
                "size_bytes": os.path.getsize(os.path.join(docs_dir, f)),
                "download_url": f"/api/v1/ai/demo-documents/{f}"
            }
            for f in files
        ]
    }


@app.get("/api/v1/ai/demo-documents/{filename}", tags=["Demo Datasets"])
def get_demo_document(filename: str):
    """Streams a realistic demo PDF document."""
    import os
    from fastapi.responses import FileResponse
    docs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "demo_docs")
    file_path = os.path.join(docs_dir, filename)
    if not os.path.exists(file_path) or not filename.endswith(".pdf"):
        raise HTTPException(status_code=404, detail="Demo document not found")
    return FileResponse(file_path, media_type="application/pdf", filename=filename)


# ── SIH Expected Solution: Government Portal Verification ─────────────────────
class PortalVerifyRequest(BaseModel):
    seller_id: str
    organization_name: str
    gstin: Optional[str] = None
    pan: Optional[str] = None
    cin: Optional[str] = None
    udyam_no: Optional[str] = None
    dpiit_no: Optional[str] = None
    epfo_code: Optional[str] = None
    esic_code: Optional[str] = None
    bis_license: Optional[str] = None
    nsic_reg: Optional[str] = None
    oem_auth_ref: Optional[str] = None
    mii_reg: Optional[str] = None


@app.post("/api/v1/ai/portals/verify", response_model=PortalVerificationReport, tags=["Government Portals"])
def verify_all_portals(request: PortalVerifyRequest):
    """
    SIH Expected Solution: Run all 13 SIH-mandated government portal checks in a single call.
    Portals: GSTN, PAN+IT, MCA21, Udyam/MSME, Startup India/DPIIT, NSIC, OEM Auth,
    Make in India, BIS/DPIIT, EPFO, ESIC, DigiLocker, Debarment/Blacklist.
    Returns structured PortalVerificationReport with per-portal findings and aggregate score.
    """
    try:
        return run_portal_verification(
            seller_id=request.seller_id,
            organization_name=request.organization_name,
            gstin=request.gstin,
            pan=request.pan,
            cin=request.cin,
            udyam_no=request.udyam_no,
            dpiit_no=request.dpiit_no,
            epfo_code=request.epfo_code,
            esic_code=request.esic_code,
            bis_license=request.bis_license,
            nsic_reg=request.nsic_reg,
            oem_auth_ref=request.oem_auth_ref,
            mii_reg=request.mii_reg,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── SIH Expected Solution: Compliance Score ───────────────────────────────────
class ComplianceScoreRequest(BaseModel):
    bid_id: str
    total_requirements: int
    compliant_count: int
    non_compliant_count: int
    unverified_count: int
    partially_compliant_count: int
    not_applicable_count: int = 0


class ComplianceScoreResponse(BaseModel):
    bid_id: str
    compliance_score: float
    risk_level: str
    total_requirements: int
    compliant_count: int
    non_compliant_count: int
    unverified_count: int
    partially_compliant_count: int
    computed_at: str


@app.post("/api/v1/ai/compliance/score", response_model=ComplianceScoreResponse, tags=["Compliance Scoring"])
def compute_compliance_score(request: ComplianceScoreRequest):
    """
    SIH Expected Solution: Compute weighted compliance score (0-100%) and risk level.
    Formula: Compliant=1.0pt, Partial=0.5pt; denominator excludes NOT_APPLICABLE.
    Risk: <40% → CRITICAL, 40-59% → HIGH, 60-79% → MEDIUM, >=80% → LOW.
    """
    denominator = request.total_requirements - request.not_applicable_count
    if denominator <= 0:
        score = 0.0
    else:
        score = round(((request.compliant_count * 1.0 + request.partially_compliant_count * 0.5) / denominator) * 100, 1)

    if request.non_compliant_count > 0 or score < 40:
        risk = "CRITICAL"
    elif score < 60:
        risk = "HIGH"
    elif score < 80:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    return ComplianceScoreResponse(
        bid_id=request.bid_id,
        compliance_score=score,
        risk_level=risk,
        total_requirements=request.total_requirements,
        compliant_count=request.compliant_count,
        non_compliant_count=request.non_compliant_count,
        unverified_count=request.unverified_count,
        partially_compliant_count=request.partially_compliant_count,
        computed_at=datetime.datetime.utcnow().isoformat() + "Z",
    )


# ── SIH Expected Solution: AI Recommendation ─────────────────────────────────
class RecommendationRequest(BaseModel):
    bid_id: str
    compliance_score: float
    risk_level: str
    total_requirements: int
    compliant_count: int
    non_compliant_count: int
    unverified_count: int
    partially_compliant_count: int
    gaps: Optional[List[str]] = None
    strengths: Optional[List[str]] = None


@app.post("/api/v1/ai/compliance/recommend", response_model=AiRecommendation, tags=["Compliance Scoring"])
def get_ai_recommendation(request: RecommendationRequest):
    """
    SIH Expected Solution: Generate AI-structured procurement recommendation.
    Returns RECOMMEND_QUALIFY, RECOMMEND_REJECT, or REFER_FOR_REVIEW with
    gap analysis, strengths, basis, and officer-authority disclaimer.
    """
    try:
        return generate_recommendation(
            bid_id=request.bid_id,
            compliance_score=request.compliance_score,
            risk_level=request.risk_level,
            total_requirements=request.total_requirements,
            compliant_count=request.compliant_count,
            non_compliant_count=request.non_compliant_count,
            unverified_count=request.unverified_count,
            partially_compliant_count=request.partially_compliant_count,
            gaps=request.gaps,
            strengths=request.strengths,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))