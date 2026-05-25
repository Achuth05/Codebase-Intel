from fastapi import APIRouter, HTTPException
from app.services.graph_service import (
    get_imports, get_functions, get_classes, get_file, get_top_imports
)

router = APIRouter()

@router.get("/graph/{repo_name}/imports/{module_name}")
def files_importing(repo_name: str, module_name: str):
    try:
        return get_imports(repo_name, module_name)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/graph/{repo_name}/functions")
def all_functions(repo_name: str):
    try:
        return get_functions(repo_name)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/graph/{repo_name}/classes")
def all_classes(repo_name: str):
    try:
        return get_classes(repo_name)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/graph/{repo_name}/file")
def file_summary(repo_name: str, file_path: str):
    try:
        return get_file(repo_name, file_path)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/graph/{repo_name}/most-imported")
def most_imported(repo_name: str, top_n: int = 10):
    try:
        return get_top_imports(repo_name, top_n)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))