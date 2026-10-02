# PR #318 の弁明（年額プランの自動更新ジョブ / BILL-212）

- 相手: 決済基盤チームのシニアエンジニア（コードレビュー）
- 元になる台帳: `ledger.yaml`（18項目）。この文書は台帳から作ったもので、内容は台帳と同じ
- 今回は第一周: コードは変えておらず、テストも実行していない。以下の「改修」はすべて計画で、検証は済んでいない

---

## 1. その場の回答

このPRは、要求の「同じ請求期間に二重課金しない」をまだ満たしていないので、マージ前に直します。重複防止の本体は、請求期間ごとの冪等キーを決済APIに渡すことに置き、実行は月額と同じ単独の CronJob に寄せます。共有の決済クライアントに足した再試行は範囲外の月額ジョブにも効くので、変更前の差分を見て、キー付きの呼び出しに限るか外すかを決めます。

---

## 2. 深掘りされたときの根拠

根拠（なぜそれが必要か・妥当か）と証拠（成果物が実際にどうなっているか）は分けて書く。証拠はすべて資料確認（inspection）で、実行して確かめたものではない。

### 一覧

| ID | 層 | 入口 | 問い | 対応 | 検証 |
|---|---|---|---|---|---|
| D-001 | 構造 | impact | 二重課金しないことを何が保証しているか | change | pending |
| D-002 | 構造 | deviation | なぜ billing-scheduler（2レプリカ）で動かすのか | remove_or_align | pending |
| D-003 | 構造 | impact | 0042 の列追加は本番・デプロイ・ロールバックで壊れないか | なし（問題なし） | done |
| D-004 | 境界 | deviation | なぜ共有の payments_client に再試行を入れたか | investigate | pending |
| D-005 | 境界 | counterexample | 5xx 後の再送で二重課金しないか | change（候補） | pending |
| D-006 | 手続き | impact | 課金成功後・UPDATE 前に止まったらどうなるか | change | pending |
| D-007 | 手続き | counterexample | 3日後の再試行で二重課金・空振りしないか | change（候補） | pending |
| D-008 | 手続き | counterexample | 「前回更新日の1年後」の起点はどこか | investigate | pending |
| D-009 | 手続き | deviation | なぜ月額と違い3回まで再試行するのか | なし（問題なし） | done |
| D-010 | 手続き | impact | 毎月1日の約40万件をどれだけで処理できるか | investigate | pending |
| D-011 | 細部 | deviation | なぜ請求額を round(…, 2) で出すのか | remove_or_align | pending |
| D-012 | 細部 | impact | 税率は config と money のどちらを正とするか | investigate | pending |
| D-013 | 細部 | deviation | なぜタイムゾーン無しの now なのか | remove_or_align | pending |
| D-014 | 細部 | deviation | なぜ次回更新日を Python の replace で出すのか | remove_or_align（候補） | pending |
| D-015 | 細部 | impact | 顧客の個人情報がどこへ出るか | remove_or_align | pending |
| D-016 | 細部 | impact | PayCo が応答しないとどうなるか | change（候補） | pending |
| D-017 | 細部 | deviation | 再試行3回・待機2秒の根拠は | narrow（候補） | pending |
| D-018 | 細部 | asked（模擬尋問） | テスト全件成功は正しさの証拠か | change | pending |

「候補」は、同じ箇所に掛かる上の層の項目（D-004・D-008）の結論を待っているもの。上の層から順に確定させる。

### 構造

**D-001 二重課金の防止（冪等性・並行実行）**
- 根拠: BILL-212 要求2（利用規約 §4.2 に明記済み）。PayCo v2 抜粋「`Idempotency-Key` を受け付け、同じキーの再送には最初の要求の結果を返す」
- 証拠: `app/payments_client.py:27-31` が送るヘッダは Authorization のみ。`app/renewal_worker.py:17-42` に請求済みを確かめる処理が無い
- 足りないところ: 二重課金の経路が4つある。2レプリカの同時実行（D-002）、課金成功後・UPDATE 前の中断（D-006）、5xx 後の即時再送（D-005）、結果不定の失敗を3日後に再課金（D-007）。月額の既存ジョブにも冪等キーは無いので、「月額と同じ」は根拠にならない
- 改修: 購読IDと上書きされない請求期間の識別子から作った冪等キーを PayCo に送り、これを重複防止の本体にする。実行の単一化（D-002）は補助
- 検証計画: 同じ購読・同じ期間で charge が2回呼ばれる3ケース（2実行の並行・UPDATE 前の例外・5xx 後の再送）で、同じキーが送られることをテストで確かめる

