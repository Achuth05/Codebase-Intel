from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.api.schemas.ingest_schema import IngestRequest, IngestResponse
from app.pipeline import run_pipeline

router = APIRouter()

# Track ingestion status in memory
ingestion_status: dict = {}

def run_ingest_task(github_url: str, repo_name: str):
    try:
        ingestion_status[repo_name] = "processing"
        result = run_pipeline(github_url)
        ingestion_status[repo_name] = "done"
    except Exception as e:
        ingestion_status[repo_name] = f"error: {str(e)}"

@router.post("/ingest", response_model=IngestResponse)
def ingest(request: IngestRequest, background_tasks: BackgroundTasks):
    try:
        result = run_pipeline(request.github_url)
        repo_name = result["repo_path"].rstrip("/").split("/")[-1]

        return IngestResponse(
            status="success",
            repo_name=repo_name,
            repo_path=result["repo_path"],
            total_files=result["total_files"],
            total_chunks=result["total_chunks"],
            graph_nodes=result["graph_nodes"],
            graph_edges=result["graph_edges"],
            errors=[str(e) for e in result.get("errors", [])]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ingest/status/{repo_name}")
def ingest_status(repo_name: str):
    status = ingestion_status.get(repo_name, "not_found")
    return {"repo_name": repo_name, "status": status}