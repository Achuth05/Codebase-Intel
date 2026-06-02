from fastapi import APIRouter, HTTPException
from app.api.schemas.ask_schema import AskRequest, AskResponse
from app.services.qa_service import answer_question, reset_conversation
from app.llm.rag_chain import stream_chain
from fastapi.responses import StreamingResponse
from app.utils.repo_store import user_has_access

router = APIRouter()

@router.post("/ask", response_model=AskResponse)
def ask(request: AskRequest):
    try:
        if not user_has_access(request.repo_name, request.user_id):
            raise HTTPException(status_code=403, detail="Forbidden")
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

@router.post("/ask/stream")
def ask_stream(request: AskRequest):
    try:
        if not user_has_access(request.repo_name, request.user_id):
            raise HTTPException(status_code=403, detail="Forbidden")
        return StreamingResponse(
            stream_chain(request.repo_name, request.question),
            media_type="text/plain"
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/ask/{repo_name}/memory")
def reset_memory(repo_name: str):
    return reset_conversation(repo_name)