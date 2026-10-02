# PR #318 年額プランの自動更新ジョブ — レビュー向けの弁明（第一周）

対象: 決済基盤チームのシニアエンジニア（コードレビュー）
台帳: `ledger.yaml`（20項目。この文書は台帳から作っており、採用理由・未確認事項・認める限界の中身は台帳と同じ）

---

## 1. その場の回答

### このPRを採用してよいか

このPRは現状のままでは採用できません。本番の型（DB の金額は Decimal）では金額計算が例外になって年額の更新が1件も成立せず、その例外は定期ジョブのプロセスごと落として同居するセッション掃除まで止めます（計算できたとしても、請求額が通貨の最小単位の整数になっていません）。その計算を直した時点で、2レプリカでの同時実行・成否不定の 5xx への鍵なし再送・課金後の中断のいずれでも同じ請求期間を二重に課金する経路が開き、共用クライアントの再送変更は対象外の月額ジョブにはデプロイ時点で同じ経路を持ち込みます。

### 構造・境界の問いへの答え

**なぜ共用の scheduler に載せたのか（実行基盤）**
今の載せ方には二重課金を避ける根拠が無く、2レプリカがそれぞれ同じ購読を課金します。月額と同じ単独の CronJob（同時実行禁止）に移す方針で、まだ直していません。CronJob でもまれに二重起動は起こるので、最後の担保は課金の冪等キーに置きます。

**二重課金をどこで防いでいるのか**
現状は防ぐ仕組みがありません。決済サービスが受け付ける冪等キーを請求期間から作って送る方針で、未実装です。キーの保持期間は決済サービスに問い合わせ中で、その回答で足りるかどうかが決まります。

**なぜ共用クライアントに即時再送を入れたのか**
要求にも計測にも根拠が無く、成否不定の 5xx を鍵なしで送り直すので取り下げます。共用クライアントのため月額ジョブの挙動まで変えており、戻すことで対象外の月額を元の挙動に保てます。再試行は要求どおり3日後の再試行に任せます。

**冪等キーはどう作るのか**
請求期間だけから作ると、カード拒否の後の3日後の再試行にも最初の拒否が返り続けるので、確定した拒否の回数もキーに含めます。成否不定の応答は拒否と分けて扱い、同じキーで送り直して拒否の回数に数えない方針です。最初が 5xx だったキーへの再送を決済サービスがどう扱うかは、問い合わせの回答待ちです。

**failure_count 列の追加は安全か**
定数の既定値つきで列を足すだけで、PostgreSQL 16 では表の書き換えが起きず、先に適用してロールバックはイメージだけという既存の手順のどの時点でも旧版と両立します。ここは資料で確認済みです。再試行日を別に持つ改修で列を足す場合は見直します。

---

## 2. 深掘りされたときの根拠

凡例: 根拠 = なぜ妥当か（要求・既存契約・規約・許容範囲）。証拠 = 実際にそうなっているか（今回はすべて資料確認 `inspection`。テストの実行・計測はしていない）。状態はすべて台帳の `verification.status`。

### 構造

**D-001 実行基盤（2レプリカの scheduler か、単独の CronJob か）** — origin: deviation, impact / pending
- 根拠: BILL-212.md:10 要求2（二重課金しない、利用規約 §4.2）。deploy/monthly-worker.yaml:1-8（既存の課金ジョブは単独 CronJob・Forbid）
- 証拠: deploy/scheduler.yaml:7（replicas: 2）、app/scheduler.py:9-10（読み込み時に登録 → 各レプリカで実行）、app/renewal_worker.py:17-21（確保・ロックなし）、app/cleanup.py:4-5（既存の同居ジョブは2回実行しても無害）、Kubernetes 文書 Deployments §Rolling Update（maxSurge 既定 25%・切り上げ → 更新中は3 Pod）
- 対応: remove_or_align — CronJob（Forbid）へ寄せる。検証予定: scheduler から登録が消え、CronJob が追加された差分の確認

### 境界

