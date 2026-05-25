from fastapi import APIRouter, HTTPException
from app.api.schemas.ask_schema import AskRequest, AskResponse
from app.services.qa_service import answer_question, reset_conversation

router = APIRouter()

@router.post("/ask", response_model=AskResponse)
def ask(request: AskRequest):
    try:
        result = answer_question(request.repo_name, request.question, request.k)
        return AskResponse(
            question=request.question,
            answer=result["answer"],
            sources=result["sources"],
            follow_up_questions=result.get("follow_up_questions", [])
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/ask/{repo_name}/memory")
def reset_memory(repo_name: str):
    return reset_conversation(repo_name)