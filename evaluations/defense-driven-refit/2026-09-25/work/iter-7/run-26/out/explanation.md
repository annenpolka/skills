# PR #318 弁明（年額プランの自動更新ジョブ）

対象: 決済基盤チームのシニアエンジニア（コードレビュー）
台帳: `ledger.yaml`（22項目。この資料はすべてその台帳から作っている）
第一周: コードは変更しておらず、テストも実行していない。以下の「改修」はすべて予定で、検証は済んでいない。

---

## 1. その場の回答

### この PR を採用してよいか

このままでは採用できません。
同じ請求期間に二重課金する経路が四つあり（2台で常駐する共有スケジューラでの同時実行、共有の決済クライアントに足した冪等キー無しの再送（月額ジョブにも波及）、結果不定の失敗を3日後に再課金すること、課金後・更新前の停止や2月29日の次回日計算の例外）、加えて本番の金額型では計算が例外になって1件も更新できず（スケジューラごと落ちて既存のセッション削除も止まる）、型が合っても決済代行の「最小単位の整数」という金額の約束に反します。
タイムゾーン無しの現在時刻（DB の設定次第で期日の最大9時間前に課金）、一覧取得後の解約、通知メールの失敗、past_due から戻した購読の失敗回数は、該当する設定や規則が資料に無く違反かを判定できないため、未確認のまま止める理由に含めます。

### 構造: なぜ課金ジョブを共有スケジューラに載せたのか

載せる根拠はなく、月額と同じ「単独起動・多重起動禁止」の定期ジョブに移します。
共有スケジューラは可用性のため2台が同時に動くので、同じ購読を2台が課金できてしまうためです。
単独起動でも二重起動は完全には防げないので、最後の防壁は決済代行の冪等キーで、キーの元にする「請求期間」の定義を起票者に確認するのを待っています。

### 境界: 決済クライアントに足した自動再送は要るのか

要求に根拠がないので外します。
結果が不定の 5xx を冪等キー無しで再送すると二重課金になり、同じクライアントを使う月額ジョブの挙動まで変えるためです。
一時的な障害は、要求どおり3日後の再試行に回ります。

### 境界: 失敗回数の列を足すマイグレーションは安全か

資料で確認した範囲では安全です。
PostgreSQL 16 では定数の既定値つきの列追加は表を書き換えず、旧版はこの列を参照しないので、マイグレーションを残したままイメージを戻しても動きます。
追加の瞬間に短い排他ロックは取ります。

---

## 2. 深掘りされたときの根拠

凡例: 根拠＝なぜその性質が必要／妥当か。証拠＝成果物が実際にどうなっているか（今回はすべて資料・コードを読んだ確認＝inspection。実行による確認ではない）。
状態: pending＝改修予定で未検証、done＝資料確認で済み。「候補」は依存先の確定待ち。

### 構造

**D-001 なぜ共有スケジューラ（2レプリカ）に載せたのか**　origin: deviation, impact／pending／remove_or_align
- 根拠: 要求2 二重課金禁止（`docs/tickets/BILL-212.md:10`、利用規約 §4.2）／既存の課金ジョブは単独 CronJob・`concurrencyPolicy: Forbid`（`deploy/monthly-worker.yaml:1,7-8`）
- 証拠: `deploy/scheduler.yaml:1,7`（replicas: 2、INFRA-77）／`app/scheduler.py:10`（各プロセスが独立に登録）／`app/renewal_worker.py:17-21,28-33,39-42`（確保の印なし、冪等キーなし、更新は課金の後）／`deploy/scheduler.yaml:8-9`（RollingUpdate）／`BILL-212.md:17-18`（毎月1日に約40万件）
- 対応: 月額と同じ CronJob に寄せ、`scheduler.py` の登録を外す
- 検証計画: マニフェストのレビュー、D-003 と合わせた2本同時実行の結合テストで1購読1期間1回の課金を確認