**D-002 二重課金の防止** — origin: impact, asked(simulated) / pending
- 根拠: BILL-212.md:10 要求2。payco-api-v2-excerpt.md:8（Idempotency-Key、同じキーには最初の結果を返す）
- 証拠: payments_client.py:27-31（鍵なし）、renewal_worker.py:28-42 と db.py:6（課金と更新が別々に確定）、excerpt:10（5xx は成否不定）、renewal_worker.py:54-58（失敗扱いで3日後に再課金）、scheduler.yaml:9, 12（RollingUpdate・猶予30秒、終了シグナルの処理なし）
- 対応: change — 請求期間から決まる鍵を送る。検証予定: ヘッダと鍵の同一性のテスト、SUP-4411 の保持期間の確認

**D-003 共用クライアントの即時再送** — origin: deviation, impact, asked(simulated) / pending
- 根拠: BILL-212.md:11 要求3（再試行は3日後）、BILL-212.md:20-22（月額は対象外）
- 証拠: payments_client.py:32-39（5xx・接続エラーで鍵なし再送）、excerpt:10、monthly_worker.py:6, 9, 23-28（月額も同じクライアント）、README.md:11, 16
- 対応: remove_or_align — 再送を取り除く。検証予定: 5xx で POST が1回だけのテスト、月額経路の差分確認

**D-014 冪等キーの作り方（D-002 の改修への反例）** — origin: counterexample / pending / depends_on D-002
- 根拠: excerpt:8、BILL-212.md:10-11 要求2・要求3
- 証拠（反例）: a) renews_at から作る → renewal_worker.py:55-58 の上書きで鍵が変わる。b) 期間だけから作る → 拒否後の再試行に最初の拒否が返り続ける。c) 成否不定も失敗に数える → 成立済みの課金で past_due と通知（payments_client.py:36-43 はどちらも PaymentError）
- 対応: change — 請求期間の識別子＋確定した拒否の回数で鍵を作り、成否不定は別の例外にする。検証予定: 例外の区別・鍵の変化・failure_count のテスト

**D-018 failure_count 列のマイグレーション** — origin: impact / done（資料確認）
- 根拠: deploy/README.md:4-5（先に適用、ロールバックはイメージのみ）
- 証拠: deploy/README.md:3（PostgreSQL 16）、PostgreSQL 16 文書 ALTER TABLE §Notes（非揮発 DEFAULT の ADD COLUMN は書き換えなし）・§Description（ACCESS EXCLUSIVE、保持は短い）、0042:1、抜粋内で列を参照するのは renewal_worker と tests のみ

### 手続き

**D-005 PaymentError 以外の例外** — origin: impact / pending / depends_on D-002
- 根拠: BILL-212.md:9 要求1。scheduler.py:9 と cleanup.py:4-5（同居の既存ジョブ）
- 証拠: renewal_worker.py:34（PaymentError のみ捕捉）、schedule 文書 Exception Handling（例外は捕まえず run_pending を中断させる）、scheduler.py:12-14（例外処理なし → プロセス終了）、schedule 文書 Examples（初回は登録から一定時間後 → 掃除は起動1時間後が初回）
- 対応: change — 購読1件ごとに例外を捕まえて続ける（再課金しないことは D-002 が担う）

**D-008 顧客の取得（N+1・全列）** — origin: deviation, impact / pending
- 根拠: monthly_worker.py:14-19（JOIN で payco_customer_id のみ）、BILL-212.md:17-18（集中日は約40万件）
- 証拠: renewal_worker.py:23-25、0031:13（customers の列）
- 対応: remove_or_align — JOIN で payco_customer_id と email だけを取る

**D-016 取得後に解約された購読** — origin: counterexample / pending
- 根拠: BILL-212.md:9 要求1
- 証拠: renewal_worker.py:17-21, 28、0031:5（canceled がある）、BILL-212.md:18
- 対応: investigate — 解約の経路と扱いを確認

**D-017 40万件の処理時間** — origin: impact, asked(simulated) / pending
- 根拠: BILL-212.md:17-18
- 証拠: renewal_worker.py:17-22（一括読み込み・逐次課金）、0031:11（抽出条件に合う索引あり）、payments_client.py:34, 38
- 対応: investigate — PayCo の応答時間・レート制限と完了時刻の期待を確認

**D-020 past_due 後の通知の取りこぼし** — origin: impact / pending
- 根拠: BILL-212.md:11 要求3
- 証拠: renewal_worker.py:49-53（更新が先、通知が後）、:19（past_due は再抽出されない）、mailer.py:1-3（実装省略）
- 対応: investigate — mailer の失敗時の挙動を確認

