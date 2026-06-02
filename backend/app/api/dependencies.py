from typing import Optional

from fastapi import Header, HTTPException


def get_current_user_id(x_user_id: Optional[str] = Header(None, alias="X-User-Id")) -> str:
    if not x_user_id:
        raise HTTPException(status_code=400, detail="Missing X-User-Id header")
    return x_user_id
