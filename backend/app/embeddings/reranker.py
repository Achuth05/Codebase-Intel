from app.embeddings.emb_generator import get_embeddings
import numpy as np

def cosine_similarity(a: list[float], b: list[float]) -> float:
    a, b = np.array(a), np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-10))

def rerank_chunks(question: str, chunks: list[dict], top_k: int = 5) -> list[dict]:
    """
    Rerank chunks by actual similarity to the question.
    ChromaDB gives approximate results — this makes them more precise.
    """
    if not chunks:
        return chunks

    question_embedding = get_embeddings([question])[0]

    scored = []
    for chunk in chunks:
        chunk_embedding = get_embeddings([chunk["content"]])[0]
        score = cosine_similarity(question_embedding, chunk_embedding)
        scored.append({**chunk, "rerank_score": round(score, 4)})

    return sorted(scored, key=lambda x: x["rerank_score"], reverse=True)[:top_k]