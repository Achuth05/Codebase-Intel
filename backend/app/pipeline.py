from app.parser.repo_cloner import clone_repo
from app.parser.file_scanner import scan_files
from app.parser.ts_parser import parse_file
from app.embeddings.chunker import chunk_all_files
from app.graph.graph_builder import build_graph, save_graph
from app.embeddings.vector_store import store_chunks

def get_repo_name(repo_path: str) -> str:
    return repo_path.rstrip("/").split("/")[-1]

def run_pipeline(github_url: str) -> dict:
    # Step 1: Clone
    repo_path = clone_repo(github_url)

    # Step 2: Scan
    files = scan_files(repo_path)

    # Step 3: Parse
    parsed_files = []
    errors = []

    for f in files:
        try:
            with open(f["full_path"], "r", encoding="utf-8", errors="ignore") as fh:
                content = fh.read()
            parsed = parse_file(f["file_path"], content)
            parsed["size_bytes"] = f["size_bytes"]
            parsed_files.append(parsed)
        except Exception as e:
            errors.append({"file_path": f["file_path"], "error": str(e)})

    # Step 4: Build and save graph
    repo_name = get_repo_name(repo_path)
    G = build_graph(parsed_files, repo_path)
    graph_path = save_graph(G, repo_name)

    # Step 5: Chunk all files
    print("Chunking files...")
    chunks = chunk_all_files(parsed_files, repo_path)
    print(f"Total chunks: {len(chunks)}")

    # Step 6: Embed and store in ChromaDB
    store_chunks(chunks, repo_name)

    return {
        "repo_path": repo_path,
        "total_files": len(files),
        "total_chunks": len(chunks),
        "graph_path": graph_path,
        "graph_nodes": G.number_of_nodes(),
        "graph_edges": G.number_of_edges(),
        "errors": errors
    }