**D-002 実行場所**
- 根拠: `deploy/monthly-worker.yaml:1,7-8`（課金ジョブは単独プロセス・`concurrencyPolicy: Forbid`）、BILL-212 要求2。実行間隔は要求に定めがないので任意（10分のままでも15分に揃えてもよい）
- 証拠: `deploy/scheduler.yaml:1,7` は可用性のため `replicas: 2`（INFRA-77）。`app/scheduler.py:9-14` は purge と同じ単一ループで、schedule ライブラリはジョブの例外を捕まえない
- 足りないところ: 2つのレプリカがそれぞれ同じ期日到来分を課金し、past_due のメールも二重に送る。年額側の例外はプロセスごと落とす。期日到来の年額購読がある間は10分ごとに落ち、起動1時間後が初回の `purge_expired_sessions` は一度も走らない
- 改修: 月額と同じ専用 CronJob（Forbid）に寄せ、`scheduler.py` の登録を外す。billing-scheduler の2レプリカはそのまま

**D-003 マイグレーション 0042（done）**
- 根拠: BILL-212 要求3（連続失敗回数を数える必要がある）、`deploy/README.md:4-5`（先に適用、ロールバックはイメージのみ）
- 証拠: `deploy/README.md:3` は PostgreSQL 16。定数デフォルトの列追加は PostgreSQL 11 以降は表を書き換えない（PostgreSQL 文書）。`app/monthly_worker.py:14-18` は failure_count を参照しない
- 答え: 列追加は定数デフォルトなので表の書き換えは起きず、先に適用しても、アプリだけ戻して列が残っても既存コードは影響を受けない

### 境界

**D-004 共有クライアントへの再試行追加**
- 根拠: BILL-212 の対象外に「月額プラン（既存の monthly_worker が担当）」とある
- 証拠: `app/monthly_worker.py:9,22-34` は同じ PaymentsClient を使い、PaymentError なら即 past_due にする。`app/payments_client.py:32-43` は接続エラーも3回目の後に PaymentError に変える
- 足りないところ: 変更は範囲外の月額にも効く（5xx の再送、接続エラー時の past_due）。PR 前の `charge()` が抜粋に無いので、月額の挙動がどれだけ変わったかは確定できない
- 改修: 調査。PR 前と比べて、(a) 再試行を外して元に戻す (b) 冪等キー付きの呼び出しに限って再試行する、のどちらが月額を変えずに済むかを決める

**D-005 反例: 5xx 後の再送**
- 反例: 説明「5xx と接続エラーで自動再試行する」に従ったまま、PayCo 側で成立していた課金を、5xx 応答の後にもう一件作る
- 根拠: PayCo v2 抜粋「5xx の場合、課金が成立しているかどうかは不定のことがある」、BILL-212 要求2
- 証拠: `app/payments_client.py:27-39` はキーを付けずに再送している
- 改修（候補）: `charge()` が呼び出し側から冪等キーを受け取り、全試行で同じキーを送る。キーの無い呼び出しは再送しない

### 手続き

**D-006 課金成功後・UPDATE 前の中断（部分失敗）**
- 根拠: BILL-212 要求2
- 証拠: `app/db.py:6` は autocommit。`app/renewal_worker.py:28-42` は課金→UPDATE の順で、PaymentError 以外の例外は捕まえない。`deploy/scheduler.yaml:8-12` は RollingUpdate・終了猶予30秒で、`app/scheduler.py:12-14` に停止シグナルの処理は無い
- 足りないところ: 止まった購読は次の実行で再課金される。具体的には、2月29日の renews_at で課金直後に例外（D-014、再起動のたびに再発）、UPDATE 時の DB エラー、デプロイ時の停止
- 改修: D-001 の冪等キーで再課金を PayCo 側で最初の結果に畳む。課金直後に例外を出す計算は SQL に寄せる（D-014）

**D-007 反例: 3日後の再試行**
- 反例(1): 5xx で実は成立していた課金を、3日後に新しい課金として作る。結果不定のまま3回目に達すると、課金済みかもしれない顧客に更新失敗メールが届く
- 反例(2): カード拒否の後も同じキーで再送し、最初の拒否が返り続けて、再試行が空振りのまま past_due になる（「最初の要求の結果を返す」が拒否応答にも当てはまる場合に限る）
- 根拠: BILL-212 要求2・3、PayCo v2 抜粋（5xx は結果不定、同じキーの再送は最初の結果）
- 証拠: `app/payments_client.py:36-43`（5xx を使い切ると 4xx と同じ PaymentError）、`app/renewal_worker.py:55-57`（renews_at を now+3日で上書きし、期間を識別する値が残らない）
- 改修（候補）: 結果不定なら同じキーで再送して結果を確かめ、確定した拒否の後は試行番号を進めた新しいキーで課金する。キーは上書きされない請求期間の識別子から作る

