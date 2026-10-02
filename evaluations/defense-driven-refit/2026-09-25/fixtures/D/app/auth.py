from dataclasses import dataclass

from fastapi import Header, HTTPException

from app import sessions


@dataclass
class User:
    id: int
    org_id: int
    role: str  # "admin" | "member"


def current_user(authorization: str = Header(...)) -> User:
    session = sessions.lookup(authorization.removeprefix("Bearer "))
    if session is None:
        raise HTTPException(401)
    return User(id=session["user_id"], org_id=session["org_id"], role=session["role"])
