## 成果物
- out/ledger.yaml: 17項目（構造3・境界6・手続き5・細部3）。gap 15件、done 2（R-09 招待の組織分離、R-17 席数の数え方）。origin（複数可）deviation 4、impact 13、counterexample 2、asked 3（全て simulated: true）。admitted_limit は unverified 12、accepted 1（R-15）。PyYAML で規則検査（依存先が未確定なら candidate を含む）違反0。
- out/explanation.md: 一段目は冒頭3文の採否と構造・境界9項目の回答。二段目は根拠と証拠の表と改修計画、外部資料は文書名と節。三段目は accepted と unverified に分けた一覧と判断を頼る相手。署名（ダイヤル、終了条件未達・gap 15件、次の周の最初の手、内容ハッシュの作り方と18ファイルのハッシュ）。
- 採用を止める gap 3件: R-04 キャッシュキー members:page={page}（members.md:3-4 違反）、R-05 単一 RENAME（deploy/README.md:4-5 の手順で旧 Pod とロールバック後が失敗）、R-10 行ロック無しの Read Committed で席数上限超過（挿入からコミットまでにロゴ取得とメール送信）。SSRF（R-06）は一段目の境界の回答と台帳で扱った。

## 要件の達成（自己申告）: 1 ○ / 2 ○ / 3 ○（製品の挙動は inspection、OWASP ASVS は convention として節と原文、「チームが採用しているかは資料に無い」と付記）/ 4 ○（判定者次第で partial: R-14 Redis 障害時 DB フォールバックは change だが数行）/ 5 ○ / 6 ○

## 読んだファイル（順）
skill: s8/SKILL.md, s8/references/impact-profiles/backend.md
repo（find、全18ファイルのハッシュ）: README.md, app/routes/members.py, app/routes/invitations.py, app/logo.py, migrations/0033, app/cache.py, app/db.py, app/auth.py, app/mailer.py, app/routes/org_settings.py, app/config.py, deploy/api.yaml, deploy/README.md, docs/spec/members.md, docs/tickets/TEAM-45.md, migrations/0020, tests/test_invitations.py, tests/test_members.py
Web: WebFetch（PG16 transaction-iso, requests quickstart, psycopg pool, OWASP ASVS 5.0 V1, FastAPI async）、検索2語（OWASP ASVS SSRF、redis-py ConnectionError）

## impact 項目の着想元
R-02 資料+初期一覧（個人情報）+索引（data minimization/retention）/ R-03 資料+初期一覧（外部副作用）+既有知識 / R-04 資料+索引（cache key completeness、tenant isolation）/ R-05 資料+索引（expand-contract、mixed-version）/ R-06 資料+索引（SSRF、OWASP ASVS）+Web / R-07 資料+初期一覧（移行）+模擬尋問 / R-08 資料+索引（Hyrum's Law、schema evolution）/ R-09 資料+初期一覧（認可）+索引（BOLA/IDOR）— done / R-10 資料+索引（isolation levels、write skew）+Web+反例駆動 / R-11 資料+索引（pool exhaustion）+Web / R-12 資料+索引（ambiguous outcome）+初期一覧（部分失敗）/ R-13 資料+初期一覧（冪等性）+索引（idempotent APIs）/ R-14 資料+初期一覧（障害時）+Web

## Trace: all OK

## 不明点（構造化）
1. 同時実行が条件の経路（R-10）を採用を止める gap とみなすか可能性か。GFR: 「成り立つ」はシステムが受け付ける入力の組み合わせで到達できること、成立条件を gap に併記。
2. SSRF（R-06）は深刻だが資料にセキュリティ要件が無く、定義上採用を止める gap にならない。GFR: convention を根拠とする重大な gap を冒頭に入れてよいか決める。入れないなら一段目の別の場所に必ず出す。
3. 採用を止める R-04 が上位 R-01（キャッシュを残すかの investigate）に依存して candidate。GFR: 上位のどの選択でも gap の解消が必須なら制約は確定、対応の選び方だけ candidate。
4. 版のハッシュに Web の外部資料を含めるか。GFR: ハッシュに含めず文書名・版・節（アクセス日）で記録。
5. 変更前のコードが無く PR で入ったか判別できない（R-08、R-12）。GFR: 「導入元不明」と記録し investigate。
6. R-15 を accepted にしたが受け入れる権限の主体が不明。GFR: accepted には受け入れた主体を記録、権限が無ければ unverified。

## 裁量
ID R-01〜R-17、meta ブロック / 根拠・証拠の書式 {種類: 本文, ref: ファイル:行} / 版は全18ファイルの内容ハッシュ先頭12桁 / R-10 を採用を止める gap に、SSRF は境界の回答に / R-01 investigate で R-02・R-04・R-14・R-15 が candidate / R-15 を開発者判断で accepted / R-04 と R-05 を境界層 / 模擬尋問3件 / 二段目に判断依存の節 / jev-crosscheck 不使用

## やり直し: 1回（冒頭4文→3文）。一時ファイルを out/ の外に書こうとしてパス誤りで失敗（ファイルは作られていない）
