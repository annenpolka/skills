# 座席予約サービス 内部仕様 v0.9

更新: 2026-09-12 / オーナー: 予約基盤

## 1. 状態

| 状態 | 意味 |
|---|---|
| HOLD | 予約者が座席を一時確保している |
| CONFIRMED | 予約確定 |
| EXPIRED | ホールドが期限切れとなり解放された |
| CANCELLED | 取消済み |

## 2. 操作

- `hold(seat)`: 空席を HOLD にする。`expires_at = 処理時刻 + 10分` を設定する。
- `confirm(hold)`: 状態が HOLD の予約を CONFIRMED にする。HOLD でなければ拒否する。
- `cancel(hold)`: HOLD または CONFIRMED の予約を CANCELLED にする。

## 3. ホールドの期限

- HOLD は `expires_at`（設定から10分後）を持つ。
- sweeper が最大 5 秒間隔で動作し、`expires_at` を過ぎた HOLD を EXPIRED にする。
- 予約者は期限までに `confirm` することを期待されている。

## 4. 外部から観測できる結果

- 予約者と運用者に見えるのは、各操作の受理/拒否と、予約の最終状態である。
