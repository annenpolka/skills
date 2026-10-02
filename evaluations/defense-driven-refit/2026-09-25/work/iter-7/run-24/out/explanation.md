# PR #402 弁明 — PayCo webhook で注文の支払状態を更新する（PAY-140）

コードレビュアー向け。台帳 `ledger.yaml`（20項目）から生成した。第一周のため、コードは変更しておらず、テストも実行していない。

---

## 1. その場の回答

### この PR を採用してよいか

このままでは採用できません。PayCo は配送順序を保証しないため、返金の後に遅れて届いた支払成功のイベントで注文が「支払済み」に戻り、返金済み表示による誤発送防止の要求に反するので、イベントの発生時刻で古いイベントを捨てる改修を入れます。もう二点、署名鍵が未設定のときに空のまま起動しうるか（そうなら偽の webhook が通る）と、注文に PayCo の charge ID が入る前に webhook が届きうるか（そうなら支払状態の反映が黙って失われる）が資料で確認できないため、確認が済むまで採用を止める側に数えています。

### 構造

**重複排除の記録テーブルは要るのか**
PayCo は同じイベントを複数回送ると明記しているため、イベント ID を主キーにした記録で、二度目以降は状態を更新しません。記録と状態更新は同じトランザクションで、同じイベントが同時に届いても二重には反映されません。

**マイグレーションは既存データや配布順序に影響しないか**
新規テーブルを作るだけで、既存データには触れません。コードが先に出ても、その間のイベントは 2xx にならないため、PayCo の再送（最大3日）で回収されます。

**記録をいつまで持つのか**
今は無期限に持ちます。必要な下限は PayCo の再送期間の3日で、削るときはそれより長い保持期間で削ります。行数が増え続けることは、限界として受け入れています。

### 境界

**偽の webhook で状態を変えられないか**
PayCo の資料どおりの方式で、解析前の生の本文に対する署名を検証し、通らなければ DB に触れずに 400 を返します。比較は定数時間です。

**署名鍵が未設定のときはどうなるか**
鍵は設定から読んだ値をそのまま使っており、未設定のときに起動が止まるかは、設定を読み込む側を見ないと分かりません。その確認を待っています。空のまま起動しうるなら、起動時に失敗させる変更を入れます。

**対象外のイベントに、エラーではなく 200 を返すのはなぜか**
対象は要求に挙がった3種だけで、それ以外は受け取ったことだけを返します。エラーにすると、PayCo が最大3日間再送し続けるためです。

**書き込む状態値は既存の制約と合っているか**
要求の3種を、注文テーブルの既存の制約が許す値に一対一で対応させています。新しい状態値は足していません。

**部分返金でも「返金済み」になるのでは**
返金イベントは全額返金として扱います。部分返金はチケットの対象外です。部分返金で同じイベントが来るかは未確認として残しています。

**返金済みを発送画面に出す要求は、これで満たされるか**
この PR は支払状態を「返金済み」に書き込むところまでで、発送画面は変えていません。発送画面がその値を読んで「返金済み」と表示するかは、確認を待っています。

**イベントの charge ID で注文を引いてよいのか**
イベントに入っている charge の ID で注文を引いています。ただ、その ID が注文に保存している値と同じだということは、手元の PayCo 資料に書かれていません。PayCo の一次資料と、注文に ID を保存する側の実装を確認するまで待っています。

---

## 2. 深掘りされたときの根拠

根拠（なぜ妥当か）と証拠（実際にそうなっているか）を分けて示す。証拠の「資料確認」は読んで確かめたもので、実行はしていない。テストは本周では実行していない。

