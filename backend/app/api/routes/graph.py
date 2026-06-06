from fastapi import APIRouter, HTTPException, Depends
from app.api.auth import get_current_user
from app.services.graph_service import (
    get_imports, get_functions, get_classes,
    get_file, get_top_imports,
    get_file_description, get_function_description
)

router = APIRouter()

@router.get("/graph/{repo_name}/imports")
def files_importing(repo_name: str, module_name: str, user_id: str = Depends(get_current_user)):
    try:
        return get_imports(repo_name, module_name, user_id)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/graph/{repo_name}/functions")
def all_functions(repo_name: str, user_id: str = Depends(get_current_user)):
    try:
        return get_functions(repo_name, user_id)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/graph/{repo_name}/classes")
def all_classes(repo_name: str, user_id: str = Depends(get_current_user)):
    try:
        return get_classes(repo_name, user_id)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/graph/{repo_name}/file")
def file_summary(repo_name: str, file_path: str, user_id: str = Depends(get_current_user)):
    try:
        return get_file(repo_name, file_path, user_id)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/graph/{repo_name}/most-imported")
def most_imported(repo_name: str, top_n: int = 10, user_id: str = Depends(get_current_user)):
    try:
        return get_top_imports(repo_name, user_id, top_n)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/graph/{repo_name}/file-description")
def file_description(repo_name: str, file_path: str, user_id: str = Depends(get_current_user)):
    try:
        return get_file_description(repo_name, file_path, user_id)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/graph/{repo_name}/function-description")
def function_description(repo_name: str, file_path: str, function_name: str, user_id: str = Depends(get_current_user)):
    try:
        return get_function_description(repo_name, file_path, function_name, user_id)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/graph/{repo_name}/file-details")
def file_details(repo_name: str, file_path: str, user_id: str = Depends(get_current_user)):
    try:
        from app.services.graph_service import get_file_details_service
        return get_file_details_service(repo_name, file_path, user_id)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))