### 境界

**D-002 共有クライアントの自動再送は、無いと何が壊れるのか**　origin: deviation, impact, asked（模擬）／pending／remove_or_align
- 根拠: 要求3の再試行は「3日後」だけ（`BILL-212.md:11`）／要求2（`:10`）／月額は対象外（`:22`）／PayCo: 5xx は成否不定（`docs/vendor/payco-api-v2-excerpt.md:10`）
- 証拠: `app/payments_client.py:25-39`（5xx・接続エラーで再 POST、`Idempotency-Key` なし `:30`）／`app/monthly_worker.py:6,9,23`（月額も同じクライアント）
- 対応: PR で足した再送を外す（PR前の版は抜粋に無いので、PR差分で照合）
- 検証計画: `requests.post` をモックした単体テストで、5xx・接続エラー時の POST が1回であること（月額経由も）

**D-018 失敗回数の列の追加は安全か**　origin: impact, asked（模擬）／done
- 根拠: 要求3（`BILL-212.md:11`）／デプロイ手順: PostgreSQL 16、pre-deploy Job、ロールバックでマイグレーションは戻さない（`deploy/README.md:3-5`）
- 証拠: PostgreSQL 16 文書 ALTER TABLE — Notes（非揮発の既定値つきの ADD COLUMN は表を書き換えない）、同 Description（ACCESS EXCLUSIVE）／`app/monthly_worker.py:14-19`・`app/cleanup.py:4-5`（PR前から動くコードはこの列を参照しない）
- 答え: 要求3の連続失敗回数のための列。表の書き換えは無く、マイグレーションを残したままのロールバックでも旧版は動く

### 手続き

**D-003 二重課金しないことはどこで保証しているか（結果不定の失敗を3日後に再課金）**　origin: impact, counterexample, asked（模擬）／pending／change（候補: D-007 待ち）
- 根拠: 要求2（`BILL-212.md:10`）／PayCo の `Idempotency-Key`（`payco-api-v2-excerpt.md:8`）／Kubernetes 文書 CronJob limitations「Jobs should be idempotent」
- 証拠: `payco-api-v2-excerpt.md:10`（5xx の成否不定）／`app/payments_client.py:30,36-43`（キーなし、5xx を PaymentError にまとめる）／`app/renewal_worker.py:34-36,55-58`（3日後に再課金、課金一覧での照会なし）
- 対応: 購読IDと請求期間から決まる冪等キーを付ける。キーの元になる「請求期間」の識別子は D-007 待ち
- 検証計画: 同じ期間なら再試行をまたいでも同じキー、次の期間なら別キー、の単体テスト

**D-004 課金後・更新前に止まったら再課金しないか**　origin: counterexample／pending／change（候補: D-003 待ち）
- 根拠: 要求2
- 証拠: `app/renewal_worker.py:28-42`・`app/db.py:6`（課金と更新が別操作、autocommit）／`deploy/scheduler.yaml:8-12`・`app/scheduler.py:12-14`（ロールアウトで停止、停止時の処理なし）／`app/payments_client.py:42`・`app/renewal_worker.py:38`（課金成功後にも例外源）
- 対応: D-003 の冪等キーで、再実行の課金に最初の結果を返させる
- 検証計画: 課金成立直後に UPDATE を失敗させる障害注入テスト

**D-007 再試行で renews_at を上書きするとき、請求期間を何で識別するのか**　origin: impact, counterexample／pending／investigate
- 根拠: 要求2（`BILL-212.md:10`）、要求5（`:13`）
- 証拠: `app/renewal_worker.py:55-58`・`migrations/0031_subscriptions.sql:1-10`・`0042:1`（元の期日を残す列が無い）／`app/renewal_worker.py:38`（2回失敗後に成功すると更新日が約6日ずれ続ける）
- 対応: 要求5の「前回更新日」と要求2の「請求期間」の起点を起票者に確認する

