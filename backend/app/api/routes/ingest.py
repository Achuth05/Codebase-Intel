from fastapi import APIRouter, HTTPException, Depends
from app.api.schemas.ingest_schema import IngestRequest, IngestResponse
from app.services.ingest_service import ingest_repo
from app.api.auth import get_current_user
from supabase import create_client
from app.config import SUPABASE_URL, SUPABASE_SERVICE_KEY

router = APIRouter()

def get_supabase():
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

@router.post("/ingest", response_model=IngestResponse)
def ingest(request: IngestRequest, user_id: str = Depends(get_current_user)):
    try:
        result = ingest_repo(request.github_url, user_id=user_id, force=request.force)

        if result["status"] == "success":
            sb = get_supabase()
            sb.table("repositories").upsert({
                "user_id": user_id,
                "repo_name": result["repo_name"],
                "github_url": request.github_url,
                "total_files": result["total_files"],
                "total_chunks": result["total_chunks"],
                "graph_nodes": result["graph_nodes"],
                "graph_edges": result["graph_edges"],
            }, on_conflict="user_id,repo_name").execute()

        return IngestResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ingest/repos")
def list_repos(user_id: str = Depends(get_current_user)):
    try:
        sb = get_supabase()
        result = sb.table("repositories").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return {"repos": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))