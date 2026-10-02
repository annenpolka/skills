# PR #318 年額プラン自動更新ジョブ：レビュー前の弁明

相手: 決済基盤チームのシニアエンジニア（コードレビュー）
台帳: `ledger.yaml`（23項目。この文書は台帳から作っている。内容が食い違ったら台帳が正）
今回は第一周。コードは変えておらず、テストも実行していない。「確認済み」は資料を読んで確かめたという意味で、実行して確かめたものはない。

---

## 1. その場の回答

### この PR を採用してよいか

今の形では採用できません。同じ購読への二重課金を止める仕組みがなく（2台での同時実行、成否不明の 5xx の後の再課金、冪等キーの未送信、共有クライアントのキーなし再送）、資料で確かめた限りでは、本番の DB の型だと金額計算で例外になって課金まで届かず、同じプロセスで動く既存のセッション削除ジョブも巻き込んで止まります。直し方は決めてありますが、CS 手動請求から切り替えるときの既存データの状態と、PayCo の冪等キーの保持期間がまだ確認できておらず、そこが分かるまで採用の可否は確定しません。

### 構造・境界の問いへの答え

**月額ワーカーを拡張せず、年額を別モジュールにしたのはなぜか**
月額はこのチケットの対象外で、失敗時の手続きも要求の段階で年額だけ違う（3日後に再試行、3回で past_due と通知）ので、ジョブ本体を分けています。

**同時に1つしか走らない前提は成り立つか**
成り立ちません。今は2台構成のスケジューラに載っていて、同じ購読を2台が同時に課金しうるので、月額と同じ単独実行の CronJob に移します（未実施）。CronJob もまれに二重に起動するので、二重課金の防止そのものは冪等キーで担保します。

**「二重課金しない」をどこで保証しているか**
今は保証がありません。PayCo の冪等キーを、購読と請求期間の起点から作って送るように直します（未実施）。キーの保持期間は PayCo に問い合わせ中で、回答が来るまでは、保持期間を過ぎた再送まで止められるとは言えません。

**「失敗したら3日後に再試行」に従ったまま二重課金しないか**
しえます。5xx は課金が成立していることがあるのに、今は失敗として数えて3日後に新しく課金するからです。成否不明を失敗から分けたうえで、同じキーで再送するか課金一覧で照合するかはキーの保持期間と一覧 API の返却項目を確かめてから決めるので、それまではこの経路のリスクが残ります。

**冪等キーを付ければ再試行も正しく動くか**
キーを請求期間だけで作ると、カード拒否の3日後の再試行に最初の拒否結果が返り、実際には再試行されないおそれがあります。確定した失敗の後だけキーを変え、成否不明の後は同じキーを使う形にします（未実施）。

**共有の決済クライアントに即時の自動再試行を入れたのはなぜか**
即時再試行を求める要求はありません。キーなしの再送は二重課金につながりうるうえ、対象外の月額ジョブの挙動まで変えてしまうので、外して PR 前の単発呼び出しに戻します（未実施）。一時的な障害は、年額では3日後の再試行まで持ち越します。

**マイグレーションは旧版アプリや月額ジョブと共存できるか**
列を足すだけで、月額ジョブも旧版アプリもこの列を読まないので、先にマイグレーションを当ててもアプリだけ戻しても動きます。PostgreSQL 16 では既定値付きの列の追加で表の書き換えは起きません。

---

## 2. 深掘りされたときの根拠

凡例: 根拠＝なぜ必要・妥当か（要求・既存契約・規約・任意選択）。証拠＝実際にそうなっているか。今回の証拠はすべて資料確認（inspection）。状態は台帳の `verification.status`。

### 構造

**D-01 月額と別モジュールにした理由**（asked・模擬／確認済み）
- 根拠: BILL-212「対象外: 月額プラン」、要求3（失敗時の手続きが年額だけ異なる）
- 証拠: `app/monthly_worker.py:29-34`（失敗即 past_due）と `app/renewal_worker.py:34-36,46-59`（再試行）を読み比べた

