# PR #318: 年額プランの自動更新ジョブを追加

## 概要

BILL-212 の対応。期日を迎えた年額購読を自動で更新課金する `renewal_worker` を追加しました。
既存の定期ジョブ基盤（`app/scheduler.py`）に登録し、10分ごとに実行します。

## 変更ファイル

- `app/renewal_worker.py`（新規）: 更新対象の抽出、課金、次回更新日の設定、失敗時の再試行
- `app/payments_client.py`（変更）: 5xx と接続エラーで自動再試行するようにした
- `app/scheduler.py`（変更）: `run_due_renewals` を10分ごとに登録
- `migrations/0042_add_failure_count.sql`（新規）: 連続失敗回数の列を追加
- `tests/test_renewal_worker.py`（新規）: 正常系・失敗系のテスト

変更していないが関係するファイル: `app/monthly_worker.py`（月額の既存ジョブ）、`app/db.py`、`app/config.py`、
`deploy/`、`migrations/0031_subscriptions.sql`、`docs/`

## テスト

`pytest tests/test_renewal_worker.py` 全件成功（CI #9912）