**D-010 PaymentError 以外の例外が出たらどうなるか**　origin: impact／pending／change
- 根拠: 要求1（`BILL-212.md:9`）／同じプロセスの既存のセッション削除ジョブ（`app/scheduler.py:9`、`app/cleanup.py:4-5`）
- 証拠: `app/renewal_worker.py:26,38,53`・`app/db.py:9-23`（例外源）／schedule 文書 Exception Handling（ジョブの例外は捕まえない）／`app/scheduler.py:9-14`（ループに例外処理なし。10分後の renewal が毎回落ちると1時間後のセッション削除は一度も走らない）
- 対応: 購読1件ごとに例外を捕まえて記録し、次へ進む（既存ジョブへの波及は D-001 で消える）
- 検証計画: 2件目で例外を起こし、1件目と3件目が処理される単体テスト

**D-014 毎月1日の約40万件を逐次で捌けるか**　origin: impact／pending／investigate
- 根拠: 規模（`BILL-212.md:17-18`）
- 証拠: `app/renewal_worker.py:17-43`（全件取得・逐次）／`app/payments_client.py:25-39`（5xx 時に待ち）／完了期限・PayCo のレート制限・応答時間は資料に無い
- 対応: 1件あたりの時間を計測し、完了期限の有無とレート制限を確認する。仕組みは足さない

**D-015 一覧取得後に解約された購読を課金しないか**　origin: counterexample／pending／investigate
- 根拠: 要求1（`BILL-212.md:9`）
- 証拠: `app/renewal_worker.py:17-22`（一括取得後に逐次処理）／`migrations/0031_subscriptions.sql:5`（canceled がある）
- 対応: 解約の効力が生じる時点の規則を確認する。違反なら課金直前に条件付き更新で行を確保する

**D-016 月額と違い、なぜ3日後再試行・3回で past_due なのか**　origin: deviation／done
- 根拠: 要求3（`BILL-212.md:11`）、月額は対象外（`:22`）
- 証拠: `app/renewal_worker.py:11-12,40,46-58`／`app/monthly_worker.py:29-34`／`tests/test_renewal_worker.py:63-85`（テストはあるが今回は実行していない）
- 答え: 要求3に合わせている。月額の即時 past_due は既存の月額の仕様で対象外

**D-021 冪等キーを付けても、3日後にキーが失効していたら二重課金しないか**　origin: counterexample（改修案への反例）／pending／investigate（候補: D-003 待ち）
- 根拠: 要求2／PayCo の課金一覧 API（`payco-api-v2-excerpt.md:12-14`）
- 証拠: `payco-api-v2-excerpt.md:9`（保持期間は記載なし、SUP-4411）／`app/renewal_worker.py:12`（3日）／課金一覧が返す項目は抜粋に無い
- 対応: SUP-4411 で保持期間を確認する。足りなければ、再試行前に課金一覧で照合する変更を検討する

### 細部

**D-005 なぜ既存の money 関数でなく round(price × (1+TAX_RATE), 2) か**　origin: deviation, impact／pending／remove_or_align
- 根拠: 要求4（`BILL-212.md:12`）／PayCo: amount は最小単位の整数（`payco-api-v2-excerpt.md:7`）／既存の `money.with_tax_minor_units`（`app/money.py:7-11`、`app/monthly_worker.py:21`）
- 証拠: `migrations/0031_subscriptions.sql:6`・`app/db.py:1-6`（numeric、型の読み替えなし）／psycopg 3 文書 Adapting basic Python types（numeric は Decimal で返る）／`app/config.py:3`・Python 文書 decimal — Decimal objects（Decimal と float の算術は TypeError）／`app/renewal_worker.py:26,30`（float でも小数のまま、USD はドル単位）／`tests/test_renewal_worker.py:41,59`（float の fixture）
- 対応: `money.with_tax_minor_units(price, currency)` に寄せる
- 検証計画: Decimal の price（JPY・USD・端数・丸め境界）で int かつ最小単位になる単体テスト

