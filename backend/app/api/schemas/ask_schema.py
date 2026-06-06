from pydantic import BaseModel

class AskRequest(BaseModel):
    repo_name: str
    question: str
    k: int = 5

class AskResponse(BaseModel):
    question: str
    answer: str
    sources: list[str]
    follow_up_questions: list[str] = []