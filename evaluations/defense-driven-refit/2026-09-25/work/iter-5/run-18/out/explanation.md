# PR #402 弁明資料（コードレビュアー向け）

PayCo webhook で注文の支払状態を更新する（PAY-140）。台帳は `ledger.yaml`（14項目）。この資料は台帳から作った三段階の説明で、台帳と内容の食い違いはない。

---

## 1. その場の回答

### この PR を採用してよいか

このままの採用はお勧めしません。署名の方式と重複排除は資料と照らして成り立っていますが、PayCo はイベントの配送順序を保証しないため、遅れて届いた支払成功イベントが「返金済み」を「支払済み」に戻し、返金済みの注文を発送画面で返金済みと表示するという要求を破る経路があります。この修正に加えて、対応する注文が見つからないイベントが黙って失われる点と、発送画面の表示がまだ確かめられていない点を片付けてから採用を判断してください。

### 構造

**処理済みイベント表は何を守っているのか**
PayCo は同じイベントを複数回送るので、イベント ID を主キーの表に記録し、記録できたときだけ同じトランザクションで状態を更新しています。2回目以降は更新の前に止まり、更新が失敗すれば記録も巻き戻るので、再送で拾えます。

**移行とコードの配布順が前後したら何が起きるか**
移行は新しい表を足すだけで既存の表を変えないので、古いコードには影響しません。コードが先に出ても、その間のイベントは失敗応答になり PayCo が最大3日再送するので、移行後に反映されます。

**処理済みイベント表はいつまで持つのか**
重複排除に要るのは PayCo の再送期間（最大3日）以上の保持で、今は消していないので満たしています。保存しているのはイベント ID と受信時刻だけです。削除を足すときは3日以上残す条件で足します。

### 境界

**対応する注文が無いイベントはどうなるか**（未解決）
今は、対応する注文が見つからなくても処理済みにして成功を返すので、PayCo は再送せず、その支払・返金は反映されないまま残ります。直す予定ですが、失敗応答にして再送に委ねるか、記録して検知するかは、注文側で charge ID をいつ書くかを確かめてから選びます。

**「返金済みを発送画面に出す」要求はどこで満たされるか**（未確認）
この PR は返金イベントで支払状態を「返金済み」にするところまでで、発送画面は変えていません。発送画面がこの状態を読んで「返金済み」と表示するかは、まだ確かめていません。

**正規の要求を送り直されたら状態が動かないか**
署名は時刻と本文を含むので、5分を過ぎた送り直しは拒否され、5分以内の送り直しは同じイベント ID として重複扱いで止まります。本文を書き換えれば署名が合いません。

---

## 2. 深掘りされたときの根拠

根拠（なぜ必要・妥当か）と証拠（成果物がそうなっているか）を分けて示す。証拠はすべて資料確認（inspection）で、テストは読んだだけで実行していない。資料の略記: 要求＝`docs/tickets/PAY-140.md`、PayCo 抜粋＝`docs/vendor/payco-webhooks-excerpt.md`。

### 構造

**I-01 処理済みイベント表と同一トランザクション** — 検証済み（資料確認）
- 根拠: 要求3「同じイベントが複数回届いても結果が変わらない」／PayCo 抜粋:3「at-least-once、各イベントは一意の id」
- 証拠: `app/webhooks.py:46-53`（挿入が行を返さなければ UPDATE 前に return）、`app/db.py:11-15`（1接続で `conn.transaction()`。psycopg 3 docs「Transactions management」: 抜けると commit、例外で rollback）、`migrations/0051_processed_events.sql:2`（event_id が主キー）、PostgreSQL docs「INSERT」（RETURNING は実際に挿入された行だけ返す）、PostgreSQL docs「13.2.1 Read Committed」（ON CONFLICT DO NOTHING は他トランザクションの結果で挿入しないことがある）
- 限度: テストでの確認は含まない（A-01）

**I-05 移行の配布順** — 検証済み（資料確認）
- 根拠: `migrations/0020_orders.sql` は本 PR で変わらない（`README.md:13`）／PayCo 抜粋:8「2xx が無ければ最大3日再送」
- 証拠: `migrations/0051_processed_events.sql:1-4`（CREATE TABLE のみ）、`app/webhooks.py:46-51`（表が無ければ例外で巻き戻り、2xx は返らない）

