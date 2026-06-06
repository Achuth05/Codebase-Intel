from fastapi import APIRouter, HTTPException, Depends
from app.api.auth import get_current_user
from app.services.documentation_service import generate_readme, generate_function_docs

router = APIRouter()

@router.get("/docs/{repo_name}/readme")
def readme(repo_name: str, user_id: str = Depends(get_current_user)):
    try:
        return generate_readme(repo_name, user_id)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/docs/{repo_name}/functions")
def function_docs(repo_name: str, file_path: str, user_id: str = Depends(get_current_user)):
    try:
        return generate_function_docs(repo_name, file_path, user_id)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))