**D-02 同時実行**（impact／未検証・remove_or_align）
- 根拠: 要求2、`deploy/monthly-worker.yaml:1-8`（既存の課金ジョブは CronJob・Forbid・単独プロセス）
- 証拠: `deploy/scheduler.yaml:1,7`（replicas: 2、INFRA-77）、`:8-9`（RollingUpdate）、`app/scheduler.py:10`、`app/renewal_worker.py:17-21,28-42`（行を確保していない）、`app/db.py:6`（autocommit）
- 対応: scheduler から外し、月額と同形の CronJob に移す。CronJob の重複生成は Kubernetes docs「CronJob — Job creation」に明記があるので D-04 で覆う

### 境界

**D-04 冪等キー**（impact／未検証・change／依存: D-09）
- 根拠: 要求2、`docs/vendor/payco-api-v2-excerpt.md:8`（Idempotency-Key、同じキーの再送には最初の結果を返す）
- 証拠: `app/payments_client.py:27-31`（Authorization だけ送っている）、`app/renewal_worker.py:28-42`（課金と更新が原子的でない）、`deploy/scheduler.yaml:12` と `app/scheduler.py`（停止シグナルの処理がない）

**D-05 成否不明の 5xx（反例）**（counterexample／未検証・investigate／依存: D-04）
- 反例: 課金は成立 → 5xx → 失敗として数える → 3日後に新しく課金 → 同じ期間に2回目の課金
- 根拠: 要求2・3、`payco-api-v2-excerpt.md:10`（5xx では成否が不定のことがある）
- 証拠: `app/payments_client.py:32-43`（5xx・接続エラーも最後は PaymentError になり、4xx と区別されない）、`app/renewal_worker.py:34-36`
- 調査: SUP-4411（キーの保持期間）、PayCo 原文で GET /v2/charges の返却項目を確認する

**D-06 キーの粒度（反例）**（counterexample／未検証・change／依存: D-04）
- 反例: キーを（購読, 期間）で固定 → カード拒否 → 3日後に同じキーで送る → 拒否結果が返るだけで再試行にならない
- 根拠: 要求3、`payco-api-v2-excerpt.md:8`
- 証拠: 転記は拒否の結果も返すのかを区別していない（同 :8）

**D-07 共有クライアントの即時再試行**（impact／未検証・remove_or_align）
- 根拠: 要求2、要求3（求めているのは3日後の再試行）、BILL-212「対象外: 月額プラン」、`app/monthly_worker.py:6,9,23`（同じクライアントを既定引数で使っている）
- 証拠: `app/payments_client.py:25-39`（キーなしで再送、1件あたり最大6秒の sleep）、`payco-api-v2-excerpt.md:10`

**D-08 マイグレーション 0042**（impact／確認済み）
- 根拠: `deploy/README.md:4-5`（pre-deploy Job の後に RollingUpdate、ロールバックはイメージだけ）、要求3
- 証拠: PostgreSQL 16 docs「ALTER TABLE — Notes」（non-volatile な DEFAULT なら表の書き換えなし）、`deploy/README.md:3`（PG16）、`app/monthly_worker.py`（failure_count を使っていない）

### 手続き

**D-03 CS 手動請求からの切替**（impact／未検証・investigate）
- 根拠: BILL-212「背景」（これまで CS が手動で請求）、要求1・2
- 証拠: `app/renewal_worker.py:17-21`（抽出に下限がない）。CS が renews_at を進めていたかは資料にない
- 調査: 切替前に `renews_at < 切替日時` の件数を数え、PayCo の課金一覧と突き合わせる

**D-09 失敗時に renews_at を上書きしている**（impact／未検証・change）
- 根拠: 要求2（期間の同一性が要る）、要求3・5
- 証拠: `app/renewal_worker.py:55-58`（上書き）、`:38`（上書き後の値に1年を足す）、`migrations/0031`・`0042`（期間の起点を持つ列がない）
- 対応: 再試行日時を別の列に持ち、renews_at を期間の起点として残す

**D-10 要求5「前回更新日」の読み方**（asked・模擬／未検証・investigate）
- 根拠: 要求5の文面（予定日なのか課金日なのかは書かれていない）
- 証拠: `app/renewal_worker.py:38,57`（今は最後の再試行日時が起点になる）
- 調査: BILL-212 の持ち主に確認する