| ID | 層 | 問い | 根拠 | 証拠 | 状態 |
|---|---|---|---|---|---|
| D-001 | 構造 | 重複排除は要るか | 要求3（PAY-140.md:7）、PayCo の at-least-once 配送と一意の id（vendor:3） | webhooks.py:46-53、0051:2 の主キー、PostgreSQL 文書 INSERT の RETURNING の記述。テスト test_duplicate_event_is_ignored は未実行 | done |
| D-002 | 構造 | 0051 と配布順序 | PayCo の再送：2xx 以外は最大3日（vendor:8） | 0051:1-4 は CREATE TABLE のみ。webhooks.py:46-51、db.py:13-15 で、テーブルが無ければ例外になり処理全体が戻る | done |
| D-004 | 構造 | 記録の保持期間 | 再送3日（vendor:8）。3日を超える保持期間は freedom | 0051:1-4、webhooks.py に削除処理なし | done（narrow） |
| D-005 | 境界 | 署名検証 | 要求2（PAY-140.md:6）、署名方式（vendor:6-7） | webhooks.py:21-33（解析に失敗したら拒否）、38-40、Python 文書 hmac の compare_digest。署名テスト3件は未実行 | done |
| D-006 | 境界 | 鍵が未設定・空のとき | 要求2 | webhooks.py:9,31。app/config.py は抜粋に無い。Python 文書 hmac に、空の鍵を拒否する記述は無い | pending（investigate） |
| D-008 | 境界 | 対象外のイベントに 200 | 要求1 の対象3種（PAY-140.md:5）、再送条件（vendor:8）。本文の形は freedom | webhooks.py:42-44 | done |
| D-009 | 境界 | 状態値と制約 | 要求1、orders の CHECK 制約（0020:5-6） | webhooks.py:14-18 | done |
| D-010 | 境界 | 部分返金 | 対象外（PAY-140.md:12） | webhooks.py:17。vendor:5 に部分返金時のイベントの記載は無い | done（narrow） |
| D-014 | 境界 | 要求4は満たされるか | 要求4（PAY-140.md:8） | README.md:7-13 に発送画面は無い。発送画面の実装は抜粋外 | pending（investigate） |
| D-016 | 境界 | charge ID の照合キー | vendor:5（charge オブジェクト。id の記載なし）、0020:4 | webhooks.py:56。テストの ch_1 は現在の前提を写しただけで、根拠ではない | pending（investigate） |
| D-003 | 手続き | 順序が入れ替わったとき | 順序非保証（vendor:4）、再送（vendor:8）、created（vendor:5）、要求4 | webhooks.py:54-57 の更新条件は charge ID だけ。逆順のテストは無い（tests:46-50） | pending（change） |
| D-011 | 手続き | 更新が0件のとき | 0020:4 の payco_charge_id は NULL 可、2xx なら再送されない（vendor:8）、要求1 | webhooks.py:54-58 は更新件数を見ない。charge ID を書き込む処理は抜粋外 | pending（investigate） |
| D-012 | 手続き | async def の中で同期 DB を呼ぶ | db.py:11-15 の既存ヘルパー、FastAPI 文書「Concurrency and async / await」の「In a hurry?」節、10秒以内に 2xx（vendor:8） | webhooks.py:37,46-57 | pending（investigate） |
| D-013 | 手続き | 再送が尽きたイベント | 再送は最大3日（vendor:8）、要求4 | webhooks.py:36-58 に照合処理なし。README.md:5 の説明 | done（narrow） |
| D-017 | 手続き | 同じイベントの同時到着 | 要求3、vendor:3 | webhooks.py:46-57、PostgreSQL 文書 63.5 Index Uniqueness Checks、13.2.1 Read Committed | done |
| D-018 | 手続き | 更新失敗時に記録だけ残らないか | 要求1、vendor:8 | db.py:11-15、psycopg 3 文書 Transactions management | done |
| D-020 | 手続き | 本文の保存・出力 | 要求1（必要なのは状態の反映だけ） | webhooks.py:47-57 | done |
| D-007 | 細部 | 許容差 300 秒 | PayCo 抜粋の署名の項にある推奨値（vendor:7、convention） | webhooks.py:13,28。test_rejects_old_timestamp は未実行 | done |
| D-015 | 細部 | 不正な本文の個別処理 | vendor:8。エラー応答の形は freedom | webhooks.py:41-42,50,56、db.py:13-15 | done |
| D-019 | 細部 | 改修案で created が同じ秒のとき | created は秒単位（vendor:5）、要求4。paid と failed の同秒は freedom | vendor:5 | pending（change、D-003 に依存） |

（vendor = docs/vendor/payco-webhooks-excerpt.md、0020・0051 = migrations/ の各ファイル）

### 予定している改修（verification.plan より）

