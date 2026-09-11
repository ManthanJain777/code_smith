from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "UP", "service": "ai-service", "version": "3.0.0",
        "engines": ["TenderUnderstanding","DocumentIntelligence","ComplianceReasoning",
                    "ContradictionDetection","ForgeryDetection","CollusionDetection","UnitNormalizer","HybridRAG"]
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
        file_bytes = await file.read()
        pages = extract_text_from_bytes(file_bytes, file.filename)
        full_text = "\n".join(p["text"] for p in pages)
        requirements = TenderUnderstandingEngine.extract_requirements(tender_id, full_text)
        return {
            "tender_id": tender_id, "filename": file.filename,
            "page_count": len(pages), "requirements_extracted": len(requirements),
            "requirements": [r.model_dump() for r in requirements], "pages": pages,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/ai/documents/upload-async", tags=["Document Intelligence Pipeline"])
async def upload_document_async(file: UploadFile = File(...), bid_id: str = Form("BID-A-01")):
    try:
        file_bytes = await file.read()
        job_id = DocumentJobWorker.create_job(file.filename, file_bytes, bid_id)
        return {"job_id": job_id, "filename": file.filename, "status": "QUEUED"}
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
        if not evidences:
            evidences = DocumentIntelligenceEngine.extract_evidence_from_text(
                bid_id=bid_id, document_id="DOC-07", document_name="Financial_Statements.pdf",
                content_text="FY2025 Turnover: Rs.94 Crore\nPump efficiency: 88.4%\nFY2023: Rs.112 Crore\nFY2024: Rs.127 Crore",
                requirement=requirement
            )
        return evidences
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
        file_bytes = await file.read()
        report = ForgeryDetectionEngine.analyze(file_bytes, file.filename)
        return report.dict()
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
def query_copilot(request: CopilotQueryRequest):
    try:
        DocumentJobWorker.ensure_demo_indexed()
        index = DocumentJobWorker.get_vector_index()
        retrieved_chunks = index.search(request.question, top_k=request.max_results, bid_id=request.bid_id)
        if not retrieved_chunks:
            # Fallback across all chunks if specific bid chunk didn't match
            retrieved_chunks = index.search(request.question, top_k=request.max_results)
        return ProcurementCopilotEngine.answer_query(
            request=request,
            retrieved_evidence=retrieved_chunks
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



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