# デプロイ手順

- DB は PostgreSQL 16。既定のトランザクション分離レベルは変更していない。
- `migrations/` は pre-deploy Job で適用し、成功後に Deployment を RollingUpdate する（新旧の Pod が数分間並ぶ）。
- ロールバックはイメージタグを戻す。マイグレーションは自動では戻さない。
