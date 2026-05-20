from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.pipeline import run_pipeline

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