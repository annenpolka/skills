from contextlib import contextmanager

from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from app.config import DATABASE_URL, DB_POOL_SIZE

pool = ConnectionPool(DATABASE_URL, max_size=DB_POOL_SIZE, kwargs={"row_factory": dict_row})


def fetch_all(sql, params=()):
    with pool.connection() as conn:
        return conn.execute(sql, params).fetchall()


def fetch_one(sql, params=()):
    with pool.connection() as conn:
        return conn.execute(sql, params).fetchone()


@contextmanager
def transaction():
    with pool.connection() as conn:
        with conn.transaction():
            yield conn
