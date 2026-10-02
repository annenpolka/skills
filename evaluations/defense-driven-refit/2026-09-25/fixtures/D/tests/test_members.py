from app.routes import members


class FakeCache(dict):
    def get(self, key):
        return dict.get(self, key)

    def set(self, key, value, ttl):
        self[key] = value


def test_admin_sees_email(monkeypatch, admin_user, rows):
    monkeypatch.setattr(members, "cache", FakeCache())
    monkeypatch.setattr(members.db, "fetch_all", lambda *a: rows)
    result = members.list_members(page=1, user=admin_user)
    assert result[0]["email"] == "a@example.com"


def test_member_does_not_see_email(monkeypatch, member_user, rows):
    monkeypatch.setattr(members, "cache", FakeCache())
    monkeypatch.setattr(members.db, "fetch_all", lambda *a: rows)
    result = members.list_members(page=1, user=member_user)
    assert "email" not in result[0]


def test_second_call_uses_cache(monkeypatch, admin_user, rows):
    cache = FakeCache()
    monkeypatch.setattr(members, "cache", cache)
    calls = []
    monkeypatch.setattr(members.db, "fetch_all", lambda *a: calls.append(a) or rows)
    members.list_members(page=1, user=admin_user)
    members.list_members(page=1, user=admin_user)
    assert len(calls) == 1