**D-006 要求4の「config の TAX_RATE」と money.py の TAX_RATE、どちらが正か**　origin: impact／pending／investigate
- 根拠: 要求4（`BILL-212.md:12`）
- 証拠: `app/config.py:3`、`app/money.py:3,10`（独立した2定義、今はどちらも 0.10）
- 対応: 起票者に確認し、正とする定数を一つにする

**D-008 タイムゾーン無しの now() で、DB セッションのタイムゾーンを何と前提しているか**　origin: deviation, impact／pending／remove_or_align
- 根拠: 要求1（`BILL-212.md:9`）／月額は `datetime.now(timezone.utc)`（`app/monthly_worker.py:13`）
- 証拠: `migrations/0031_subscriptions.sql:8`・`deploy/scheduler.yaml:17-19`（timestamptz、TZ=Asia/Tokyo）／psycopg 3 文書（tzinfo なしは timestamp として渡る）／PostgreSQL 16 文書 §8.5.1.3（変換はセッションの TimeZone で解釈）／`deploy/README.md:3`（セッション TimeZone の記載なし）
- 対応: 月額と同じ UTC のタイムゾーン付き時刻にする
- 検証計画: セッション TimeZone を UTC と Asia/Tokyo にした結合テストで、期日前後の抽出が同じになること

**D-009 なぜ SQL の interval でなく replace(year+1) か**　origin: deviation, impact／pending／remove_or_align
- 根拠: 要求5（`BILL-212.md:13`）／月額は `interval '1 month'`（`app/monthly_worker.py:35-38`）
- 証拠: Python 文書 datetime — datetime Objects（範囲外の日は ValueError）／`app/renewal_worker.py:28-38`（計算は課金の後、例外は捕まらない）／`:57`（閏年の2月26日に失敗すると期日が2月29日になる。直近は2028年）
- 対応: UPDATE の中で `renews_at + interval '1 year'` として進める
- 検証計画: 2月29日の期日での結合テスト

**D-011 PayCo への POST に timeout が無いのはなぜか**　origin: impact／pending／change
- 根拠: Requests 文書 Advanced Usage — Timeouts（外部サーバーへの要求には timeout を付けるべき。既定では時間切れにならない）／値そのものは freedom
- 証拠: `app/payments_client.py:27-31`／schedule 文書 Parallel execution（ジョブは直列に実行）
- 対応: 接続と読み取りの timeout を指定する

**D-012 なぜ成功ログに顧客行全体を出すのか**　origin: deviation, impact／pending／remove_or_align
- 根拠: 月額のログは sub_id だけ（`app/monthly_worker.py:33,39`）
- 証拠: `app/renewal_worker.py:23-25,43`・`migrations/0031_subscriptions.sql:13`（email・name・billing_address を含む行をそのまま出力）／`BILL-212.md:17-18`（毎月1日に約40万人分）
- 対応: sub_id だけを出す
- 検証計画: caplog で個人情報の列が出ないこと

**D-013 なぜ顧客を1件ずつ SELECT * で取るのか**　origin: deviation, impact／pending／remove_or_align
- 根拠: 月額は JOIN で必要な列だけ（`app/monthly_worker.py:14-19`）
- 証拠: `BILL-212.md:17-18`（約40万回の追加問い合わせ）／`app/renewal_worker.py:29,53`（使うのは payco_customer_id と email だけ）
- 対応: JOIN にし、payco_customer_id と email だけを取る

**D-017 past_due にした後のメール送信が失敗したらどうなるか**　origin: impact／pending／investigate
- 根拠: 要求3の通知（`BILL-212.md:11`）
- 証拠: `app/renewal_worker.py:49-53`（past_due の後に送信）／`:18-19`（以後その購読は処理されない）／`app/mailer.py:1-3`（失敗時の挙動は資料に無い）
- 対応: メール送信サービスの失敗時の挙動を確認する

