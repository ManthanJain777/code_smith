import math
import re
from typing import List, Dict, Any


class VectorStoreIndex:
    """
    Lightweight Vector Store Index providing Cosine Similarity & TF-IDF Vector Search
    over document evidence chunks.
    """

    def __init__(self):
        self.chunks: List[Dict[str, Any]] = []

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r'\w+', text.lower())

    def _get_vector(self, text: str) -> Dict[str, float]:
        tokens = self._tokenize(text)
        freq: Dict[str, int] = {}
        for t in tokens:
            freq[t] = freq.get(t, 0) + 1

        length = math.sqrt(sum(v * v for v in freq.values())) or 1.0
        return {k: v / length for k, v in freq.items()}

    def _cosine_similarity(self, vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
        dot_product = sum(v * vec2.get(k, 0.0) for k, v in vec1.items())
        return dot_product

    def add_chunk(self, chunk_id: str, document_id: str, document_name: str, page: int, text: str, extracted_value: Any = None, bid_id: str = None):
        vector = self._get_vector(text)
        self.chunks.append({
            "chunk_id": chunk_id,
            "document_id": document_id,
            "document_name": document_name,
            "page": page,
            "text": text,
            "extracted_value": extracted_value,
            "bid_id": bid_id,
            "vector": vector
        })

    def search(self, query: str, top_k: int = 5, bid_id: str = None) -> List[Dict[str, Any]]:
        if not self.chunks or not query:
            return []

        query_vec = self._get_vector(query)
        results = []

        for chunk in self.chunks:
            if bid_id and chunk.get("bid_id") and chunk.get("bid_id") != bid_id:
                continue
            score = self._cosine_similarity(query_vec, chunk["vector"])
            if score > 0.05:
                item = dict(chunk)
                item["score"] = score
                item["chunk"] = chunk
                results.append(item)

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]
