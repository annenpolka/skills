## 成果物
- out/ledger.yaml: 21件（構造4・境界6・手続き4・細部7）、冒頭に署名ブロック。origin（重複あり）impact 16、counterexample 5、asked 4（全て simulated: true）、deviation 3。組み合わせ: impact のみ10、impact+counterexample 4、impact+asked 1、deviation+impact 1、deviation のみ1、deviation+asked 1、asked のみ2、counterexample のみ1。gap 13件のうち終了条件を満たすのは D-03 と D-05（narrow で検証済み、限界 accepted）、残り11件 pending・final_answer null。gap なし検証済み8件（S-01, S-04, B-01, B-03, D-01, D-02, D-04, D-06）。pyyaml で規則検査。
- out/explanation.md: 一段目は冒頭の採否3文と構造・境界の各項目への答え。二段目は層ごとの表。三段目は accepted 4件と unverified 11件。署名にダイヤル、版と作り方、ファイルごとのハッシュ、終了条件未達、次の周の最初の手、退屈版、影響領域、公開文書。
- 主な発見 P-01（採用を止める gap）: 順序非保証・3日再送と無条件の UPDATE（webhooks.py:54-57）で返金後の charge.succeeded が paid に戻す→要求4違反が資料だけで成り立つ。改修案 AND payment_status <> 'refunded'（未実施）。ほかに S-02 ルーター登録が変更ファイルに無い、S-03 client_with_db fixture が未定義、B-06 発送画面が範囲外。

## 要件の達成（自己申告）: 1 ○（P-01, P-03 0行更新, B-04 再送時の t, B-06）/ 2 ○（pending 11件は kind: unverified）/ 3 ○（空の鍵 HMAC は一般知識、非 ASCII の TypeError は一次文書と公開不具合報告）/ 4 ○（D-03・D-05・D-06 は accepted、P-04 と D-07 は investigate）/ 5 ○（D-01, D-02 で freedom）/ 6 ○

## 読んだファイル（順）
skill: s8/SKILL.md, s8/references/impact-profiles/backend.md（find）
repo: README.md, app/webhooks.py, migrations/0051, tests/test_webhooks.py, app/db.py, migrations/0020, docs/tickets/PAY-140.md, docs/vendor/payco-webhooks-excerpt.md → SHA-256
Web: 検索1語（hmac.compare_digest ASCII only）、WebFetch（PG transaction-iso, psycopg transactions, PG sql-insert, PG index-unique-checks, cpython hmac.rst, starlette datastructures.py, FastAPI async）、docs.python.org は 503

## impact 項目の着想元
S-01 資料+初期一覧（冪等性）+backend.md（idempotent consumer, unique constraints）+Web / S-04 初期一覧（移行）+backend.md（mixed-version）+資料 / B-01 資料+初期一覧（認証）/ B-02 既有知識+backend.md（秘密）+資料 / B-03 資料+初期一覧（障害時・外部副作用）+backend.md（webhooks, ambiguous outcome）/ B-04 資料+既有知識 / B-05 資料 / B-06 資料 / P-01 資料+backend.md（ordering, replay）+本文（反例駆動）+Web / P-02 資料 / P-03 既有知識+backend.md（ack gap）+資料 / P-04 既有知識+Web+backend.md（性能・資源）/ D-04 資料+初期一覧（金銭）/ D-05 資料+既有知識 / D-06 初期一覧（保存期間）+backend.md（retention）+資料 / D-07 backend.md（運用・監視）+資料+既有知識

## Trace: all OK

## 不明点（構造化）
1. P-01 に「改修する」と「改修後は refunded から戻る遷移を受け付けない限界」を1項目に持たせた。一項目一対応の規則と例 D-014（remove_or_align と accepted の限界が同じ項目）が食い違う。GFR: 選んだ改修に本来備わる限界は同じ項目、別の対応として受け入れる限界は分ける、と明文化。
2. PayCo の「順序を保証しない」「3日再送」を existing_contract に置いたが、「製品の挙動は inspection」に反するように読める。GFR: 外部の挙動は、設計理由なら existing_contract、成果物の適合を示すなら inspection と用途で分類。
3. 「採用を止める gap＝経路が資料確認で成り立つもの」の「成り立つ」の定義（P-01 は契約上起こりうるが観測していない）。GFR: 確認済みの資料の組み合わせだけで到達できること、未確認の前提を一つでも要するなら可能性。
4. 版のハッシュ対象に公開 Web 文書を含めるか（含めず URL のみ）。GFR: 外部文書は URL と参照日を署名に、ハッシュには含めない。
5. 項目の形に無いフィールド（simulated、impact_area、note）を足した。simulated は本文で必須なのに例に無い。GFR: 本文で必須のフィールドは項目の形の例にも載せる。

## 裁量
P-01 を採用を止める gap に、改修案は要求4だけを根拠にした最小変更 / D-03・D-05 は narrow と accepted / 版は全8ファイルを C ロケールでパス順に並べた shasum 一覧の SHA-256 / 一段目で個別に答えるのは構造・境界だけ / テストは inspection / PayCo は Web 検索しない（実在サービスと混同して仕様を補う恐れ）/ jev-crosscheck 不使用 / 署名ブロックを台帳冒頭と explanation の両方に

## やり直し: 1回（B-03 の問いを「確定時だけ 2xx を返すか」に狭めて done、回復可否は B-04 に分離）
