# PR #402: PayCo webhook で注文の支払状態を更新する（PAY-140）

## 概要

PayCo から届く webhook を受け、注文の支払状態（`orders.payment_status`）を更新します。

## 変更ファイル

- `app/webhooks.py`（新規）: 署名検証、重複排除、状態更新
- `migrations/0051_processed_events.sql`（新規）
- `tests/test_webhooks.py`（新規）

変更していないが関係するファイル: `app/db.py`、`migrations/0020_orders.sql`、`docs/`

## テスト

`pytest tests/test_webhooks.py` 全件成功
