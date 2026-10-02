# PR #402 弁明資料（コードレビュアー向け）

対象: PR #402「PayCo webhook で注文の支払状態を更新する」（PAY-140）
台帳: `ledger.yaml`（21項目）。この資料は台帳から作った。採用理由・未確認事項・認める限界は台帳と同じ内容。

---

## 1. その場の回答

### この PR を採用してよいか

現状のままの採用は勧めません。PayCo はイベントの配送順を保証せず最大3日再送するのに、この実装は支払状態を無条件に上書きするため、返金済みの注文が後から届いた支払成功イベントで「支払済み」に戻り、発送画面で返金済みと表示させる要求に反する経路が資料だけで成り立ちます。返金済みを上書きしない条件を更新文に足す改修を予定していますが未実施・未検証で、ほかにルーター登録・テストの fixture・PayCo 側の ID と再送時の署名時刻・発送画面の表示など、資料では確かめられない前提が残っています。

### 構造

**処理済みイベント表は何のため？**
PayCo は同じイベントを複数回送るので、イベントIDを主キーにした表への記録と注文の更新を一つのトランザクションで行っています。同じイベントで更新が確定するのは一度だけで、更新に失敗すれば記録も取り消され、PayCo の再送で回復します。守れるのは同じイベントの再送までで、別のイベント同士の順序逆転は上の改修で扱います。

**このエンドポイントはアプリに登録されている？**
この PR の変更ファイルに登録箇所が無く、手元の資料にもアプリ本体が無いので、まだ確認できていません。登録箇所の確認待ちで、無ければ登録を足します。

**テストは全件通っている？**
PR 説明は全件成功としていますが、後半2件が使う fixture の定義が資料に無く、今回は実行もしていないので確認できていません。また、その2件は偽の DB を使うため、通っても SQL による重複排除や更新条件の確認にはなりません。fixture の所在確認と実行、実 DB でのテスト追加が次の作業です。

**マイグレーションの適用順で困らない？**
新しい表を足すだけで既存の表は変えないので、旧コードとの混在で困ることはありません。表の適用前にコードが出ても失敗は 2xx 以外になり、表の適用後に PayCo の再送で回復します。

### 境界

**署名検証は PayCo の仕様どおり？**
はい。PayCo の資料にある方式（時刻と生の本文をつないだ HMAC-SHA256 の16進）どおりに、JSON として読む前の本文で検証し、合わなければ DB に触れる前に 400 で拒否します。資料に書かれていない書式の細部（大文字の16進や複数の署名）は、資料の例と同じ形を前提にしています。

**署名用シークレットが空だったら？**
設定の読み込み方が手元の資料に無く、確認できていません。空文字になり得るなら誰でも署名を作れてしまうので、確認して、必要なら空のシークレットを受け付けない変更を入れます。

**失敗したときの応答は？**
確定した処理・対象外・重複には 2xx を返して再送を止め、DB の失敗では何も確定させずに 2xx 以外を返して PayCo の再送に回復を任せます。応答が 10 秒を超えて再送が来ても、先の処理が確定していれば重複として扱います。

**障害で遅れた再送は署名の時刻検査を通る？**
PayCo の資料が、再送のたびに署名の時刻を新しくするかを書いていないので分かりません。新しくしないなら5分を超えた再送はすべて拒否され、障害からの回復ができないので、PayCo の一次資料の確認待ちです。

**webhook の charge ID と注文の charge ID は同じもの？**
そう前提していますが、PayCo の資料の抜粋にも既存コードの抜粋にも裏付けが無く、確認待ちです。食い違うと全イベントが「該当する注文なし」のまま処理済みになり、黙って失われます。

**「発送画面で返金済みと表示」の要求は満たされる？**
この PR が保証するのは支払状態を refunded にするところまでで、発送画面はこの PR で変えておらず、表示を確認できていません。発送画面の確認待ちで、表示しない場合はこの PR に含めるか別に切るかを依頼者と決めます。

---

## 2. 深掘りされたときの根拠

