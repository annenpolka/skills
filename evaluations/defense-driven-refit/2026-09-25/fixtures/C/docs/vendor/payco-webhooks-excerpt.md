# PayCo Webhooks 抜粋（社内転記、2026-03）

- 配送は at-least-once。同じイベントが複数回届くことがある。各イベントは一意の `id` を持つ。
- イベントの配送順序は保証しない。
- 各イベントは `created`（UNIX秒）と、送信時点の `data.object`（charge オブジェクト。`status` と `refunded` を含む）を持つ。
- 署名: `PayCo-Signature: t=<UNIX秒>,v1=<HMAC-SHA256(secret, "<t>.<raw body>") の16進>`。
  受信側は t の許容差（推奨 300 秒）を検査すること。
- 10 秒以内に 2xx を返さない場合、最大 3 日間、指数的に間隔を空けて再送する。
