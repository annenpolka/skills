# PR #57 アカウント削除API — レビュー前の弁明

対象: コードレビュアー、プライバシー担当
台帳: `ledger.yaml`（15項目）。以下の三段はすべてこの台帳から作っています。二人の読み手で違うのは冒頭の用語だけで、採用の判断、未確認の事項、認める限界は同じです。

---

## 1. その場の回答

### 冒頭: この PR を採用してよいか

**コードレビュアー向け**

このままでは採用できません。監査ログを持つ利用者（表示名を一度でも変えた人）は外部キー違反で削除が 500 になり、削除できた利用者でも、扱いが未決の注文履歴が CASCADE で取り消し不能に消え（未決事項を先に決めてしまうので、採用を止める側に入れました）、検索索引・外部 CRM・分析基盤には個人情報が期限なく残ります。削除の方式そのものは猶予期間と法令上の保持対象の判断待ちで、削除後も発行済みトークンが最長24時間使えることとバックアップに最長35日残ることは、それぞれ要求の解釈とプライバシー担当の判断を待っています。

**プライバシー担当向け**

このままでは採用できません。プロフィールを一度でも更新した利用者は削除自体が失敗し、削除できた利用者でも管理画面の検索・外部 CRM・分析基盤に氏名・メール・電話・住所が期限なく残り、扱いが未決の注文履歴は取り消せない形で消えます（未決事項を先に決めてしまうので、採用を止める側に入れました）。削除の方式そのものは猶予期間と法令上の保持対象の判断待ちで、削除後も発行済みのログイン状態が最長24時間使えることとバックアップに最長35日残ることは、それぞれ要求の解釈とプライバシー担当の判断を待っています。

### 構造の問い

**即時に全項目を物理削除する方式は、要求に遡れるか**
「利用者が自分で消せる」「個人情報を保持しない」という要求には沿っています。ただ、取り消し猶予期間（PM 判断待ち）と法令上残すべき対象（法務確認中）が決まっていないので、即時に全部消す方式はまだ要求に遡れません。判断次第で「削除予約のうえ期限後に削除」や「一部を残す削除」に変わります。

**管理画面の利用者検索から消えるか**
消えません。検索索引は更新された行を写すだけで削除を反映しないため、メール・氏名・電話・住所が期限なく検索できます。削除時に索引からも消す処理を加える予定です。

**外部 CRM から消えるか**
消えません。さらに CRM との対応づけを利用者の行と一緒に消すので、後から CRM 側を消す手掛かりもなくなります。CRM 側で削除できるか、マーケティングで保持が要るかを確認してから直します。

**分析基盤から消えるか**
削除後の日次出力には含まれません。ただし削除前の日々の全件出力にメール・電話・住所が残り、保存期限が設定されていないため期限なく残ります。過去分の扱いは分析基盤側の要件確認を待っています。

**バックアップには残るか**
残ります。日次スナップショットに最長35日残り、期限が来ると消えます。これを許容するかはプライバシー担当の判断を待っています。

### 境界の問い

**削除後もログインや API 利用ができてしまわないか**
リフレッシュトークンは消えるので更新はできませんが、発行済みのアクセストークンは最長24時間そのまま通ります。「削除後ログインできない」がこれを含むかは PM の確認待ちで、ログイン処理そのものもまだ確認できていません。

**204 は何の完了を意味するか**
今の PR 説明は「利用者の行を消した」としか言っていません。そのため、他所に残る個人情報や、監査ログのある利用者で失敗することと説明が合っていません。何がその時点で消え、何がいつまでに消え、何を残すかが決まってから説明を書き直します。

**他人のアカウントを消せないか、CSRF は**
消せるのはトークンの持ち主本人のアカウントだけで、対象を指定する入力はありません。認証は Authorization ヘッダだけで Cookie を使わないため、他サイトがブラウザに削除要求を送らせても認証情報は付きません。

**同じ要求が再送されたら**
二回目以降は消す行がなく、同じ 204 を返します。DB の外への副作用がないので、二重に処理されることはありません。