**D-008 反例: 次回更新日の起点**
- 反例: 説明「前回更新日の1年後」に従ったまま、失敗を挟むたびに毎年の更新日が3日・6日ずつ後ろへずれる
- 根拠: BILL-212 要求5
- 証拠: `app/renewal_worker.py:55-57` で上書きし、38行目で上書き後の値に1年を足す
- 足りないところ: 「前回更新日」が予定日なのか実際に課金できた日なのかが、要求から読めない
- 改修: 調査（依頼者確認）。予定日の意味なら、次の試行日時を別に持ち、renews_at を上書きしない形に変える

**D-009 3回までの再試行（done）**
- 根拠: BILL-212 要求3（3日後に再試行、連続3回失敗で past_due とメール）
- 証拠: `app/renewal_worker.py:11-12,46-58`、成功時に failure_count を0に戻す（40行目）
- 答え: 月額と違って即 past_due にしないのは要求3のため。回数3と間隔3日は要求の値で、成功すれば数え直す

**D-010 集中日の処理時間**
- 根拠: BILL-212 規模（年額約180万件、毎月1日に約40万件）
- 証拠: `app/renewal_worker.py:17-25`（全件取得、1件ごとに customers を SELECT、同期 HTTP）、`migrations/0031_subscriptions.sql:11`（期日検索は索引で覆われる）
- 足りないところ: 1件あたりの所要時間の計測が無い（仮に1件0.1秒でも約11時間。計測ではなく算術）
- 改修: 調査。応答時間の実測と、PayCo の流量制限の確認（抜粋に記載なし）。分かるまで並列化やバッチ化は求めない

### 細部

**D-011 請求額の計算**
- 根拠: BILL-212 要求4（税込、JPY は1円・USD は1セントに丸める）、PayCo v2 抜粋（amount は最小単位の整数）、`app/money.py:7-11` `with_tax_minor_units`（月額が使う）
- 証拠: `migrations/0031_subscriptions.sql:6` の price は numeric で、psycopg 3 は Decimal で返す（`app/db.py` に変換設定は無い）。`app/config.py:3` の TAX_RATE は float で、Decimal と float の算術は TypeError。`tests/test_renewal_worker.py:41,59` は価格を float で与えている
- 足りないところ: 本番の価格では課金前に TypeError になり、PaymentError ではないので最初の購読でジョブ全体が落ちる。float で動いたとしても、額が最小単位の整数にならない
- 改修: `money.with_tax_minor_units` に寄せる（ROUND_HALF_UP、最小単位の整数）
- 検証計画: 価格を Decimal で与えるテストで、JPY 12000.00→13200、USD 99.99→10999 が渡ることを確かめる

**D-012 税率の出所**
- 根拠: BILL-212 要求4「税率は config の TAX_RATE」、`app/money.py:3`（月額が使う税率）
- 証拠: `app/config.py:3` と `app/money.py:3` はどちらも 0.10
- 足りないところ: 定義が2箇所にあり、要求の文面と既存実装が指す場所が違う。money に寄せても（D-011）この問いは残る
- 改修: 調査（どちらを正とするかは依頼者の判断）

**D-013 タイムゾーン無しの now**
- 根拠: `app/monthly_worker.py:13`（`datetime.now(timezone.utc)`）
- 証拠: `deploy/scheduler.yaml:17-19` は TZ=Asia/Tokyo、renews_at は timestamptz（`0031:8`）。タイムゾーン無しの datetime は timestamp として送られ、PostgreSQL はセッションの TimeZone で解釈する
- 足りないところ: セッションの TimeZone が UTC なら、期日判定は9時間早まり、再試行日時も9時間ずれる。セッション設定は資料に無い
- 改修: 月額と同じ UTC の aware datetime に寄せる（セッション設定に左右されなくなる）

