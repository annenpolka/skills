# PR #611（TEAM-45 チーム機能の改善）の弁明 — コードレビュアー向け

台帳は `ledger.yaml`（22項目）。この文書は同じ台帳から作った三段階の出力と署名です。
本周（第1周）はコードを変更しておらず、テストも実行していません。直し方は台帳の `resolution` と `verification.plan` に予定として書いてあり、検証済みとしているのは資料を読んで確かめた4項目だけです。

---

## 1. その場の回答

### この PR を採用してよいか

このPRはこのままでは採用できません。採用を止めるのは、メンバー一覧のキャッシュが組織も権限も区別せず他組織の一覧や管理者向けのメールアドレスを返すこと（2点）、改名マイグレーションがデプロイ中とロールバック時に旧コードを壊すこと、同時に届いた招待で席数を超えうること、管理者が入力したロゴURLへサーバーから要求が飛んで内部の宛先にも届くこと（社内規約に明記は無いものの、内部の応答がメールに載りうる経路なので入れています）の5点です。直し方の候補と確認手順は台帳に用意してありますが、本周はコードを変えておらずテストも実行していないので、直したうえで再提出します。

### 構造・境界の各項目

**キャッシュを置いたのはなぜか**（D-001・構造）
「一覧が遅い」という要求への対応ですが、遅さの原因と改善量はまだ計測していません。キャッシュキーを直した後も、キャッシュが効くのは同じ組織の同じページを60秒以内に再表示したときだけです。そのためPR説明の「速くしました」はその範囲に限った書き方に直し、計測は次の周で行います。

**ロゴをサーバーで取得して埋め込むのはなぜか**（D-002・構造）
要求は「管理者が登録したURLのロゴを表示する」ことで、サーバーで取得して埋め込むか、URLをメールに載せるかは決まっていません。いま、既存のメール送信処理のロゴ引数が画像データとURLのどちらを受け取る契約なのかを確認しています。URLで足りるなら取得処理ごと削り、画像データが必要なら取得先の制限などの改修を入れます。

**改名マイグレーションは安全か**（D-003・境界）
このままでは安全ではありません。この運用ではマイグレーションを先に当て、その後に新旧のPodが数分並びます。そのため、その間とイメージを戻すロールバックのときに、旧コードの name 列を読む処理が失敗します。列の追加と値の移し替えを先に出し、旧列の削除は全Podが新コードになってから別に行う二段階に分けます。

**一覧APIの応答キーが display_name になったのはよいか**（D-004・境界）
変更前の応答キー名をまだ確認できていません。もし name だったなら、要求に無い公開APIの変更になります。その場合は応答キーを元に戻し、DBの列名だけを変えます。

**席数超過をなぜ409で返すのか**（D-005・境界、確認済み）
要求は拒否することだけを求めていて、状態コードは指定していません。同じエンドポイントでは403を権限不足に使っているので、席の使用数との衝突として409を返しています。402や422を否定するものではありません。

**一括招待の途中で席が尽きたらどうなるか**（D-006・境界）
一括招待画面は1件ずつ招待APIを呼ぶので、席が尽きた以降の要求はすべて409になります。画面がそれを受けて止まるのか続けるのか、招待できなかった宛先を管理者に示すのかは、画面のコードを確認するまで答えられません。

手続き・細部の項目は、聞かれたら次の二段目を見て答えます。

---

## 2. 深掘りされたときの根拠

根拠（なぜその性質・選択が要るか）と証拠（成果物が実際にそうなっているか）を分けて示します。証拠はすべて資料・コード・文書を読んだ確認（inspection）です。テストの記述は「テストがある」ことの確認で、実行はしていません。

### 構造

| ID | 問い | 根拠 | 証拠 | 状態 |
|---|---|---|---|---|
| D-001 | キャッシュは要求1に効くか | requirement: TEAM-45.md:5 / existing_contract: app/cache.py:1 | members.py:19-29、test_members.py:26-33（現在の挙動の確認であり、速さの確認ではない） | pending（narrow） |
| D-002 | なぜサーバー取得・埋め込みか | requirement: TEAM-45.md:7 / existing_contract: mailer.py:1（logo 引数の型は記述なし） | invitations.py:34-35、logo.py:1-12 | pending（investigate） |