**D-019 なぜ10分間隔か**　origin: deviation／done
- 根拠: freedom（要求1に遅れの上限が無い）
- 証拠: `BILL-212.md:9-13`（間隔の指定なし）、`deploy/monthly-worker.yaml:7`（月額は15分）
- 答え: 10分は許容範囲内の任意の値で、15分に揃えても要求上の違いは無い

**D-020 「テスト全件成功」は何を検出できないのか**　origin: asked（模擬）／pending／change
- 根拠: 要求1〜5（`BILL-212.md:9-13`）
- 証拠: `tests/test_renewal_worker.py:15-16`（FakeDB が SQL を無視）／`:41-42`（float・タイムゾーン無し）／`:59`（誤った現在値 13200.0 を固定）／`:25-34`（クライアントの変更は未検査）／重複実行・冪等性・2月29日・例外時の継続のテストは無い／`README.md:21`（CI の結果は再実行していない）
- 対応: fixture を本番の型にし、断言を最小単位の整数 13200 にする。ほかのテストは各項目の検証計画で足す

**D-022 past_due から active に戻した購読が、1回の失敗ですぐ past_due にならないか**　origin: counterexample／pending／investigate
- 根拠: 要求3の「連続3回」（`BILL-212.md:11`）
- 証拠: `app/renewal_worker.py:40,47-52`（past_due にしても failure_count は3のまま）／復帰の経路は抜粋に無い
- 対応: 復帰の経路と、そこで failure_count を0に戻しているかを確認する

---

## 3. 認める限界と見直す条件

### accepted（受け入れて今回は直さないもの）

なし。今回、限界を受け入れる権限を持つ主体の判断は得ていない。

### unverified（未確認の事項）

まず全体として、gap が残る19項目（D-001〜D-015、D-017、D-020〜D-022）は、改修も調査も検証もまだ済んでいない（gap が残るのに限界の欄が空の D-008・D-012・D-013・D-020 も、改修が入るまでは未検証）。以下は、そのうえで各項目が抱える限界。

| 項目 | 限界 | 見直す条件 |
|---|---|---|
| D-001 | CronJob でも Job が2つ作られることは排除できず、単独起動だけでは要求2を保証できない | D-003 の冪等キーが入り、重複実行の結合テストが緑になったとき |
| D-002 | 一時的な 5xx も同じ実行の中では救わず、3日後の再試行に回る | SUP-4411 で即時再送が安全と示せたとき |
| D-003 | 冪等キーで畳めるのは PayCo がキーを保持している間だけ。保持期間は不明 | SUP-4411 の回答 |
| D-004 | キーの保持期間を過ぎた再実行は防げない | SUP-4411 の回答 |
| D-005 | money の最小単位表は JPY・USD だけ。ほかの通貨の年額購読があるかは資料に無い | JPY・USD 以外の年額購読があると分かったとき |
| D-006 | 税率定数のどちらが正かは未確認（今は同値で額は一致） | 起票者の回答、または税率定数の変更時 |
| D-007 | 請求期間の定義が未確認なので、D-003・D-004・D-021 は候補のまま | 起票者の回答 |
| D-009 | interval 加算では2月29日の1年後は2月28日になる。要求5は2月29日の扱いを定めていない | 起票者が2月29日の扱いを指定したとき |
| D-010 | 課金後に例外が出た購読は次の実行で再び課金対象になる（畳むのは D-003・D-004） | D-003 の確定時 |
| D-011 | timeout の値は任意選択。PR前から timeout が無かったかは抜粋では分からない | PayCo の応答時間の計測値か推奨値が得られたとき |
| D-014 | 毎月1日の処理時間と、PayCo の上限に触れるかは未確認 | 計測値と完了期限が得られたとき |
| D-015 | 取得後に解約された購読の扱いは未確認 | 解約の効力規則が確認できたとき |
| D-017 | past_due の通知が確実に届くかは未確認 | メール送信サービスの失敗時の挙動が分かったとき |
| D-018 | 列の追加時に短い ACCESS EXCLUSIVE ロックを取る。デプロイ時間帯の負荷は資料に無い | 毎月1日の集中時間帯にデプロイするとき |
| D-021 | 5xx で成立していた課金を、3日後の再試行で二重にしないことは未保証 | SUP-4411 の回答 |
| D-022 | past_due からの復帰後の失敗回数の扱いは未確認 | 復帰の経路が確認できたとき |