**D-11 1件の例外で全体が止まる**（impact／未検証・change／依存: D-04）
- 根拠: 要求1、`app/scheduler.py:9`（既存の purge_expired_sessions が同じプロセスで動いている）
- 証拠: schedule のドキュメント「Exception Handling」（ジョブの例外は捕まえずに run_pending まで上がる）、`app/scheduler.py:12-14`（捕まえていない）、`:9-10`（再起動すると purge は1時間後まで走らないので、10分おきに落ち続けると purge に届かない）、例外が出る箇所の例は `app/renewal_worker.py:26,38,53`

**D-12 毎月1日の約40万件**（impact／未検証・investigate／依存: D-02）
- 根拠: BILL-212「規模」
- 証拠: `app/renewal_worker.py:17-21`（全件を一度に読み込む）、`:22-42`（1件ずつ同期で課金）。PayCo の応答時間・流量制限と、許容される処理時間は資料にない

### 細部

**D-13 金額計算**（impact／未検証・remove_or_align）
- 根拠: 要求4、`payco-api-v2-excerpt.md:7`（amount は最小単位の整数）、`app/money.py:7-11` と `app/monthly_worker.py:21`（既存の税込計算）
- 証拠: `migrations/0031_subscriptions.sql:6`（numeric）、psycopg 3 docs「Numbers adaptation」（numeric を float で受けるにはアダプタ設定が要る＝既定は Decimal。`app/db.py` に設定はない）、Python docs「decimal — Decimal objects」（Decimal と float の演算は TypeError）、`app/config.py:3`（float）、`tests/test_renewal_worker.py:41,59`（price を float で与え、現在の値を確かめているだけ）
- 対応: `money.with_tax_minor_units` に寄せる（ROUND_HALF_UP は既存に合わせた任意の選択）

**D-14 TAX_RATE が2か所にある**（impact／未検証・investigate／依存: D-13）
- 根拠: 要求4（config の TAX_RATE を使う）
- 証拠: `app/money.py:3` と `app/config.py:3`（今はどちらも 0.10）

**D-15 タイムゾーンなしの now**（impact／未検証・remove_or_align）
- 根拠: 要求1、`migrations/0031_subscriptions.sql:8`（timestamptz）、`app/monthly_worker.py:13`（UTC のタイムゾーン付き）
- 証拠: `deploy/scheduler.yaml:17-19`（TZ=Asia/Tokyo）、psycopg 3 docs「Date/time types adaptation」（tzinfo のない datetime は timestamp として送られる）、PostgreSQL 16 docs §8.5.1.3（timestamp は TimeZone 設定の現地時刻として変換される）。DB セッションの TimeZone は資料にない

**D-16 replace(year+1) とうるう日**（impact／未検証・remove_or_align）
- 根拠: 要求5、`app/monthly_worker.py:36`（SQL の interval で加算）、任意選択（2/29 の翌年を 2/28 にする。3/1 でも構わない）
- 証拠: Python docs「datetime Objects」（範囲外の日付は ValueError）、`app/renewal_worker.py:28-42`（課金の後、UPDATE の前に失敗する）、PostgreSQL 16 docs §9.9（月末を超えたら末日にし、日付の計算はセッションのタイムゾーンで行う）

**D-17 タイムアウトがない**（impact／未検証・change）
- 根拠: 要求1、Requests docs「Advanced Usage — Timeouts」（既定ではタイムアウトしない）
- 証拠: `app/payments_client.py:27-31`、Kubernetes docs「CronJob — Concurrency policy」（Forbid だと前回が終わるまで次を見送る）

**D-18 ログに個人情報を出している**（impact／未検証・remove_or_align）
- 根拠: `app/monthly_worker.py:33,39`（月額は sub_id だけ出す）、OWASP Logging Cheat Sheet「Data to exclude」（氏名・メールアドレスなども記録から外す対象）
- 証拠: `migrations/0031_subscriptions.sql:13`（customers には email・name・billing_address がある）、`app/renewal_worker.py:23-24,43`

