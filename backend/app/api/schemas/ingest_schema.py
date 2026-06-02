from pydantic import BaseModel

class IngestRequest(BaseModel):
    github_url: str
    force: bool = False
    user_id: str

class IngestResponse(BaseModel):
    status: str
    repo_name: str
    repo_path: str
    total_files: int
    total_chunks: int
    graph_nodes: int
    graph_edges: int
    errors: list[str] = []