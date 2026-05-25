from pydantic import BaseModel

class ImpactRequest(BaseModel):
    repo_name: str
    file_path: str

class ImpactResponse(BaseModel):
    file: str
    symbols_defined: list[dict]
    direct_dependents: list[str]
    indirect_dependents: list[str]
    total_impact: int