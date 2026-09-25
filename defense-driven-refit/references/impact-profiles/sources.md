# Backend anchors: 一次資料への入口

作成日: 2026-09-25。以下は検索先の候補であり、案件への適用根拠や検証結果ではない。
URLの参照先を確認しているが、全記述の監査・全バージョンへの適用確認はしていない。
`current`等の更新される資料は、利用時に実際の製品・版・構成へ合わせる。
引用や仕様上の保証を使うときは該当箇所を取得し、タイトル・版・節・取得日を記録する。
リンクが切れていれば、タイトルと発行元で検索する。取得できなければ未確認とする。

人物の立場は論点の入口であり、唯一の正解ではない。特に分散ロックのような議論では、
実際の故障モデル・製品の現行仕様・反対の議論を確認し、人物名だけで方式を禁止/推奨しない。
各資料から本文を大量転載せず、以下では著作名と検索語だけを保持している。

<a id="authz"></a>
## AUTHZ — 認可
[OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
検索語: least privilege / deny by default / every request / relationship-based access control。

<a id="apisec"></a>
## APISEC — APIの脅威と資源消費
[OWASP API Security Top 10, 2023 edition](https://api-security.owasp.org/editions/2023/en/0x11-t10/)
検索語: BOLA / object property level authorization / unrestricted resource consumption / business flows。
2023版を入口にしている。最新版・採用基準であることを意味しない。

<a id="session"></a>
## SESSION — セッション
[OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
検索語: expiration / renewal / invalidation / session lifecycle。

<a id="csrf"></a>
## CSRF — ブラウザからの操作
[OWASP Cross-Site Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
検索語: CSRF token / SameSite / origin / client-side CSRF。

<a id="logging"></a>
## LOGGING — ログと機微情報
[OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
検索語: data to exclude / interaction identifier / verification / logging failures。

<a id="secrets"></a>
## SECRETS — 秘密情報のライフサイクル
[OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
検索語: rotation / revocation / expiration / backup / lifecycle。

<a id="privacy"></a>
## PRIVACY — 個人情報
[OWASP User Privacy Protection Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/User_Privacy_Protection_Cheat_Sheet.html)
検索語: privacy / encryption / user data。
削除期限・保持義務・削除対象はこの資料から一律に決めず、案件の要求と適用される規則を確認する。

<a id="input"></a>
## INPUT — 入力と正規化
[OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
検索語: syntactic vs semantic validation / Unicode normalization / length / allowlist。

<a id="sql"></a>
## SQL — SQL構築
[OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
検索語: prepared statements / parameterized queries / allow-list identifiers。

<a id="ssrf"></a>
## SSRF — 接続先制御
[OWASP Server Side Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
検索語: allowlist / redirects / DNS pinning / network layer。

<a id="http"></a>
## HTTP — HTTPの意味
[IETF / HTTP Working Group: RFC 9110, HTTP Semantics](https://httpwg.org/specs/rfc9110.html)
検索語: idempotent methods / conditional requests / status codes / Retry-After。
HTTPメソッドの性質と、業務上の副作用が一度だけになる保証は混同しない。

<a id="protobuf"></a>
## PROTOBUF — 通信形式の進化
[Protocol Buffers: Language Guide (proto 3)](https://protobuf.dev/programming-guides/proto3/)
検索語: updating a message type / field presence / unknown fields / enum / JSON mapping。
Protobufの保証をJSONや他形式へそのまま適用しない。使用形式の公式仕様へ展開する。

<a id="hyrum"></a>
## HYRUM — 観測可能な挙動への依存
[Hyrum Wright: Hyrum's Law](https://www.hyrumslaw.com/)
検索語: observable behavior / consumers / API compatibility。

<a id="tx"></a>
## TX — トランザクション分離
[PostgreSQL: Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
検索語: Read Committed / Repeatable Read / Serializable / serialization anomaly / retry。
PostgreSQL以外へは、対象DBの分離レベルと実際の保証を確認して置き換える。

<a id="locks"></a>
## LOCKS — ロック
[PostgreSQL: Explicit Locking](https://www.postgresql.org/docs/current/explicit-locking.html)
検索語: table-level locks / row-level locks / deadlocks / advisory locks。

<a id="alter"></a>
## ALTER — DDLの動作
[PostgreSQL: ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
検索語: lock / rewrite / validation / concurrent operations。
操作・DB版・テーブル条件に応じて確認する。無停止を一般保証しない。

<a id="migration"></a>
## MIGRATION — 新旧混在と段階的な移行
[GitLab: Avoiding downtime in migrations](https://docs.gitlab.com/development/database/avoiding_downtime_in_migrations/)
検索語: multi-release / rename / background migration / deployment order / compatibility。
GitLab自身の運用条件を前提とする資料。自分の案件に全手順を義務化しない。

<a id="acks"></a>
## ACKS — 配送・受領確認
[RabbitMQ: Consumer Acknowledgements and Publisher Confirms](https://www.rabbitmq.com/docs/confirms)
検索語: acknowledgements / confirms / requeue / redelivery / prefetch。
別のqueueではその製品の保証を確認する。brokerのACKと業務処理完了を分ける。

<a id="outbox"></a>
## OUTBOX — 二重書込み
[Chris Richardson: Transactional outbox](https://microservices.io/patterns/data/transactional-outbox.html)
検索語: database update and message publishing / message relay / duplicate messages。

<a id="idempotency"></a>
## IDEMPOTENCY — 再送の意味
[Malcolm Featonby: Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)
検索語: semantic equivalence / late arriving requests / same client request ID, different intent。

<a id="retry"></a>
## RETRY — 再試行と負荷
[Marc Brooker: Timeouts, retries, and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)
検索語: retries at multiple layers / timeout selection / capped backoff / jitter。
AWS Builder Centerへredirectされる場合がある。本文を取得できなければタイトルで一次資料を探す。

<a id="webhooks"></a>
## WEBHOOKS — 外部から届くイベント
[Stripe: Webhooks](https://docs.stripe.com/webhooks)
検索語: signature / raw body / duplicate events / event ordering / retries。
Stripe以外の配送保証・署名方式へ一般化せず、実際の送信元仕様を読む。

<a id="saga"></a>
## SAGA — 複数サービスの業務処理
[Chris Richardson: Saga](https://microservices.io/patterns/data/saga.html)
検索語: local transactions / compensation / lack of isolation / orchestration。
補償は物理的な時間巻戻しではない。必要な契約に対して最小の方式を選ぶ。

<a id="fencing"></a>
## FENCING — 期限を失った所有者
[Martin Kleppmann: How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)
検索語: efficiency vs correctness / process pause / lease expiry / fencing tokens。
2016年の議論。現行製品の能力判定は現行仕様で行い、当時の評価だけで決めない。

<a id="jepsen"></a>
## JEPSEN — 一貫性モデル
[Jepsen: Consistency](https://jepsen.io/consistency)
検索語: consistency models / histories / phenomena / serializability / linearizability。
理論上のモデルと特定製品・構成の検証結果を区別する。

<a id="caching"></a>
## CACHING — キャッシュの失敗条件
[Amazon Builders' Library: Caching challenges and strategies](https://aws.amazon.com/builders-library/caching-challenges-and-strategies/)
検索語: cache addiction / thundering herd / negative caching / downstream failure / versioning。

<a id="overload"></a>
## OVERLOAD — 過負荷
[Google SRE: Handling Overload](https://sre.google/sre-book/handling-overload/)
検索語: queue management / client-side throttling / load shedding / criticality。

<a id="cascading"></a>
## CASCADING — 障害の自己増幅
[Google SRE: Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/)
検索語: resource exhaustion / positive feedback / retries / recovery。

<a id="monitoring"></a>
## MONITORING — 結果を観測する
[Google SRE: Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
検索語: golden signals / symptoms vs causes / tail latency / monitoring complexity。

<a id="pitr"></a>
## PITR — バックアップと復元
[PostgreSQL: Continuous Archiving and Point-in-Time Recovery](https://www.postgresql.org/docs/current/continuous-archiving.html)
検索語: base backup / WAL archive / recovery / timeline / restore。
RPO・RTOは案件の目標。バックアップ機能があるだけで目標を達成したことにはしない。

<a id="explain"></a>
## EXPLAIN — 実行計画
[PostgreSQL: Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
検索語: estimated rows / actual rows / costs / ANALYZE / buffers。
EXPLAIN ANALYZEは実行を伴う。対象と副作用の許可を確認する。

<a id="datetime"></a>
## DATETIME — 日付と時刻
[PostgreSQL: Date/Time Types](https://www.postgresql.org/docs/current/datatype-datetime.html)
検索語: time zones / timestamp with time zone / date / interval / daylight saving。

<a id="monotonic"></a>
## MONOTONIC — 経過時間
[Python: time.monotonic](https://docs.python.org/3/library/time.html#time.monotonic)
検索語: monotonic clock / reference point / clock information。
実際に使う言語・OS・clockの仕様へ読み替える。異なるclock domainを比較しない。

<a id="numeric"></a>
## NUMERIC — 数値表現
[PostgreSQL: Numeric Types](https://www.postgresql.org/docs/current/datatype-numeric.html)
検索語: exact vs inexact / precision / scale / rounding / range。
DBだけでなくドライバ、実行言語、wire形式、外部サービスまで精度と単位を追う。
