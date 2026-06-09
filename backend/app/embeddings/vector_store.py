import os
from supabase import create_client
from app.embeddings.emb_generator import get_embeddings
from app.config import SUPABASE_URL, SUPABASE_SERVICE_KEY
from langchain_core.retrievers import BaseRetriever
from langchain_core.documents import Document
from langchain_core.callbacks.manager import CallbackManagerForRetrieverRun

def get_supabase():
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def clean_text(text: str) -> str:
    return text.replace("\x00", "").replace("\u0000", "")

def _chunk_to_doc(chunk: dict) -> Document:
    return Document(
        page_content=chunk["content"],
        metadata={
            "file_path": chunk["file_path"],
            "language": chunk.get("language", ""),
            "functions": chunk.get("functions", ""),
            "classes": chunk.get("classes", ""),
        }
    )

def store_chunks(chunks, repo_name: str, user_id: str, persist_dir: str = None):
    sb = get_supabase()
    texts = [doc.page_content for doc in chunks]
    total = len(texts)
    batch_size = 64

    sb.table("chunks").delete().eq("user_id", user_id).eq("repo_name", repo_name).execute()

    all_rows = []
    for i in range(0, total, batch_size):
        batch_texts = texts[i:i + batch_size]
        batch_docs = chunks[i:i + batch_size]

        print(f"Embedding {min(i + batch_size, total)}/{total} chunks...")
        embeddings = get_embeddings(batch_texts)

        for doc, embedding in zip(batch_docs, embeddings):
            all_rows.append({
                "user_id": user_id,
                "repo_name": repo_name,
                "file_path": clean_text(doc.metadata.get("file_path", "")),
                "content": clean_text(doc.page_content),
                "embedding": embedding,
                "language": clean_text(doc.metadata.get("language", "")),
                "functions": clean_text(doc.metadata.get("functions", "")),
                "classes": clean_text(doc.metadata.get("classes", "")),
            })

        if len(all_rows) >= 100:
            sb.table("chunks").insert(all_rows).execute()
            all_rows = []

    if all_rows:
        sb.table("chunks").insert(all_rows).execute()

    print(f"Done. Stored {total} chunks in Supabase.")


def similarity_search(question: str, repo_name: str, user_id: str, k: int = 5) -> list[dict]:
    sb = get_supabase()
    query_embedding = get_embeddings([question])[0]

    result = sb.rpc("match_chunks", {
        "query_embedding": query_embedding,
        "match_user_id": user_id,
        "match_repo_name": repo_name,
        "match_count": k
    }).execute()

    chunks = []
    for row in result.data:
        chunks.append({
            "content": row["content"],
            "file_path": row["file_path"],
            "language": row.get("language", ""),
            "functions": row.get("functions", ""),
            "classes": row.get("classes", ""),
            "similarity": row["similarity"]
        })

    return chunks


class SupabaseRetriever(BaseRetriever):
    repo_name: str
    user_id: str
    k: int = 5

    def _get_relevant_documents(
        self, query: str, *, run_manager: CallbackManagerForRetrieverRun
    ) -> list[Document]:
        chunks = similarity_search(query, self.repo_name, self.user_id, self.k)
        return [_chunk_to_doc(c) for c in chunks]


class SupabaseVectorStoreWrapper:
    def __init__(self, repo_name: str, user_id: str):
        self.repo_name = repo_name
        self.user_id = user_id

    def similarity_search(self, question: str, k: int = 5) -> list[Document]:
        chunks = similarity_search(question, self.repo_name, self.user_id, k)
        return [_chunk_to_doc(c) for c in chunks]

    def similarity_search_with_score(self, question: str, k: int = 5) -> list:
        chunks = similarity_search(question, self.repo_name, self.user_id, k)
        return [(_chunk_to_doc(c), 1 - c["similarity"]) for c in chunks]

    def as_retriever(self, search_kwargs: dict = None) -> SupabaseRetriever:
        k = search_kwargs.get("k", 5) if search_kwargs else 5
        return SupabaseRetriever(repo_name=self.repo_name, user_id=self.user_id, k=k)


def load_vectorstore(repo_name: str, user_id: str, persist_dir: str = None) -> SupabaseVectorStoreWrapper:
    return SupabaseVectorStoreWrapper(repo_name, user_id)