- **D-003（採用を止める）**: 注文に、最後に反映したイベントの created を持つ列を足す（追加のみ、NULL 可）。UPDATE を「記録済みの created が NULL か、今回より古いときだけ更新する」一文の条件付き更新にする。古いイベントも処理済みとして記録し、2xx を返す。テストは、逆順、遅れて届いた再送、同じ charge の別イベントの同時処理の3つ。同時処理は実DBで確かめる。data.object の状態から状態を導く案は採らない。抜粋の「送信時点」が、再送ごとの時点なのか、イベント発生時点なのかが読めないため。
- **D-019**: created が同じ秒のときは、refunded を他の状態で上書きしない。両方の到着順でテストする。
- **D-006 / D-011 / D-014 / D-016**: 調査して、結果に応じて変更する（各項目の plan を参照）。D-011 で「0件なら再送させる」変更に進む場合は、D-003 の改修後に生じる「古いイベントなので更新しない」0件と区別する。
- **D-012**: 既存のエンドポイントの DB 呼び出し方式に揃える。揃える先が無ければ、DB 部分をスレッドプールで実行する。

---

## 3. 認める限界と見直す条件

### kind: accepted（受け入れて今回は直さない）

| ID | 限界 | 見直す条件 | 受け入れた主体 |
|---|---|---|---|
| D-004 | 重複排除の記録が、受信イベント数に比例して増え続ける | テーブルの容量・行数が運用監視で問題になったとき、またはチームのデータ保持方針の対象と判明したとき | 担当開発者（注文チーム、PR #402 提出者） |

### kind: unverified（未確認事項の報告。終了には数えない）

改修・調査を予定しているもの:

| ID | 限界 | 見直す条件 |
|---|---|---|
| D-003 | 改修が入るまで、順序が入れ替わると返金済みの注文が「支払済み」表示に戻りうる | 改修とテストが入り、版が変わったとき |
| D-006 | 署名鍵の供給経路（未設定・空のときの挙動）を確認していない | app/config.py と配布先の設定を確認したとき |
| D-011 | 更新が0件のイベントは、記録だけ残って黙って失われうる。そうなるかどうかは未確認 | 注文作成側の実装を確認したとき |
| D-012 | DB が遅いときに、同じワーカーの他の要求まで止まるかを確認していない | 既存エンドポイントの方式を確認したとき |
| D-014 | 発送画面を確認するまで、この PR で要求4を満たせているかは言えない | 発送画面の実装を確認したとき |
| D-016 | 照合キー（data.object.id ＝ payco_charge_id）の前提を資料で確認できていない | PayCo の一次資料と注文作成側の実装を確認したとき |
| D-019 | created が同じ秒の paid と failed は、資料から順序を決められないため、後から届いたほうを採る | 同じ charge で paid と failed の両方が出うるかを、PayCo の一次資料で確認できたとき |

要求者の受け入れを待つもの（説明を限定済み。受け入れる権限は要求側にある）:

| ID | 限界 | 見直す条件 |
|---|---|---|
| D-010 | PayCo が部分返金で charge.refunded を送るかは未確認。送る場合、一部返金の注文も返金済みと表示され、発送されなくなる | PayCo の一次資料で確認したとき、または部分返金を扱う要求が出たとき |
| D-013 | 受信できない状態が3日を超えるとイベントが失われ、それを検知する仕組みも無い | 要求者がこの限界を受け入れるか、照合・監視を求めたとき |

検証の強さによるもの（資料確認にとどまる）:

| ID | 限界 | 見直す条件 |
|---|---|---|
| D-001 | 実DBでの重複排除はテストで確かめていない。テストの fake_db は抜粋外にあり、「テスト全件成功」は README の記載だけで、本周では再現していない | 実DBの結合テストを足す周、または fixture の実装を読めるとき |
| D-005 | 署名の16進の大文字・小文字は抜粋に書かれておらず、小文字を前提にしている | PayCo の一次資料、または検証環境での実受信で確認できたとき |
| D-017 | 実DBでの同時実行は試していない。DB の隔離レベル設定は抜粋に無い | 実DBで同時実行のテストを足す周 |

---

## 人間側の条件

- 上位層の決定（重複排除の記録テーブル、新規テーブルだけのマイグレーション、無期限保持）は、担当開発者が自分の言葉で説明できる。
- 下位層は、台帳の参照先（ファイル:行と、外部文書の節）を見れば答えられる。
- 専門外の前提がどこに依存しているか:
  - PayCo の仕様（部分返金、charge の ID、16進の表記）→ PayCo の一次資料
  - 部分返金と、3日を超える欠落を受け入れるか → PAY-140 の要求者
  - 鍵の供給 → 設定と配布の管理者
  - 返金済みの表示 → 発送画面の担当

---

## 署名