### 細部

**D-004 金額計算** — origin: deviation, impact, asked(simulated) / pending
- 根拠: BILL-212.md:12 要求4（税込、最小単位に丸める）。excerpt:7（amount は最小単位の整数）。money.py:7-11 と monthly_worker.py:21（既存の計算）
- 証拠: 0031:6（numeric）、psycopg 3 文書 §Numbers adaptation（numeric → Decimal）、db.py:6（読み込み設定の変更なし）、config.py:3（float の 0.10）、Python 文書 decimal（Decimal と float の演算は TypeError）、tests:41, 59（float 入力・現在値 13200.0）
- 対応: remove_or_align — money.with_tax_minor_units に寄せる

**D-006 PayCo 呼び出しのタイムアウト** — origin: impact / pending / depends_on D-002
- 根拠: Requests 文書 Advanced Usage §Timeouts（外部サーバへの要求には timeout を付けるべき）
- 証拠: payments_client.py:27-31（timeout なし）、同文書（既定ではタイムアウトしない）、scheduler.py:12-14、monthly-worker.yaml:8
- 対応: change — timeout を付け、read timeout は成否不定として扱う

**D-007 タイムゾーンなしの現在時刻** — origin: deviation, impact / pending
- 根拠: monthly_worker.py:13（UTC 付きの現在時刻）
- 証拠: scheduler.yaml:17-19（TZ=Asia/Tokyo）、0031:8（timestamptz）、psycopg 3 文書（naive → timestamp）、PostgreSQL 16 文書 §9.9（timestamp は TimeZone の時刻とみなして比較）、AWS re:Post（RDS の既定は UTC。この DB の設定は未確認）
- 対応: remove_or_align — datetime.now(timezone.utc) に寄せる

**D-009 成功ログの顧客情報** — origin: deviation, impact / pending
- 根拠: monthly_worker.py:33, 39（sub_id のみ）
- 証拠: renewal_worker.py:43, 23-25、0031:13
- 対応: remove_or_align — sub_id だけのログに寄せる

**D-010 実行間隔10分** — origin: deviation / done
- 根拠: freedom — 要求に間隔の指定は無い。10分は任意の値で15分を否定しない
- 証拠: scheduler.py:10、README.md:6、BILL-212.md:9-13、monthly-worker.yaml:7

**D-011 失敗3回・再試行3日** — origin: deviation / done
- 根拠: BILL-212.md:11 要求3
- 証拠: renewal_worker.py:11-12, 40, 46-58、tests:63-85（内容を確認。実行はしていない）

**D-012 2月29日の「1年後」** — origin: deviation, counterexample / pending
- 根拠: BILL-212.md:13 要求5。monthly_worker.py:35-37（SQL の interval で進める）。freedom — 閏日の翌年を2月28日とするか3月1日とするかは要求に無く、既存の丸めに合わせた
- 証拠: renewal_worker.py:28-38（課金の後で計算）、Python の date の範囲外 ValueError（CPython issue #116175 ほか）、renewal_worker.py:57（再試行日から2月29日が生じうる）、PostgreSQL 16 文書 §9.9（月末に丸める）
- 対応: remove_or_align — `renews_at + interval '1 year'` に寄せる

**D-013 再試行を挟んだときの次回更新日** — origin: counterexample / pending
- 根拠: BILL-212.md:13 要求5
- 証拠: renewal_worker.py:38, 55-58、tests:51-60（失敗を挟む場合は未検査）
- 対応: investigate — 「前回更新日」の定義を要求の持ち主に確認

**D-015 税率の正本（D-004 の改修への反例）** — origin: counterexample / pending / depends_on D-004
- 根拠: BILL-212.md:12 要求4（税率は config の TAX_RATE）
- 証拠: config.py:3（0.10 float）、money.py:3（Decimal 0.10）。現時点で値は一致
- 対応: investigate — どちらを正本とするか確認

**D-019 テストが確かめていること** — origin: asked(simulated) / pending
- 根拠: BILL-212.md:9-13 要求1〜5
- 証拠: tests:15-16（SQL 条件を無視する偽DB）、tests:41-42（本番と違う型）、tests:59（現在値の保存）、二重課金のテストなし
- 対応: change — 本番と同じ型と、要求から書いた期待値に置き換える