---

## 2. 深掘りされたときの根拠

根拠（なぜその性質が必要か）と証拠（成果物がその性質を持つか）を分けています。証拠はすべて資料確認（inspection）で、実行はしていません。

| ID | 層 | 問い | 根拠 | 証拠 |
|---|---|---|---|---|
| D-01 | 構造 | 即時・物理削除は要求に遡れるか | requirement: ACC-88.md:9, :11 | inspection: account.py:11（即時 DELETE）、ACC-88.md:13-16（未決2件） |
| D-02 | 構造 | 検索索引から消えるか | requirement: ACC-88.md:11 | inspection: user_indexer.py:7-15（upsert のみ）、config/search.yaml:1-5、0001_users.sql:3-6 |
| D-03 | 構造 | CRM から消えるか | requirement: ACC-88.md:11 | inspection: crm_sync.py:1,7-10、0015_users_crm.sql:1 |
| D-04 | 構造 | 分析基盤から消えるか | requirement: ACC-88.md:11 | inspection: export_analytics.py:1,9-13、ops/backup.md:6 |
| D-05 | 構造 | バックアップに残ってよいか | requirement: ACC-88.md:11 | inspection: ops/backup.md:3-4 |
| D-06 | 境界 | 削除後に API を使えないか | requirement: ACC-88.md:10 | inspection: 0004_refresh_tokens.sql:3、auth.py:9,19-27、PyJWT 文書「Expiration Time Claim (exp)」、orders.py:9-19、profile.py:9-16 |
| D-07 | 境界 | 204 は何を約束するか | requirement: ACC-88.md:11 | inspection: README.md:5-6、account.py:11-12 |
| D-08 | 境界 | 他人の削除・CSRF | existing_contract: profile.py:10、orders.py:10,15 と同じ本人特定 | inspection: account.py:9-11、auth.py:1,19-22、main.py:3,8 |
| D-09 | 境界 | 再送 | convention: RFC 9110 §9.2.2 | inspection: account.py:11-12、db.py:21-23 |
| D-10 | 手続き | 監査ログを持つ利用者を削除できるか | requirement: ACC-88.md:9 | inspection: 0012_audit_logs.sql:3、PostgreSQL 16 文書 §5.4.5、profile.py:15、audit.py:4-5、db.py:6,21-23、Starlette 文書 Exceptions。test: test_account.py:8-18（FakeDB のため制約を通らない） |
| D-11 | 手続き | 注文が CASCADE で消えてよいか | requirement: ACC-88.md:15, :11 | inspection: 0007_orders.sql:3,6、PostgreSQL 16 文書 §5.4.5 |
| D-12 | 手続き | 削除の記録を残さないのはなぜか | existing_contract: profile.py:15（本人による変更を audit.record で記録） | inspection: account.py:9-12、audit.py:4-5、0012_audit_logs.sql:3 |
| D-13 | 手続き | 復元で削除済み利用者が戻らないか | requirement: ACC-88.md:11 | inspection: ops/backup.md:3-5。ops/restore.md は抜粋外で未確認 |
| D-14 | 手続き | 同期ジョブが削除済み利用者を書き戻さないか | requirement: ACC-88.md:11 | inspection: user_indexer.py:8-15、crm_sync.py:7-10 |
| D-15 | 手続き | テスト成功は何を示すか | requirement: ACC-88.md:9-11 | test: test_account.py:16-24（SQL 文字列と 204 のみ）。inspection: README.md:16-18（本周は未実行） |

退屈版（隣の本人向け変更系 API の形を削除に当てはめたもの）との差分は二つです。`audit.record` が無いこと（D-12）と、`Response(status_code=204)` を明示して返すこと（細部層。今回の granularity の外なので項目にしていません）。

---

## 3. 認める限界と見直す条件

### kind: accepted（受け入れて今回は直さない）

なし。受け入れる権限を持つ人（PM、法務、経理、プライバシー担当、分析基盤・CRM の担当）の判断を、この周ではまだ得ていません。

