# PR #57 アカウント削除API（ACC-88）— レビュー前の弁明（第一周）

対象: コードレビュアー、プライバシー担当。台帳は `ledger.yaml` の一つで、両者に同じ内容を出す（変えるのは長さと用語だけ）。
今回は資料を読んで確認しただけで、コードの変更もテストの実行もしていない。

---

## 1. その場の回答

### この PR を採用してよいか

現状のままでは採用できません。表示名を一度でも変えた利用者は監査ログの参照制約で削除が 500 で失敗し、削除できた利用者も利用者検索の索引・外部 CRM・分析基盤の過去スナップショットに個人情報が残るため、チケットの「自分で削除できる」「個人情報を保持しない」に反します。加えて、削除と同時に注文履歴を連鎖削除しますが、その扱いはチケット上まだ法務・経理の判断待ちで、この PR はその判断を取り消せない形で先取りしています。

### 構造・境界の問いへの答え

**削除と同時に注文履歴まで消してよいのか（構造）**
今は、利用者の行を消すと注文もデータベースの設定で自動的に消えます。消してよいかは法務・経理の判断待ちなので、この挙動はまだ確定させられません。判断が出たら、消すことを説明に明記するか、利用者の行を残して個人情報だけ消す形に変えます。

**受け付けた瞬間に、取り消せない削除をしてよいのか（構造）**
今は即時に物理削除していて、戻す手段はデータベース全体の復元しかありません。取り消しの猶予期間を設けるかは PM の判断待ちです。設けることになれば、削除の形を作り直します。

**削除後は本当にログインできないのか（境界）**
更新用トークンは削除と同時に消えますが、発行済みのアクセストークンは署名だけで検証しているため、最長 24 時間は通ります。ただし、確認した範囲のルートでは、残ったトークンで読める本人データはなく、書き込みは参照制約で失敗します。「ログインできない」が発行済みトークンの即時失効まで求めているかは PM に、ログイン処理と更新処理が削除済みの利用者を拒むかは資料外のコードで確認する必要があり、どちらもまだです。

**他人が人のアカウントを消せないか（境界）**
消せません。削除対象は認証トークンの持ち主に固定されていて、ID を指定する入力がありません。認証は Cookie を使わない Bearer ヘッダなので、他のサイトから資格情報付きの削除要求を送らせることもできません。

**パスワードの再入力などの確認なしに消してよいのか（境界）**
今は、有効なトークンがあれば確認なしで即時に消えます。再確認が要るかはチケットに書かれておらず、取り消しの猶予があるかどうかで必要性が変わるので、PM の判断を待っています。要求にない再確認を実装側で勝手に足すことはしません。

**PR 説明の「users 行を削除」は実際と合っているか（境界）**
合っていません。実際には同じ操作で注文と更新用トークンも消え、監査ログがある利用者では全体が失敗します。説明を実際の挙動に合わせて書き直し、改修した後は改修後の挙動で書き直します。

---

## 2. 深掘りされたときの根拠

根拠（なぜそれが必要・妥当か）と証拠（実体が実際にそうなっているか）は分けて示す。証拠はすべて資料確認（inspection）で、実行して確かめたものではない。

