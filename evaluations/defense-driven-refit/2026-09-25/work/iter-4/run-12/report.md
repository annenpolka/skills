## 成果物
- out/ledger.yaml: 22項目。構造4・境界4・手続き8・細部6。impact 13、asked 6（全て simulated: true）、counterexample 2、deviation 1。done 11、pending 11。meta（ダイヤル、各ファイルの版 sha256 先頭12桁、退屈版、影響領域、抜粋外の資料）。検査スクリプト通過。
- out/explanation.md: 1段目3文。2段目は確認済みの表と改修予定・調査中の表。3段目は受け入れる限界と未確認事項の報告に分離。終了条件は未達（gap 13 のうち閉じたのは2）。署名に scope/granularity/strength、版の方式、公開文書、専門外の前提の判断者。
- 最大の発見 P-01: 配送順序保証なし（抜粋 L4）と最大3日の再送（L8）→ succeeded の初回配送失敗後に refunded が先に処理されると succeeded の再送が paid に戻す → PAY-140 要求4（誤発送防止）が崩れる。change として記録（refunded を上書きしない条件、逆順テスト）、pending。

## 要件の達成（自己申告）: 1 ○（P-01, X-02 再送時の署名時刻, B-04 空の鍵, S-04 発送画面側, X-06 3日より長く残す条件, ほか）/ 2 ○ / 3 ○（type と data.object.id のフィールド名、t の付け直し、部分返金、failed と succeeded の両立は未確認として investigate）/ 4 ○（個人情報 P-08・移行 S-03 は確認して閉じた、プール・鍵の回転・複数 v1 署名は求めない、P-06 は investigate、P-07 統合テストは条件付き提案）/ 5 ○（P-03 に candidate: true）/ 6 ○

## 読んだファイル（順）
skill: s6/SKILL.md, s6/references/impact-profiles/backend.md
repo（find 後）: README.md, app/webhooks.py, app/db.py, tests/test_webhooks.py, docs/tickets/PAY-140.md, docs/vendor/payco-webhooks-excerpt.md, migrations/0020, migrations/0051（shasum、git 管理外を確認）
Web検索4語（ON CONFLICT DO NOTHING concurrent、psycopg transaction()、FastAPI async blocking、hmac.compare_digest non-ASCII）、WebFetch 4件（psycopg transactions、PG sql-insert、FastAPI async、PG transaction-iso）

## impact 項目の着想元
S-02 初期一覧（冪等性）+資料 / S-03 初期一覧（移行）+資料 / S-04 資料（要求4）/ B-03 初期一覧（認可・認証）+資料 / B-04 資料+既有知識（空の鍵）/ P-01 資料（L4・L8、要求4）+既有知識+backend.md（ordering）/ P-02 資料 / P-04 初期一覧（部分失敗）+資料+Web / P-05 初期一覧（並行実行）+既有知識+Web / P-08 初期一覧（個人情報）/ X-02 資料+既有知識 / X-05 初期一覧（金銭）+資料+既有知識 / X-06 初期一覧（保存期間と削除）+資料

## Trace: all OK

## 不明点（構造化）
1. 削除探針を strength=資料確認でかけるときの扱いと記録の仕方。GFR: strength の各値で許される代替手段と記録欄を明示。
2. 反例駆動の三行（説明・反例・欠けていた条件）を置くフィールドが無い（YAML コメントに）。GFR: 各入口の出力を台帳のどのフィールドに写すか明記。
3. admitted_limit の二つの意味（終了条件では区別、出力の節では区別を求めていない）。GFR: 出力の各段でも状態ごとに分けて並べる指示。
4. candidate フラグの適用範囲（下位も investigate のとき、同じ層どうしの依存）。GFR: 付ける条件と付けない条件を action と依存の種類ごとに列挙。
5. その場の回答の範囲（上位層に限るが最重要の穴は手続き層）。GFR: 要約段の選び方の基準の優先順位を明示。
6. 複数ファイルにまたがる版。GFR: 記録法を規定。

## 裁量
ID 接頭辞を層で（S/B/P/X）/ 版は sha256 先頭12桁、複数ファイルは主ファイル / meta 追加 / 退屈版は FastAPI・PostgreSQL の標準形（参照順3）/ 模擬尋問6項目 / 公開文書は inspection / テストは「本周は未実行」注記で証拠欄 / P-01 の最小改修は refunded を終端とみなす条件付き UPDATE、代替は P-02 の候補 / 三段目を分離、終了条件の状況の節 / 署名者 / jev-crosscheck 不使用

## やり直し: 1回（その場の回答4文→3文）
