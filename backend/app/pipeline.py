from app.parser.repo_cloner import clone_repo
from app.parser.file_scanner import scan_files
from app.parser.ts_parser import parse_file
from app.embeddings.chunker import chunk_all_files
from app.graph.graph_builder import build_graph, save_graph
from app.embeddings.vector_store import store_chunks

def get_repo_name(repo_path: str) -> str:
    return repo_path.rstrip("/").split("/")[-1]

def run_pipeline(github_url: str, progress_callback=None) -> dict:
    def update(stage, pct):
        if progress_callback:
            progress_callback(stage, pct)

    # Step 1: Clone
    update("cloning", 5)
    repo_path = clone_repo(github_url)

    # Step 2: Scan
    update("scanning files", 15)
    files = scan_files(repo_path)

    # Step 3: Parse
    update("parsing code", 25)
    parsed_files = []
    errors = []
    total = len(files)

    for i, f in enumerate(files):
        try:
            with open(f["full_path"], "r", encoding="utf-8", errors="ignore") as fh:
                content = fh.read()
            parsed = parse_file(f["file_path"], content)
            parsed["size_bytes"] = f["size_bytes"]
            parsed_files.append(parsed)
        except Exception as e:
            errors.append({"file_path": f["file_path"], "error": str(e)})

        if i % 50 == 0:
            pct = 25 + int((i / total) * 20)
            update("parsing code", pct)

    # Step 4: Build graph
    update("building graph", 45)
    repo_name = get_repo_name(repo_path)
    G = build_graph(parsed_files, repo_path)
    graph_path = save_graph(G, repo_name)

    # Step 5: Chunk
    update("chunking files", 55)
    chunks = chunk_all_files(parsed_files, repo_path)

    # Step 6: Embed and store
    total_chunks = len(chunks)
    batch_size = 64
    total_batches = max(1, total_chunks // batch_size)

    for i in range(0, total_chunks, batch_size):
        pct = 60 + int((i / total_chunks) * 38)
        update(f"embedding chunks ({i}/{total_chunks})", pct)

    update("storing embeddings", 95)
    store_chunks(chunks, repo_name)

    update("done", 100)

    return {
        "repo_path": repo_path,
        "total_files": len(files),
        "total_chunks": total_chunks,
        "graph_path": graph_path,
        "graph_nodes": G.number_of_nodes(),
        "graph_edges": G.number_of_edges(),
        "errors": errors
    }