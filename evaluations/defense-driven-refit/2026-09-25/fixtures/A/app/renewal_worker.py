import logging
from datetime import datetime, timedelta

from app import db, mailer
from app.config import TAX_RATE
from app.payments_client import PaymentError, PaymentsClient

log = logging.getLogger(__name__)
payments = PaymentsClient()

MAX_FAILURES = 3
RETRY_AFTER = timedelta(days=3)


def run_due_renewals():
    now = datetime.now()
    subs = db.fetch_all(
        "SELECT * FROM subscriptions WHERE plan_type = 'annual' "
        "AND status = 'active' AND renews_at <= %s",
        (now,),
    )
    for sub in subs:
        customer = db.fetch_one(
            "SELECT * FROM customers WHERE id = %s", (sub["customer_id"],)
        )
        amount = round(sub["price"] * (1 + TAX_RATE), 2)
        try:
            payments.charge(
                customer_id=customer["payco_customer_id"],
                amount=amount,
                currency=sub["currency"],
                description=f"Annual renewal {sub['id']}",
            )
        except PaymentError as e:
            _record_failure(sub, customer, e, now)
            continue

        next_renewal = sub["renews_at"].replace(year=sub["renews_at"].year + 1)
        db.execute(
            "UPDATE subscriptions SET renews_at = %s, failure_count = 0 WHERE id = %s",
            (next_renewal, sub["id"]),
        )
        log.info("renewed subscription: sub=%s customer=%s", sub, customer)


def _record_failure(sub, customer, error, now):
    failures = sub["failure_count"] + 1
    if failures >= MAX_FAILURES:
        db.execute(
            "UPDATE subscriptions SET status = 'past_due', failure_count = %s WHERE id = %s",
            (failures, sub["id"]),
        )
        mailer.send(customer["email"], "renewal_failed", {"sub_id": sub["id"]})
    else:
        db.execute(
            "UPDATE subscriptions SET renews_at = %s, failure_count = %s WHERE id = %s",
            (now + RETRY_AFTER, failures, sub["id"]),
        )
    log.warning("renewal failed: sub=%s error=%s", sub["id"], error)