- **ダイヤル**: scope = 変更範囲（PR #402 全体: app/webhooks.py, migrations/0051_processed_events.sql, tests/test_webhooks.py）／ granularity = 細部 ／ strength = 資料確認
- **周**: 第一周。コード変更なし、テスト実行なし、依頼者への質問なし（資料で分からないことは台帳に残した）
- **版**: `sha256:aafdced4d7af7a47c44e33b439b732676f940415c9109502235172e3f135a702`（台帳では短縮形 `aafdced4d7af`）
  - 作り方: リポジトリ抜粋のルートで `find . -type f | LC_ALL=C sort | xargs shasum -a 256 | shasum -a 256`。対象は、全項目の scope.ref と、根拠・証拠が参照した全ファイル（抜粋の8ファイル全部）。
  - ファイルごとの SHA-256:
    - `1ab6ba861a526a4421d82cda059d7d3bc7d6cd956ac49ff8bff028c017ce83a9  ./README.md`
    - `cfe0447eb1b64577ccb9227095e1430789a3d0bb1a55ea14c0ed73d4da665286  ./app/db.py`
    - `385a1d64e294aa5ba1c0094914b70f5be8ca2633fbfa48d6f3b3a94771519483  ./app/webhooks.py`
    - `0e6923f340c4d1b1c8093f2a5ab1a94025fadaf640beb0d2d82f427ba9eb87c3  ./docs/tickets/PAY-140.md`
    - `10a9f97acb78e9f4b3179831c6367b10254783cce550a080bc11cf73a2360e4b  ./docs/vendor/payco-webhooks-excerpt.md`
    - `b1e02aa4a6e424f81479fb5153adfbfe4025c2440ac3ac13930c49ca2116b314  ./migrations/0020_orders.sql`
    - `169880db122c6c620a42eec55d9dedb51142142709dee06edf16e7cb3a1995a2  ./migrations/0051_processed_events.sql`
    - `13d35324ff22c37c2b380c9ec51c1352448c363da7b03892b8e4914c11d9aa27  ./tests/test_webhooks.py`
- **外部の Web 文書**（ハッシュに含めない。参照日はすべて 2026-10-01）:
  - PostgreSQL 文書「13.2.1 Read Committed Isolation Level」 https://www.postgresql.org/docs/current/transaction-iso.html
  - PostgreSQL 文書「63.5 Index Uniqueness Checks」 https://www.postgresql.org/docs/current/index-unique-checks.html
  - PostgreSQL 文書「SQL Commands: INSERT」（ON CONFLICT と RETURNING の記述） https://www.postgresql.org/docs/current/sql-insert.html
  - psycopg 3 文書「Transactions management」（transaction ブロックと接続の with の記述） https://www.psycopg.org/psycopg3/docs/basic/transactions.html
  - FastAPI 文書「Concurrency and async / await」（「In a hurry?」節） https://fastapi.tiangolo.com/async/
  - Python 文書「hmac — Keyed-Hashing for Message Authentication」（hmac.new と compare_digest） https://docs.python.org/3/library/hmac.html
- **退屈版**: 抜粋の中には、明示された規約も、同種の既存実装も無い。そのため、FastAPI と psycopg 3 の標準形に、PayCo 抜粋の手順をそのまま当てた最小案と比べた。差分は D-012 の1件だけで、一致した箇所は影響駆動と模擬尋問で検査した。
- **影響領域**: 初期一覧の10分野と、案件固有の3点（配送順序の非保証、発送画面での返金済み表示、2xx と再送の関係）を見た。金額の計算は PR に無いため、項目にしていない。
- **終了条件**: 未達。gap が残っていて検証が pending の項目は7件（D-003, D-006, D-011, D-012, D-014, D-016, D-019）。このうち、採用を止める（または止める側に数えた）のは D-003, D-006, D-011。
- **次の周の最初の手**: D-003 の改修（created による条件付き更新と列の追加）と、逆順・遅れた再送のテストを入れる。並行して、app/config.py（D-006）と、payco_charge_id を書き込む処理（D-011, D-016）を読む。
- **版が変わったときの扱い**: D-003 の改修で webhooks.py が変わる（新しいマイグレーションも加わる）。webhooks.py を scope か根拠・証拠で参照している done 項目は、版の規則で pending に戻る。今回の done 項目13件（D-001, D-002, D-004, D-005, D-007, D-008, D-009, D-010, D-013, D-015, D-017, D-018, D-020）は、すべてこれに当たる。D-003 の resolution が変わった場合は、D-011 と D-019 を pending に戻す。