**I-09 処理済みイベント表の保持期間** — 説明を限定して検証済み（narrow）
- 根拠: PayCo 抜粋:8（再送は最大3日なので、それ以上の保持が要る）／freedom: 3日以上なら保持期間は任意で、無期限はその一つ
- 証拠: `migrations/0051_processed_events.sql:1-4`（列は event_id と received_at だけ）、`app/webhooks.py:47-51`（保存するのは event の id だけ）

### 境界

**I-04 対応する注文が無いイベント** — 調査待ち（investigate）
- 根拠: 要求1「支払状態を反映する」／PayCo 抜粋:8（再送は2xxが返らない場合に限って書かれている）／`migrations/0020_orders.sql:4`（payco_charge_id は NULL 可）
- 証拠: `app/webhooks.py:54-58`（更新件数を見ずにコミットして200）
- 失敗経路: 注文行に charge ID が入る前に webhook が届く → UPDATE は0件 → event_id は処理済みで確定 → 200 → 再送されず、されても重複扱い → 支払・返金が反映されないまま残る
- 次の手: 注文作成から charge ID 書き込みまでのコードを読み、先着が起こりうるか・注文に紐づかない charge があるかを確認して、「巻き戻し＋非2xx」か「0件の記録と警報」を選ぶ

**I-06 要求4 と発送画面** — 調査待ち（investigate）
- 根拠: 要求4「返金済みの注文は発送画面で『返金済み』と表示」／`migrations/0020_orders.sql:5-6`（許容値に 'refunded'）
- 証拠: `app/webhooks.py:17`（charge.refunded → 'refunded'）、`README.md:7-13`（発送画面は変更にも関係ファイルにも無い）
- 次の手: 発送画面が参照する列と 'refunded' の表示を確認。無ければ本 PR に含めるか別チケットかを依頼者に確認

**C-02 送り直し（リプレイ）** — 検証済み（資料確認）
- 根拠: 要求2・要求3／PayCo 抜粋:6-7（署名は t と raw body の HMAC、受信側は t の許容差を検査）
- 証拠: `app/webhooks.py:28-33`（許容差と HMAC 照合）、`app/webhooks.py:46-53`（同じ event_id は更新前に停止）
- 補足: 元の要求が届かず送り直しだけが届いた場合は正規イベントの遅着と同じで、I-02 の扱いになる

### 手続き

**I-02 配送順序と「返金済み」の上書き** — 改修予定（change）、未検証
- 根拠: 要求4／PayCo 抜粋:4「配送順序は保証しない」／PayCo 抜粋:8「2xx が無ければ最大3日、間隔を空けて再送」
- 証拠: `app/webhooks.py:54-57`（UPDATE の条件は charge ID だけ）、`tests/test_webhooks.py:46-50`（発生順の成功→返金だけを扱う）
- 失敗経路: charge.succeeded の配送が charge.refunded より後になる（順序保証なし、または初回配送の失敗で再送に回る）→ event_id が別なので重複排除を通る → refunded が paid に戻る → 発送画面に返金済みが出ず誤発送。charge.failed の後着でも refunded が消える
- 対応: refunded を後着の succeeded/failed で上書きしない条件を、同じ UPDATE 文の WHERE に置く。created による順序判定でも成り立つが、列の追加が要るうえ秒単位で同じ秒の並びを決められないので、どちらでも refunded を守る条件は要る
- 検証計画: 返金→成功、返金→失敗の逆順で refunded が残るテストを、行の状態を観測できる形（実 PostgreSQL か WHERE を評価する fake）で足して実行する。同時到着は PostgreSQL docs「13.2.1 Read Committed」（後の UPDATE は先の確定を待って WHERE を再評価）に依るので、接続先の既定の分離レベルを設定で確認する

**I-03 支払成功と失敗の逆順** — 調査待ち（investigate）
- 根拠: PayCo 抜粋:4（順序保証なし）、抜粋:5（created と送信時点の data.object）
- 証拠: `app/webhooks.py:54-57`（現在の状態も created も見ない）
- 未確定の点: 同じ charge に failed と succeeded の両方が起こりうるか、再送時の data.object が初回送信時点か再送時点かは抜粋に無い。確認後、必要なら created か data.object.status による判定を改修として起票する

