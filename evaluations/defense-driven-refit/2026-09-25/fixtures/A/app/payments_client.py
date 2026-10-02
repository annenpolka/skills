import time

import requests

from app.config import PAYMENTS_API_KEY, PAYMENTS_API_URL


class PaymentError(Exception):
    pass


class PaymentsClient:
    def __init__(self, max_attempts=3, backoff_seconds=2):
        self.max_attempts = max_attempts
        self.backoff_seconds = backoff_seconds

    def charge(self, customer_id, amount, currency, description):
        payload = {
            "customer": customer_id,
            "amount": amount,
            "currency": currency,
            "description": description,
        }
        last_error = None
        for attempt in range(1, self.max_attempts + 1):
            try:
                resp = requests.post(
                    f"{PAYMENTS_API_URL}/v2/charges",
                    json=payload,
                    headers={"Authorization": f"Bearer {PAYMENTS_API_KEY}"},
                )
            except requests.ConnectionError as e:
                last_error = e
                time.sleep(self.backoff_seconds)
                continue
            if resp.status_code >= 500:
                last_error = PaymentError(resp.text)
                time.sleep(self.backoff_seconds)
                continue
            if resp.status_code >= 400:
                raise PaymentError(resp.json().get("error", {}).get("message"))
            return resp.json()
        raise PaymentError(f"charge failed after {self.max_attempts} attempts: {last_error}")
