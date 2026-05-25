from app.pipeline import run_pipeline

def ingest_repo(github_url: str) -> dict:
    result = run_pipeline(github_url)
    repo_name = result["repo_path"].rstrip("/").split("/")[-1]
    return {
        "status": "success",
        "repo_name": repo_name,
        "repo_path": result["repo_path"],
        "total_files": result["total_files"],
        "total_chunks": result["total_chunks"],
        "graph_nodes": result["graph_nodes"],
        "graph_edges": result["graph_edges"],
        "errors": result.get("errors", [])
    }