### kind: unverified（未確認事項の報告。改修予定を含み、終了には数えない）

| ID | 認める限界 | 見直す条件 |
|---|---|---|
| D-01 | 即時物理削除が要求に合うかは未確定 | PM の猶予期間判断、または法務の保持対象一覧が出たとき |
| D-02 | 検索索引に個人情報が残る | 索引の削除処理が入ったとき／保持対象に索引上の項目が含まれたとき |
| D-03 | CRM に連絡先が残り、削除後は社内から辿れない | CRM の削除手段と MKT-31 の保持要否が確認できたとき |
| D-04 | 分析基盤に個人情報が期限なく残る | DATA-12 の保持要件と除去手段が決まったとき |
| D-05 | 削除後最長35日、バックアップに個人情報が残る | プライバシー担当の判断が出たとき／保持期間が変わったとき |
| D-06 | 削除後最長24時間、発行済みトークンで API を呼べる | PM の解釈が出たとき／注文を残す判断になったとき |
| D-07 | PR 説明が削除の範囲を実体より広く読ませる | D-01・D-02〜D-05・D-10 が確定したとき |
| D-10 | 監査ログを持つ利用者は削除できない | 監査ログの保持要否が決まったとき |
| D-11 | 監査ログの無い利用者の注文履歴が削除と同時に消える | 法務・経理の注文履歴の判断が出たとき |
| D-12 | 削除の記録が残らない | 監査ログの扱いが決まったとき |
| D-13 | 復元で削除済み利用者が戻る可能性を否定できない | ops/restore.md を確認したとき／四半期の復元訓練のとき |
| D-14 | 同期ジョブと削除が重なると、外部に書き戻されうる | D-02・D-03・D-12 が確定したとき |
| D-15 | 本PRのテストは削除の成立を示していない | 実 DB のテストが加わったとき |

---

## 署名

- 署名者: アカウント基盤チーム 担当開発者
- ダイヤル: **scope = 変更範囲（PR #57 全体）／granularity = 手続き／strength = 資料確認**
  - 手続き層まで項目を置きました。細部層（定数、分岐、応答の返し方）は確定させていません。
  - 強さは資料確認です。テストは実行しておらず、コードも変更していません。どの項目も実行では確かめていません。「pytest 全件成功」は PR 説明の記載を引用しただけです。
- 版: `sha256:96dc07b5b05d58a7ac86e70c984c6f46ab6ce1209f683dc4a5f9f8ab645f3d56`
  - 作り方: リポジトリ抜粋は版管理の外にあります。台帳が参照した20ファイル（抜粋の全ファイル）を、パスの C ロケール昇順に `shasum -a 256 <path>` し、その出力行を連結したもの全体を `shasum -a 256` しました。
  - ファイルごとの値:

    ```
    975f3a1e260e8f128e77accfe480ec5dad36dfd0817287603501143976b3f451  README.md
    a1635446793518ca1bf9225528f011dd709b32eab17051faaf91e9bf5ae75321  app/audit.py
    19ea00c06f6f9c0f67fe03550d8279e09ead6d7c781e0a941048dff287546432  app/auth.py
    2d1b37c5a564e85eb92882524adbd56357ccc2f3ec20b7d5f6f359f3875d4172  app/db.py
    2aa4ab60bc01124abbc94e4bb90152fec5f5a625f2d96231c861a4c1650ec931  app/main.py
    cc034b208e847436fd5c733e91e595737a249d300557d337d5f50881c4b0531d  app/routes/account.py
    507b8209e72cf0b2fc0315c65b44416197904b6df961449a7bdc6a0bcab09925  app/routes/orders.py
    a4e9ab58aed82e4fea7ada5abadc3475dfc1d86c9edf229959bf6190f0fc94eb  app/routes/profile.py
    dc21d907ab971a0c7768e890d0d58bd27bf442ec03435bc51782bcf2d387ffb6  config/search.yaml
    f4567ad97cafda4de9f27057bf138ad2a2a08e32c4a7566dc8db426df0b68788  docs/tickets/ACC-88.md
    eea1628500b27f92386d2d4eaf6d3d15af2c7f173c87c74b5075fd9fd398e484  jobs/crm_sync.py
    ca5597db43e15e5f696f1e2e66cc4477070e6922649a779c3a8dd6a430ae00b9  jobs/export_analytics.py
    e6723d05aed76b9c166c4c4474ffc02f2b0c62e95b0138e60798c173004c88fb  jobs/user_indexer.py
    d2d01d3e15ba906d1434a2f6fc6fe3ce274ff2b0398acf5a8391204a7ea36f1f  migrations/0001_users.sql
    f3732b5a5ea88097467f18e526f3a571edee0368aab7fb7297ec76488a4952f9  migrations/0004_refresh_tokens.sql
    c1df3da3fcdf5d0d6b435557cdd330ee99dd566b8d5f87ddc1fd640adb73b89b  migrations/0007_orders.sql
    4ea43bca4cd60d349c6511828b9793481971883c62e7ba5a9ed40d709629f61c  migrations/0012_audit_logs.sql
    3b4af1851cbc5c8725b8cdc058cb9702060c679d5f29e6543c8198e7e092e9fa  migrations/0015_users_crm.sql
    83bc8537a613c1d1953b35392c23d969ec6077e3b56b83cedba29151bb932ccd  ops/backup.md
    c1563a536a63639c06d0f9b06ea15de1aa739dec29a0411171f84da67fdceacb  tests/test_account.py
    ```

