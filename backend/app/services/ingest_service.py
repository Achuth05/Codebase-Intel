import os
from app.pipeline import run_pipeline
from app.config import REPOS_DIR, CHROMA_DB_PATH

def repo_already_ingested(repo_name: str) -> bool:
    chroma_path = os.path.join(CHROMA_DB_PATH, repo_name)
    repo_path = os.path.join(REPOS_DIR, repo_name)
    return os.path.exists(chroma_path) and os.path.exists(repo_path)

def ingest_repo(github_url: str, force: bool = False) -> dict:
    repo_name = github_url.rstrip("/").split("/")[-1].replace(".git", "")

    if repo_already_ingested(repo_name) and not force:
        return {
            "status": "already_ingested",
            "repo_name": repo_name,
            "repo_path": f"{REPOS_DIR}/{repo_name}",
            "total_files": 0,
            "total_chunks": 0,
            "graph_nodes": 0,
            "graph_edges": 0,
            "errors": []
        }

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