**D-014 次回更新日の計算**
- 根拠: BILL-212 要求5、`app/monthly_worker.py:35-37`（SQL の interval で進める）
- 証拠: `app/renewal_worker.py:38` の `replace(year=…)` は2月29日で ValueError になり、しかも課金の直後。PostgreSQL の interval 加算は月末を超える日を月末に丸める
- 足りないところ: 2月29日の購読は課金直後に落ち、次の実行で再課金される（D-006）。本PRの再試行（now+3日）でも2月29日は作られうる（最短で2028年2月）
- 改修（候補）: SQL の `renews_at + interval '1 year'` に寄せる。起点（D-008）が変わっても式の形は同じ

**D-015 個人情報の経路**
- 根拠: `app/monthly_worker.py:33,39`（ログは sub_id だけ）、BILL-212 要求3（メール通知に email が要る）
- 証拠: `app/renewal_worker.py:43` が sub と customer の行全体を info で出す。customers は email・name・billing_address などを持つ（`0031:13`）。メール引数は sub_id のみ（53行目）
- 改修: ID だけをログに出し、顧客は必要な列（payco_customer_id, email）だけを JOIN で取る

**D-016 タイムアウト**
- 根拠: BILL-212 要求1（期日到来分を自動で課金し続ける）
- 証拠: `app/payments_client.py:27-31` に timeout が無く、requests は既定でタイムアウトしない。処理は単一スレッドのループ
- 足りないところ: 応答が返らないと更新処理全体が止まる。タイムアウトを足すと、読み取りタイムアウトという結果不定の経路が増え、今の except では捕まらない
- 改修（候補）: timeout を指定し、読み取りタイムアウトを結果不定として、キー付き再送（D-005）の対象にする。値は D-010 の計測から決める

**D-017 再試行3回・待機2秒**
- 根拠: 任意の選択（freedom）。要求にも PayCo 抜粋にも指定は無い。呼び出し元は逐次処理の単一のジョブなので、ジッタが無くても一斉再送にはならない。3回・2秒を否定する理由も、最適とする理由も無い
- 改修（候補）: 再試行を残すなら、値は任意の選択と説明し、最適性は主張しない

**D-018 模擬尋問「テスト全件成功なのだから正しいのでは？」**
- 証拠: `tests/test_renewal_worker.py:15-16` の FakeDB は SQL を無視して active を全件返す（WHERE 条件は検査されない）。41・59行目は価格を float で与えて 13200.0 を期待しており、要求4の整数ではなく現在の値を写している。二重課金・2月29日・時刻帯・冪等キーのテストが無い
- 答え方: 緑のテストは D-011 の TypeError を隠しており、要求2・4・5に合っている証拠にはならない。CI #9912 の結果そのものは今回見ていない
- 改修: 価格を Decimal にし、期待値を要求4の整数に直す。D-001・D-011・D-013・D-014 の検証計画にあるテストを足す

### 参照した公開文書（証拠の補助）

- Python `decimal`（Decimal と float の算術は TypeError）: https://docs.python.org/3/library/decimal.html
- psycopg 3 Adapting basic Python types（numeric→Decimal、tzinfo 無しの datetime→timestamp）: https://www.psycopg.org/psycopg3/docs/basic/adapt.html
- PostgreSQL Date/Time Types（timestamp と timestamptz の変換はセッションの TimeZone を使う）: https://www.postgresql.org/docs/current/datatype-datetime.html
- PostgreSQL Date/Time Functions and Operators（interval 加算は月末に丸める）: https://www.postgresql.org/docs/current/functions-datetime.html
- PostgreSQL ALTER TABLE（定数デフォルトの列追加は書き換えなし）: https://www.postgresql.org/docs/current/sql-altertable.html
- schedule Exception Handling（ジョブの例外は捕まえない）: https://schedule.readthedocs.io/en/stable/exception-handling.html
- Kubernetes CronJob（まれにジョブが2つ作られうる）: https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/
- requests Timeouts（既定ではタイムアウトしない）: https://requests.readthedocs.io/en/latest/user/quickstart/#timeouts

---

## 3. 認める限界と見直す条件

未検証の項目（pending）は、答えを確定させていない。以下は改修前の現状で認める限界と、見直す条件。

### 他者の回答待ち