- 参照した外部文書（ハッシュに含めない。参照日はすべて 2026-10-01）
  - PostgreSQL 16 Documentation, §5.4.5 Foreign Keys — https://www.postgresql.org/docs/16/ddl-constraints.html （NO ACTION が既定であること、CASCADE の定義）
  - PyJWT Documentation, Usage Examples「Expiration Time Claim (exp)」 — https://pyjwt.readthedocs.io/en/stable/usage.html
  - Starlette Documentation, Exceptions「ServerErrorMiddleware」 — https://starlette.dev/exceptions/
  - RFC 9110 HTTP Semantics, §9.2.2 Idempotent Methods — https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2
- 抜粋に無く未確認の資料: `ops/restore.md`、ログイン処理、`app/search`、`app/integrations/crm`、`app/storage`、`app/config`
- 終了条件: **未達**
  - gap を持つ項目は13件で、終了したものは0件です（resolution 確定かつ検証済み 0件、受け入れた限界 0件）。
  - 内訳: investigate 5件（D-01, D-03, D-04, D-06, D-13）、change 確定 2件（D-02, D-15）、change 候補 5件（D-07, D-10, D-11, D-12, D-14）、narrow 1件（D-05、受け入れの判断待ち）。
  - gap の無い項目は2件（D-08, D-09）で、資料確認で検証済みです。
- 次の周の最初の手: PM・法務・経理から、猶予期間・法令上の保持対象と期間・注文履歴の扱いの三点（D-01）を受け取ります。並行して、依存先の無い実 DB テスト（D-15）を書き、監査ログを持つ利用者で削除が失敗すること（D-10）を実行で確かめます。
- 人間側の条件
  - 自分の言葉で話せること: 削除方式が未決の判断待ちであること。個人情報が利用者の行の外に4か所（検索索引、CRM、分析基盤、バックアップ）あること。監査ログの外部キーで削除が失敗すること。
  - 聞かれたら見る場所: 外部キーの定義（`migrations/`）、同期ジョブ（`jobs/`）、バックアップの運用（`ops/backup.md`）、要求（`docs/tickets/ACC-88.md`）。
  - 専門外の前提の依存先: 猶予期間は PM、法令上の保持対象は法務（佐藤）、注文履歴は法務・経理（佐藤・李）、バックアップの許容はプライバシー担当、分析基盤の保持は DATA-12 の担当、CRM の保持は MKT-31 の担当。
