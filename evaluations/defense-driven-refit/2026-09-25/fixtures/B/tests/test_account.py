from fastapi.testclient import TestClient

from app import db
from app.auth import User, current_user
from app.main import app


class FakeDB:
    def __init__(self):
        self.executed = []

    def execute(self, sql, params=()):
        self.executed.append((sql, params))


def test_delete_me_removes_user(monkeypatch):
    fake = FakeDB()
    monkeypatch.setattr(db, "execute", fake.execute)
    app.dependency_overrides[current_user] = lambda: User(id=7, email="u@example.com", roles=[])

    resp = TestClient(app).delete("/v1/me")

    assert resp.status_code == 204
    assert fake.executed == [("DELETE FROM users WHERE id = %s", (7,))]
