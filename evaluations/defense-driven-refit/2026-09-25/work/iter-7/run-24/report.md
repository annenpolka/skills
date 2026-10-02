## 成果物
- out/ledger.yaml: 20項目（構造3・境界7・手続き7・細部3）。origin 延べ impact 12、asked 7（全て simulated: true）、counterexample 3、deviation 1。複数入口 D-006=[impact, counterexample]、D-010=[asked, counterexample]、D-014=[impact, asked]。done 13、pending 7（D-003, D-006, D-011, D-012, D-014, D-016, D-019、final_answer null）。規則を機械検査。
- out/explanation.md: 三段階出力、改修予定、人間側の条件、署名（ダイヤル、内容ハッシュと作り方・ファイルごとの一覧、Web 文書の参照日、終了条件未達・gap 7件、次の周の最初の手）。
- 採用判断: 採用不可。D-003 順序非保証で返金後の支払成功が遅れて届くと paid に戻り要求4違反（created による条件付き更新を予定）。迷うものとして理由つきで止める側に D-006（署名鍵が未設定・空のまま起動しうるか）、D-011（charge ID 未設定時の0件更新で処理済み）。

## 要件の達成（自己申告）: 1 ○ / 2 ○ / 3 ○（テストの ch_1 は現在値で根拠ではないと明示）/ 4 ○（D-004 保持期間と D-013 3日超の欠落は narrow、D-015 不正な本文は個別処理不要）/ 5 ○（freedom: D-004, D-008, D-015, D-019）/ 6 ○

## 読んだファイル（順）
skill: s9/SKILL.md → find → s9/references/impact-profiles/backend.md
repo: README.md, app/webhooks.py, migrations/0051, tests/test_webhooks.py, app/db.py, migrations/0020, docs/tickets/PAY-140.md, docs/vendor/payco-webhooks-excerpt.md
Web: WebFetch 6件（PG transaction-iso, FastAPI async, PG sql-insert, PG index-unique-checks, Python hmac, psycopg transactions）。WebSearch なし。

## impact 項目の着想元
D-001 初期一覧（冪等性）+資料 / D-002 初期一覧（移行）+資料+既有知識 / D-003 資料+backend.md（ordering/replay）/ D-004 初期一覧（保存期間）+資料 / D-005 初期一覧（認証）+資料 / D-006 既有知識+資料+Web / D-011 既有知識+資料+backend.md（ack gap）/ D-013 資料+backend.md（webhooks/DLQ）+既有知識 / D-014 資料 / D-017 初期一覧（並行実行）+backend.md（idempotent consumer / unique constraints）+Web / D-018 初期一覧（部分失敗）+資料+Web / D-020 初期一覧（個人情報）

## Trace: all OK

## 不明点（構造化）
1. 実行していないテストを証拠としてどう書くか（test: …, executed: false とした）。GFR: 実行より低い強さではテストを読んだ結果は inspection、test 種は実行結果がある場合に限ると明記。
2. 修正が複数の層にまたがる項目の層（D-003 はスキーマ列追加と UPDATE 条件、手続きにした）。GFR: 問いが対象とする判断の層に置き、他層の変更は plan に参照、独立の判断は別項目。
3. narrow で他者の受け入れが要る項目の終了判定（D-010・D-013 は narrow で done だが受け入れの権限は要求者、admitted_limit は unverified）。GFR: 他者の受け入れを前提にする resolution は、権限のある主体が accepted にするまで終了に数えない。
4. 後から当てた反例の入口を origin に足してよいか（D-006・D-010 に counterexample を追記）。GFR: 入口を追記するときは、その入口で実際に作った問い（反例の文）を gap か署名に残す。

## 裁量
ID は発見順、台帳は層順 / 版は12桁を各項目、完全形を meta と署名、対象は8ファイル全て / D-004 の accepted_by を「担当開発者（PR #402 提出者）」/ FastAPI 文書の推奨と PayCo 推奨300秒を convention、PayCo の配送・再送の性質を existing_contract / D-003 は created 比較方式 / D-019 同秒の扱い（refunded 優先は要求4、paid と failed は後着で freedom）/ D-006 と D-011 を迷うものとして止める側、D-016 は入れない / 手続き・細部はその場の回答に載せない / テストは executed: false / WebFetch のみ / jev-crosscheck 不使用

## やり直し: 1回（署名の「版が変わったら pending に戻る done 項目」の一覧を、根拠・証拠で参照する項目も含めて done 13件すべてに）
