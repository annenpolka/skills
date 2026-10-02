from fastapi import APIRouter, Depends

from app import audit, db
from app.auth import current_user

router = APIRouter()


@router.patch("/v1/me/profile")
def update_profile(body: dict, user=Depends(current_user)):
    db.execute(
        "UPDATE users SET display_name = %s, updated_at = now() WHERE id = %s",
        (body["display_name"], user.id),
    )
    audit.record(user.id, "profile.updated")
    return {"ok": True}