**D-19 顧客を1件ずつ別クエリで取っている**（deviation／未検証・remove_or_align）
- 根拠: `app/monthly_worker.py:14-19`（JOIN）
- 証拠: `app/renewal_worker.py:23-24`、`migrations/0031_subscriptions.sql:3`（NOT NULL の外部キーなので、JOIN にしても行は消えない）

**D-20 MAX_FAILURES=3 / RETRY_AFTER=3日**（deviation／確認済み）
- 根拠: 要求3
- 証拠: `app/renewal_worker.py:40,47-58`、`tests/test_renewal_worker.py:74-85`（テストがあることは確かめたが、実行はしていない）

**D-21 10分間隔**（deviation／確認済み／依存: D-02）
- 根拠: 任意選択（要求に間隔の定めはない。月額は `*/15`）
- 証拠: `docs/tickets/BILL-212.md`、`deploy/monthly-worker.yaml:7`

**D-22 past_due にした後の通知が失われる**（impact／未検証・investigate）
- 根拠: 要求3（メールで通知する）
- 証拠: `app/renewal_worker.py:49-53`（状態を先に更新し、メールは後。past_due になると 18-19 行の抽出条件から外れる）、`app/mailer.py:1-3`（実装が省略されていて、失敗したときの動きが分からない）

**D-23 テストが要求を確かめていない**（asked・模擬／未検証・change・候補／依存: D-04, D-09, D-10, D-13, D-15, D-16）
- 根拠: 要求1〜5
- 証拠: `tests/test_renewal_worker.py:15-16`（FakeDB が SQL を無視する）、`:39-43`（本番と型が違う）、`:59-60`（現在の値を確かめているだけ）。CI #9912 の結果は見ていない

---

## 3. 認める限界と見直す条件

### 3-1. 受け入れた限界（今回は直さない）

| 項目 | 限界 | 見直す条件 |
|---|---|---|
| D-08 | ADD COLUMN は ACCESS EXCLUSIVE ロックを取る。subscriptions に長いクエリが走っていると適用が待たされ、その間ほかの読み書きも待ちうる。ロック待ちは計測していない | 適用する時間帯に subscriptions への長いクエリがあると分かったとき |

任意に選んだもの（最適だとは主張しない）: 実行間隔10分（D-21）、2/29 の翌年を 2/28 にすること（D-16）、丸め方 ROUND_HALF_UP（D-13。既存の実装に合わせた）、タイムアウトの値（D-17。計測するまでの仮置き）。

### 3-2. 改修予定の項目で、まだ確認できていないこと

改修はすべて未実施で、未検証です。そのうえで、改修しても残るものや、確認待ちのものを挙げます。

| 項目 | まだ確認できていないこと・残るもの | 見直す条件 |
|---|---|---|
| D-02 | CronJob もまれに Job を2つ作るので、実行方式を揃えるだけでは二重実行はなくならない | D-04 が確認済みになるまで、D-02 だけで二重課金を防げるとは言わない |
| D-03 | CS が手動請求したのに renews_at を進めていない購読があるか分からない。初回の実行で、過去の分をまとめて課金するおそれを否定できない | 件数の調査と CS の請求記録の突き合わせが済んだとき |
| D-04 | 冪等キーの保持期間が分からない（SUP-4411）。保持期間を過ぎた再送は止められない | SUP-4411 の回答 |
| D-05 | 成否不明の扱いが決まるまでは、5xx や接続断の後の再試行が二重課金になりうる | SUP-4411 の回答、または PayCo 原文で一覧 API の項目を確認したとき |
| D-06 | 拒否された結果もキーに保存されるのかが、転記からは読めない | PayCo 原文かテスト環境で確かめたとき |
| D-07 | 外した後は、一時的な 5xx でも年額は3日後の再試行まで、月額は PR 前と同じくすぐ past_due になる | D-05 が決まり、キー付きの再送が安全だと確かめられたとき |
| D-09 / D-10 | 次回更新日を予定日から数えるか、課金した日から数えるかが決まっていない（列を分ける改修はどちらの場合でも必要） | BILL-212 の持ち主の回答 |
| D-12 | 40万件がその日のうちに処理し終わるとは言えない | 計測したとき、または許容時間が決まったとき |
| D-14 | 税率の定義が2か所にある状態は解消していない（今は同じ値なので金額に差は出ない） | どちらかの TAX_RATE を変えるとき、またはチームの回答が来たとき |
| D-16 | DB の TimeZone によっては、日本時間の暦で見た更新日がずれうる | DB の TimeZone 設定を確認したとき |
| D-17 | タイムアウトの値は計測に基づいていない | PayCo の応答時間を計測したとき |
| D-22 | 要求3の通知が必ず届くとは言えない | mailer が失敗したときの動きを確認したとき |
| D-23 | 次回更新日のテストの期待値をまだ決められない | D-10 が確定したとき |

