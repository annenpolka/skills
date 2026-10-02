## 成果物
- out/ledger.yaml: 21項目。impact 13 / deviation 3 / counterexample 3 / asked 2。構造1 / 境界6 / 手続き4 / 細部10。done 2（D-017, D-019。narrow を資料照合）、pending 19（final_answer 全て null）。自作スクリプトで形式検査。meta（ダイヤル、版 sha256 先頭7桁、影響領域の選別、公開一次資料URL、depends_on の向きの解釈）。
- out/explanation.md: 署名 scope=変更範囲（PR #318 全体）/ granularity=細部 / strength=資料確認、コード未変更・テスト未実行・終了条件未達を明記。三段階出力、「本周で変えたもの」、人間側の条件。
- 所見: 二重課金経路5つ（2レプリカ多重起動、冪等キー無し、共有クライアント即時再送、結果不定を失敗として数える、課金後DB更新前の中断）+ CS 手動請求との重複、Decimal×float TypeError（スケジューラごと落ち同居ジョブも止まる、未実行）、naive now × timestamptz で9時間早く課金（条件付き）、2/29 replace 例外が課金成功後→繰り返し課金、共有クライアント再試行が月額に波及、ログに個人情報。

## 要件の達成（自己申告）: 1 ○ / 2 ○ / 3 ○（SIGTERM 既定挙動は既有知識と明記）/ 4 ○（認可・保存期間・キャッシュ・分散協調は非該当、性能は計測待ち investigate）/ 5 ○ / 6 ○

## 読んだファイル（順）
skill: s1/SKILL.md, s1/references/impact-profiles/backend.md
repo（find 後）: README.md, app/renewal_worker.py, app/payments_client.py, app/scheduler.py, migrations/0042, tests/test_renewal_worker.py, app/monthly_worker.py, app/db.py, app/config.py, app/money.py, app/mailer.py, app/cleanup.py, deploy/README.md, deploy/scheduler.yaml, deploy/monthly-worker.yaml, migrations/0031, docs/tickets/BILL-212.md, docs/vendor/payco-api-v2-excerpt.md
Web検索8語（psycopg numeric/naive、k8s CronJob idempotent、schedule 例外、PG11 ADD COLUMN default、RDS TZ x2、requests ConnectionError after send、psycopg numeric loader）
WebFetch: psycopg adapt, k8s cron-jobs, schedule exception-handling, requests timeouts, PG16 functions-datetime / datatype-datetime, requests adapters.py（repost.aws 403）

## impact 項目の着想元
D-002 資料+索引（idempotent APIs / ambiguous outcome）+既有知識
D-003 資料+本文（移行・後方互換）+既有知識
D-005 資料（背景）+本文（案件固有）
D-006 資料+既有知識
D-007 資料（2レプリカ、canceled、規模）+索引（lost update）
D-008 資料（RollingUpdate、autocommit）+Web（schedule）+既有知識（SIGTERM）+索引（graceful shutdown）
D-010 資料（40万件、月額の JOIN）+索引（N+1、性能）
D-011 資料+Web（psycopg Decimal）+既有知識+索引（decimal / rounding）
D-013 資料+Web+索引（civil time vs instant）
D-014 資料+Web+既有知識
D-015 資料+本文（個人情報）+索引（sensitive logging）
D-016 Web（requests timeout）+資料+索引（timeouts）
D-019 資料+Web（PG11+）+索引（mixed-version）

## Trace: all OK

## 不明点（構造化）
1. depends_on の伝播方向が未定義。GFR: 辺の意味と辿る方向を明記。
2-3. 層順序規則の「確定」を表す欄・基準が無い（第1周で上位層の確定をどう扱うか）。GFR: 規則の前提状態に専用欄か判定基準。
4. 「同一scope」がダイヤル scope か scope.ref か曖昧。GFR: 別語にするか修飾。
5. VCS 無しの版識別子。GFR: 代替を規定。
6. 逸脱と影響の両方から来る項目の origin。GFR: 複数値か優先順位を明記。
7. 模擬尋問を asked としてよいか。GFR: 模擬と実際を区別する印。
8. 限界が複数ある項目（admitted_limit が単一オブジェクト）。GFR: リストで持てるように。

## 裁量
版 sha256 先頭7桁 / meta 追加 / depends_on 逆向き解釈 / 本周の action を確定とみなす / 失敗経路を生んだ入口を origin に / 公式文書を existing_contract として扱う / 入口を YAML コメントに / 模擬尋問は asked+コメント / done は narrow 2件のみ / D-001 は CronJob 形に寄せる案 / RDS 既定TZ は条件付き / jev-crosscheck 不使用

## やり直し: 3回（その場の回答、D-002 resolution を反例 D-021 を受けて改訂、psycopg Decimal の再検索）
