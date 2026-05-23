from fastapi import APIRouter, HTTPException
from app.api.schemas.ask_schema import AskRequest, AskResponse
from app.llm.rag_chain import ask_chain, clear_memory
from app.llm.response_formatter import format_response

router = APIRouter()

@router.post("/ask", response_model=AskResponse)
def ask(request: AskRequest):
    try:
        result = ask_chain(request.repo_name, request.question)
        formatted = format_response(result["answer"], result["sources"])

        return AskResponse(
            question=request.question,
            answer=formatted["answer"],
            sources=formatted["sources"],
            follow_up_questions=formatted["follow_up_questions"]
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/ask/{repo_name}/memory")
def reset_memory(repo_name: str):
    clear_memory(repo_name)
    return {"status": "memory cleared", "repo_name": repo_name}