| ID | 層 | 問い | 根拠 | 証拠 | 対応と状態 |
|---|---|---|---|---|---|
| S-01 | 構造 | 注文履歴の連鎖削除は誰の決定か | ACC-88.md:15（注文履歴は未決）、:11（法令上の保持対象は法務に確認中） | migrations/0007_orders.sql:3,6（ON DELETE CASCADE、total_yen）、account.py:11、PostgreSQL 16 §5.4.5 Foreign Keys（CASCADE）、ops/backup.md:3-4 | investigate／pending |
| S-02 | 構造 | 即時の物理削除は誰の決定か | ACC-88.md:16（猶予は PM 判断待ち）、:9 | account.py:9-12、ops/backup.md:3-5 | investigate／pending |
| B-01 | 境界 | 削除後に「ログインできない」は成り立つか | ACC-88.md:10 | auth.py:9（TTL 24h）、auth.py:19-27（DB を引かない）、0004_refresh_tokens.sql:3（CASCADE）、orders.py:9-19・profile.py:9-16・0007:3・0012:3（残ったトークンでは読み取りが空、書き込みは失敗）、0001_users.sql:2 と PostgreSQL 16 §8.1.4（ID は sequence 採番） | investigate／pending（S-01・S-02 待ちの候補） |
| B-02 | 境界 | 第三者が他人のアカウントを消させられるか | ACC-88.md:9 | account.py:9-11、auth.py:1,19-27、OWASP CSRF Prevention Cheat Sheet（Introduction／Employing Custom Request Headers for AJAX/API） | gap なし／done |
| B-03 | 境界 | 再確認なしの不可逆削除（反例） | ACC-88.md:9（再確認の記載なし） | account.py:9-12、auth.py:9,19-27 | investigate／pending（S-02 待ちの候補） |
| P-01 | 手続き | audit_logs も連鎖で消えるか | ACC-88.md:9 | 0012_audit_logs.sql:3（ON DELETE 指定なし）、profile.py:15・audit.py:4-5、PostgreSQL 16 §5.4.5（NO ACTION が既定で、参照行が残ればエラー）、db.py:6 と psycopg 3 Autocommit transactions・PostgreSQL 16 BEGIN（失敗した文はロールバック）、main.py:1-8 と Starlette Exceptions（未処理エラーは 500）、test_account.py:8-13,18（FakeDB） | change／pending（S-01・P-02・P-03 待ちの候補） |
| P-02 | 手続き | 隣の profile 更新と違って監査記録を残さないのはなぜか（逸脱） | existing_contract: profile.py:15 | account.py:9-12、0012:3（現スキーマでは削除の前後どちらで記録しても成立しない） | investigate／pending |
| P-03 | 手続き | 既存の監査記録を残すか消すか | ACC-88.md:11 | 0012:1-6、export_analytics.py:10-11・backup.md:6（user_id はスナップショットから個人に結び付く） | investigate／pending |
| P-04 | 手続き | 利用者検索の索引から消えるか | ACC-88.md:11、existing_contract: search.yaml:1-5、user_indexer.py:1 | user_indexer.py:8-15（upsert のみで削除処理なし）、account.py:11 | change／pending（S-01・S-02 待ちの候補） |
| P-05 | 手続き | 索引から消しても同期が復活させないか（反例） | ACC-88.md:11 | user_indexer.py:8-15 | change／pending（P-04 待ちの候補） |
| P-06 | 手続き | 外部 CRM に連絡先が残らないか | ACC-88.md:11、existing_contract: crm_sync.py:1 | crm_sync.py:7-10、0015_users_crm.sql:1、account.py:11 | change／pending |
| P-07 | 手続き | CRM から消しても残る経路はないか（反例） | ACC-88.md:11 | crm_sync.py:7-10 | change／pending |
| P-08 | 手続き | 分析基盤の過去スナップショットに残らないか | ACC-88.md:11、existing_contract: export_analytics.py:1（DATA-12） | export_analytics.py:9-11、backup.md:6（無期限保持） | investigate／pending |
| P-09 | 手続き | バックアップに残り、復元で戻らないか | ACC-88.md:11、existing_contract: backup.md:3-5 | backup.md:3-5 | investigate／pending |
| P-10 | 手続き | テストは削除の成立を確かめているか | ACC-88.md:9-11 | test_account.py:8-13,18,24、README.md:18（全件成功の記載。今回は実行していない） | change／pending |
| P-11 | 境界 | PR 説明は実体と一致するか | existing_contract: 0004:3・0007:3・0012:3 | README.md:5-6 | change／pending |
| P-12 | 手続き | 同じ削除要求が二度届いたら | ACC-88.md:9、freedom（二度目の応答コードは 204 でも 404 でもよい） | account.py:11-12、PostgreSQL 16 DELETE Outputs（0 件はエラーではない） | gap なし／done |

改修の予定（verification.plan の要約）:

- 法務・経理・PM の判断待ち: S-01（注文履歴）、S-02（猶予）、P-03（監査記録の保持）、B-01・B-03（ログインの範囲と再確認）。判断は ACC-88 に記録してもらう。
- 依存なしで進められるもの: P-06（CRM クライアントの削除手段を一次資料で確認したうえで、削除を CRM に伝える）、P-07（同期との競合・部分失敗で ID を失わない条件）、P-10（マイグレーションを当てた実 PostgreSQL でのテストに置き換える）、P-11（PR 説明の更新）。
- 依存先が決まってから選ぶもの: P-01（監査記録との両立方式。外部キーの変更は既存行の移行として扱う）、P-04・P-05（索引からの削除と同期との競合）。
- 他チームの判断が要るもの: P-08（DATA-12 と分析基盤の持ち主）、P-09（ops/restore.md の確認とプライバシー担当の判断）。

