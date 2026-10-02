import secrets

from fastapi import APIRouter, Depends, HTTPException

from app import db, mailer
from app.auth import current_user
from app.logo import fetch_logo

router = APIRouter()


@router.post("/v1/invitations", status_code=201)
def invite(body: dict, user=Depends(current_user)):
    if user.role != "admin":
        raise HTTPException(403)
    with db.transaction() as tx:
        org = tx.execute(
            "SELECT o.id, o.name, o.logo_url, p.seat_limit FROM orgs o "
            "JOIN plans p ON p.id = o.plan_id WHERE o.id = %s",
            (user.org_id,),
        ).fetchone()
        used = tx.execute(
            "SELECT (SELECT count(*) FROM users WHERE org_id = %s AND active) + "
            "(SELECT count(*) FROM invitations WHERE org_id = %s AND accepted_at IS NULL) AS n",
            (user.org_id, user.org_id),
        ).fetchone()["n"]
        if used >= org["seat_limit"]:
            raise HTTPException(409, "seat limit reached")
        token = secrets.token_urlsafe(32)
        tx.execute(
            "INSERT INTO invitations (org_id, email, token, invited_by) VALUES (%s, %s, %s, %s)",
            (user.org_id, body["email"], token, user.id),
        )
        logo = fetch_logo(org["logo_url"]) if org["logo_url"] else None
        mailer.send_invitation(body["email"], org["name"], token, logo)
    return {"ok": True}