**D-01 async 関数内の同期 DB 呼び出し** — 調査待ち（investigate）
- 退屈版との差: FastAPI docs「Concurrency and async / await」In a hurry?（await 非対応ライブラリの path operation は def で宣言し、スレッドプールで実行される）
- 根拠: `app/db.py:11-15`（既存の同期ヘルパ）／PayCo 抜粋:8（10秒以内に2xx）
- 証拠: `app/webhooks.py:37, 46-57`、`app/db.py:13`（async 関数内で同期の接続と問い合わせ）
- 次の手: 既存の async エンドポイントの呼び方を確認し、慣行があれば揃え、無ければ DB 部分をスレッドプールで実行する形に変えて応答時間を計測する

### 細部

**I-07 部分返金と charge.refunded** — 調査待ち（investigate）
- 根拠: 要求1（対象イベント）、要求の対象外「部分返金」／PayCo 抜粋:5（data.object は status と refunded を含む）
- 証拠: `app/webhooks.py:14-18, 42`（イベント種別だけで状態を決める）
- 未確定の点: 部分返金で charge.refunded が届くか、data.object.refunded の意味、「対象外」が「起きない」か「扱わない」か

**I-08 署名鍵の設定** — 調査待ち（investigate）
- 根拠: 要求2
- 証拠: `app/webhooks.py:9, 30-32`（設定値をそのまま鍵に使う）
- 未確定の点: `app/config.py` が抜粋に無く、未設定・空文字で起動できるか分からない。空の鍵で動けば署名を誰でも作れる

**C-01 非 ASCII の署名ヘッダで 500** — 改修予定（change）、未検証
- 反例: v1 に 0x80 以上のバイトを入れた偽の要求 → ヘッダは latin-1 で文字列化 → `hmac.compare_digest` が TypeError → KeyError/ValueError しか捕まえないので 500
- 根拠: 要求2／Python docs「hmac」compare_digest（str は ASCII のみ）
- 証拠: `app/webhooks.py:22-27, 33`、CPython `Modules/_operator.c` の `_compare_digest`（非 ASCII の str に TypeError）、Starlette `datastructures.py` の `Headers.__getitem__`（latin-1 で復号）
- 影響: 状態は変わらない（要求2は保たれる）。認証失敗がサーバ障害として記録される
- 対応: 比較をバイト列で行うか TypeError も拒否に含める一行の変更。非 ASCII の v1 で 400 になるテストを足して実行する

**A-01 テストの証拠力**（想定質問） — 調査待ち（investigate）
- 根拠: 要求3・要求4（これらのテストが受け持つ要求）
- 証拠: `tests/test_webhooks.py:38-50`（client_with_db / post_signed / fake_db の定義がこのファイルに無い）、`README.md:15-17`（全件成功の記載）
- 未確定の点: fake_db が ON CONFLICT をどう再現しているか。fake_db.updates は UPDATE の引数の記録に見え、行の最終状態や WHERE 条件の効果は確かめていない可能性がある

**A-02 許容差 300 秒**（想定質問） — 検証済み（資料確認）
- 根拠: convention — PayCo 抜粋:6-7「受信側は t の許容差（推奨 300 秒）を検査すること」
- 証拠: `app/webhooks.py:13, 28-29`、`tests/test_webhooks.py:31-35`（301秒前の署名を拒否すると主張。未実行）
- 回答: PayCo の推奨値に合わせた。他の値を否定する根拠は持たない

---

## 3. 認める限界と見直す条件

### 受け入れた限界（今回は直さない）

| 項目 | 限界 | 見直す条件 |
|---|---|---|
| I-09 | 処理済みイベント表は無期限に増える | 行数・容量が運用上の閾値に達したとき、または削除処理を足すとき（保持は3日以上にする） |
| A-02 | 再送のたびに署名時刻 t が付け直される前提に立っている。抜粋は明記せず、推奨300秒と最大3日の再送の併記から読み取れるだけ。付け直されないなら5分を過ぎた再送はすべて拒否される | PayCo の全文仕様で t の意味を確認したとき、または再送が署名時刻で拒否された記録が出たとき |