---

## 3. 認める限界と見直す条件

### kind: accepted（受け入れて今回は直さないもの）

なし。今回の周では、受け入れると決めた限界はありません。バックアップの 35 日残存（P-09）は受け入れの候補ですが、受け入れるかはプライバシー担当の判断なので、まだ未確認事項に置いています。

### kind: unverified（改修予定・確認待ちの未確認事項）

| ID | 認める限界 | 見直す条件 |
|---|---|---|
| S-01 | 注文履歴の扱いが決まるまで、この PR は削除時に注文履歴を消す | 法務・経理の決定が ACC-88 に記録されたとき |
| S-02 | 猶予の有無が決まらないまま即時削除を実装している | PM の判断が ACC-88 に記録されたとき |
| B-01 | 削除後も発行済みアクセストークンは最長 24 時間有効。ログイン・更新処理が削除済み利用者を拒むかは未確認 | ログイン・更新の実装を確認したとき、または PM が範囲を決めたとき |
| B-03 | トークンさえあれば、再確認なしで即時に取り消せない削除ができる | PM が再確認と猶予の要否を決めたとき |
| P-01 | 改修するまで、監査記録を持つ利用者の削除は 500 で失敗する（何も消えない） | S-01・P-02・P-03 が確定したとき |
| P-02 | アカウント削除は監査記録に残らない | 監査記録の要否が決まったとき |
| P-03 | 削除後の監査記録の扱いが決まっていない | 法務による保持対象の確認が終わったとき |
| P-04 | 改修するまで、削除した利用者の個人情報が利用者検索の索引に残る | S-01・S-02 が確定し、索引からの削除を改修したとき |
| P-05 | 改修案でも、同期との競合で索引に文書が戻りうる | P-04 の方式が決まったとき |
| P-06 | 改修するまで、削除した利用者の連絡先が外部 CRM に残る | CRM 側の削除手段を確認し、伝播を改修したとき |
| P-07 | 改修案でも、同期との競合や部分失敗で CRM に連絡先が残りうる | P-06 の改修方式を決めたとき |
| P-08 | 削除した利用者の個人情報が、分析基盤の過去スナップショットに無期限に残る | DATA-12 の持ち主とプライバシー担当が過去分の扱いを決めたとき |
| P-09 | 削除後最大 35 日はバックアップに個人情報が残る。復元時に削除が戻らない保証は未確認 | ops/restore.md を確認し、プライバシー担当が残存期間を判断したとき |
| P-10 | 現在のテストは、削除の成立も個人情報の消去も確かめていない | 実 PostgreSQL でのテストを追加したとき |
| P-11 | 現在の PR 説明は、消える範囲と失敗する条件を書いていない | PR 説明を更新したとき |

### 資料の外にあって今回確かめていないもの

ログイン・トークン更新の実装、`app/search`（bulk_upsert の書き込み条件）、`app/integrations/crm`、`app/config`・`app/storage`、`ops/restore.md`、MKT-31、DATA-12、問い合わせ経由の既存の手動削除の手順（ACC-88.md:5）、アプリ・基盤のログ設定。ここに個人情報の別の複製先や別の削除経路があれば、該当する項目の結論が変わります。

---

## 署名

