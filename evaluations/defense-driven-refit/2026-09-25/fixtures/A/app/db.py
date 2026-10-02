import psycopg
from psycopg.rows import dict_row

from app.config import DATABASE_URL

_conn = psycopg.connect(DATABASE_URL, row_factory=dict_row, autocommit=True)


def fetch_all(sql, params=()):
    with _conn.cursor() as cur:
        cur.execute(sql, params)
        return cur.fetchall()


def fetch_one(sql, params=()):
    with _conn.cursor() as cur:
        cur.execute(sql, params)
        return cur.fetchone()


def execute(sql, params=()):
    with _conn.cursor() as cur:
        cur.execute(sql, params)