---

## 3. 認める限界と見直す条件

### accepted（受け入れて今回は直さないと決めた限界）

なし。今回の周では、受け入れて閉じた限界はありません。

### unverified（改修予定または未確認のまま報告する事項）

| 項目 | 限界 | 見直す条件 |
|---|---|---|
| D-001 | CronJob の Forbid でも二重起動はまれに起こる（Kubernetes 文書 CronJob §Job creation）。単独実行は二重課金の担保にならない | 冪等キーが入らないと決まったとき、または並列処理が必要になったとき |
| D-002 | 冪等キーの保持期間が不明（SUP-4411 問い合わせ中） | SUP-4411 の回答。期間が再送間隔より短ければ課金試行の記録か照合方式へ広げる |
| D-003 | 即時再送を外すと一時的な 5xx も3日後に回る。5xx の頻度は資料に無い。変更前のクライアント全文は抜粋に無い | 5xx 率・障害時間の計測が得られたとき |
| D-004 | 最小単位の換算表は JPY・USD のみ。年額の通貨の分布は資料に無い | 通貨の分布を確認したとき、または通貨を追加するとき |
| D-005 | 全件が失敗する障害時に件ごとに続けると課金だけが進む。安全かは鍵の保持期間しだい | SUP-4411 の回答、または打ち切り条件が要ると判断したとき |
| D-006 | timeout の値に計測の根拠が無い | PayCo の応答時間を計測したとき |
| D-007 | 現状のコードが実際に早く課金するか（DB の TimeZone）は未確認 | 改修を入れないと決めたとき、DB の timezone を確認する |
| D-013 | 「前回更新日」の定義が資料に無い | 要求の持ち主の回答が得られたとき |
| D-014 | 最初が 5xx だったキーへの再送に決済サービスが何を返すか不明 | SUP-4411 への追加質問の回答 |
| D-015 | 税率が二箇所に定義され、どちらが正本か資料で決まらない（値は一致） | 税率変更時、または要求の持ち主の回答 |
| D-016 | 解約の実装と扱いが資料に無い | 解約経路か回答を確認したとき |
| D-017 | 処理時間を計測していない。レート制限の有無も不明 | 計測結果か、レート制限の資料が得られたとき |
| D-020 | mailer の実装が抜粋に無い | mailer の実装か送信サービスの仕様を確認したとき |

可能性にとどまる失敗経路（タイムゾーンのずれ、取得後の解約、処理時間、通知の取りこぼし、更新日のずれ）は、採用可否の結論には入れず、ここに並べています。

---

## 署名

- **scope**: 変更範囲（PR #318 全体: app/renewal_worker.py, app/payments_client.py, app/scheduler.py, migrations/0042_add_failure_count.sql, tests/test_renewal_worker.py。影響の確認のため、変更されていない関連ファイルと deploy/・docs/ も参照）
- **granularity**: 細部
- **strength**: 資料確認（コードは変更せず、テストの実行・計測もしていない。PR説明の CI #9912 の結果は未確認）
- **周**: 第一周（2026-10-01）
- **版**: `4f30341995ac`（全体値 `4f30341995ace5ca3be4bb73be7d24e66150b0c926c9f23f44e1c13bb77e79da` の先頭12桁）
- **版の作り方**: 版管理の外のため、repo 抜粋の全18ファイル（台帳の scope.ref と根拠・証拠が参照したファイル一式）を相対パスの C ロケール順に並べて `shasum -a 256` にかけ、その出力全体（各行「ハッシュ␣␣パス」）をもう一度 SHA-256 にかけた
- **ファイルごとのハッシュ（SHA-256）**:

```
aef5216b8cf7c42bde763e5836f80f6aeb381abf9679752ebd448f0542374105  README.md
783c9e3fb83eb01a761ed70cbeccba91a38036ee04ec908357912b41354d4271  app/cleanup.py
7a8363437f02355744edd0fcd43613d7ddebd4e1d8691671116bd0f2f1985300  app/config.py
2d1b37c5a564e85eb92882524adbd56357ccc2f3ec20b7d5f6f359f3875d4172  app/db.py
590b2dbaba2b264ce4eee9fd4d8b6626826284e5f96d5ef49468c3d099df7c49  app/mailer.py
cbbd013c623a9f2cd1702611c5a33e7fc95bef689b8ee2400d5605e6223055eb  app/money.py
b6617e6511596c57a767276ec8a92e5a09434091b536f1923e4f8e3571839006  app/monthly_worker.py
276e91d173303b59cec919131406bca5b35584a25babffe9c5a72ed67b8a25b9  app/payments_client.py
0a6068e124d69a44c7153277ba2ac90e5b7044ad6d4317cb2b4a5b4c5d35328e  app/renewal_worker.py
02acedadbafb0fca5cd9816dfd377c471281becdd9b8010cae4897ce4be579a8  app/scheduler.py
1318b5a4fd5a4a5e9273007bb03aaa369535c5f04cc906388fe81b7ba81b976e  deploy/README.md
9e7b5d48c899b9ae55352934b7b14c8a574f01650188a5f240408a2ad3828461  deploy/monthly-worker.yaml
8892f10aef6c8d1bea341794a408750c7a003468f9b7eb117788d7409b5730ea  deploy/scheduler.yaml
a77b976d80ec9f9fd7ff6e192e94245d7ca9ce1cb1863cddfbec7a96ca15151e  docs/tickets/BILL-212.md
a9931db2c6a6180f810cec686546fa653f2282a918100b1a80e8bb8cdff842a3  docs/vendor/payco-api-v2-excerpt.md
eca698449661d86a27b18c28be3d451b6eb54ad271f3fc8045ffdddec820c168  migrations/0031_subscriptions.sql
6b8bd2f8a059557f9bddebdc86cdd940bee6e045c6c4f3d21c284112ca3fe693  migrations/0042_add_failure_count.sql
3f3b9c017620d7ba3e29b8059d58dd0a764ce6d2d63be5028378308320b010bf  tests/test_renewal_worker.py
```

- **終了条件**: 未達。gap を持つ項目は17件で、すべて verification pending（resolution 確定かつ done: 0件、accepted として閉じた限界: 0件）。gap の無い3項目（D-010, D-011, D-018）は資料確認で done
- **次の周の最初の手**: 上の層から確定させる。(1) D-001 の CronJob 移設と D-003 の再送の取り下げを入れる。(2) D-002/D-014 の鍵（請求期間の識別子と確定した拒否の回数、成否不定の例外の分離）を実装し、SUP-4411 に保持期間と「最初が 5xx だった鍵の再送」の扱いを追加で問い合わせる。(3) D-004・D-012 を既存方式に寄せ、D-019 のテストを本番の型で書き直して実行する（strength をテスト実行へ上げる）。並行して、要求の持ち主に D-013・D-015・D-016・D-017 を確認する
- **影響領域の選び方**: 案件固有の一覧が資料に無いため、Skill の初期一覧と backend の索引から、BILL-212・PayCo 抜粋・deploy/ に照らして選んだ。認可・認証（利用者の入力を受けないバッチで、API キーの扱いは変更なし）と、データの保存期間・削除（新たに保存するのは failure_count だけ。ログの出力は D-009 で減らす）は、この PR では該当なしと判断し、項目を作っていない
- **模擬尋問**: 決済基盤のシニアエンジニアを想定し、「二重課金はどこで防ぐか」「amount は最小単位の整数か」「5xx で POST を送り直してよいか」「1日の40万件はいつ終わるか」「CI が緑でも本番の型を通っているか」を当てた（D-002, D-004, D-003, D-017, D-019 に simulated として記録）
- **依存している判断（人間側の条件）**: 上位層（実行基盤、冪等キー）は提出者が自分の言葉で説明する。決済サービスの鍵の保持期間と 5xx 時の挙動は決済サービス（SUP-4411）に、「前回更新日」・税率の正本・解約の扱い・完了時刻は BILL-212 の持ち主に、scheduler の2レプリカ構成は INFRA-77 の判断に依存している
- **参照した公開資料**: psycopg 3 文書 Adapting basic Python types / Python 文書 decimal / schedule 文書 Exception Handling・Examples / Requests 文書 Advanced Usage §Timeouts / PostgreSQL 16 文書 ALTER TABLE・§9.9 Date/Time Functions and Operators / Kubernetes 文書 CronJob（v1.32）・Deployments / AWS re:Post「Change the time zone of an Amazon RDS DB instance」/ CPython issue #116175