### 改修予定・調査中の項目の未確認事項（終了条件には数えない）

| 項目 | 対応 | 未確認のこと | 見直す条件 |
|---|---|---|---|
| I-02 | change | 修正は未実施・未検証。PayCo に返金の取り消しなど refunded から戻る事象があるかは抜粋に無く、あれば新しい条件が正しい遷移も止める | PayCo 全文仕様で返金後の遷移を確認したとき、または refunded の注文に succeeded/failed が届いた記録が出たとき |
| I-04 | investigate | 直すまで、対応する注文の無いイベントは黙って失われ、後から見つける手段が無い | 注文作成側の調査結果が出たとき |
| I-06 | investigate | 要求4は DB の状態が refunded になるところまでしか示せない | 発送画面の確認結果が出たとき |
| I-03 | investigate | 支払成功と失敗の逆順到着に対する挙動は保証しない | PayCo 仕様の確認結果、または同じ charge に両方が届いた記録 |
| I-07 | investigate | 部分返金が起きた注文の表示は保証しない | PayCo 仕様か依頼者の回答が出たとき、または部分返金が発生したとき |
| I-08 | investigate | 要求2の充足は「正しい鍵が設定されていれば」の条件付き | 設定の確認結果が出たとき |
| D-01 | investigate | 応答時間とイベントループへの影響は計測していない | 慣行の確認結果、または応答時間が10秒に近づいた記録 |
| C-01 | change | 実行環境の Python の版と ASGI サーバのヘッダ扱いは抜粋に無く、500 は実行で確かめていない | テストを実行したとき |
| A-01 | investigate | テストは読んだだけで実行していない。README の「全件成功」は未確認で、重複排除の正しさはコードと文書の照合に依っている | フィクスチャを確認し、テストを実行したとき |

### この周の検証の強さについて

すべて資料確認（コード・スキーマ・要求・PayCo 抜粋・公開文書を読んだ）で、実行・計測はしていない。「検証済み」は読んで照合できたという意味で、動かして確かめたという意味ではない。PayCo の相手仕様は社内転記の抜粋（2026-03）だけに依っている。

---

## 署名

- ダイヤル: **scope = 変更範囲（PR #402 全体） / granularity = 細部 / strength = 資料確認**
- 版: `sha256:aafdced4d7af`（版管理の外のため、`repo/` 直下で `find . -type f -print0 | LC_ALL=C sort -z | xargs -0 shasum -a 256 | shasum -a 256` を実行した値 `aafdced4d7af7a47c44e33b439b732676f940415c9109502235172e3f135a702` の先頭12桁。対象は README.md, app/, docs/, migrations/, tests/ の8ファイル）
- 台帳: `ledger.yaml` 14項目（impact 9 / deviation 1 / counterexample 2 / asked（模擬）2）、検証済み 5 / 未検証 9
- 終了条件: **未達**。gap が残る項目は 9（I-02, I-03, I-04, I-06, I-07, I-08, D-01, C-01, A-01）
- 次の周の最初の手: テストのフィクスチャ定義を読んでテストの形を決め（A-01）、I-02 の UPDATE 条件を変えて逆順到着のテストを足す
- 専門外の前提と、その判断を持つ相手:
  - PayCo の相手仕様（返金後の遷移、成功と失敗の両立、部分返金時のイベント、再送時の t と data.object）→ PayCo（I-02, I-03, I-07, A-02）
  - 部分返金を「起きない」とするか「扱わない」とするか、発送画面の変更を本 PR に含めるか → PAY-140 の依頼者（I-06, I-07）
  - 発送画面の表示、注文作成での charge ID の書き込み、署名鍵の設定、既存エンドポイントの慣行、テストのフィクスチャ → 抜粋に含まれないリポジトリ部分（I-04, I-06, I-08, D-01, A-01）
- 今回しなかったこと: コード変更、テスト実行、依頼者・PayCo への質問
- 参照した公開文書: Python docs「hmac」、CPython `Modules/_operator.c`、Starlette `datastructures.py`、PostgreSQL docs「INSERT」「13.2 Transaction Isolation」、psycopg 3 docs「Transactions management」、FastAPI docs「Concurrency and async / await」（URL は `ledger.yaml` の meta.external_references）
