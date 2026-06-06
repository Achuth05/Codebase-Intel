import os
from app.config import get_user_repos_path

def repo_already_ingested(repo_name: str, user_id: str) -> bool:
    from supabase import create_client
    from app.config import SUPABASE_URL, SUPABASE_SERVICE_KEY
    sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    result = sb.table("repositories").select("id").eq("user_id", user_id).eq("repo_name", repo_name).execute()
    return len(result.data) > 0

def ingest_repo(github_url: str, user_id: str, force: bool = False) -> dict:
    repo_name = github_url.rstrip("/").split("/")[-1].replace(".git", "")

    if repo_already_ingested(repo_name, user_id) and not force:
        return {
            "status": "already_ingested",
            "repo_name": repo_name,
            "repo_path": f"{get_user_repos_path(user_id)}/{repo_name}",
            "total_files": 0,
            "total_chunks": 0,
            "graph_nodes": 0,
            "graph_edges": 0,
            "errors": []
        }

    from app.pipeline import run_pipeline
    result = run_pipeline(github_url, user_id=user_id)
    return {
        "status": "success",
        "repo_name": result["repo_name"],
        "repo_path": result["repo_path"],
        "total_files": result["total_files"],
        "total_chunks": result["total_chunks"],
        "graph_nodes": result["graph_nodes"],
        "graph_edges": result["graph_edges"],
        "errors": result.get("errors", [])
    }