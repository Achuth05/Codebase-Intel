from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.pipeline import run_pipeline
from app.graph.graph_builder import load_graph
from app.graph.graph_queries import (
    get_files_importing,
    get_all_functions,
    get_all_classes,
    get_file_summary,
    get_most_imported
)
from app.embeddings.retriever import retrieve_chunks
from app.llm.groq_client import ask_groq

app = FastAPI()

class IngestRequest(BaseModel):
    github_url: str

@app.get("/")
def root():
    return {"message": "Codebase Intel API is running"}

@app.post("/ingest")
def ingest(request: IngestRequest):
    try:
        result = run_pipeline(request.github_url)
        return {
            "status": "success",
            "repo_path": result["repo_path"],
            "total_files": result["total_files"],
            "errors": result["errors"],
            "sample": result["parsed_files"][:5]
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/graph/{repo_name}/imports/{module_name}")
def files_importing(repo_name: str, module_name: str):
    G = load_graph(repo_name)
    return {"module": module_name, "imported_by": get_files_importing(G, module_name)}

@app.get("/graph/{repo_name}/functions")
def all_functions(repo_name: str):
    G = load_graph(repo_name)
    return {"functions": get_all_functions(G)}

@app.get("/graph/{repo_name}/classes")
def all_classes(repo_name: str):
    G = load_graph(repo_name)
    return {"classes": get_all_classes(G)}

@app.get("/graph/{repo_name}/file")
def file_summary(repo_name: str, file_path: str):
    G = load_graph(repo_name)
    return get_file_summary(G, file_path)

@app.get("/graph/{repo_name}/most-imported")
def most_imported(repo_name: str, top_n: int = 10):
    G = load_graph(repo_name)
    return {"most_imported": get_most_imported(G, top_n)}

class QueryRequest(BaseModel):
    repo_name: str
    question: str
    k: int = 5

@app.post("/query")
def query(request: QueryRequest):
    try:
        chunks = retrieve_chunks(request.repo_name, request.question, request.k)
        answer = ask_groq(request.question, chunks)
        return {
            "question": request.question,
            "answer": answer,
            "sources": [c["file_path"] for c in chunks]
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))