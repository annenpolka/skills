"""API プロセス間で共有する Redis キャッシュ。"""
import json

import redis

from app.config import REDIS_URL

_r = redis.Redis.from_url(REDIS_URL)


def get(key):
    raw = _r.get(key)
    return None if raw is None else json.loads(raw)


def set(key, value, ttl):
    _r.set(key, json.dumps(value), ex=ttl)