### 境界

| ID | 問い | 根拠 | 証拠 | 状態 |
|---|---|---|---|---|
| D-003 | 単一 RENAME は新旧併存に耐えるか | requirement: TEAM-45.md:8 / existing_contract: deploy/README.md:4、:5、deploy/api.yaml:6-9 | 0033_rename_user_name.sql:1、README.md:10、members.py:11,24 | pending（change）**採用阻止** |
| D-004 | 応答キー変更は利用側が追従済みか | requirement: TEAM-45.md:8 / existing_contract: docs/spec/members.md:3-5 | members.py:11 | pending（investigate） |
| D-005 | なぜ409か | freedom（要求は状態コードを指定しない）/ existing_contract: invitations.py:14-15、org_settings.py:12-16 | invitations.py:27-28、test_invitations.py:7-11 | done |
| D-006 | 一括招待画面は409を扱えるか | requirement: TEAM-45.md:12 | invitations.py:27-28 | pending（investigate） |

### 手続き

| ID | 問い | 根拠 | 証拠 | 状態 |
|---|---|---|---|---|
| D-007 | 別組織が同じページを引いたら | existing_contract: docs/spec/members.md:3、app/cache.py:1 | members.py:19-22、:23-26、test_members.py:12-33（別組織の連続呼び出しを検査していない） | pending（change: キーに org_id）**採用阻止** |
| D-008 | 一般メンバーが管理者の直後に引いたら | existing_contract: docs/spec/members.md:4 | members.py:12-13,28-29、:19-22、test_members.py:12-23 | pending（change: 整形をキャッシュの後へ）**採用阻止** |
| D-009 | メールアドレスを Redis に置いてよいか | なし（規程が資料に無い） | members.py:24,28-29、cache.py:1,8 | pending（investigate） |
| D-010 | Redis 障害で一覧が落ちないか | なし（可用性の要求・慣行が資料に無い） | members.py:20,29、cache.py:8-17、README.md:7,20-21 | pending（investigate） |
| D-011 | 残り1席に2件同時に来たら | requirement: TEAM-45.md:6 / existing_contract: deploy/README.md:3、PostgreSQL 16 文書 13.3.2・SELECT「The Locking Clause」（改修方式の選択理由） | invitations.py:16-33、PostgreSQL 16 文書 13.2・13.2.1、deploy/api.yaml:6,15、test_invitations.py:7-20（偽のトランザクション） | pending（change: FOR UPDATE OF o）**採用阻止** |
| D-012 | ロゴ取得をトランザクション内で行ってよいか | existing_contract: db.py:21-25、config.py:5 / requirement: TEAM-45.md:12 | invitations.py:16,34、logo.py:7、requests Quickstart「Timeouts」注記 | pending（change, 候補・D-002待ち） |
| D-013 | 送信後にコミットが失敗したら | existing_contract: mailer.py:2 | invitations.py:16,35-36 | pending（investigate） |
| D-014 | 内部宛先のURLを登録されたら | requirement: TEAM-45.md:7（管理者は組織ごとの利用者: members.md:4、auth.py:8-12）/ convention: OWASP ASVS 5.0.0 V1.3.6（採用の記載は資料に無い） | org_settings.py:14-16、logo.py:7、requests Quickstart「Redirection and History」、invitations.py:32-35 | pending（change, 候補・D-002待ち）**採用阻止** |

### 細部