| ID | 認める限界 | 見直す条件 |
|---|---|---|
| D-001 | PayCo のキー保持期間が抜粋に無く（SUP-4411 で問い合わせ中）、3日後・6日後の再試行までキーが効くか分からない。同じキーの同時要求の扱いも抜粋に無い | SUP-4411 の回答が来たとき。保持期間が6日に満たなければ、再課金前に `GET /v2/charges` で請求済みを照会する処理を足すか決める |
| D-007 | 「同じキーの再送は最初の結果を返す」が拒否応答にも当てはまるかは抜粋から読めない。保持期間も不明 | PayCo の原文か SUP-4411 の回答で、失敗応答の扱いと保持期間が分かったとき |
| D-008 | 要求5の起点（予定日か、課金できた日か）が未確定。現状の実装は「最後の再試行予定日時の1年後」として振る舞う | 依頼者から要求5の起点について回答を得たとき |
| D-009 | 「連続3回」に初回の失敗を含む読みを採った（初回＋再試行3回の読みもありうる）。依頼者には未確認 | 依頼者か CS の運用で数え方が示されたとき |
| D-012 | 税率の定義が config と money の2箇所にある。今は両方 0.10 で請求額は変わらないが、一本化は未了 | 依頼者の回答が来たとき。またはどちらかの税率を変える変更が出たとき |

### 調査・計測待ち

| ID | 認める限界 | 見直す条件 |
|---|---|---|
| D-004 | このPRで月額ジョブの失敗時の挙動がどう変わったかは未確定 | PR 前の payments_client の差分を確認したとき |
| D-010 | 集中日の処理が何時間で終わるか分からない | 計測値が出たとき。または所要時間が次の集中日やデプロイ時間帯に重なると分かったとき |
| D-016 | タイムアウト値を決める応答時間の計測が無い | D-010 の計測が出たとき |
| D-017 | 再試行の回数・待機は計測に基づかない | D-010 の計測で、待機が処理時間の主な原因と分かったとき |
| D-013 | 改修前の現状のずれ幅（0時間か9時間か）は DB セッションの設定を見ていないため未確認 | 改修後のテストが通ったとき。改修前に本番へ出す判断が出たら DB の TimeZone 設定を確かめる |
| D-014 | 既存の年額データに2月29日の renews_at があるかは未確認 | 件数を確かめたとき。または D-008 の起点が決まったとき |
| D-011 | JPY・USD 以外の通貨は money に指数が無く KeyError になる。年額購読の通貨の分布は未確認 | 年額購読の通貨に JPY・USD 以外があると分かったとき |

### 改修前の現状（改修とテストで閉じる）

| ID | 認める限界 | 見直す条件 |
|---|---|---|
| D-011 | 資料上は、年額更新を1件も課金できない見込み（実行では未確認） | 改修後のテストが通ったとき |
| D-005 | 5xx の後の再送で二重課金が起こりうる | D-004 で再試行を残すと決まり、キー付き再送のテストが通ったとき |
| D-006 | 止まった購読は次の実行で再課金される | D-001・D-014 の改修後、中断テストが通ったとき |
| D-015 | 個人情報がログに出る | 改修後のテストが通ったとき |
| D-002 | CronJob と Forbid に寄せても、まれに同じ時刻のジョブが2つ作られうる（重複防止の本体は D-001） | D-001 の改修を入れずに出す判断が出たとき |
| D-018 | 本周はテストを実行しておらず、既存テストの合否も確かめていない | 第二周でテストを実行したとき |

### 範囲の外に置いたこと

- 月額の既存ジョブにも「課金成功後・UPDATE 前の中断で再課金」と同じ形の経路がある。BILL-212 の対象外なので本PRでは直さない。別チケットにするかは依頼者に委ねる
- 認可・認証と、データの保存期間・削除は、この変更では該当しないと判断した（利用者の入力を受けない定期ジョブで、新たに保存するのは failure_count だけ）
- 並列化・バッチ化・再試行のジッタは、計測（D-010）が出るまで求めない

---

## 署名

- **scope = 変更範囲（PR #318 全体） / granularity = 細部 / strength = 資料確認**
- 第一周。コードは変えておらず、テストも実行していない。done の2項目（D-003・D-009）は資料を読んで確かめたもの
- 終了条件は未達。gap を持つ16項目はすべて verification pending
- 台帳の版: 抜粋にコミットIDが無いため `PR#318-excerpt` と記した。提出前に head のコミットIDに置き換える
- 退屈版は既存の月額ジョブ（`app/monthly_worker.py`・`deploy/monthly-worker.yaml`）。明示された規約ファイルは抜粋に無い
- 専門外の前提と、依存している判断:
  - PayCo のキーの保持期間と失敗応答の扱い → PayCo サポート（SUP-4411）
  - 要求5の起点、「連続3回」の数え方、税率の正とする定義 → 依頼者（BILL-212）
  - DB セッションの TimeZone、年額購読の通貨と2月29日の件数 → 本番DBの設定とデータ（未確認）
