from fastapi import APIRouter, HTTPException
from app.services.graph_service import (
    get_imports, get_functions, get_classes, get_file, get_top_imports
)
from app.utils.repo_store import user_has_access

router = APIRouter()

@router.get("/graph/{repo_name}/imports")
def files_importing(repo_name: str, module_name: str, user_id: str):
    if not user_has_access(repo_name, user_id):
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        return get_imports(repo_name, module_name)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/graph/{repo_name}/functions")
def all_functions(repo_name: str, user_id: str):
    if not user_has_access(repo_name, user_id):
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        return get_functions(repo_name)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/graph/{repo_name}/classes")
def all_classes(repo_name: str, user_id: str):
    if not user_has_access(repo_name, user_id):
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        return get_classes(repo_name)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/graph/{repo_name}/file")
def file_summary(repo_name: str, file_path: str, user_id: str):
    if not user_has_access(repo_name, user_id):
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        return get_file(repo_name, file_path)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/graph/{repo_name}/most-imported")
def most_imported(repo_name: str, top_n: int = 10, user_id: str = ""):
    if not user_has_access(repo_name, user_id):
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        return get_top_imports(repo_name, top_n)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/graph/{repo_name}/file-description")
def file_description(repo_name: str, file_path: str, user_id: str):
    if not user_has_access(repo_name, user_id):
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        from app.services.graph_service import get_file_description
        return get_file_description(repo_name, file_path)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/graph/{repo_name}/function-description")
def function_description(repo_name: str, file_path: str, function_name: str, user_id: str):
    if not user_has_access(repo_name, user_id):
        raise HTTPException(status_code=403, detail="Forbidden")
    print("REPO:", repo_name)
    print("FILE:", file_path)
    print("FUNCTION:", function_name)

    try:
        from app.services.graph_service import get_function_description
        return get_function_description(repo_name, file_path, function_name)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))