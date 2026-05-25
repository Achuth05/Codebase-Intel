from app.llm.rag_chain import ask_chain, clear_memory
from app.llm.response_formatter import format_response
from app.embeddings.reranker import rerank_chunks
from app.embeddings.vector_store import load_vectorstore

def answer_question(repo_name: str, question: str, k: int = 5) -> dict:
    # Get answer from chain
    result = ask_chain(repo_name, question)

    # Rerank sources for better citations
    vectorstore = load_vectorstore(repo_name)
    raw_chunks = vectorstore.similarity_search(question, k=k * 2)
    chunks = [
        {
            "content": doc.page_content,
            "file_path": doc.metadata.get("file_path", ""),
            "language": doc.metadata.get("language", "")
        }
        for doc in raw_chunks
    ]
    reranked = rerank_chunks(question, chunks, top_k=k)
    sources = list(set([c["file_path"] for c in reranked]))

    formatted = format_response(result["answer"], sources)
    return formatted


def reset_conversation(repo_name: str):
    clear_memory(repo_name)
    return {"status": "memory cleared", "repo_name": repo_name}