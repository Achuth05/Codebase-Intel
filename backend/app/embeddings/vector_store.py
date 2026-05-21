import os
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain.embeddings.base import Embeddings
from app.embeddings.emb_generator import get_embeddings
from app.config import CHROMA_DB_PATH

class HFAPIEmbeddings(Embeddings):
    """Wraps our HF API call into a LangChain-compatible embeddings class"""

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        # HF API has a limit per request — batch in groups of 64
        all_embeddings = []
        batch_size = 64

        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            embeddings = get_embeddings(batch)
            all_embeddings.extend(embeddings)
            print(f"Embedded {min(i + batch_size, len(texts))}/{len(texts)} chunks...")

        return all_embeddings

    def embed_query(self, text: str) -> list[float]:
        return get_embeddings([text])[0]


def store_chunks(chunks: list[Document], repo_name: str) -> Chroma:
    persist_dir = os.path.join(CHROMA_DB_PATH, repo_name)
    os.makedirs(persist_dir, exist_ok=True)

    embeddings = HFAPIEmbeddings()

    print(f"Storing {len(chunks)} chunks into ChromaDB...")
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=persist_dir,
        collection_name=repo_name
    )

    print(f"Done. Stored at {persist_dir}")
    return vectorstore


def load_vectorstore(repo_name: str) -> Chroma:
    persist_dir = os.path.join(CHROMA_DB_PATH, repo_name)

    if not os.path.exists(persist_dir):
        raise FileNotFoundError(
            f"No vector store found for repo: {repo_name}. Ingest it first."
        )

    return Chroma(
        persist_directory=persist_dir,
        embedding_function=HFAPIEmbeddings(),
        collection_name=repo_name
    )