"""組織設定（既存）。管理者がロゴ URL などを登録する。"""
from fastapi import APIRouter, Depends, HTTPException

from app import db
from app.auth import current_user

router = APIRouter()


@router.patch("/v1/org/settings")
def update_settings(body: dict, user=Depends(current_user)):
    if user.role != "admin":
        raise HTTPException(403)
    logo_url = body.get("logo_url")
    if logo_url is not None and not logo_url.startswith("https://"):
        raise HTTPException(422, "logo_url must be https")
    with db.transaction() as tx:
        tx.execute("UPDATE orgs SET logo_url = %s WHERE id = %s", (logo_url, user.org_id))
    return {"ok": True}
