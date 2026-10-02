"""Bearer トークン認証。Authorization ヘッダの JWT を検証する。Cookie は使わない。"""
from dataclasses import dataclass

import jwt
from fastapi import Header, HTTPException

from app.config import JWT_PUBLIC_KEY

ACCESS_TOKEN_TTL_SECONDS = 24 * 60 * 60  # ログイン時に発行。更新は refresh_tokens で行う


@dataclass
class User:
    id: int
    email: str
    roles: list


def current_user(authorization: str = Header(...)) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(401)
    token = authorization.removeprefix("Bearer ")
    try:
        claims = jwt.decode(token, JWT_PUBLIC_KEY, algorithms=["RS256"])
    except jwt.PyJWTError:
        raise HTTPException(401)
    return User(id=int(claims["sub"]), email=claims["email"], roles=claims.get("roles", []))