---

## 署名

- 署名: PR #318 提出者（決済基盤チーム開発者）、2026-09-25
- ダイヤル: **scope = 変更範囲（PR #318 全体）** ／ **granularity = 細部** ／ **strength = 資料確認**
  - scope: `app/renewal_worker.py`、`app/payments_client.py`、`app/scheduler.py`、`migrations/0042_add_failure_count.sql`、`tests/test_renewal_worker.py`。変更の影響が及ぶ先として、`app/monthly_worker.py`（同じクライアントを使っている）、同じプロセスで動く `purge_expired_sessions`、`deploy/`、`migrations/0031`、`docs/` も読んだ
  - strength: コードは変えておらず、テストも実行していない。ライブラリや製品の動きは公開文書で確かめた（下の一覧）。確認済みは4項目で、残りはすべて未検証
- 版: `sha256:7f583c5699d3`（バージョン管理の外にある資料なので、一式の内容ハッシュを取った。作り方: run-19/repo 直下で `find . -type f | LC_ALL=C sort | xargs shasum -a 256 | shasum -a 256` を実行し、その先頭12桁。対象は18ファイル）
- 終了条件: **まだ満たしていない**。gap が残っている項目は19件（すべて未検証。内訳は investigate 6、change 6、remove_or_align 7。このうち1件は、依存先の結論待ちで候補にとどめている）
- 次の周で最初にやること: D-03（切替前の既存データの件数調査）と SUP-4411 の確認を始める。並行して、構造層の D-02（CronJob に移す）を実装し、そのうえで D-04・D-06・D-07・D-09 を実装して、テストを実行して確かめる段階まで上げる
- 影響領域の点検（初期一覧＋案件固有）:
  - 冪等性・重複実行 → D-02, D-04, D-05, D-06, D-09
  - 金銭の計算 → D-13, D-14
  - 外部サービスへの副作用 → D-04, D-07, D-17
  - 障害時・部分失敗 → D-11, D-17, D-22
  - 時刻・タイムゾーン → D-15, D-16
  - 並行実行 → D-02
  - 移行・後方互換 → D-03, D-07, D-08
  - 個人情報の経路 → D-18
  - 性能（案件固有。毎月1日に集中する）→ D-12
  - 認可・認証 → 該当なし。利用者の入力を受けない内部バッチで、API キーの扱い（`app/payments_client.py:30`）はこの PR で変えていない
  - データの保存期間と削除 → 該当なし。新たに保存するのは failure_count だけ（D-08 で確認した）
- 専門外の前提と、それを判断する人:
  - PayCo のキー保持期間・拒否したときの動き・一覧 API の項目 → PayCo（SUP-4411、原文）
  - DB セッションの TimeZone → DB・インフラ設定の担当（資料に記載なし）
  - 要求5の読み方・許容される処理時間 → BILL-212 の持ち主
  - どちらの税率を正とするか → 決済基盤チーム
  - mailer が失敗したときの動き → 社内のメール送信サービス
  - 手動請求の記録 → CS
- 参照した公開文書: psycopg 3「Adapting basic Python types」(psycopg.org/psycopg3/docs/basic/adapt.html)、Python「decimal」(docs.python.org/3/library/decimal.html)、schedule「Exception Handling」(schedule.readthedocs.io/en/stable/exception-handling.html)、Requests「Advanced Usage — Timeouts」(requests.readthedocs.io/en/latest/user/advanced/)、Kubernetes「CronJob」(kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/)、PostgreSQL 16「8.5 Date/Time Types」「9.9 Date/Time Functions and Operators」「ALTER TABLE」、OWASP「Logging Cheat Sheet」
