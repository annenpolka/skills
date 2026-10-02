import hashlib
import hmac
import json
import time

from app import webhooks
from app.webhooks import verify_signature

SECRET = "whsec_test"


def sign(body: bytes, t: int) -> str:
    sig = hmac.new(SECRET.encode(), f"{t}.".encode() + body, hashlib.sha256).hexdigest()
    return f"t={t},v1={sig}"


def test_valid_signature(monkeypatch):
    monkeypatch.setattr(webhooks, "PAYCO_WEBHOOK_SECRET", SECRET)
    body = b'{"id":"evt_1"}'
    now = time.time()
    assert verify_signature(sign(body, int(now)), body, now)


def test_rejects_tampered_body(monkeypatch):
    monkeypatch.setattr(webhooks, "PAYCO_WEBHOOK_SECRET", SECRET)
    now = time.time()
    header = sign(b'{"id":"evt_1"}', int(now))
    assert not verify_signature(header, b'{"id":"evt_2"}', now)


def test_rejects_old_timestamp(monkeypatch):
    monkeypatch.setattr(webhooks, "PAYCO_WEBHOOK_SECRET", SECRET)
    body = b'{"id":"evt_1"}'
    now = time.time()
    assert not verify_signature(sign(body, int(now) - 301), body, now)


def test_duplicate_event_is_ignored(client_with_db):
    client, fake_db = client_with_db
    event = {"id": "evt_1", "type": "charge.succeeded", "data": {"object": {"id": "ch_1"}}}
    client.post_signed(event)
    client.post_signed(event)
    assert fake_db.updates == [("paid", "ch_1")]


def test_refund_after_success(client_with_db):
    client, fake_db = client_with_db
    client.post_signed({"id": "evt_1", "type": "charge.succeeded", "data": {"object": {"id": "ch_1"}}})
    client.post_signed({"id": "evt_2", "type": "charge.refunded", "data": {"object": {"id": "ch_1"}}})
    assert fake_db.updates[-1] == ("refunded", "ch_1")
