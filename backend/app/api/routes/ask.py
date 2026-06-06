from fastapi import APIRouter, HTTPException, Depends
from app.api.schemas.ask_schema import AskRequest, AskResponse
from app.services.qa_service import answer_question, reset_conversation
from app.llm.rag_chain import stream_chain
from app.api.auth import get_current_user
from fastapi.responses import StreamingResponse

router = APIRouter()

@router.post("/ask", response_model=AskResponse)
def ask(request: AskRequest, user_id: str = Depends(get_current_user)):
    try:
        result = answer_question(request.repo_name, request.question, user_id=user_id, k=request.k)
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
def ask_stream(request: AskRequest, user_id: str = Depends(get_current_user)):
    try:
        return StreamingResponse(
            stream_chain(request.repo_name, request.question, user_id=user_id),
            media_type="text/plain"
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/ask/{repo_name}/memory")
def reset_memory(repo_name: str, user_id: str = Depends(get_current_user)):
    return reset_conversation(repo_name, user_id)