---

## 署名

- 署名者: PR #318 担当開発者（決済基盤チーム）／2026-10-01
- ダイヤル: **scope = 変更範囲（PR #318 全体）／granularity = 細部／strength = 資料確認**
- 今回やっていないこと: コードの変更、テストと CI の再実行、依頼者（起票者）への質問。テストの合否は README の記載（CI #9912）で、自分では確かめていない
- 終了条件: **未達**。gap が残る項目は19件（resolution 確定10件: D-001, D-002, D-005, D-008, D-009, D-010, D-011, D-012, D-013, D-020／investigate 6件: D-006, D-007, D-014, D-015, D-017, D-022／候補3件: D-003, D-004, D-021）。done は gap なしの3件（D-016, D-018, D-019）
- 次の周の最初の手: 起票者に要求5の「前回更新日」と要求2の「請求期間」の定義を確認し（D-007、候補3件のロック解除）、SUP-4411 の回答を確認する（D-021）。並行して確定済みの10件を実装し、各 verification.plan のテストを実行する
- 退屈版: 同種の既存実装（`app/monthly_worker.py`、`app/money.py`、`deploy/monthly-worker.yaml`）。lint 設定・CONTRIBUTING・設計ガイドは抜粋に無い
- 影響領域: 初期一覧＋案件固有（利用規約 §4.2 の二重課金禁止、毎月1日の約40万件集中、共有スケジューラ上の既存ジョブ、共有決済クライアントを使う月額ジョブ）。項目を作らなかった領域: 認可・認証（利用者の入力を受けない内部ジョブで、PR は認証情報の扱いを変えていない）、データの保存期間と削除（個人情報がログへ出る経路は D-012 で扱った。ログの保存期間そのものは資料に無い）
- 専門外の前提の依存先: 起票者（要求2・4・5の定義、解約の効力規則、完了期限）、PayCo（SUP-4411 のキー保持期間、レート制限、課金一覧の項目）、インフラ（RDS のセッション TimeZone、INFRA-77）、メール送信サービス（失敗時の挙動）、CS（past_due からの復帰の経路）

### 版

`scope.version = sha256:4f30341995ac`（下記の全体ハッシュの先頭12桁）

作り方: リポジトリ抜粋の直下で次を実行し、出力の先頭を取った。対象は抜粋の全18ファイルで、全項目の `scope.ref` と根拠・証拠が参照したファイルの和集合と一致する。

```
find . -type f | sed 's|^\./||' | LC_ALL=C sort | xargs shasum -a 256 | shasum -a 256
→ 4f30341995ace5ca3be4bb73be7d24e66150b0c926c9f23f44e1c13bb77e79da
```