根拠（なぜ必要・妥当か）と証拠（実際にそうなっているか）を分けて示す。今回の証拠はすべて資料・コードの確認（inspection）で、テストは実行していない。テストコードは「読んだ」だけの扱い。

### 構造

| ID | 問い | 根拠 | 証拠 | 状態 |
|---|---|---|---|---|
| S-01 | 処理済みイベント表が無いと何が壊れるか | requirement: PAY-140 要求3（`docs/tickets/PAY-140.md:7`）／existing_contract: PayCo at-least-once・一意の id（`docs/vendor/payco-webhooks-excerpt.md:3`） | `app/webhooks.py:46-57`、`app/db.py:11-15`、`migrations/0051_processed_events.sql:2`／PostgreSQL 文書 Index Uniqueness Checks（未コミットの同一キー挿入を待つ）、INSERT の RETURNING（挿入された行だけ返す）／psycopg 3 文書 Transactions management（正常終了でコミット、例外でロールバック） | done |
| S-02 | ルーターはアプリに登録されているか | requirement: PAY-140 要求1 | 変更ファイル一覧にアプリ本体が無い（`README.md:9-11`）、`app/webhooks.py:11` | pending（investigate） |
| S-03 | fixture `client_with_db` はどこにあり、「全件成功」は確かめられるか | PR 説明の主張（`README.md:17`） | fixture が未定義（`tests/test_webhooks.py:38-50`）、関係ファイルにも無い（`README.md:9-13`）、偽の DB を見ている（同:43,50） | pending（investigate） |
| S-04 | 配布順・旧コード混在で壊れないか | existing_contract: PayCo 再送最大3日（`payco-webhooks-excerpt.md:8`） | 0051 は CREATE TABLE のみ（`migrations/0051_processed_events.sql:1-4`）、表が無いと INSERT 例外でロールバック（`app/webhooks.py:46-51`） | done |

### 境界

| ID | 問い | 根拠 | 証拠 | 状態 |
|---|---|---|---|---|
| B-01 | 署名検証は PayCo 仕様どおりか | requirement: PAY-140 要求2（`PAY-140.md:6`）／existing_contract: PayCo 署名の書式（`payco-webhooks-excerpt.md:6`） | 生の本文で検証（`app/webhooks.py:38-41`）、HMAC 入力と比較（同:30-33）、DB 前に 400（同:39-40,46）、テストコード（`tests/test_webhooks.py:17-35`、未実行） | done（限界 accepted） |
| B-02 | シークレットが空でない前提 | requirement: PAY-140 要求2 | 空チェック無し（`app/webhooks.py:9,30-32`）、`app/config.py` は抜粋外、テストはシークレットを差し替え（`tests/test_webhooks.py:18,25,32`） | pending（investigate） |
| B-03 | 確定時だけ 2xx を返しているか | existing_contract: PayCo 再送条件（`payco-webhooks-excerpt.md:8`）／requirement: 要求3 | 各分岐（`app/webhooks.py:39-40,43-44,52-53,58`）、トランザクションのロールバック（同:46-57、psycopg 3 文書） | done |
| B-04 | 再送は新しい t で署名されるか | existing_contract: PayCo 署名・許容差・再送（`payco-webhooks-excerpt.md:6-8`） | 抜粋に再送時の t の記述が無い（同:5-6） | pending（investigate） |
| B-05 | `data.object.id` = `orders.payco_charge_id` か | existing_contract: `payco_charge_id text UNIQUE`（`migrations/0020_orders.sql:4`）、PayCo の data.object（`payco-webhooks-excerpt.md:5`） | 抜粋は id に触れない（同:5）、`payco_charge_id` を書くコードは抜粋外、テストの `ch_1` は同 PR のデータ（`tests/test_webhooks.py:40,48-49`） | pending（investigate） |
| B-06 | 要求4（発送画面の返金済み表示）を満たすか | requirement: PAY-140 要求4（`PAY-140.md:8`） | 発送画面は変更・関係ファイルに無い（`README.md:9-13`）、CHECK に refunded は既存（`migrations/0020_orders.sql:5-6`） | pending（investigate） |

