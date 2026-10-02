## 成果物
- out/ledger.yaml: 18項目。impact 7、deviation 7、counterexample 3、asked 1（模擬尋問）。構造3・境界2・手続き5・細部8。done 2（D-003 マイグレーション、D-009 3回までの再試行。どちらも gap なし）、pending 16。PyYAML とスクリプトで規則検査。
- out/explanation.md: 1段目3文（ID なし）、2段目は層ごとの根拠と証拠と公開文書URL、3段目は admitted_limit 17件を「他者の回答待ち」「調査・計測待ち」「改修前の現状」に分類。署名、終了条件未達を明記。
- 発見: Decimal×float TypeError（1件も課金できない見込み、テストは float で見えない）、2レプリカで二重課金、5xx をキー無しで再送、2/29 replace 例外が課金直後→再起動のたびに再課金、naive now と TZ、ログに顧客情報行全体、共有クライアント変更が月額にも効く、年額の例外でプロセスが10分ごとに落ちる間 purge が走らない。

## 要件の達成（自己申告）: 1 ○ / 2 ○ / 3 ○（PG の timestamp→timestamptz 変換と requests タイムアウト既定値は既有知識で URL を載せたが公式ページは取得していない）/ 4 ○（並列化・バッチ化・ジッタは計測まで求めない、マイグレーションは問題なしで閉じた、認可と保存期間は非該当）/ 5 ○ / 6 ○

## 読んだファイル（順）
skill: s3/SKILL.md → s3/references/impact-profiles/backend.md（find で一覧）
repo: README.md, app/renewal_worker.py, app/payments_client.py, app/scheduler.py, migrations/0042, tests/test_renewal_worker.py, app/monthly_worker.py, app/db.py, app/config.py, app/money.py, app/mailer.py, app/cleanup.py, deploy/scheduler.yaml, deploy/monthly-worker.yaml, deploy/README.md, docs/tickets/BILL-212.md, docs/vendor/payco-api-v2-excerpt.md, migrations/0031 → out/ledger.yaml 読み直し
Web検索7語（decimal TypeError、psycopg adaptation、schedule 例外、k8s CronJob idempotent、PG11 ADD COLUMN、requests timeout 既定、PG Feb 29 + 1 year）+ WebFetch psycopg adapt

## impact 項目の着想元
D-001 初期一覧（冪等性・並行実行）+backend.md（idempotent APIs, ambiguous outcome）+資料
D-003 初期一覧（移行）+backend.md（online DDL, mixed-version）+資料+Web
D-006 初期一覧（障害時）+backend.md（graceful shutdown）+資料（autocommit、猶予30秒）+既有知識（2/29）+Web（schedule）
D-010 backend.md（性能・資源）+資料（40万件、0031 索引）
D-012 初期一覧（金銭）+資料（TAX_RATE の食い違い）
D-015 初期一覧（個人情報）+backend.md（sensitive logging）+資料
D-016 backend.md（Brooker の timeouts）+Web+既有知識

## トレース: 全段 OK

## 不明点（構造化）
1. question が五問の分類値だけで、具体的な問いの置き場が無い（YAML コメントで補った）。GFR: 列挙値の欄に自由記述の欄を並べるか置き場を明示。
2. 版（コミットID無し）。GFR: 代替識別子と作り方を定める。
3. 終了条件「admitted_limit に見直し条件付きで列挙」が改修待ち pending に限界を書くだけで形式的に満たせる。GFR: 対応（defer/narrow など）で判定し保留と受容を区別。
4. 模擬尋問の origin。GFR: 観測した入力と想定した入力を別値に。
5. 「scope.ref が重なる項目の間では上位層の確定を待つ」で、範囲の広い上位項目があると論理的に無関係な下位項目まで止まる（D-010 の範囲を狭めて回避）。GFR: 確定の順序は論理的な依存（depends_on）で定め、行範囲の重なりは依存候補の発見にだけ使う。
6. 1段目がどの問いへの回答か指定されていない（「このPRの構造は妥当か」と置いた）。GFR: 各出力段に答える問いを明示。

## 裁量
退屈版は monthly_worker と monthly-worker.yaml / 版名 "PR#318-excerpt" / ID 通し番号、meta 追加 / 「連続3回」は初回を含む読みを採り限界に記録 / 認可・保存期間を非該当と明記 / 公開文書の確認は inspection / D-010 の11時間は算術と明記 / DB 側の占有は提案せず冪等キーと実行の単一化 / 層は自分で決定 / jev-crosscheck 不使用

## やり直し: 3回（D-006 飛ばしで ID 振り直し、D-010 scope を層順序規則のため狭める、1段目の言い過ぎを弱める）+ 件数修正1