| sha256 | ファイル |
|---|---|
| aef5216b8cf7c42bde763e5836f80f6aeb381abf9679752ebd448f0542374105 | README.md |
| 783c9e3fb83eb01a761ed70cbeccba91a38036ee04ec908357912b41354d4271 | app/cleanup.py |
| 7a8363437f02355744edd0fcd43613d7ddebd4e1d8691671116bd0f2f1985300 | app/config.py |
| 2d1b37c5a564e85eb92882524adbd56357ccc2f3ec20b7d5f6f359f3875d4172 | app/db.py |
| 590b2dbaba2b264ce4eee9fd4d8b6626826284e5f96d5ef49468c3d099df7c49 | app/mailer.py |
| cbbd013c623a9f2cd1702611c5a33e7fc95bef689b8ee2400d5605e6223055eb | app/money.py |
| b6617e6511596c57a767276ec8a92e5a09434091b536f1923e4f8e3571839006 | app/monthly_worker.py |
| 276e91d173303b59cec919131406bca5b35584a25babffe9c5a72ed67b8a25b9 | app/payments_client.py |
| 0a6068e124d69a44c7153277ba2ac90e5b7044ad6d4317cb2b4a5b4c5d35328e | app/renewal_worker.py |
| 02acedadbafb0fca5cd9816dfd377c471281becdd9b8010cae4897ce4be579a8 | app/scheduler.py |
| 1318b5a4fd5a4a5e9273007bb03aaa369535c5f04cc906388fe81b7ba81b976e | deploy/README.md |
| 9e7b5d48c899b9ae55352934b7b14c8a574f01650188a5f240408a2ad3828461 | deploy/monthly-worker.yaml |
| 8892f10aef6c8d1bea341794a408750c7a003468f9b7eb117788d7409b5730ea | deploy/scheduler.yaml |
| a77b976d80ec9f9fd7ff6e192e94245d7ca9ce1cb1863cddfbec7a96ca15151e | docs/tickets/BILL-212.md |
| a9931db2c6a6180f810cec686546fa653f2282a918100b1a80e8bb8cdff842a3 | docs/vendor/payco-api-v2-excerpt.md |
| eca698449661d86a27b18c28be3d451b6eb54ad271f3fc8045ffdddec820c168 | migrations/0031_subscriptions.sql |
| 6b8bd2f8a059557f9bddebdc86cdd940bee6e045c6c4f3d21c284112ca3fe693 | migrations/0042_add_failure_count.sql |
| 3f3b9c017620d7ba3e29b8059d58dd0a764ce6d2d63be5028378308320b010bf | tests/test_renewal_worker.py |

### 参照した外部文書（ハッシュには含めない。参照日はすべて 2026-10-01）

| 文書 | 節 | URL | 使った項目 |
|---|---|---|---|
| psycopg 3 documentation | Adapting basic Python types（数値、日付・時刻） | https://www.psycopg.org/psycopg3/docs/basic/adapt.html | D-005, D-008 |
| Python documentation, decimal | Decimal objects | https://docs.python.org/3/library/decimal.html | D-005 |
| Python documentation, datetime | datetime Objects（constructor、replace()） | https://docs.python.org/3/library/datetime.html | D-009 |
| schedule documentation | Exception Handling | https://schedule.readthedocs.io/en/stable/exception-handling.html | D-010 |
| schedule documentation | Parallel execution | https://schedule.readthedocs.io/en/stable/parallel-execution.html | D-011 |
| Requests documentation | Advanced Usage — Timeouts | https://requests.readthedocs.io/en/latest/user/advanced/ | D-011 |
| PostgreSQL 16 documentation | ALTER TABLE（Description、Notes） | https://www.postgresql.org/docs/16/sql-altertable.html | D-018 |
| PostgreSQL 16 documentation | 8.5.1.3 Time Stamps | https://www.postgresql.org/docs/16/datatype-datetime.html | D-008 |
| PostgreSQL 16 documentation | 9.9 Date/Time Functions and Operators | https://www.postgresql.org/docs/16/functions-datetime.html | D-009 |
| Kubernetes documentation | CronJob — Concurrency policy、CronJob limitations | https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/ | D-001, D-003 |

注: 抜粋には依存ライブラリの版を示すファイルが無い。ライブラリの挙動は上記の現行文書と照合した（psycopg は `import psycopg` なので 3 系）。版が分かったら、該当する項目の証拠を見直す。
