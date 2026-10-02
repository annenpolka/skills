import pytest
from fastapi import HTTPException

from app.routes import invitations


def test_rejects_when_seats_full(fake_tx_factory, admin_user, monkeypatch):
    monkeypatch.setattr(invitations.db, "transaction", fake_tx_factory(seat_limit=5, used=5))
    with pytest.raises(HTTPException) as e:
        invitations.invite({"email": "new@example.com"}, user=admin_user)
    assert e.value.status_code == 409


def test_sends_invitation_with_logo(fake_tx_factory, admin_user, monkeypatch):
    sent = []
    monkeypatch.setattr(invitations.db, "transaction", fake_tx_factory(seat_limit=5, used=1))
    monkeypatch.setattr(invitations, "fetch_logo", lambda url: b"PNG")
    monkeypatch.setattr(invitations.mailer, "send_invitation", lambda *a: sent.append(a))
    invitations.invite({"email": "new@example.com"}, user=admin_user)
    assert sent[0][3] == b"PNG"
