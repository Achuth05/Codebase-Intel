from fastapi import APIRouter, HTTPException
from app.api.schemas.ingest_schema import IngestRequest, IngestResponse
from app.services.ingest_service import ingest_repo

router = APIRouter()

@router.post("/ingest", response_model=IngestResponse)
def ingest(request: IngestRequest):
    try:
        result = ingest_repo(request.github_url, request.force)
        return IngestResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))