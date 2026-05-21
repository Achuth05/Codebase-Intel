from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

# Map our file extensions to LangChain language names
LANGUAGE_MAP = {
    "py": "python",
    "js": "js",
    "ts": "ts",
    "tsx": "ts",
    "jsx": "js",
    "go": "go",
    "cpp": "cpp",
    "c": "c",
    "rb": "ruby",
    "rs": "rust",
}

def chunk_file(parsed_file: dict, content: str) -> list[Document]:
    file_path = parsed_file["file_path"]
    language = parsed_file["language"]
    
    # Build metadata that will be stored alongside each chunk
    metadata = {
        "file_path": file_path,
        "language": language,
        "functions": ", ".join(parsed_file.get("functions", [])),
        "classes": ", ".join(parsed_file.get("classes", [])),
    }

    lang = LANGUAGE_MAP.get(language)

    if lang:
        # Language-aware splitting — respects function/class boundaries
        splitter = RecursiveCharacterTextSplitter.from_language(
            language=lang,
            chunk_size=500,
            chunk_overlap=50
        )
    else:
        # Plain text splitting for md, yaml, json etc
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )

    chunks = splitter.create_documents([content], metadatas=[metadata])
    return chunks


def chunk_all_files(parsed_files: list[dict], repo_path: str) -> list[Document]:
    all_chunks = []

    for parsed in parsed_files:
        try:
            with open(
                f"{repo_path}/{parsed['file_path']}",
                "r",
                encoding="utf-8",
                errors="ignore"
            ) as f:
                content = f.read()

            if not content.strip():
                continue

            chunks = chunk_file(parsed, content)
            all_chunks.extend(chunks)

        except Exception as e:
            print(f"Chunking error for {parsed['file_path']}: {e}")

    return all_chunks