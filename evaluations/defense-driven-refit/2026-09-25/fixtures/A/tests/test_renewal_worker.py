from datetime import datetime

import pytest

from app import renewal_worker
from app.payments_client import PaymentError


class FakeDB:
    def __init__(self, subs, customers):
        self.subs = {s["id"]: s for s in subs}
        self.customers = customers
        self.executed = []

    def fetch_all(self, sql, params=()):
        return [s for s in self.subs.values() if s["status"] == "active"]

    def fetch_one(self, sql, params=()):
        return self.customers[params[0]]

    def execute(self, sql, params=()):
        self.executed.append((sql, params))


class FakePayments:
    def __init__(self, fail=False):
        self.fail = fail
        self.calls = []

    def charge(self, **kwargs):
        self.calls.append(kwargs)
        if self.fail:
            raise PaymentError("card_declined")
        return {"id": "ch_1"}


@pytest.fixture
def sub():
    return {
        "id": 1, "customer_id": 10, "plan_type": "annual", "status": "active",
        "price": 12000.0, "currency": "JPY", "failure_count": 0,
        "renews_at": datetime(2026, 9, 1, 0, 0),
    }


@pytest.fixture
def customers():
    return {10: {"id": 10, "email": "a@example.com", "payco_customer_id": "cus_1"}}


def test_renews_and_sets_next_year(monkeypatch, sub, customers):
    db = FakeDB([sub], customers)
    payments = FakePayments()
    monkeypatch.setattr(renewal_worker, "db", db)
    monkeypatch.setattr(renewal_worker, "payments", payments)

    renewal_worker.run_due_renewals()

    assert payments.calls[0]["amount"] == 13200.0
    assert db.executed[-1][1] == (datetime(2027, 9, 1, 0, 0), 1)


def test_failure_schedules_retry(monkeypatch, sub, customers):
    db = FakeDB([sub], customers)
    monkeypatch.setattr(renewal_worker, "db", db)
    monkeypatch.setattr(renewal_worker, "payments", FakePayments(fail=True))

    renewal_worker.run_due_renewals()

    sql, params = db.executed[-1]
    assert "failure_count" in sql and params[1] == 1


def test_third_failure_marks_past_due(monkeypatch, sub, customers):
    sub["failure_count"] = 2
    db = FakeDB([sub], customers)
    sent = []
    monkeypatch.setattr(renewal_worker, "db", db)
    monkeypatch.setattr(renewal_worker, "payments", FakePayments(fail=True))
    monkeypatch.setattr(renewal_worker.mailer, "send", lambda *a: sent.append(a))

    renewal_worker.run_due_renewals()

    assert "past_due" in db.executed[-1][0]
    assert sent[0][0] == "a@example.com"
