from fastapi import APIRouter, Depends, Response

from app import db
from app.auth import current_user

router = APIRouter()


@router.delete("/v1/me", status_code=204)
def delete_me(user=Depends(current_user)):
    db.execute("DELETE FROM users WHERE id = %s", (user.id,))
    return Response(status_code=204)
