from app import db


def purge_expired_sessions():
    db.execute("DELETE FROM sessions WHERE expires_at < now()")
