from pydantic import BaseModel

class ReadmeResponse(BaseModel):
    repo_name: str
    readme: str
    saved_to: str

class FunctionDocsRequest(BaseModel):
    repo_name: str
    file_path: str

class FunctionDocsResponse(BaseModel):
    file: str
    functions_documented: int
    docs: list[dict]