### 手続き

| ID | 問い | 根拠 | 証拠 | 状態 |
|---|---|---|---|---|
| P-01 | 返金後に charge.succeeded が届いても返金済みのままか | requirement: PAY-140 要求4（`PAY-140.md:8`）／existing_contract: 順序非保証（`payco-webhooks-excerpt.md:4`）、再送最大3日（同:8） | 更新条件に現在の状態が無い（`app/webhooks.py:54-57`）、重複排除はイベントID単位（同:47-53）、テストは正順のみ（`tests/test_webhooks.py:46-50`） | pending（change を予定） |
| P-02 | failed と succeeded が逆順に届いたら正しいか | existing_contract: 順序非保証（`payco-webhooks-excerpt.md:4`）／requirement: 要求1 | 一つの charge が両方を出し得るか、data.object の「送信時点」の意味が抜粋に無い（同:3-5） | pending（investigate） |
| P-03 | 更新0行でも処理済みにすると何が失われるか | requirement: 要求1／existing_contract: 2xx で再送停止（`payco-webhooks-excerpt.md:8`） | 行数を見ずにコミット（`app/webhooks.py:47-58`）、`payco_charge_id` は NULL 可（`migrations/0020_orders.sql:4`） | pending（investigate） |
| P-04 | なぜ async def で同期 DB 処理を呼ぶのか | convention: FastAPI 文書 Concurrency and async / await「In a hurry?」（await 非対応の DB ライブラリなら def で宣言） | `app/webhooks.py:37,46`、`app/db.py:13` | pending（investigate） |

P-01 の改修内容（未実施）: 更新文を `UPDATE orders SET payment_status = %s WHERE payco_charge_id = %s AND payment_status <> 'refunded'` にする。根拠は要求4だけで、PayCo 抜粋の曖昧な点に依存しない。現在値を読んでから書く二文の実装は同時到着で破れるため、条件付きの一文にする（PostgreSQL 文書 13.2.1 Read Committed: 待機後、WHERE は更新後の行で再評価される）。検証計画は、実 PostgreSQL での逆順（refunded→succeeded、refunded→failed）・正順・同時到着のテスト。

### 細部

| ID | 問い | 根拠 | 証拠 | 状態 |
|---|---|---|---|---|
| D-01 | なぜ 300 秒で、未来方向にも許すのか | convention: PayCo 抜粋「受信側は t の許容差（推奨 300 秒）を検査すること」（`payco-webhooks-excerpt.md:7`）／freedom: 方向は指定されていない | `app/webhooks.py:13,28,39`、テストコード（`tests/test_webhooks.py:31-35`、未実行） | done |
| D-02 | なぜ 400 で、401・403 ではないのか | freedom: PayCo が分けるのは 2xx かどうかだけ（`payco-webhooks-excerpt.md:8`） | `app/webhooks.py:39-40` | done |
| D-03 | 不正な署名ヘッダで 400 以外になる入力はあるか | requirement: PAY-140 要求2 | 解析失敗は捕捉（`app/webhooks.py:22-27`）、比較は try の外（同:33）、Python 文書 `hmac.compare_digest`（str は ASCII のみ）、Starlette の Headers は latin-1 で復号、いずれも DB 前（同:39-41,46） | done（narrow、限界 accepted） |
| D-04 | 3イベントと状態値は要求と既存スキーマに沿うか | requirement: PAY-140 要求1（`PAY-140.md:5`）／existing_contract: CHECK 制約（`migrations/0020_orders.sql:5-6`） | `app/webhooks.py:14-18,42-44` | done |
| D-05 | charge.refunded は全額返金のときに届く前提か | requirement: PAY-140 対象外「部分返金」（`PAY-140.md:10-12`） | 抜粋は部分返金時の挙動を書かない（`payco-webhooks-excerpt.md:5`） | done（narrow、限界 accepted） |
| D-06 | 処理済み記録はいつまで残す必要があるか | existing_contract: 再送最大3日（`payco-webhooks-excerpt.md:8`） | 削除の仕組みが無い（`migrations/0051_processed_events.sql:1-4`） | done（限界 accepted） |
| D-07 | 拒否が続いたら3日以内に気づけるか | existing_contract: 再送最大3日（`payco-webhooks-excerpt.md:8`） | 拒否時に記録を出さない（`app/webhooks.py:39-40`）、監視設定は抜粋外 | pending（investigate） |

