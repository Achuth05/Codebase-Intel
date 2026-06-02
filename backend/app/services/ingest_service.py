import os
from app.pipeline import run_pipeline
from app.config import REPOS_DIR, CHROMA_DB_PATH
from app.utils.repo_store import find_by_url, add_repo, add_owner, get_repo


def ingest_repo(github_url: str, force: bool = False, user_id: str = "") -> dict:
    repo_name = github_url.rstrip("/").split("/")[-1].replace(".git", "")

    # If repo exists by URL, link owner and return existing metadata
    existing = find_by_url(github_url)
    if existing and not force:
        add_owner(existing, user_id)
        meta = get_repo(existing)
        return {
            "status": "already_exists",
            "repo_name": existing,
            "repo_path": meta.get("repo_path", f"{REPOS_DIR}/{existing}"),
            "total_files": 0,
            "total_chunks": 0,
            "graph_nodes": 0,
            "graph_edges": 0,
            "errors": []
        }

    # Otherwise run pipeline (this will clone/parse/store)
    result = run_pipeline(github_url)
    repo_name = result["repo_path"].rstrip("/").split("/")[-1]

    chroma_path = os.path.join(CHROMA_DB_PATH, repo_name)
    repo_path = result["repo_path"]
    add_repo(repo_name, github_url, repo_path, chroma_path, user_id)

    return {
        "status": "success",
        "repo_name": repo_name,
        "repo_path": repo_path,
        "total_files": result.get("total_files", 0),
        "total_chunks": result.get("total_chunks", 0),
        "graph_nodes": result.get("graph_nodes", 0),
        "graph_edges": result.get("graph_edges", 0),
        "errors": result.get("errors", [])
    }