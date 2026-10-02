import hashlib
import hmac
import json
import time

from fastapi import APIRouter, HTTPException, Request

from app import db
from app.config import PAYCO_WEBHOOK_SECRET

router = APIRouter()

TOLERANCE_SECONDS = 300
STATUS_BY_EVENT = {
    "charge.succeeded": "paid",
    "charge.failed": "failed",
    "charge.refunded": "refunded",
}


def verify_signature(header: str, body: bytes, now: float) -> bool:
    try:
        parts = dict(item.split("=", 1) for item in header.split(","))
        timestamp = int(parts["t"])
        signature = parts["v1"]
    except (KeyError, ValueError):
        return False
    if abs(now - timestamp) > TOLERANCE_SECONDS:
        return False
    expected = hmac.new(
        PAYCO_WEBHOOK_SECRET.encode(), f"{timestamp}.".encode() + body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


@router.post("/webhooks/payco")
async def payco_webhook(request: Request):
    body = await request.body()
    if not verify_signature(request.headers.get("PayCo-Signature", ""), body, time.time()):
        raise HTTPException(400)
    event = json.loads(body)
    status = STATUS_BY_EVENT.get(event["type"])
    if status is None:
        return {"ignored": True}

    with db.transaction() as conn:
        inserted = conn.execute(
            "INSERT INTO processed_events (event_id) VALUES (%s) "
            "ON CONFLICT (event_id) DO NOTHING RETURNING event_id",
            (event["id"],),
        ).fetchone()
        if inserted is None:
            return {"duplicate": True}
        conn.execute(
            "UPDATE orders SET payment_status = %s WHERE payco_charge_id = %s",
            (status, event["data"]["object"]["id"]),
        )
    return {"ok": True}
