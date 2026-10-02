# PayCo API v2 抜粋（社内転記、2026-03）

原文は PayCo の開発者ポータル。この抜粋は決済基盤チームが必要箇所だけ転記したもの。

## POST /v2/charges

- 本文: `customer`（PayCo 顧客ID）、`amount`（通貨の最小単位の整数。JPY なら円、USD ならセント）、`currency`、`description`
- `Idempotency-Key` ヘッダを受け付ける。同じキーでの再送には最初の要求の結果を返す。
- キーの保持期間: 転記元に記載なし（PayCo サポートに問い合わせ中: SUP-4411）
- 5xx 応答の場合、課金が成立しているかどうかは不定のことがある。

## GET /v2/charges?customer=...&created_gte=...

- 顧客ごとの課金一覧を返す。
