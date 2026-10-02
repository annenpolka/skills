## 成果物
- out/ledger.yaml: 14項目。impact 9、deviation 1、counterexample 2、asked（simulated: true）2。構造3・境界3・手続き3・細部5。done 5（I-01, I-05, I-09, C-02, A-02）、pending 9。版は資料一式の内容ハッシュ sha256:aafdced4d7af（作り方は meta）。python で規則検査。
- out/explanation.md: 1段目は採用可否の結論「このままは非推奨」と構造・境界の6項目への答え。2段目は全14項目の参照。3段目は受け入れた限界2件と改修予定・調査中の未確認事項9件を分離。署名（ダイヤル、版、終了条件未達・gap 残り9、次の周の最初の手、判断者）。
- 主な発見: I-02 順序保証なしと再送で後着の charge.succeeded や failed が refunded を上書き→PAY-140 要求4違反（change、UPDATE の WHERE に状態条件）。次点 I-04 対応注文0件でも処理済みで200→イベントが黙って消える。

## 要件の達成（自己申告）: 1 ○ / 2 ○ / 3 ○（PayCo 未記載は investigate と限界、公開文書は文書名と節で inspection）/ 4 ○（I-09 は削除ジョブを要求せず narrow、D-01 と C-01 は過剰と見られうる）/ 5 ○ / 6 ○

## 読んだファイル（順）
skill: s7/SKILL.md → find → repo（並列）README.md, app/webhooks.py, app/db.py, docs/tickets/PAY-140.md, docs/vendor/payco-webhooks-excerpt.md, migrations/0020, 0051, tests/test_webhooks.py と同じ組で s7/references/impact-profiles/backend.md → shasum
Web: WebFetch（python hmac, PG sql-insert / transaction-iso, FastAPI async, starlette datastructures.py, cpython _operator.c, psycopg transactions）、検索2語

## impact 項目の着想元
I-01 資料+初期一覧（冪等性・並行実行）+既有知識+Web（閉じた）/ I-02 資料+初期一覧（外部副作用）+backend.md（ordering / at-least-once）+Web / I-03 資料+既有知識 / I-04 資料+初期一覧（障害時）+backend.md（ack gap / webhooks）+既有知識 / I-05 初期一覧（移行）+backend.md（mixed-version）+資料（閉じた）/ I-06 資料+本文（誰の要求）/ I-07 資料+初期一覧（金銭）/ I-08 初期一覧（認可）+backend.md（秘密、「痕跡がないだけで非該当にしない」）+資料+既有知識 / I-09 初期一覧（保存期間・個人情報）+backend.md（retention）+資料（narrow で閉じた）

## Trace: all OK

## 不明点（構造化）
1. 版の粒度: 一式で一つのハッシュでは、版が変わったときにどの資料が変わったか判別できず、参照資料が変わった done 項目だけを戻す規則と両立しない。GFR: 判定に要る情報を捨てる規則なら、それを残す場所（ハッシュの元の一覧を作り方として保存する等）も指定。
2. 1段目の構造・境界の各項目は答えがある前提。pending（final_answer null）の項目の扱いが無い（「（未解決）」「（未確認）」と付けて現状を述べた）。GFR: 出力の書式は入力のすべての状態について出す形か出さない形かを明記。
3. 入口が複数あるときの origin（I-04 は影響駆動からも反例駆動からも到達）。GFR: 優先順位か主と副の併記。
4. 閉じる問いの途中で見つかった前提（A-02 の「なぜ300秒」で再送時の t の付け直し）を別項目にするか閉じた項目の admitted_limit にするか（後者にした）。GFR: 「答えは確定したが前提が未確認」という中間状態の置き場所を例示。
5. 「影響領域に該当する scope は impact 項目を最低1つ」の scope の単位（影響領域ごとにした）。GFR: 被覆の下限規則は数える単位を定義。

## 裁量
ID を origin 別接頭辞 / 項目の形に無い欄を追加（impact_area、counterexample{explanation, counterexample, missing_condition}、boring_version）と meta・signature / 版のハッシュの作り方と先頭12桁 / PayCo 抜粋は existing_contract、推奨300秒と Python docs「ASCII のみ」は文書名と記述つき convention、未実行テストは inspection / I-02 は WHERE に状態条件、I-04 と D-01 は investigate / depends_on は全て空（I-02 の条件は I-03 の結果がどうでも要る）/ 模擬尋問2件 / 時刻は非該当 / jev-crosscheck 不使用

## やり直し: 1回（冒頭「署名検証は成り立っている」を pending の I-08 に対して言い過ぎとして「署名の方式は成り立っている」に）