---

## 3. 認める限界と見直す条件

### kind: accepted — 今回は直さないと決めた限界

| ID | 限界 | 見直す条件 |
|---|---|---|
| B-01 | 抜粋に無い署名書式の細部（16進の大文字・小文字、v1 の複数並び）は確認しておらず、抜粋の例と同じ単一・小文字16進を前提にしている | PayCo の一次資料で署名ヘッダの完全な書式を確認したとき、または本番で正規の webhook が 400 になったとき |
| D-03 | ASCII 以外を含む不正な署名は 400 ではなく 500 になる（状態は変わらない） | 5xx の監視にこの経路のノイズが乗るとき、または応答コードの規約が定まったとき |
| D-05 | 部分返金のときに PayCo が何を送るかを確認していない。届けば一部返金の注文も返金済み表示になる | 部分返金を扱う要求が来たとき、または PayCo の資料で部分返金でも charge.refunded が届くと分かったとき |
| D-06 | 処理済みイベント表は削除されず増え続ける | 削除の仕組みを入れるとき（保持は再送期間3日より長くする）、または表の大きさが運用上の問題になったとき |

### kind: unverified — 未確認事項の報告（終了には数えない）

| ID | 未確認のこと | 見直す条件 |
|---|---|---|
| P-01 | 返金済みを上書きしない改修は未実施・未検証。改修後は refunded から戻る遷移（返金の取り消し等）を受け付けなくなり、その遷移が PayCo にあるかは抜粋に無い | 改修とテストが入った版で検証を終えたとき。PayCo の一次資料で refunded から戻るイベントが確認されたとき |
| S-02 | エンドポイントがアプリに登録されているか | アプリ本体の登録箇所を確認したとき |
| S-03 | テストは今回実行しておらず、PR 説明の「全件成功」は資料で裏付けられていない | fixture の所在を確認し、テストを実行したとき |
| B-02 | シークレットが未設定・空のときの挙動 | `app/config.py` の読み込みを確認したとき |
| B-04 | 障害から5分以上たった後の再送で回復できるか | PayCo の一次資料で再送時の t の扱いを確認したとき |
| B-05 | webhook の charge ID と注文の charge ID が同じ値か | PayCo の一次資料と `payco_charge_id` を書き込む既存コードを確認したとき |
| B-06 | 発送画面の返金済み表示（この PR が保証するのは payment_status の値まで） | 発送画面のコードを確認したとき |
| P-02 | paid と failed の間の順序逆転が起こり得るか | PayCo の一次資料で charge の状態遷移を確認したとき |
| P-03 | 注文に紐付かないイベントが黙って処理済みになる経路の発生可能性 | `payco_charge_id` を書き込む既存コードを確認したとき |
| P-04 | 同期 DB 処理がイベントループを止める影響の大きさ | 既存の慣行を確認したとき、または webhook 集中時の応答時間を計測したとき |
| D-07 | 署名検証の失敗が続いたときに検知できるか | 既存の監視設定を確認したとき |

---

## 署名

