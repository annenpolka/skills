## 成果物
- out/ledger.yaml: 17項目。gap 15（全て pending・final_answer null）、gap なし done 2（B-02 第三者による削除・IDOR/CSRF、P-12 二重送信）。origin（複数可）impact 11、counterexample 4、deviation 1、asked 4（全て simulated: true）。構造2（S-01 注文履歴の連鎖削除、S-02 取り消し猶予なしの即時削除）・境界5・手続き10。meta（ダイヤル、版、入口、影響領域との対応、終了条件未達と次の手）。
- out/explanation.md: 一段目の結論「現状のままでは採用できない」（audit_logs FK で削除500、個人情報が検索索引・CRM・分析スナップショットに残る、未決の注文履歴を取り消せない形で先取り削除）。二段目は参照表、三段目は accepted 0・unverified 15。署名（ダイヤル、版の作り方、ファイルごとのハッシュ、未達、次の手）。

## 要件の達成（自己申告）: 1 ○ / 2 ○ / 3 ○（製品の挙動 PG・Starlette・OWASP は文書名と節で inspection、法令・CRM API・DATA-12・MKT-31 の中身は発明せず）/ 4 ○（B-03 再確認なしの削除は investigate、過剰と見られる余地）/ 5 ○（kind、candidate の推移、版の一致をスクリプト検査）/ 6 ○

## 読んだファイル（順）
skill: s8/SKILL.md → find → s8/references/impact-profiles/backend.md
repo: README.md, app/routes/account.py, app/main.py, tests/test_account.py, docs/tickets/ACC-88.md, app/auth.py, app/db.py, app/audit.py, app/routes/profile.py, app/routes/orders.py, migrations/0001,0004,0007,0012,0015, jobs/crm_sync.py, export_analytics.py, user_indexer.py, config/search.yaml, ops/backup.md
Web: 検索2語（OWASP CSRF bearer、FastAPI 500）、WebFetch（PG16 ddl-constraints / sql-begin / datatype-numeric / sql-delete、OWASP CSRF cheat sheet、psycopg transactions、starlette exceptions）

## impact 項目の着想元
S-01 資料+初期一覧（保存期間と削除、金銭）+Web / S-02 資料+初期一覧 / B-01 資料+backend.md（session revocation）+Web / B-02 資料+backend.md（BOLA/IDOR、CSRF）+Web（閉じた）/ P-01 資料+初期一覧（障害時）+既有知識+Web / P-03 資料+初期一覧+既有知識 / P-04 資料+backend.md（deletion propagation）+既有知識 / P-06 資料+初期一覧（外部副作用、個人情報）+backend.md / P-08 資料+backend.md（retention）/ P-09 資料+backend.md（RPO、restore drill）+既有知識 / P-12 初期一覧（冪等性）+資料+Web（閉じた）

## Trace: all OK

## 不明点（構造化）
1. 未決事項（注文履歴）を取り消せない形で先取りする挙動が「採用を止める gap」に当たるか（一段目に入れた）。GFR: 要求が保留している事項を不可逆に確定させる挙動を独立の区分として扱う。
2. 版ハッシュに Web の一次資料を含めるか（ローカル20ファイルのみ、Web は URL と節を meta に）。GFR: 外部資料は文書名・節・URL・参照日で版と別に記録、ハッシュ対象外と明記。
3. 複数ファイルにまたがる scope.ref をスキーマ例にない配列で書いた。GFR: scope.ref が複数参照を取れることを形の定義に含める。
4. 要求違反は確定だが直す手段が資料外（CRM の API）のとき change か investigate か（change にし手段の確認を plan に）。GFR: action は gap を閉じる対応で選び、前提の調査は plan の先頭手順に。
5. kind: accepted を付けてよい主体が不明（受け入れ候補も unverified に）。GFR: accepted には受け入れた主体を記録、判断していない限界は unverified。
6. depends_on の「同じ対応」の粒度（action の種類か内容か）。GFR: 依存の判定は action の種類と対象で、内容の差は版の規則で扱う。

## 裁量
ID 接頭辞を層ごと（S/B/P）/ scope.ref を配列、asked_by 欄を追加、meta 節 / 細部層は作らない / 境界の退屈版は一致とみなし項目化せず、逸脱は P-02 の1件 / 外部 CRM と分析基盤の保持を ACC-88:11 の「保持」に含める / 時刻と移行は非該当 / 資料外の事項は署名に列挙 / 説明は1本（2者共通）/ 版ハッシュは repo の全20ファイル

## やり直し: 3回（一段目4文→3文、B-01 の depends_on に S-01 追加、一時ファイル .manifest.sha256 を run-20/ 直下に誤って書き直後に削除）
