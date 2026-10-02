from fastapi import APIRouter, Depends

from app import cache, db
from app.auth import current_user

router = APIRouter()
PAGE_SIZE = 50


def serialize(row, include_email):
    member = {"id": row["id"], "display_name": row["display_name"], "role": row["role"]}
    if include_email:
        member["email"] = row["email"]
    return member


@router.get("/v1/members")
def list_members(page: int = 1, user=Depends(current_user)):
    cache_key = f"members:page={page}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached
    rows = db.fetch_all(
        "SELECT id, display_name, email, role FROM users "
        "WHERE org_id = %s AND active ORDER BY id LIMIT %s OFFSET %s",
        (user.org_id, PAGE_SIZE, (page - 1) * PAGE_SIZE),
    )
    members = [serialize(r, include_email=user.role == "admin") for r in rows]
    cache.set(cache_key, members, ttl=60)
    return members
