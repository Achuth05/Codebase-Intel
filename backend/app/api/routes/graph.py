from fastapi import APIRouter, HTTPException
from app.graph.graph_builder import load_graph
from app.graph.graph_queries import (
    get_files_importing,
    get_all_functions,
    get_all_classes,
    get_file_summary,
    get_most_imported
)

router = APIRouter()

@router.get("/graph/{repo_name}/imports/{module_name}")
def files_importing(repo_name: str, module_name: str):
    try:
        G = load_graph(repo_name)
        return {"module": module_name, "imported_by": get_files_importing(G, module_name)}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/graph/{repo_name}/functions")
def all_functions(repo_name: str):
    try:
        G = load_graph(repo_name)
        return {"functions": get_all_functions(G)}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/graph/{repo_name}/classes")
def all_classes(repo_name: str):
    try:
        G = load_graph(repo_name)
        return {"classes": get_all_classes(G)}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/graph/{repo_name}/file")
def file_summary(repo_name: str, file_path: str):
    try:
        G = load_graph(repo_name)
        return get_file_summary(G, file_path)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/graph/{repo_name}/most-imported")
def most_imported(repo_name: str, top_n: int = 10):
    try:
        G = load_graph(repo_name)
        return {"most_imported": get_most_imported(G, top_n)}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))