from fastapi import APIRouter, HTTPException
from app.services.impact_service import analyze_impact, most_impactful

router = APIRouter()

@router.get("/impact/{repo_name}/file")
def file_impact(repo_name: str, file_path: str):
    try:
        return analyze_impact(repo_name, file_path)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/impact/{repo_name}/most-impactful")
def top_impactful(repo_name: str, top_n: int = 10):
    try:
        return most_impactful(repo_name, top_n)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))