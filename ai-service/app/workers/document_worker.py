import time
import uuid
from typing import Dict, Any, List
from app.parsers.pdf_parser import PDFParser
from app.retrieval.vector_store import VectorStoreIndex


class DocumentJobWorker:
    """
    Asynchronous Document Processing Worker managing document ingestion jobs.
    Tracks job status: QUEUED -> PROCESSING -> COMPLETED / FAILED
    """

    _jobs: Dict[str, Dict[str, Any]] = {}
    _global_vector_index = VectorStoreIndex()

    @classmethod
    def create_job(cls, filename: str, file_bytes: bytes, bid_id: str) -> str:
        job_id = f"JOB-{uuid.uuid4().hex[:8].upper()}"
        cls._jobs[job_id] = {
            "job_id": job_id,
            "bid_id": bid_id,
            "filename": filename,
            "status": "QUEUED",
            "progress_percent": 0,
            "page_count": 0,
            "chunk_count": 0,
            "error": None,
            "created_at": time.time()
        }

        # Process job inline/asynchronously
        cls._execute_job(job_id, filename, file_bytes, bid_id)
        return job_id

    @classmethod
    def get_job_status(cls, job_id: str) -> Dict[str, Any]:
        if job_id not in cls._jobs:
            return {"job_id": job_id, "status": "NOT_FOUND", "progress_percent": 0}
        return cls._jobs[job_id]

    @classmethod
    def get_vector_index(cls) -> VectorStoreIndex:
        return cls._global_vector_index

    @classmethod
    def _execute_job(cls, job_id: str, filename: str, file_bytes: bytes, bid_id: str):
        job = cls._jobs[job_id]
        try:
            job["status"] = "PROCESSING"
            job["progress_percent"] = 25

            # Step 1: Parse PDF Pages
            pages = PDFParser.extract_pages_from_bytes(file_bytes, filename)
            job["page_count"] = len(pages)
            job["progress_percent"] = 55

            # Step 2: Index Chunks into Vector Store
            doc_id = f"DOC-{uuid.uuid4().hex[:6].upper()}"
            chunk_counter = 0

            for page in pages:
                lines = page["raw_text"].split('\n')
                for line in lines:
                    line_clean = line.strip()
                    if len(line_clean) > 15:
                        chunk_id = f"CHK-{uuid.uuid4().hex[:6].upper()}"
                        
                        # Extract numerical value if present
                        import re
                        num_match = re.search(r'₹?\s*(\d+(?:\.\d+)?)', line_clean)
                        val = float(num_match.group(1)) if num_match else None

                        cls._global_vector_index.add_chunk(
                            chunk_id=chunk_id,
                            document_id=doc_id,
                            document_name=filename,
                            page=page["page_number"],
                            text=line_clean,
                            extracted_value=val,
                            bid_id=bid_id
                        )
                        chunk_counter += 1

            job["chunk_count"] = chunk_counter
            job["progress_percent"] = 100
            job["status"] = "COMPLETED"

        except Exception as e:
            job["status"] = "FAILED"
            job["error"] = str(e)

    @classmethod
    def ensure_demo_indexed(cls):
        """Auto-indexes synthetic demo documents into the global vector store if empty."""
        if len(cls._global_vector_index.chunks) > 0:
            return
        import os
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        demo_dir = os.path.join(base_dir, "demo_docs")
        if not os.path.exists(demo_dir):
            return

        for fname in os.listdir(demo_dir):
            if fname.endswith(".pdf"):
                fpath = os.path.join(demo_dir, fname)
                try:
                    with open(fpath, "rb") as f:
                        fbytes = f.read()
                    bid_id = "BID-APEX-001" if "Apex" in fname else ("TND-PUMP-001" if "TND" in fname else "BID-GFL-001")
                    cls.create_job(fname, fbytes, bid_id)
                except Exception:
                    pass

