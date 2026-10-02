## 成果物
- out/ledger.yaml: 21項目。版 sha256:23d0644d…（repo/ の18ファイルの内容ハッシュ、作り方は署名）。impact 14、deviation 4、counterexample 2、asked 1（simulated: true）。構造4・境界7・手続き5・細部5。gap 19件は全て pending・final_answer null（change/narrow 9件=確定4・candidate 5、investigate 10件）。done 2（D-010 招待APIの認可、D-021 上限判定 >=、gap null）。規則を機械検査（candidate と依存先の確定状態の整合、asked の simulated を含む）。
- out/explanation.md: 冒頭3文で「採用不可」、止める理由3点（キャッシュキー、ロゴ取得の SSRF、改名マイグレーション）と席数競合の併記。
- 発見: D-005 members:page={page} に組織ID・権限なし、共有 Redis・3レプリカ×4ワーカー。D-006 https 前方一致のみ・リダイレクト追従・取得内容が管理者指定の宛先へ。D-002 RENAME と pre-deploy→RollingUpdate→イメージのみロールバックの不両立。D-007 Read Committed で count と INSERT の間にロック無し。D-003 ロゴ取得とメール送信がトランザクション内。

## 要件の達成（自己申告）: 1 ○ / 2 ○ / 3 ○（D-006「管理者＝組織側の利用者」は推論、OWASP Case 1 の redirect 記述を Case 2 に当てはめたことを明示）/ 4 ○ / 5 ○ / 6 ○（受け入れた限界と改修予定の未確認事項を分離）

## 読んだファイル（順）
skill: find → s7/SKILL.md, s7/references/impact-profiles/backend.md
repo: README.md, docs/tickets/TEAM-45.md, docs/spec/members.md, app/routes/members.py, app/routes/invitations.py, app/logo.py, migrations/0033, app/cache.py, app/db.py, app/auth.py, app/mailer.py, app/routes/org_settings.py, app/config.py, deploy/api.yaml, deploy/README.md, migrations/0020, tests/test_members.py, tests/test_invitations.py → shasum
Web: WebFetch（PG16 transaction-iso, requests quickstart, OWASP SSRF cheat sheet x2, PG16 sql-altertable, PG16 explicit-locking）。WebSearch なし。

## impact 項目の着想元
D-002 資料+初期一覧（移行）+backend.md（expand-contract / mixed-version）/ D-003 資料+初期一覧（外部副作用・部分失敗）+backend.md（ambiguous outcome）+既有知識+Web / D-005 資料+初期一覧（認可・個人情報）+backend.md（cache key completeness / tenant isolation）/ D-006 資料+backend.md（SSRF）+Web+既有知識 / D-007 資料+backend.md（isolation / write skew）+Web+既有知識 / D-008 資料+初期一覧 / D-009 資料+backend.md（Hyrum's Law / schema evolution）/ D-010 初期一覧（認可）+資料（閉じた）/ D-014 初期一覧（保存期間と削除）+backend.md（invalidation）+資料 / D-015 初期一覧（障害時）+資料 / D-016 初期一覧（個人情報）+backend.md（data minimization）+資料 / D-018 資料+Web+既有知識 / D-020 初期一覧（金銭）+既有知識 / D-021 初期一覧（金銭）+資料（閉じた）

## Trace: all OK（Formatting で一度修正）

## 不明点（構造化）
1. 下位層を掘る順序: ワークフロー4「上位確定後に下位を掘る」「木は最初から全部作らない」とダイヤル granularity=細部の両立（下位層を candidate として記録した）。GFR: 記録と確定を別段階として定義し、granularity がどちらを指すか明示。
2. 反例項目の layer（手続きにした）。GFR: 当てる層と項目の layer の決め方を同じ箇所で。
3. 三段目の「受け入れた限界」と「改修予定の未確認事項」を区別する欄が台帳に無い（resolution と status から推定）。GFR: 出力の区分を台帳側で判定できる欄か導出規則を。
4. 複数の入口から同じ問いに届いたときの origin と重複（asked は1件）。GFR: 入口が重なったときの優先順位。
5. 製品の挙動を根拠に置くか証拠に置くか（PG 分離レベルの挙動は改修の必要性を支えるが inspection に置いた）。convention に外部規格を許していて境界が曖昧。GFR: 使い道で振り分ける（必要性を支えるなら grounding、適合を確かめるなら evidence）。
6. 冒頭に入れる「採用を止める gap」の判定基準が無い。GFR: 採用を止める条件を明文化。

## 裁量
採用を止める gap として D-002、D-005、D-006、D-007 は併記 / その場の回答は ID なしの話題名見出し / 台帳の先頭に signature 節、done にも admitted_limit / PR 説明の narrow も pending / 修正案の具体形（キャッシュキーの形、FOR UPDATE OF o、expand-contract の手順）/ 判断者を署名に列挙 / jev-crosscheck 不使用

## やり直し: 2回（冒頭と各項目の3文超過で7ブロック書き直し、署名の gap 内訳の誤り修正）