| ID | 問い | 根拠 | 証拠 | 状態 |
|---|---|---|---|---|
| D-015 | TTL はなぜ60秒か | freedom（鮮度の要求なし。30秒や120秒を否定しない） | members.py:29、cache.py:16-17 | pending（narrow） |
| D-016 | タイムアウトはなぜ5秒か | freedom（3秒や10秒を否定しない） | logo.py:7-9、requests Advanced Usage「Timeouts」 | pending（narrow, 候補・D-002待ち） |
| D-017 | 画像でない・巨大な応答が来たら | requirement: TEAM-45.md:7（画像URL） | logo.py:10-12、requests Advanced Usage「Body Content Workflow」 | pending（change, 候補・D-002待ち） |
| D-018 | seat_limit は常に数値か | requirement: TEAM-45.md:6 | invitations.py:18,27 | pending（investigate） |
| D-019 | 同じ宛先の重複招待も1席ずつ数えるか | requirement: TEAM-45.md:6、:12 / existing_contract: 0020_invitations.sql:1-9 | invitations.py:22-26,30-33 | pending（investigate） |
| D-020 | 席数の境界はずれていないか | requirement: TEAM-45.md:6 | invitations.py:22-28、test_invitations.py:7-20 | done |
| D-021 | 1ページ50件の根拠 | existing_contract: docs/spec/members.md:5 | members.py:7,26 | done |
| D-022 | 取得失敗時にロゴなしで送るか | freedom（取得失敗時の扱いは要求に無い） | logo.py:6-11、requests Quickstart「Errors and Exceptions」、Advanced Usage「Body Content Workflow」 | done |

改修の要点（予定であり、未実施）:

- D-007・D-008: 整形前の行を `org_id` と `page` をキーにしてキャッシュし、メールを含めるかの判定と整形はキャッシュの後で毎回行う。共有の FakeCache で「組織A→組織B」「管理者→一般メンバー」の順に呼ぶテストを足す。
- D-003: 改名を「列の追加と値のコピー」と「旧列の削除（後日・別マイグレーション）」に分ける。
- D-011: 席数を数える前に `SELECT ... FROM orgs o JOIN plans p ... FOR UPDATE OF o` で組織の行だけをロックする（plans の行もロックすると、同じプランの全組織が直列化するため）。
- D-014: D-002 の結論で取得を残す場合に限り、リダイレクトを追わず、ループバック・プライベート・リンクローカルに解決したアドレスへは接続しない。

---

## 3. 認める限界と見直す条件

### kind: accepted（受け入れて今回は直さないもの）

なし。本周は、受け入れて閉じる判断を一つもしていません。

### kind: unverified（未確認事項の報告。改修予定または確認待ち）

| ID | 限界 | 見直す条件 |
|---|---|---|
| D-001 | 遅さの原因と改善量を計測していない。キャッシュの効かない初回表示が主因なら効果は小さい | 計測で初回表示が主因と分かったとき（問い合わせ側の対処に切り替える） |
| D-002 | mailer の logo 引数の契約が未確認で、埋め込み方式の採否が決まっていない。URL を載せる形は、外部画像を止めるメールクライアントでは表示されない可能性がある（既有知識による見込みで、未確認） | mailer の実装を確認したとき |
| D-003 | 抜粋外のコードが users.name を読み書きしているか確認していない。値のコピーの負荷も未評価 | 全リポジトリの参照を洗い出し、users の件数を確認したとき |
| D-004 | API 利用者の範囲（画面以外の利用者がいるか）が資料に無い | 差分で変更前のキー名を確認したとき |
| D-006 | 一括招待画面の挙動を確認していない | 画面のコードを確認したとき |
| D-009 | Redis にメールアドレスを置いてよいか確認していない | 規程と Redis の運用設定を確認したとき |
| D-010 | Redis 障害時に一覧が失敗することを許容するか未確認 | 既存のキャッシュ利用箇所の扱いを確認したとき |
| D-011 | 改修後のロックは、トランザクション内の外部通信の間も保持される。席を消費する他の経路が同じロックを取るか未確認 | D-012・D-013 が確定したとき、席を消費する他の経路を洗い出したとき |
| D-012 | 一括招待では招待ごとに同じロゴを取得し直す（200件なら200回） | D-002 で取得を残すと決まったとき、または所要時間に苦情が出たとき |
| D-013 | 送信とコミットの順序、および失敗時の扱いが決まっていない | 差分を確認し、依頼者が判断したとき |
| D-014 | 到達しうる内部宛先の有無を確認していない。DNS rebinding まで防ぐには、検査したアドレスへ直接接続する実装が要る | D-002 の結論が出たとき、運用担当に外向き通信の制限の有無を聞いたとき |
| D-015 | 一覧は最大60秒古い。製品としてこれを許容するかを担当開発者は決められない | 依頼者が許容しないと答えたとき（更新時のキャッシュ削除を検討する） |
| D-016 | ロゴ取得全体の所要時間に上限が無い | D-002 で取得を残すと決まったとき |
| D-017 | 上限バイト数の根拠（配信サービスの上限）を確認していない | D-002 の結論と配信サービスの上限を確認したとき |
| D-018 | seat_limit が NULL になりうるか確認していない | plans の定義を確認したとき |
| D-019 | 重複招待と、未承諾のまま残る招待の数え方が決まっていない | 依頼者が回答したとき |

