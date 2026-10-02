## 成果物
- out/ledger.yaml: 17項目。deviation 2 / impact 12 / counterexample 2 / asked 1（想定問答）。構造3・境界8・手続き2・細部4。done 3（D-004, D-013, D-014、資料確認のみ）/ pending 14。スクリプトで規則検査。
- 主な指摘: D-002 キャッシュキー members:page={page} で別組織の一覧・メール。D-006 ロゴ取得がリダイレクト追従で SSRF、社内応答をメールで持ち出し。D-009 Read Committed で席数の count-then-insert 競合。D-015 1回の RENAME で配布中とロールバック時に壊れる。D-008 ロゴ取得とメール送信がトランザクション内。D-010 数え方の反例。
- out/explanation.md: 1段目は全体と4論点で各3文以内。2段目は根拠/証拠別列の表と問題なしの事項。3段目は未検証一覧、限界と見直し条件、終了条件未達。署名にダイヤル、版の方式（内容ハッシュ）、第一周の条件、判断者。

## 要件の達成（自己申告）: 1 ○ / 2 ○ / 3 ○（外部文書 PG・Requests は inspection 欄、根拠に使わない）/ 4 ○（FOR UPDATE にとどめる、SSRF と取得上限は「サーバ側で取得を残す場合」に限る。D-003 は不要と見る余地が少し）/ 5 ○（resolution に state を追加）/ 6 ○

## 読んだファイル（順）
skill: s5/SKILL.md →（find）→ s5/references/impact-profiles/backend.md
repo: README.md, docs/tickets/TEAM-45.md, docs/spec/members.md, app/routes/members.py, app/routes/invitations.py, app/logo.py, migrations/0033, app/cache.py, app/db.py, app/auth.py, app/mailer.py, app/routes/org_settings.py, app/config.py, deploy/api.yaml, deploy/README.md, migrations/0020, tests/test_members.py, tests/test_invitations.py。grep name、SHA-256、git log（git 管理外）、ls。
Web: WebFetch 3件（PG16 transaction-iso、Requests Quickstart、OWASP SSRF Prevention Cheat Sheet）

## impact 項目の着想元
D-002 資料+backend.md（cache key completeness / tenant isolation）+既有知識
D-003 初期一覧（保存期間・個人情報）+資料+backend.md（invalidation）
D-004 初期一覧（認可）+資料
D-006 backend.md（SSRF）+資料+Web+既有知識
D-008 初期一覧（外部副作用・部分失敗）+backend.md（ambiguous outcome）+資料
D-009 初期一覧（並行実行）+backend.md（isolation levels / write skew）+資料+Web
D-011 初期一覧（金銭）+既有知識+資料
D-012 初期一覧（部分失敗）+資料+backend.md（Hyrum's Law）
D-013 初期一覧（認可）+backend.md（BOLA / IDOR）+資料
D-014 初期一覧（金銭）+資料
D-015 初期一覧（移行）+backend.md（expand-contract / mixed-version）+資料
D-016 backend.md（Hyrum's Law / schema evolution）+資料

## Trace: all OK

## 不明点（構造化）
1. 候補状態を書く欄が無い（resolution に state を独自追加）。GFR: 規則で区別する状態には項目の形に表現欄を。
2. 20行制限の数え方（flow style で詰めた）。GFR: 書式に依存しない単位で。
3. 終了条件が形式的に満たせる（gap の本体でない周辺の未確認事項を書くだけでも満たせる）。GFR: 限界がどの gap を受け入れるかを明示させる。
4. 想定問答の origin。GFR: 代替手順の出力ラベルも定義。
5. 複数ファイルにまたがる項目と版管理外の版。GFR: 複数対象の識別子（スナップショットID等）まで定義。
6. 「3文以内」の単位。GFR: 長さ制限に適用単位を。
7. 外部の公式文書が示す製品挙動の置き場所（根拠にも証拠にも当てはまらない）。GFR: 補助事実の置き場所を明示。

## 裁量
resolution.state（confirmed | investigating | candidate）を meta で定義 / 版は SHA-256 先頭12桁と抜粋全体のスナップショットハッシュ / D-001 を narrow で確定（investigate だと D-002 のキー修正まで候補止まりになるため）/ 想定問答は asked / 影響領域の取捨 / 1段目は全体と論点ごと / 外部文書は inspection / jev-crosscheck 不使用 / WebFetch のみ

## やり直し: 2回（D-001 investigate→narrow、想定問答の独立項目を D-015 に統合）+ D-012・D-016 の depends_on を外した（上位の決定が対象を消さないため）
