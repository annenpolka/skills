# PR #611: チーム機能の改善（TEAM-45）

## 概要

TEAM-45 の4項目に対応しました。

- メンバー一覧 API に60秒のキャッシュを入れ、応答を速くしました。
- 招待時にプランの席数を確認し、超える招待を 409 で拒否するようにしました。
- 招待メールに組織のロゴを埋め込むようにしました。
- `users.name` を `users.display_name` に改名し、コードを追従させました。

## 変更ファイル

- `app/routes/members.py`（変更）
- `app/routes/invitations.py`（変更）
- `app/logo.py`（新規）
- `migrations/0033_rename_user_name.sql`（新規）
- `tests/test_members.py`、`tests/test_invitations.py`（変更）

変更していないが関係するファイル: `app/cache.py`、`app/db.py`、`app/auth.py`、`app/mailer.py`、
`app/routes/org_settings.py`、`app/config.py`、`deploy/`、`docs/`

## テスト

`pytest` 全件成功