台帳の項目以外で、弁明全体にかかる限界:

- PR説明の「`pytest` 全件成功」（README.md:25）は確かめていません。テストのフィクスチャ（admin_user・rows・fake_tx_factory を定義する conftest）が抜粋に無く、本周は実行もしていません。
- 確認したのは抜粋リポジトリの18ファイルだけです。PR の差分（変更前のコード）、app/main.py、app/sessions、一括招待画面、plans の定義は見ていません。
- 外部文書は最新版（requests）と PostgreSQL 16 版を読みました。プロジェクトが使っている requests の版は資料に無いため、版ごとの差は確認していません。

---

## 署名

- 署名者: 担当開発者（チーム機能）。本弁明の作成者
- ダイヤル: **scope = PR #611 全体（変更範囲） / granularity = 細部 / strength = 資料確認**
- 周回: 第1周。コードの変更なし、テストの実行なし、依頼者への質問なし（資料で分からないことは台帳に未確認として残した）
- 版（版管理外の抜粋のため内容ハッシュ）: `sha256:48e8e2f41ff05774c4cc9f4bb4c46708bc4d543e20d05c373d5ed921dcf869cc`
  - 作り方: 抜粋リポジトリの直下で、全ファイル（全項目の `scope.ref` と根拠・証拠の参照先がこの18ファイルに含まれる）を相対パスの C ロケール順に並べて `shasum -a 256 <files>` を取り、その出力（`<hash>␠␠<path>` の行の並び）全体をもう一度 `shasum -a 256` にかけた値
  - ファイル別ハッシュ（SHA-256）:

    ```
    f80a2a3af0e54ccf8a98e75533390b0485cec9174917e6758214bcde4a95b06c  README.md
    8c39ab64617ae2a0db682f2a46015ea6b913d9857dfdbe32c881146606f7bce9  app/auth.py
    d846372d788a9e624ec3e1220b9b1b077ff9a57f484a4e8d87a12d902ce8115c  app/cache.py
    9eb8b702aae820482321173d190d08ef7b650b29592496625813b956b63437e2  app/config.py
    b61f29bd4164234c123b4725e0b0717dda3156c69bf0a40836ff569483ab21fe  app/db.py
    dce3bd40f9f2b5fa40122ba7ef269e6c8f413acfb7aabcfd240f4678a9b7bb0c  app/logo.py
    3a98d710e1d97a51cc223cfbe92c859a9e7d13fae503389a1dac49a6a54b3c02  app/mailer.py
    bd3c55e34fff0a9b0f912e7f7da1a4ee9e675a4e4a0107b0a32c553e6cb6e6a9  app/routes/invitations.py
    b00f34d24ecaa0cbf7a87309fc4d68f294b029d24d1289d79f6e8608f5839000  app/routes/members.py
    c35737aa23586d1b3f4196e425da8d3b5e99ff8ebda77433ba25ef11d42036a3  app/routes/org_settings.py
    f353be924e49faf0de30637a10f2777b123e53d2c07a61930525ce9d3aac0ea1  deploy/README.md
    d6c637bda03d3ed7c75eb2ff067188e7fe175a9f27af45cb38c0cba63e8a76b1  deploy/api.yaml
    c12a357100bd24285316c572a9326d59a8edb0bb534274618917bdabe3fcc781  docs/spec/members.md
    67ef01bb66f8a7d90640c2acca5b54c6843049e203a17ff44565d769714c4db9  docs/tickets/TEAM-45.md
    107146c4070223c87ff402358692e8b13bd9b957fd4560a848c26908ded5117d  migrations/0020_invitations.sql
    5a4dd92692e21c505e80ae9617776440ecebf01b45eb476a40545c56f98c6daa  migrations/0033_rename_user_name.sql
    8931c5a8b5523cb0c8a5c380c9e6c6bbca0229c77ba16be9bd72a0cfd3a4bec7  tests/test_invitations.py
    a7f7757a685c3642b359db5d0ece1345a033376cab413c06270c0918974ba96d  tests/test_members.py
    ```

