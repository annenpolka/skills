"""users の差分を OpenSearch（config/search.yaml）へ同期する。5分ごとに起動。"""
from app import db
from app.search import bulk_upsert, load_cursor, save_cursor


def run():
    cursor = load_cursor("users")
    rows = db.fetch_all(
        "SELECT id, email, display_name, phone, address, updated_at FROM users "
        "WHERE updated_at > %s ORDER BY updated_at LIMIT 1000",
        (cursor,),
    )
    if rows:
        bulk_upsert("users-v3", rows)
        save_cursor("users", rows[-1]["updated_at"])
