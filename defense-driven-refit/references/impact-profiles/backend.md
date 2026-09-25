# Backend impact anchors

知識を想起・検索するための索引。要求・契約・運用から関係する行を選び、具体的な問いは案件に合わせて展開する。

| 分野 | こんなとき | 手掛かり |
|---|---|---|
| 認証・認可 | 利用者、権限、テナントを扱う | OWASP ASVS / BOLA・IDOR / tenant isolation / session revocation / CSRF |
| 個人情報・秘密 | 保存、削除、ログ、外部送信を扱う | data minimization / retention / deletion propagation / sensitive logging / key rotation |
| API・入力・互換性 | 公開APIや入出力の形式を変える | Hyrum Wright — Hyrum's Law / schema evolution / field presence / pagination / injection / SSRF |
| DB・トランザクション | 同時更新や整合条件がある | isolation levels / write skew / lost update / optimistic locking / unique constraints / deadlock |
| DBマイグレーション | schemaや既存データを変える | expand-contract / online DDL / backfill / mixed-version deployment / lossy transformation |
| ジョブ・イベント | queue、worker、再生を使う | at-least-once / ack gap / idempotent consumer / ordering / replay / DLQ / cancellation |
| 外部API・副作用 | 決済、通知、再試行を扱う | Marc Brooker — timeouts, retries, backoff, jitter / Malcolm Featonby — idempotent APIs / ambiguous outcome / webhooks / compensation |
| 分散協調・整合性 | 複数ノード、複製、leaseがある | Martin Kleppmann — DDIA, distributed locking / fencing tokens / Jepsen / consistency models / replication lag |
| キャッシュ | 結果を再利用する | cache key completeness / invalidation race / cache stampede / singleflight / negative caching / cold cache |
| 性能・資源・費用 | 負荷、並列数、データ量が増える | tail latency / backpressure / bounded queues / pool exhaustion / N+1 / query plans / noisy neighbor |
| 時刻・数値・識別子 | 期限、日付、金額、IDを扱う | civil time vs instant / monotonic clock / DST / decimal / rounding / precision / Unicode normalization |
| 運用・変更・復旧 | 配布、監視、停止、復元を扱う | Google SRE / golden signals / SLO / blast radius / graceful shutdown / rollback / RPO・RTO / restore drill |

複数分野が関係すれば組み合わせる。全行への回答やパターンの採用は求めない。
人名・概念名は入口であり、根拠や適合証拠ではない。製品・版固有の保証は対象の一次資料で確認し、案件固有の要件は補作しない。
コードに痕跡がないだけで非該当にせず、不明は調査する。対処を確認できた問いは閉じる。
公開検索には一般化した語を使い、社内コード・顧客情報・秘密を送らない。
