# Backend impact anchors

Version: 0.1.0 / 作成日: 2026-09-25

これは検査結果でも必須設計集でもなく、案件に必要な知識を呼び出す候補索引。
各行は `ID / 適用場面 / anchors / 外せない問い`。問いは本索引の作成者による提案であり、
リンク先の著者がそのまま述べた質問ではない。関連資料へのリンクは根拠・適合証拠の代用にならない。
共通手順は [README](README.md)。まず入口一覧を確認し、該当・不明の節だけ詳しく読む。
人物名は著作・概念と組にし、人物の模倣や唯一の正解の指定には使わない。

## 入口一覧

| 節 | 適用を調べる手掛かり | 項目ID |
|---|---|---|
| [認証・認可](#auth) | 主体、所有者、テナント、権限、ブラウザ認証 | BE-AUTH-01〜06 |
| [個人情報・秘密・削除](#data) | 機微データ、ログ、保持、削除、秘密情報 | BE-DATA-01〜06 |
| [API・入力・互換性](#api) | 外部consumer、形式、ページング、入力、URL取得 | BE-API-01〜06 |
| [DB・トランザクション](#db) | 同時更新、不変条件、ロック、複製、複数保存先 | BE-DB-01〜06 |
| [DBマイグレーション](#mig) | DDL、backfill、データ変換、新旧の混在 | BE-MIG-01〜06 |
| [ジョブ・イベント](#job) | queue、worker、配送、再生、キャンセル | BE-JOB-01〜06 |
| [外部API・副作用](#ext) | HTTP/RPC、決済、通知、Webhook、再試行 | BE-EXT-01〜06 |
| [分散協調・整合性](#dist) | lease、leader、分断、複製、複数ノード | BE-DIST-01〜06 |
| [キャッシュ](#cache) | 共有/ローカルキャッシュ、失効、負のキャッシュ | BE-CACHE-01〜06 |
| [性能・資源・費用](#perf) | fan-out、pool、queue、巨大入力、負荷偏り | BE-PERF-01〜06 |
| [時刻・数値・識別子](#value) | 締め日、期限、定期実行、金額、単位、正規化 | BE-VALUE-01〜06 |
| [運用・変更・復旧](#ops) | 監視、配布、設定、バックアップ、停止、縮退 | BE-OPS-01〜06 |

Backendだから全行該当するわけではない。分野ごとの非該当理由と不明点を先に整理する。
逆に、diffに現れない要求や運用条件も入口になる。適用漏れを全文検索だけで判定しない。

<a id="auth"></a>
## 認証・認可

| ID | 適用場面 | anchors・検索入口 | 外せない問い |
|---|---|---|---|
| BE-AUTH-01 | ID指定、一覧、一括処理、テナント分離 | BOLA / IDOR / object-level authorization / [OWASP](sources.md#authz) | 認証済みであることとは別に、各対象への操作権限とテナント境界を確認しているか？ |
| BE-AUTH-02 | 入力をモデルへ一括割当、応答へ多数の属性を出す | mass assignment / property-level authorization / [API Security](sources.md#apisec) | owner、role、内部状態など、読める属性・書ける属性を操作単位で制限しているか？ |
| BE-AUTH-03 | セッション、JWT、refresh token、退会や権限変更 | revocation / session lifecycle / [OWASP Session Management](sources.md#session) | 失効後も使える経路と期間は何か。それは採用した失効要件の範囲内か？ |
| BE-AUTH-04 | ブラウザがCookie等を自動送信する状態変更API | CSRF / SameSite / origin / [OWASP CSRF](sources.md#csrf) | 認証情報が自動付与される要求を、意図した操作とどう区別するか。CORSだけで済ませていないか？ |
| BE-AUTH-05 | enqueue後に権限や所有者が変わり得る | authorization TOCTOU / delegated authority / [OWASP](sources.md#authz) | 実行時の権限と受付時の権限のどちらを使う契約か。古い権限を無期限に持ち越さないか？ |
| BE-AUTH-06 | 認可サービス、policy、権限キャッシュに依存 | deny by default / fail closed / [OWASP](sources.md#authz) | 判定不能・タイムアウト・古いpolicyで何を許すか。縮退が権限拡大にならないか？ |

<a id="data"></a>
## 個人情報・秘密・削除

| ID | 適用場面 | anchors・検索入口 | 外せない問い |
|---|---|---|---|
| BE-DATA-01 | ログ、trace、エラー、監査へデータを出す | data minimization / sensitive logging / [OWASP Logging](sources.md#logging) | 正常系だけでなく例外・再試行・debug経路からも秘密や個人情報が流れないか？ |
| BE-DATA-02 | APIキー、証明書、暗号鍵を使う | rotation / revocation / key lifecycle / [OWASP Secrets Management](sources.md#secrets) | 鍵の切替中と復元後に必要な読み書きができ、失効すべき鍵は使えなくなるか？ |
| BE-DATA-03 | 削除要求、退会、複製先やバックアップがある | deletion propagation / tombstone / [Privacy](sources.md#privacy)・[PITR](sources.md#pitr) | 削除契約はどの保存先まで及ぶか。再同期・再生・復元で対象が復活しないか？ |
| BE-DATA-04 | 保存期限、TTL、定期消去を設定する | retention / purpose limitation / [Privacy](sources.md#privacy) | 何を起点に何をいつ消すか。期間や例外の根拠は案件資料にあり、実際に消去を確認できるか？ |
| BE-DATA-05 | CSV等のexport、署名URL、ダウンロード成果物 | export authorization / capability URL / [OWASP](sources.md#authz) | 生成時と取得時の権限、対象範囲、URL寿命は契約どおりか。一覧APIより広く漏らさないか？ |
| BE-DATA-06 | 本番データを開発・検証・外部サービスへ渡す | data minimization / pseudonymization / [Privacy](sources.md#privacy) | 本番データである必要があるか。最小化・アクセス・保持・再識別の条件を確認したか？ |

<a id="api"></a>
## API・入力・互換性

| ID | 適用場面 | anchors・検索入口 | 外せない問い |
|---|---|---|---|
| BE-API-01 | 公開API、SDK、共通ライブラリの挙動を変える | Hyrum Wright / Hyrum's Law / observable behavior / [著作](sources.md#hyrum) | 未文書化の順序、エラー、既定値、タイミングにconsumerが依存していないか？ |
| BE-API-02 | 部分更新、nullable項目、default追加 | absent vs null / field presence / [Protobuf](sources.md#protobuf)・[HTTP](sources.md#http) | 未指定・null・空・既定値が、それぞれ維持・削除・代入のどれを意味する契約か？ |
| BE-API-03 | JSON/Protobuf等の形式やenumを変更する | schema evolution / unknown fields / wire compatibility / [Protobuf](sources.md#protobuf) | 新旧reader/writerで意味が保たれるか。使用する形式の仕様を確認し、別形式の保証を流用していないか？ |
| BE-API-04 | ページング、一覧、全件export | keyset pagination / stable ordering / snapshot consistency / [Isolation](sources.md#tx) | 並行した追加・更新・削除で抜けや重複が出る条件と、必要な一貫性は何か？ |
| BE-API-05 | SQLや式、識別子を外部入力から組み立てる | parameterized queries / allow-list identifiers / [OWASP SQL Injection](sources.md#sql) | 値と構文を分離しているか。パラメータ化できない識別子や並び順も制限しているか？ |
| BE-API-06 | 外部URL取得、callback登録、proxy、画像取込 | SSRF / redirects / DNS rebinding / [OWASP SSRF](sources.md#ssrf) | URL検査から接続まで、redirectや名前解決を含めて許可した接続先だけに到達するか？ |

<a id="db"></a>
## DB・トランザクション

| ID | 適用場面 | anchors・検索入口 | 外せない問い |
|---|---|---|---|
| BE-DB-01 | 複数行にまたがる残数・上限・整合条件 | write skew / serializability / [Jepsen](sources.md#jepsen)・[Isolation](sources.md#tx) | 各トランザクション単独では正しくても、同時に成立すると不変条件を破らないか？ |
| BE-DB-02 | read-modify-write、カウンタ、状態更新 | lost update / compare-and-swap / optimistic locking / [Isolation](sources.md#tx) | 読み取り後の他者の更新を消さないか。競合検出後の再計算・再試行も正しいか？ |
| BE-DB-03 | 存在確認してから作成、一意な業務ID | check-then-act / unique constraint / upsert / [Isolation](sources.md#tx) | 並行要求をDB側の制約でも扱えるか。競合した要求に返す意味は契約どおりか？ |
| BE-DB-04 | 複数ロック、長いtransaction、外部I/Oを挟む | lock ordering / deadlock / lock timeout / [PostgreSQL Locking](sources.md#locks) | 保持時間と取得順序は何か。待ち・deadlock・再試行が他の処理を連鎖停止させないか？ |
| BE-DB-05 | read replica、読み書き分離、更新直後の読取 | read-your-writes / replication lag / [Jepsen](sources.md#jepsen) | どの読取に更新の即時可視性が必要か。遅れを許す経路と許さない経路を区別したか？ |
| BE-DB-06 | DB更新とpublish/別DB更新を一つの操作にする | Chris Richardson / transactional outbox / dual write / [著作](sources.md#outbox) | 二つの操作の隙間で停止しても、必要な通知・状態更新が欠けたり重複したりしないか？ |

<a id="mig"></a>
## DBマイグレーション

| ID | 適用場面 | anchors・検索入口 | 外せない問い |
|---|---|---|---|
| BE-MIG-01 | ALTER、index、制約追加を稼働中に行う | DDL locks / table rewrite / concurrent index / [ALTER TABLE](sources.md#alter)・[Locking](sources.md#locks) | 対象DB・版・操作で何をどれだけ待たせるか。サイズと長時間transactionを含めて確認したか？ |
| BE-MIG-02 | schema変更とアプリ配布が同時には完了しない | expand-contract / parallel change / mixed versions / [GitLab migrations](sources.md#migration) | 旧reader・新reader・旧writer・新writerが混在する各段階で契約が成立するか？ |
| BE-MIG-03 | 稼働中データをbackfillする | stale backfill / compare-and-set / concurrent writes / [Isolation](sources.md#tx)・[Migrations](sources.md#migration) | 古い値から計算した結果が、その間の通常更新を上書きしないか？ |
| BE-MIG-04 | 長時間・分割・再開可能なbackfill | checkpoint / keyset scan / idempotent batch / [Migrations](sources.md#migration) | 中断位置・再実行・走査中の追加削除で、抜けや二重適用が起きないか。完了をどう数えるか？ |
| BE-MIG-05 | 値の分割、統合、意味や単位を変更する | lossy transformation / semantic migration / [Migrations](sources.md#migration) | 旧値だけで新しい意味を確定できるか。情報不足の行を勝手に推定し、確定値として保存しないか？ |
| BE-MIG-06 | down migration、旧binaryへのrollback、列削除 | rollback compatibility / new writes / contract phase / [Migrations](sources.md#migration) | 新形式の書込み後も戻せるか。戻せない地点・復旧方法・旧利用者を捨てる条件は何か？ |

<a id="job"></a>
## ジョブ・イベント

| ID | 適用場面 | anchors・検索入口 | 外せない問い |
|---|---|---|---|
| BE-JOB-01 | workerが副作用を実行してACKする | at-least-once / ack gap / idempotent consumer / [RabbitMQ](sources.md#acks) | 副作用の成功とACKの間で停止した場合、再配送をどう扱うか。brokerの保証を副作用へ拡張していないか？ |
| BE-JOB-02 | 同じ対象の複数イベント、partition、複数worker | ordering scope / sequence / stale event / [RabbitMQ](sources.md#acks) | どの単位の順序が必要か。古いイベントが後から到着して新しい状態を巻き戻さないか？ |
| BE-JOB-03 | 失敗を再試行するqueue | poison message / DLQ / retry budget / [RabbitMQ](sources.md#acks)・[Retry](sources.md#retry) | 恒久失敗を無限再試行しないか。隔離後の発見・修正・再投入の経路はあるか？ |
| BE-JOB-04 | イベント再生、障害復旧のreplay | replay-safe side effects / deduplication horizon / [Idempotency](sources.md#idempotency) | 履歴の再計算で通知や請求まで再発生しないか。再実行すべき効果と抑止すべき効果は何か？ |
| BE-JOB-05 | queueに旧形式のpayloadが残ったまま更新する | message schema evolution / field presence / [Protobuf](sources.md#protobuf) | 保持期間中の全payloadを新workerが読めるか。旧workerも新payloadを読まされる期間がないか？ |
| BE-JOB-06 | ジョブ期限、キャンセル、再配置、worker停止 | cancellation vs completion / lease / redelivery / [RabbitMQ](sources.md#acks) | キャンセル済みや期限切れの仕事が効果を確定しないか。停止後の再担当と完了の競合はどう扱うか？ |

<a id="ext"></a>
## 外部API・副作用

| ID | 適用場面 | anchors・検索入口 | 外せない問い |
|---|---|---|---|
| BE-EXT-01 | 決済・作成・送信後の応答を受け取れない | Malcolm Featonby / ambiguous outcome / idempotent APIs / [著作](sources.md#idempotency) | 相手で成功したか不明な操作を、再送・照会・保留のどれで扱うか？ |
| BE-EXT-02 | idempotency keyを生成・保存・再利用する | same key different intent / late arriving requests / [Featonby](sources.md#idempotency) | 論理操作とキーの寿命は一致するか。異なる内容の同一キーや保持期限後の再送をどう扱うか？ |
| BE-EXT-03 | SDK、service、jobがそれぞれretryする | Marc Brooker / retry amplification / timeout budget / jitter / [著作](sources.md#retry) | 全階層の総試行回数と総時間はどこで制限するか。回復を再試行が妨げないか？ |
| BE-EXT-04 | Webhookを受信して状態を更新する | signature raw body / replay / duplicate event / ordering / [Stripe](sources.md#webhooks) | 送信元確認と重複・順序対策を別々に満たすか。署名済みでも再実行を無制限に許さないか？ |
| BE-EXT-05 | 複数サービスをまたぐ業務処理と取消 | Chris Richardson / saga / compensation / [著作](sources.md#saga) | 途中成功をどう回復するか。補償の失敗・重複・取り消せない副作用も契約に入っているか？ |
| BE-EXT-06 | 相手側quota、429、Retry-After、課金がある | rate limit / Retry-After / per-tenant budget / [HTTP](sources.md#http)・[Overload](sources.md#overload) | 再送時刻・並列数・利用予算は相手の契約と一致するか。他の利用者の枠まで使い切らないか？ |

<a id="dist"></a>
## 分散協調・整合性

| ID | 適用場面 | anchors・検索入口 | 外せない問い |
|---|---|---|---|
| BE-DIST-01 | 有効期限付きロックで重要な更新を守る | Martin Kleppmann / lease expiry / fencing tokens / [著作](sources.md#fencing) | leaseを失った旧workerが復帰して書き込めないか。保存先が古い所有者の操作を拒否するか？ |
| BE-DIST-02 | 分断中も複数ノードで読書きを続ける | consistency model / histories / linearizability / [Jepsen](sources.md#jepsen) | 分断中に許す結果と停止する操作は何か。必要以上の保証も、保証不足も押し付けていないか？ |
| BE-DIST-03 | 複数経路の要求を同じ操作として識別する | operation ID vs attempt ID / semantic identity / [Idempotency](sources.md#idempotency) | 同じ操作の再送と、意図した別操作を区別できるか。request IDを毎回変えて無効化していないか？ |
| BE-DIST-04 | 複製、failover、成功応答、永続化を扱う | acknowledged write loss / durability / quorum / [Jepsen](sources.md#jepsen)・[PITR](sources.md#pitr) | どの保存状態で成功を返すか。切替後に失ってよい範囲と実際の製品保証は一致するか？ |
| BE-DIST-05 | ノード間のtimestampで勝者や順序を決める | clock skew / happens-before / causal order / [Jepsen](sources.md#jepsen) | 時計の大小を因果順序と同一視していないか。ずれ・同値・遅延到着をどう扱うか？ |
| BE-DIST-06 | 各instanceで並列数・同時実行・quotaを制限する | local vs global limit / admission control / [Overload](sources.md#overload) | 台数が増えると全体上限も増えてしまわないか。必要なのは局所上限か全体上限か？ |

<a id="cache"></a>
## キャッシュ

| ID | 適用場面 | anchors・検索入口 | 外せない問い |
|---|---|---|---|
| BE-CACHE-01 | ユーザー・権限・テナント依存の結果を共有する | cache key completeness / authorization context / [Caching](sources.md#caching)・[OWASP](sources.md#authz) | 結果に影響する主体や条件がキーと失効に反映され、別利用者の結果を返さないか？ |
| BE-CACHE-02 | 更新とinvalidate、read-throughが並行する | stale refill / invalidation race / versioned cache / [Caching](sources.md#caching) | 失効後に古い読取結果が再登録されないか。許すstalenessの上限は何か？ |
| BE-CACHE-03 | 人気キー失効、同時cache miss | cache stampede / singleflight / TTL jitter / [Caching](sources.md#caching) | missが一斉にoriginへ流れた場合に耐えるか。再生成をまとめる必要と範囲は何か？ |
| BE-CACHE-04 | not-found、失敗、空結果もcacheする | negative caching / error caching / [Caching](sources.md#caching) | 一時障害や作成直前の未存在を、正常な未存在として長く固定しないか？ |
| BE-CACHE-05 | cacheが停止・全消去・cold startする | cold cache / cache addiction / origin capacity / [Caching](sources.md#caching) | cacheがなくても縮退できるか。無制限fallbackで保存先まで停止させないか？ |
| BE-CACHE-06 | cacheの値の形式や意味を変更する | cache schema version / rolling deployment / [Caching](sources.md#caching) | 新旧binaryが互いの値を誤読しないか。切替・巻戻し・旧値失効の期間を扱えるか？ |

<a id="perf"></a>
## 性能・資源・費用

| ID | 適用場面 | anchors・検索入口 | 外せない問い |
|---|---|---|---|
| BE-PERF-01 | 多数の下流要求を待って応答する | tail latency / fan-out / deadline propagation / [Overload](sources.md#overload) | 最遅の下流と失敗時の待ちが全体SLOにどう効くか。不要になった処理も止めるか？ |
| BE-PERF-02 | queue、buffer、並列taskを増やす | bounded queue / backpressure / admission control / [Overload](sources.md#overload) | 処理能力を超える流入をどこで制限するか。待機中のメモリと期限も有限か？ |
| BE-PERF-03 | DB/HTTP接続やthread poolを使う | resource exhaustion / pool starvation / [Cascading failures](sources.md#cascading) | 待ち合わせ中の資源保持が別処理の完了を妨げないか。timeout後に解放されるか？ |
| BE-PERF-04 | ORM一覧、関連取得、集計、データ量増加 | N+1 / query plan / cardinality / [PostgreSQL EXPLAIN](sources.md#explain) | 小さなfixtureだけでなく実際の件数・偏りで、SQL数と走査量を確認したか？ |
| BE-PERF-05 | upload、圧縮、再帰形式、正規表現、大量一括入力 | unrestricted resource consumption / input bounds / [API Security](sources.md#apisec)・[Input validation](sources.md#input) | 入力サイズだけでなく展開後の量・深さ・処理時間・一括件数にも上限があるか？ |
| BE-PERF-06 | 利用者間で資源共有、従量APIや重い業務処理 | noisy neighbor / cost amplification / business-flow abuse / [API Security](sources.md#apisec) | 一利用者が他者の性能や全体の支出を支配できないか。予算と縮退を誰の契約で決めるか？ |

<a id="value"></a>
## 時刻・数値・識別子

| ID | 適用場面 | anchors・検索入口 | 外せない問い |
|---|---|---|---|
| BE-VALUE-01 | 締め日、日付、将来の予約、地域時刻を保存する | instant vs civil time / time zone / [PostgreSQL Date-Time](sources.md#datetime) | 必要なのは瞬間・日付・地域の壁時計のどれか。zoneや将来の解釈を失っていないか？ |
| BE-VALUE-02 | timeout、lease、経過時間、処理時間を測る | monotonic clock vs wall clock / [Python time](sources.md#monotonic) | 時計調整で期限判定が逆転しないか。単調時計の値を別プロセスや再起動後と無条件に比較していないか？ |
| BE-VALUE-03 | cron、定期請求、定時バッチ、取りこぼし回収 | DST gap/fold / occurrence ID / catch-up / [Date-Time](sources.md#datetime)・[Idempotency](sources.md#idempotency) | 存在しない時刻・二度来る時刻・停止後の回収で、業務上の実行回数を守れるか？ |
| BE-VALUE-04 | 金額、税、比率、分配、返金を計算する | decimal / currency scale / rounding allocation / [Numeric types](sources.md#numeric) | 丸める段階・端数の帰属・通貨単位の根拠は何か。分割と再集計で契約を破らないか？ |
| BE-VALUE-05 | 数値をDB・言語・JSON・外部API間で渡す | integer precision / unit mismatch / overflow / [Numeric types](sources.md#numeric) | 型名が同じでも精度・範囲・単位が変わらないか。IDや金額をfloat経由で壊さないか？ |
| BE-VALUE-06 | 文字列ID、検索、一意性、正規化を使う | Unicode normalization / collation / case folding / [Input validation](sources.md#input) | 比較・保存・検索・署名で同じ同一性を使うか。正規化の変更で別IDを衝突させないか？ |

<a id="ops"></a>
## 運用・変更・復旧

| ID | 適用場面 | anchors・検索入口 | 外せない問い |
|---|---|---|---|
| BE-OPS-01 | 成功率、latency、job完了を監視する | golden signals / user-visible outcome / [Google SRE](sources.md#monitoring) | 試行の成功ではなく利用者の結果を観測できるか。再試行や受付成功で未完了を隠さないか？ |
| BE-OPS-02 | metrics label、trace、同期loggingを追加する | cardinality / telemetry failure / [Monitoring](sources.md#monitoring)・[Logging](sources.md#logging) | 観測の資源量や停止が本体を壊さないか。相関IDを無制限のmetrics labelへ入れていないか？ |
| BE-OPS-03 | feature flag、設定、binaryを段階配布する | mixed configurations / rollback compatibility / [GitLab migrations](sources.md#migration) | 設定だけ戻しても新しいデータやcacheは残る。混在と戻せない地点を確認したか？ |
| BE-OPS-04 | backup、PITR、災害復旧を用意する | restore drill / RPO / RTO / [PostgreSQL PITR](sources.md#pitr) | 取得成功だけでなく復元を確認したか。鍵・設定・依存先と業務上の整合まで戻せるか？ |
| BE-OPS-05 | deploy、scale-in、shutdown、worker入替 | graceful shutdown / drain / redelivery / [RabbitMQ](sources.md#acks) | 受付停止、処理中の完了、接続切断、ACKの順序は何か。二重処理と行方不明をどう扱うか？ |
| BE-OPS-06 | 自動配布、障害時fallback、広域切替 | blast radius / canary / positive feedback / [Cascading failures](sources.md#cascading) | 失敗の波及をどこで止めるか。自動切替・再試行・再起動が残存系へ負荷を集中させないか？ |

## 交差点

各行で足りないときだけ展開する。組合せを新しい必須チェックリストにしない。

| 条件の組合せ | 参照 | 追加の問い |
|---|---|---|
| 権限変更 + queue + cache | BE-AUTH-05 / BE-CACHE-01 / BE-JOB-06 | 失効前に受け付けた仕事が、失効後のcacheで権限を復活させないか？ |
| 削除 + backup + replay | BE-DATA-03 / BE-OPS-04 / BE-JOB-04 | 復元・再生後も削除契約を維持できるか？ |
| rolling deploy + backfill + cache | BE-MIG-02 / BE-MIG-03 / BE-CACHE-06 | 新旧の値とbinaryが同時に存在しても、古い値を確定値として再保存しないか？ |
| retry + failover + idempotency | BE-EXT-02 / BE-DIST-04 / BE-DB-06 | 切替で重複排除記録だけを失い、成功済みの外部効果を再発生させないか？ |
| pool + fan-out + timeout | BE-PERF-01 / BE-PERF-03 / BE-EXT-03 | timeout後の残存処理と再試行で、枯渇が自己増幅しないか？ |
| decimal変更 + migration + API | BE-VALUE-04 / BE-MIG-05 / BE-API-03 | 保存形式は変換できても、旧consumerの単位や丸め方を壊さないか？ |

## 案件固有の手掛かりを足す場所

この索引を読むだけでは、案件の要求は分からない。
実際の要求ID、API契約、データ分類、DB/queueの製品と版、デプロイ順序、許容停止、
復旧目標、保持・削除条件を、その案件の参照として別に持つ。
未経験の領域は新しいanchorsを候補として足してよいが、適用漏れがないとは結論しない。
