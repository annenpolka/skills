from app import db


def record(user_id, action):
    db.execute("INSERT INTO audit_logs (user_id, action) VALUES (%s, %s)", (user_id, action))