- **scope**: 変更範囲（PR #402 全体: `app/webhooks.py`、`migrations/0051_processed_events.sql`、`tests/test_webhooks.py`。照合のため `app/db.py`、`migrations/0020_orders.sql`、`docs/` を参照）
- **granularity**: 細部
- **strength**: 資料確認（コード・チケット・PayCo 抜粋・公開文書の確認のみ。コードは変更しておらず、テストも実行していない）
- **周**: 第一周。依頼者への質問はしていない
- **版**: `sha256:7ae2763eb808ac952cc3ee8bd2d171cfab65561025da7135453e867c642f196f`
  - 作り方: 抜粋は版管理の外にあるため、全項目が参照したファイル一式（抜粋の全8ファイル）について、`repo/` 直下で `find . -type f | sed 's|^\./||' | LC_ALL=C sort | xargs shasum -a 256` の出力をそのままファイルにし、その SHA-256 を版とした
  - ファイルごとのハッシュ:

    ```
    1ab6ba861a526a4421d82cda059d7d3bc7d6cd956ac49ff8bff028c017ce83a9  README.md
    cfe0447eb1b64577ccb9227095e1430789a3d0bb1a55ea14c0ed73d4da665286  app/db.py
    385a1d64e294aa5ba1c0094914b70f5be8ca2633fbfa48d6f3b3a94771519483  app/webhooks.py
    0e6923f340c4d1b1c8093f2a5ab1a94025fadaf640beb0d2d82f427ba9eb87c3  docs/tickets/PAY-140.md
    10a9f97acb78e9f4b3179831c6367b10254783cce550a080bc11cf73a2360e4b  docs/vendor/payco-webhooks-excerpt.md
    b1e02aa4a6e424f81479fb5153adfbfe4025c2440ac3ac13930c49ca2116b314  migrations/0020_orders.sql
    169880db122c6c620a42eec55d9dedb51142142709dee06edf16e7cb3a1995a2  migrations/0051_processed_events.sql
    13d35324ff22c37c2b380c9ec51c1352448c363da7b03892b8e4914c11d9aa27  tests/test_webhooks.py
    ```

- **終了条件**: 未達。gap を持つ13項目のうち、終了条件を満たすのは2項目（D-03, D-05: narrow で検証済み、限界を accepted として列挙）。残る11項目（S-02, S-03, B-02, B-04, B-05, B-06, P-01, P-02, P-03, P-04, D-07）は pending
- **次の周の最初の手**: P-01 の改修（更新文に refunded を上書きしない条件を足す）と、逆順・同時到着のテストを実 PostgreSQL で入れる。あわせて S-03 の fixture の所在を確かめて pytest を実行し、strength をテスト実行に上げる。並行して B-04・B-05・P-02 を PayCo の一次資料で、S-02・B-02・B-06・P-03・P-04・D-07 を抜粋外の社内コードと監視設定で調べる
- **退屈版**: プロジェクトの規約と同種の既存実装は抜粋に無いため、FastAPI の標準形と「PayCo 抜粋の署名方式＋イベントIDでの重複排除」の最小案を退屈版にした。差分は S-02（ルーター登録が変更に無い）、S-03（fixture が無い）、P-04（同期 DB 処理を async def で呼ぶ）の3点で、それ以外は退屈版一致として影響駆動で検査した
- **影響領域**: 初期一覧と backend 知識索引から、認証（署名）、冪等性・重複実行、障害時・部分失敗、外部サービスへの副作用、並行実行、金銭（支払状態・返金）、保存期間、移行・後方互換、性能・資源、運用（監視）を拾い、案件固有として PayCo の配送順序非保証と要求4を足した。個人情報の経路（event_id と charge ID 以外を保存・出力しない）と時刻・タイムゾーン（UNIX 秒同士の比較と `DEFAULT now()` のみ）は非該当と判断した
- **参照した公開文書**: PostgreSQL 文書（13.2.1 Read Committed Isolation Level、Index Uniqueness Checks、INSERT）、psycopg 3 文書 Transactions management、Python 文書 `hmac.compare_digest`、Starlette `datastructures.Headers`、FastAPI 文書 Concurrency and async / await。PayCo については社内転記の抜粋だけを使い、抜粋に無い仕様は補っていない
- **人間側の条件**: 構造・境界は一段目を自分の言葉で話せる。手続き・細部は二段目の参照を見れば答えられる。PayCo の仕様に関わる前提（B-04, B-05, P-02, D-05）は PayCo の一次資料と社内転記の作成者の判断に依存する
