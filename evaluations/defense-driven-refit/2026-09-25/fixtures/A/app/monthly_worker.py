"""月額プランの更新ジョブ（既存、2024年から稼働）。deploy/monthly-worker.yaml で単独プロセスとして動く。"""
import logging
from datetime import datetime, timezone

from app import db, money
from app.payments_client import PaymentError, PaymentsClient

log = logging.getLogger(__name__)
payments = PaymentsClient()


def run_due_monthly():
    now = datetime.now(timezone.utc)
    subs = db.fetch_all(
        "SELECT s.*, c.payco_customer_id FROM subscriptions s "
        "JOIN customers c ON c.id = s.customer_id "
        "WHERE s.plan_type = 'monthly' AND s.status = 'active' AND s.renews_at <= %s",
        (now,),
    )
    for sub in subs:
        amount = money.with_tax_minor_units(sub["price"], sub["currency"])
        try:
            payments.charge(
                customer_id=sub["payco_customer_id"],
                amount=amount,
                currency=sub["currency"],
                description=f"Monthly renewal {sub['id']}",
            )
        except PaymentError:
            db.execute(
                "UPDATE subscriptions SET status = 'past_due' WHERE id = %s", (sub["id"],)
            )
            log.warning("monthly renewal failed: sub_id=%s", sub["id"])
            continue
        db.execute(
            "UPDATE subscriptions SET renews_at = renews_at + interval '1 month' WHERE id = %s",
            (sub["id"],),
        )
        log.info("monthly renewed: sub_id=%s", sub["id"])
