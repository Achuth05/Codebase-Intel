from app.embeddings.vector_store import load_vectorstore

def retrieve_chunks(repo_name: str, question: str, k: int = 5) -> list[dict]:
    vectorstore = load_vectorstore(repo_name)
    
    results = vectorstore.similarity_search_with_score(question, k=k)

    chunks = []
    for doc, score in results:
        chunks.append({
            "content": doc.page_content,
            "file_path": doc.metadata.get("file_path", ""),
            "language": doc.metadata.get("language", ""),
            "functions": doc.metadata.get("functions", ""),
            "classes": doc.metadata.get("classes", ""),
            "score": round(float(score), 4)
        })

    return chunks