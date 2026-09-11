"""
PDF Parser - Production Implementation
"""
import re
import hashlib
from typing import List, Dict, Any, Optional
import pymupdf


INJECTION_PATTERNS = [
    r'ignore\s+previous\s+instructions?',
    r'you\s+are\s+now\s+a',
    r'system\s*:\s*',
    r'mark\s+this\s+(as\s+)?compliant',
    r'override\s+(compliance|result|decision)',
    r'forget\s+(all\s+)?(previous|prior)',
    r'act\s+as\s+(if\s+you\s+are\s+)?',
    r'disregard\s+(all\s+)?',
    r'new\s+instructions?\s*:',
]

_INJECTION_RE = re.compile('|'.join(INJECTION_PATTERNS), re.IGNORECASE)


def sanitize_text(text: str) -> str:
    return _INJECTION_RE.sub('[REDACTED-INJECTION]', text)


def extract_text_from_bytes(file_bytes: bytes, filename: str = "document.pdf") -> List[Dict[str, Any]]:
    pages = []
    try:
        doc = pymupdf.open(stream=file_bytes, filetype="pdf")
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            page_num = page_idx + 1
            raw_text = page.get_text("text")
            clean_text = sanitize_text(raw_text.strip())
            tables = []
            try:
                table_finder = page.find_tables()
                for table in table_finder.tables:
                    extracted = table.extract()
                    cleaned_table = [
                        [str(cell).strip() if cell is not None else "" for cell in row]
                        for row in extracted
                    ]
                    tables.append(cleaned_table)
            except Exception:
                pass
            # Extract block bounding boxes for high-precision citation
            blocks_raw = page.get_text("blocks")
            blocks = []
            for b in blocks_raw:
                if len(b) >= 5 and b[4].strip():
                    blocks.append({
                        "bbox": [round(coord, 2) for coord in b[:4]],
                        "text": sanitize_text(b[4].strip())
                    })

            # Check for scanned page / embedded image if text layer is empty
            images = page.get_images()
            if len(clean_text) < 15 and len(images) > 0:
                clean_text = f"[SCANNED DOCUMENT: Page contains {len(images)} document image scan(s)]"

            chunk_id = hashlib.md5(f"{filename}:{page_num}:{clean_text[:100]}".encode()).hexdigest()[:12]
            pages.append({
                "page_num": page_num,
                "text": clean_text,
                "tables": tables,
                "blocks": blocks,
                "images_count": len(images),
                "chunk_id": chunk_id,
                "word_count": len(clean_text.split()),
                "has_tables": len(tables) > 0,
                "filename": filename,
            })
        doc.close()
    except Exception as e:
        pages.append({
            "page_num": 1,
            "text": f"[PARSE ERROR: {str(e)}]",
            "tables": [],
            "chunk_id": "ERR-" + hashlib.md5(filename.encode()).hexdigest()[:8],
            "word_count": 0,
            "has_tables": False,
            "filename": filename,
        })
    return pages


def extract_metadata(file_bytes: bytes) -> Dict[str, Any]:
    meta = {
        "creation_date": None, "modification_date": None,
        "producer": None, "author": None, "page_count": 0,
        "has_digital_signature": False, "encryption": False,
    }
    try:
        doc = pymupdf.open(stream=file_bytes, filetype="pdf")
        m = doc.metadata
        meta["creation_date"] = m.get("creationDate", "")
        meta["modification_date"] = m.get("modDate", "")
        meta["producer"] = m.get("producer", "")
        meta["author"] = m.get("author", "")
        meta["page_count"] = len(doc)
        meta["encryption"] = doc.is_encrypted
        for page in doc:
            try:
                widgets = page.widgets()
                if widgets:
                    for w in widgets:
                        if w.field_type_string == "Sig":
                            meta["has_digital_signature"] = True
                            break
            except Exception:
                pass
        doc.close()
    except Exception:
        pass
    return meta


def table_to_text(table: List[List[str]]) -> str:
    return "\n".join([" | ".join(row) for row in table])


class PDFParser:
    """PDFParser class adapter providing static extraction methods."""

    @staticmethod
    def extract_pages_from_bytes(file_bytes: bytes, filename: str = "document.pdf") -> List[Dict[str, Any]]:
        extracted = extract_text_from_bytes(file_bytes, filename)
        res = []
        for p in extracted:
            res.append({
                "page_num": p["page_num"],
                "page_number": p["page_num"],
                "text": p["text"],
                "raw_text": p["text"],
                "tables": p.get("tables", []),
                "chunk_id": p.get("chunk_id", ""),
                "word_count": p.get("word_count", 0),
                "has_tables": p.get("has_tables", False),
                "filename": filename
            })
        return res

    @staticmethod
    def extract_text_from_bytes(file_bytes: bytes, filename: str = "document.pdf") -> List[Dict[str, Any]]:
        return extract_text_from_bytes(file_bytes, filename)

    @staticmethod
    def extract_metadata(file_bytes: bytes) -> Dict[str, Any]:
        return extract_metadata(file_bytes)