- 参照した外部文書（ハッシュには含めない。参照日はすべて 2026-10-01）:
  - PostgreSQL 16 Documentation, 13.2 Transaction Isolation / 13.2.1 Read Committed Isolation Level — https://www.postgresql.org/docs/16/transaction-iso.html （D-011）
  - PostgreSQL 16 Documentation, 13.3.2 Row-Level Locks — https://www.postgresql.org/docs/16/explicit-locking.html （D-011）
  - PostgreSQL 16 Documentation, SELECT, "The Locking Clause" — https://www.postgresql.org/docs/16/sql-select.html （D-011）
  - Requests documentation (latest), Quickstart: "Redirection and History", "Timeouts", "Errors and Exceptions" — https://requests.readthedocs.io/en/latest/user/quickstart/ （D-012, D-014, D-022）
  - Requests documentation (latest), Advanced Usage: "Body Content Workflow", "Timeouts" — https://requests.readthedocs.io/en/latest/user/advanced/ （D-016, D-017, D-022）
  - OWASP ASVS 5.0.0, V1 Encoding and Sanitization, V1.3.6 — https://github.com/OWASP/ASVS/blob/master/5.0/en/0x10-V1-Encoding-and-Sanitization.md （D-014）
- 影響領域の照合（skill の初期一覧と、バックエンドの知識索引から拾ったもの）:
  - 認可・認証の前提 → D-007, D-008, D-014 ／ データの保存期間と削除 → D-009, D-019 ／ 障害時・部分失敗時 → D-010, D-012, D-013 ／ 冪等性・重複実行 → D-013, D-019 ／ 課金に触れる計算（プランの席数） → D-011, D-018, D-020 ／ 個人情報の経路 → D-008, D-009 ／ 外部サービスへの副作用 → D-013, D-014 ／ 並行実行 → D-011 ／ 移行・後方互換 → D-003, D-004
  - 時刻・タイムゾーン → 該当なし。本PRは時刻を扱わない（TTL は相対秒で、invitations.created_at は既存のまま変更されていない）
  - 索引のうち、ジョブ・イベント、分散協調は該当なし（本PRにキュー・ワーカー・複数ノード間の協調が無い）
- 終了条件: **未達**。gap が残る項目は18件で、そのうち採用を止めるものが5件（D-003, D-007, D-008, D-011, D-014）。`kind: accepted` で閉じた項目は0件。確認して問題がなかった項目（done）は4件（D-005, D-020, D-021, D-022）
- 次の周の最初の手: 依存の無い採用阻止項目 D-007・D-008 のキャッシュを直し、共有の FakeCache で連続呼び出しのテストを追加して実行する（strength=テスト実行）。並行して D-002（mailer の logo 引数の契約）を確認し、候補のまま止まっている D-012・D-014・D-016・D-017 を確定させる
