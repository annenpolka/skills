"""新規登録した利用者を外部の CRM（Acme CRM、SaaS）へ連携する。1時間ごとに起動（MKT-31）。"""
from app import db
from app.integrations import crm


def run():
    rows = db.fetch_all("SELECT id, email, display_name FROM users WHERE crm_contact_id IS NULL")
    for row in rows:
        contact = crm.create_contact(email=row["email"], name=row["display_name"])
        db.execute("UPDATE users SET crm_contact_id = %s WHERE id = %s", (contact["id"], row["id"]))
