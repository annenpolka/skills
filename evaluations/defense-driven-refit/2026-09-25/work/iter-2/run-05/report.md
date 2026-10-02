## 成果物
- out/ledger.yaml: 18項目。impact 11 / asked 3（想定問答）/ deviation 2 / counterexample 2。構造3・境界7・手続き3・細部5。done 3（D-003、D-004、D-015、資料確認のみ）/ pending 15。python で規則検査。meta（ダイヤル、版 V611-0925、影響領域と項目の対応、時刻TZ 該当なし、pytest 全件成功は未実行なので証拠に使わない、Web の出典）。
- out/explanation.md: 1段目は全体と5論点をそれぞれ3文以内。2段目は根拠/証拠別列の表と改修順序。3段目は見直し条件つき16行。判断依存の一覧、署名。
- 主な発見: D-002 キャッシュキーが page だけ→他組織の一覧・管理者向けメール漏れ。D-010 ロゴURLは https:// 前方一致のみ・リダイレクト追従→社内向け内容の読み出し（SSRF）。D-008 pre-deploy で改名、新旧Pod並走、ロールバックはイメージのみ→旧コード全面失敗。D-013 トランザクション内の外部呼び出し。D-014 READ COMMITTED で席数上限超過。D-011 timeout は全体上限ではない（反例）。D-012 一括招待画面と新409。D-017 重複招待と期限なし未承諾招待。

## 要件の達成（自己申告）: 1 ○ / 2 ○ / 3 ○（OWASP と Expand and Contract を修正方法の convention として「Web確認」付きで置いた、D-006 根拠は README からの推論、ロゴの退屈版は生成した最小案）/ 4 ○ / 5 ○ / 6 ○

## 読んだファイル（順）
skills/s4/SKILL.md（唯一のファイル）
repo: README.md, docs/tickets/TEAM-45.md, docs/spec/members.md, deploy/README.md, deploy/api.yaml, app/routes/members.py, app/routes/invitations.py, app/logo.py, migrations/0033, migrations/0020, app/cache.py, app/db.py, app/auth.py, app/mailer.py, app/routes/org_settings.py, app/config.py, tests/test_members.py, tests/test_invitations.py → grep（name/cache/redis/sessions）
Web検索5語: requests timeout not total, PostgreSQL default isolation read committed, requests allow_redirects default, OWASP SSRF cheat sheet, expand contract rename column

## impact 項目の着想元
D-002 本文（認可・個人情報）+資料+既有知識 / D-003 本文（認可）+資料 / D-005 本文（個人情報・保存期間）+資料 / D-006 本文（障害時）+資料+既有知識 / D-007 本文（移行）+資料 / D-008 本文（移行）+資料+既有知識+Web / D-010 本文（外部副作用）+資料+既有知識（SSRF）+Web / D-012 本文（後方互換・部分失敗）+資料 / D-013 本文（部分失敗・外部副作用・反例例）+資料+既有知識 / D-014 本文（並行実行・課金）+資料+既有知識+Web / D-017 本文（冪等性・保存期間・課金）+資料

## Trace: all OK

## 不明点（構造化）
1. 版の表し方（VCS 無し）。GFR: 代替と適用範囲を定義。
2. 層の規則の重なり判定: 「scope.ref が重なれば下位層は上位層の確定を待つ」を行範囲で機械的に当てると無関係な依存が生じる。gap なし・resolution null の確認項目を上位が候補のままでも done にしてよいか不明。GFR: 順序制約は趣旨（上位の決定が下位の対象を消す・書き換える可能性）で判定条件を定義し、確認だけの項目の扱いを明示。
3. 想定問答の origin。GFR: 列挙値か必須フィールドで区別。
4. 第一周の終了条件: 改修未適用の gap が全て admitted_limit に入り形式上満たされる。GFR: 保留中の作業と合意した限界を別状態に、周回単位の完了条件。
5. narrow の検証対象（PR 説明か explanation.md か）。GFR: 検証すべき文書を特定。
6. 「3文以内」の単位（全体か論点ごとか）。GFR: 長さ制約に単位を添える。
7. グローバル指示（jev-crosscheck）とシナリオ制約の衝突。GFR: タスク指示に常設手順の扱いを明記。

## 裁量
版 V611-0925 / 想定問答 asked + コメント / gap なし確認項目は上位が候補でも done（meta.interpretation）/ ロゴの退屈版は生成した最小案 / D-008 change と remove_or_align 併記 / D-002・D-008・D-010 はマージを求めない / OWASP と Expand and Contract を convention（Web確認）/ 1段目を全体と論点ごと / meta 追加 / 差分外の細部は項目化せず / jev-crosscheck 不使用

## やり直し: ファイル書き直し0、判断2（scope.ref の切り方と depends_on の組み直し、D-008 action）
