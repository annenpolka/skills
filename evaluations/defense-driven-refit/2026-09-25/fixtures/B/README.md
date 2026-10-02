# PR #57: アカウント削除APIを追加（ACC-88）

## 概要

利用者が自分のアカウントを削除できるように `DELETE /v1/me` を追加しました。
認証済み利用者の `users` 行を削除し、204 を返します。

## 変更ファイル

- `app/routes/account.py`（新規）
- `app/main.py`（ルーター登録）
- `tests/test_account.py`（新規）

変更していないが関係するファイル: `app/auth.py`、`app/db.py`、`migrations/`、`jobs/`、`config/`、`ops/`、`docs/`

## テスト

`pytest tests/test_account.py` 全件成功
