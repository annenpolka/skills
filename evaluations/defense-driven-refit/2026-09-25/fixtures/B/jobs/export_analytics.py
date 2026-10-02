"""毎日 03:00 に users と orders の全件スナップショットを分析基盤へ出力する（DATA-12）。"""
from datetime import date

from app import db
from app.storage import write_parquet


def run():
    today = date.today().isoformat()
    users = db.fetch_all("SELECT id, email, phone, address, created_at FROM users")
    write_parquet(f"s3://acme-dwh/raw/users/dt={today}/users.parquet", users)
    orders = db.fetch_all("SELECT * FROM orders")
    write_parquet(f"s3://acme-dwh/raw/orders/dt={today}/orders.parquet", orders)
