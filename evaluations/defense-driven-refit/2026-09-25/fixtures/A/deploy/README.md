# デプロイ手順

- DB は PostgreSQL 16（Amazon RDS）。
- `migrations/` は pre-deploy Job で適用し、成功後にアプリの Deployment を RollingUpdate する。
- ロールバックはアプリのイメージタグを戻す。マイグレーションは自動では戻さない。
