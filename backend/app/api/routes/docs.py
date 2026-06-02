from fastapi import APIRouter, HTTPException
from app.services.documentation_service import generate_readme, generate_function_docs
from app.utils.repo_store import user_has_access

router = APIRouter()

@router.get("/docs/{repo_name}/readme")
def readme(repo_name: str, user_id: str):
    if not user_has_access(repo_name, user_id):
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        return generate_readme(repo_name)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/docs/{repo_name}/functions")
def function_docs(repo_name: str, file_path: str, user_id: str):
    if not user_has_access(repo_name, user_id):
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        return generate_function_docs(repo_name, file_path)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))