- 署名者: アカウント基盤チーム（PR #57 担当開発者）、2026-10-01
- ダイヤル: **scope = 変更範囲（PR #57 全体）／granularity = 手続き／strength = 資料確認**
- 検証の強さ: すべて資料確認（inspection）。テストの実行、計測、障害実験はしていない。製品の挙動は PostgreSQL 16・psycopg 3・Starlette・OWASP の一次資料の該当節で確認した（URL は ledger.yaml の meta.external_documents にある）。
- 終了条件: **未達**。gap が残る項目は 15 件（S-01, S-02, B-01, B-03, P-01〜P-11）で、すべて verification が pending。gap なしで閉じた項目は 2 件（B-02, P-12）。
- 次の周の最初の手: 法務（佐藤）・経理（李）・PM に S-01・S-02・P-03 の判断を依頼する。並行して、依存のない P-06（CRM の削除手段の確認）と P-10（実 PostgreSQL でのテスト追加）に着手する。
- 専門外の前提を誰が判断するか: 注文履歴と法令上の保持は法務・経理、取り消し猶予・再確認・「ログインできない」の範囲は PM、分析基盤の過去分は DATA-12 の持ち主、バックアップの残存はプライバシー担当と運用。監査記録の要否の持ち主は資料にない。
- 入口: 逸脱駆動 1 件、影響駆動 11 件、反例駆動 4 件、実問 4 件（すべて模擬、simulated: true）。複数の入口から届いた項目は、それぞれの入口に数えている。全 17 項目。
- 影響領域のうち非該当としたもの: 時刻・タイムゾーン（PR に時刻の計算がない。猶予が入れば該当する）、移行・後方互換（PR はスキーマを変えない。外部キーを変える改修は移行として plan に含めた）。
- 版: `sha256:96dc07b5b05d58a7ac86e70c984c6f46ab6ce1209f683dc4a5f9f8ab645f3d56`
  - 作り方: 版管理の外にあるため、repo/ 以下の全 20 ファイル（全項目の scope.ref と、根拠・証拠が参照したファイルをすべて含む）を `LC_ALL=C` のパス順に並べ、`shasum -a 256` の出力（`<sha256>  <相対パス>` の行）全体をさらに SHA-256 した。
  - ファイルごとのハッシュ:

| ファイル | sha256 |
|---|---|
| README.md | 975f3a1e260e8f128e77accfe480ec5dad36dfd0817287603501143976b3f451 |
| app/audit.py | a1635446793518ca1bf9225528f011dd709b32eab17051faaf91e9bf5ae75321 |
| app/auth.py | 19ea00c06f6f9c0f67fe03550d8279e09ead6d7c781e0a941048dff287546432 |
| app/db.py | 2d1b37c5a564e85eb92882524adbd56357ccc2f3ec20b7d5f6f359f3875d4172 |
| app/main.py | 2aa4ab60bc01124abbc94e4bb90152fec5f5a625f2d96231c861a4c1650ec931 |
| app/routes/account.py | cc034b208e847436fd5c733e91e595737a249d300557d337d5f50881c4b0531d |
| app/routes/orders.py | 507b8209e72cf0b2fc0315c65b44416197904b6df961449a7bdc6a0bcab09925 |
| app/routes/profile.py | a4e9ab58aed82e4fea7ada5abadc3475dfc1d86c9edf229959bf6190f0fc94eb |
| config/search.yaml | dc21d907ab971a0c7768e890d0d58bd27bf442ec03435bc51782bcf2d387ffb6 |
| docs/tickets/ACC-88.md | f4567ad97cafda4de9f27057bf138ad2a2a08e32c4a7566dc8db426df0b68788 |
| jobs/crm_sync.py | eea1628500b27f92386d2d4eaf6d3d15af2c7f173c87c74b5075fd9fd398e484 |
| jobs/export_analytics.py | ca5597db43e15e5f696f1e2e66cc4477070e6922649a779c3a8dd6a430ae00b9 |
| jobs/user_indexer.py | e6723d05aed76b9c166c4c4474ffc02f2b0c62e95b0138e60798c173004c88fb |
| migrations/0001_users.sql | d2d01d3e15ba906d1434a2f6fc6fe3ce274ff2b0398acf5a8391204a7ea36f1f |
| migrations/0004_refresh_tokens.sql | f3732b5a5ea88097467f18e526f3a571edee0368aab7fb7297ec76488a4952f9 |
| migrations/0007_orders.sql | c1df3da3fcdf5d0d6b435557cdd330ee99dd566b8d5f87ddc1fd640adb73b89b |
| migrations/0012_audit_logs.sql | 4ea43bca4cd60d349c6511828b9793481971883c62e7ba5a9ed40d709629f61c |
| migrations/0015_users_crm.sql | 3b4af1851cbc5c8725b8cdc058cb9702060c679d5f29e6543c8198e7e092e9fa |
| ops/backup.md | 83bc8537a613c1d1953b35392c23d969ec6077e3b56b83cedba29151bb932ccd |
| tests/test_account.py | c1563a536a63639c06d0f9b06ea15de1aa739dec29a0411171f84da67fdceacb |
