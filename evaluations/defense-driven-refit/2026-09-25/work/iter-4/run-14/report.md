## 成果物
- out/ledger.yaml: 16項目、meta（ダイヤル、版の決め方、外部資料）。impact 9、asked 5（全て simulated: true）、deviation 1、counterexample 1。構造2・境界8・手続き3・細部3。done 4（D-007 narrow、D-008、D-010、D-016）、pending 12（final_answer null）。candidate: D-004、D-006、D-012、D-013、D-014（上位 D-001 / D-002 が investigate のため）。スクリプトで規則検査。
- out/explanation.md: 三段階（その場3文、要求ごとの根拠/証拠表・失敗経路・改修と検証計画・影響領域割り当て、今回直さないもの／未確認のもの／他者の判断に依存する前提）。署名（ダイヤル、版の決め方 SHA-256、第一周、コード未変更・テスト未実行）。
- 発見（マージ前に直す必要、改修は予定のみ）: D-004 キャッシュキーに org_id と権限なし→他組織の一覧がメール付き。D-006 ロゴ取得のリダイレクト追従で https 限定の検証を迂回、内部応答をメールで持ち出し。D-011 Read Committed で席数 count-then-insert 競合。D-003 単発 RENAME が新旧 Pod 並走とロールバックで旧版を壊す。

## 要件の達成（自己申告）: 1 ○ / 2 ○ / 3 ○（D-006 の「組織の管理者はテナント側の利用者」は推論、D-011 の既定分離レベルは PG16 文書）/ 4 ○（時刻非該当、D-014 は担当者確認のみ、D-006 の強化4点は D-002 でサーバ側取得を残す場合の候補）/ 5 ○ / 6 ○

## 読んだファイル（順）
skill: s6/SKILL.md（find）, s6/references/impact-profiles/backend.md
repo: README.md, docs/tickets/TEAM-45.md, docs/spec/members.md, app/routes/members.py, app/routes/invitations.py, app/logo.py, migrations/0033, migrations/0020, app/cache.py, app/db.py, app/auth.py, app/mailer.py, app/routes/org_settings.py, app/config.py, deploy/api.yaml, deploy/README.md, tests/test_members.py, tests/test_invitations.py
Web: WebFetch 2件（requests quickstart、PG16 transaction-iso）

## impact 項目の着想元
D-003 資料+初期一覧（移行）+backend.md（expand-contract / mixed-version）+既有知識
D-004 資料+backend.md（cache key completeness / tenant isolation）+初期一覧（認可・個人情報）
D-005 資料+backend.md（Hyrum's Law）+初期一覧（後方互換）
D-006 資料+backend.md（SSRF）+Web+既有知識
D-009 資料+初期一覧（後方互換・部分失敗）
D-010 資料+初期一覧（認可）+backend.md（BOLA / tenant）— done
D-011 資料+初期一覧（並行実行）+backend.md（isolation levels / write skew）+Web+既有知識
D-012 資料+初期一覧（部分失敗・外部副作用）+backend.md（pool exhaustion / ambiguous outcome）+Web
D-014 資料+初期一覧（個人情報）+backend.md（data minimization）

## Trace: all OK

## 不明点（構造化）
1. 上位 D-001 / D-002 が investigate のため重大な下位項目（テナント越境、SSRF）が candidate のまま。「マージ前に必須」は admitted_limit の文言と説明の書き分けで表すしかない。GFR: 上位のどの分岐でも現状が不可になる項目の印（例: blocking）を用意し一段目に出せるように。
2. candidate: true の置き場所（項目直下か resolution の中か）が不明、項目の形の例に無い。GFR: 規則で導入するフィールドは形の例に載せる。
3. 「必須フィールドのみで20行以内」の必須の集合と数え方。GFR: 数える対象と数え方を明示。
4. admitted_limit が単数の形で複数の限界を1文に詰めた。GFR: 各フィールドの多重度を明示。
5. 同じ項目に改修予定と受け入れる限界が混ざり（D-012）、終了条件に数えるか項目単位で決めにくい。GFR: 終了判定の単位を定義、性質の違う対応は項目を分ける。
6. PR の差分が資料に無く新旧を決められない（investigate 増）。GFR: 入力に差分の所在を必須、無ければ「新旧不明」を台帳に明示。

## 裁量
版 SHA-256 先頭12桁、複数ファイルは主ファイル / meta / 細部の問いを asked + simulated で / D-001・D-002 は investigate、下位は candidate、説明で「マージ前に必須」/ D-007 narrow で done / D-012 はロゴ取得だけトランザクション外、メール送信位置は限界 / テストは存在の参照、未実行注記 / 公開一次資料は挙動の証拠と既定値の裏付け / 時刻非該当 / 一段目は PR 全体で一つ / jev-crosscheck 不使用

## やり直し: 3回（一段目5文→3文、D-016 の depends_on に D-011 追加、説明3.1節の注記と見出し）
