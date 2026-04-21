# ユーザー認証APIエンドポイントの実装

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

## Purpose / Big Picture

このExecPlanは、Webアプリケーションにユーザー認証機能を追加するものです。実装後、ユーザーはメールアドレスとパスワードでログインでき、JWTトークンを受け取ってAPIリクエストを認証できるようになります。

実装完了後、以下のコマンドで動作を確認できます:

    curl -X POST http://localhost:8080/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"user@example.com","password":"secret123"}'

成功時には、以下のようなJSONレスポンスが返されます:

    {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...","expires_at":"2025-12-14T12:00:00Z"}

## Progress

- [x] (2025-11-14 10:00:00Z) データベーススキーマ設計完了
- [x] (2025-11-14 10:30:00Z) usersテーブルのマイグレーション作成
- [x] (2025-11-14 11:00:00Z) User modelの実装
- [x] (2025-11-14 11:30:00Z) パスワードハッシュ化ロジックの実装
- [ ] JWTトークン生成ロジックの実装
- [ ] /api/auth/loginエンドポイントの実装
- [ ] 認証ミドルウェアの実装
- [ ] 統合テストの作成
- [ ] ドキュメントの更新

## Surprises & Discoveries

- Observation: bcryptのコスト係数を12に設定すると、Raspberry Pi 3B+ではハッシュ化に約500msかかることが判明
  Evidence: ベンチマークテストの結果、cost=10で約120ms、cost=12で約480ms。本番環境では問題ないが、開発環境でのテストが遅くなる可能性がある。

- Observation: JWTライブラリ(jsonwebtoken crate)がRS256をデフォルトでサポートしているが、プロジェクトではHS256を使用する方針
  Evidence: Cargo.tomlで`jsonwebtoken = "8.3"`を確認。ドキュメントによるとRS256/HS256両方サポート。セキュリティ要件を確認した結果、シンプルなHS256で十分と判断。

## Decision Log

- Decision: パスワードハッシュ化にbcryptを使用（argon2ではなく）
  Rationale: プロジェクトで既にbcrypt crateが使用されており、依存関係を増やさないため。bcryptは実績があり、OWASP推奨のアルゴリズムでもある。
  Date/Author: 2025-11-14 10:15:00Z / Initial implementer

- Decision: JWTトークンの有効期限を24時間に設定
  Rationale: ユーザビリティとセキュリティのバランスを考慮。頻繁な再ログインは避けつつ、トークン漏洩時のリスクを限定する。
  Date/Author: 2025-11-14 10:45:00Z / Initial implementer

- Decision: JWT署名アルゴリズムにHS256を採用
  Rationale: シングルサーバー構成のため、対称鍵で十分。RS256（非対称鍵）はマイクロサービス環境で公開鍵を配布する場合に有用だが、現時点では不要。将来必要になれば移行可能。
  Date/Author: 2025-11-14 11:15:00Z / Initial implementer

## Outcomes & Retrospective

[実装完了後に記入予定]

## Context and Orientation

このプロジェクトはRust + Axum + PostgreSQLで構築されたWebアプリケーションです。現在、認証機能は存在せず、すべてのAPIエンドポイントが公開されています。

主要なファイル構成:
- `src/main.rs` - エントリーポイント、Axumサーバーの起動
- `src/routes/` - APIルーティング定義
- `src/models/` - データベースモデル
- `src/db/` - データベース接続とマイグレーション
- `migrations/` - SQLマイグレーションファイル
- `Cargo.toml` - 依存関係管理

用語定義:
- **JWT (JSON Web Token)**: ユーザー認証情報を含む署名付きトークン。クライアントが保持し、APIリクエストのAuthorizationヘッダーで送信する。
- **bcrypt**: パスワードハッシュ化アルゴリズム。ソルト付きハッシュを生成し、ブルートフォース攻撃に対する耐性を持つ。
- **Axum**: Rustの非同期Webフレームワーク。Tokioランタイム上で動作する。

## Plan of Work

以下の順序で実装を進めます:

1. **データベーススキーマの追加** (`migrations/`): usersテーブルを作成するマイグレーションを追加します。カラムは id, email, password_hash, created_at, updated_at を含みます。

2. **Userモデルの実装** (`src/models/user.rs`): データベースのusersテーブルに対応するRust構造体を定義します。SQLxのFromRow traitを実装します。

3. **パスワードハッシュ化ロジック** (`src/models/user.rs`): bcrypt crateを使用して、平文パスワードをハッシュ化する関数と、パスワード検証関数を実装します。

4. **JWT生成ロジック** (`src/auth/jwt.rs`): jsonwebtoken crateを使用して、ユーザーIDを含むJWTを生成する関数を実装します。環境変数から秘密鍵を読み込みます。

5. **ログインエンドポイント** (`src/routes/auth.rs`): POST /api/auth/loginエンドポイントを実装します。リクエストボディからemail/passwordを受け取り、検証してJWTトークンを返します。

6. **認証ミドルウェア** (`src/middleware/auth.rs`): AuthorizationヘッダーからJWTを検証し、リクエストにユーザー情報を付加するAxum middlewareを実装します。

7. **テストの追加** (`tests/auth_test.rs`): 統合テストを作成し、ログインフロー全体を検証します。

## Concrete Steps

作業ディレクトリ: プロジェクトルート

**ステップ1: マイグレーションの作成**

    sqlx migrate add create_users_table

生成されたマイグレーションファイル (`migrations/YYYYMMDDHHMMSS_create_users_table.sql`) を編集:

    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_users_email ON users(email);

マイグレーション実行:

    sqlx migrate run

期待される出力:

    Applied migration 20251114100000 create_users_table

**ステップ2: Userモデルの実装**

`src/models/user.rs` を作成し、以下を実装:

    use sqlx::FromRow;
    use chrono::{DateTime, Utc};

    #[derive(Debug, FromRow)]
    pub struct User {
        pub id: i32,
        pub email: String,
        pub password_hash: String,
        pub created_at: DateTime<Utc>,
        pub updated_at: DateTime<Utc>,
    }

`src/models/mod.rs` に追加:

    pub mod user;

**ステップ3: パスワードハッシュ化の実装**

`Cargo.toml` に依存関係追加:

    bcrypt = "0.15"

`src/models/user.rs` に関数追加:

    use bcrypt::{hash, verify, DEFAULT_COST};

    impl User {
        pub fn hash_password(password: &str) -> Result<String, bcrypt::BcryptError> {
            hash(password, DEFAULT_COST)
        }

        pub fn verify_password(&self, password: &str) -> Result<bool, bcrypt::BcryptError> {
            verify(password, &self.password_hash)
        }
    }

**ステップ4-7**: [以降のステップは同様に詳細に記述]

## Validation and Acceptance

実装完了後、以下の手順で検証します:

1. **データベース接続テスト**:

       cargo test db_connection

   期待: 1 test passed

2. **パスワードハッシュ化テスト**:

       cargo test password_hashing

   期待: 2 tests passed (hash_password_test, verify_password_test)

3. **ログインエンドポイントテスト**:

   テストユーザーを作成:

       psql $DATABASE_URL -c "INSERT INTO users (email, password_hash) VALUES ('test@example.com', '\$2b\$12\$...');"

   ログインリクエスト送信:

       curl -X POST http://localhost:8080/api/auth/login \
         -H "Content-Type: application/json" \
         -d '{"email":"test@example.com","password":"testpass123"}'

   期待されるレスポンス (HTTP 200):

       {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...","expires_at":"2025-11-15T12:00:00Z"}

   間違ったパスワードでのテスト:

       curl -X POST http://localhost:8080/api/auth/login \
         -H "Content-Type: application/json" \
         -d '{"email":"test@example.com","password":"wrongpass"}'

   期待されるレスポンス (HTTP 401):

       {"error":"Invalid credentials"}

4. **認証ミドルウェアテスト**:

   トークンなしでの保護されたエンドポイントアクセス:

       curl http://localhost:8080/api/protected

   期待: HTTP 401 Unauthorized

   有効なトークンでのアクセス:

       curl http://localhost:8080/api/protected \
         -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

   期待: HTTP 200 with protected resource

5. **統合テスト**:

       cargo test integration_auth

   期待: All tests passed (少なくとも5テスト)

## Idempotence and Recovery

この実装は以下の点でべき等性と安全性を確保しています:

1. **マイグレーション**: `sqlx migrate run` は複数回実行しても安全です。適用済みマイグレーションはスキップされます。

2. **テストデータ**: テストの前に `TRUNCATE users CASCADE;` を実行することで、クリーンな状態から開始できます。

3. **ロールバック**: 問題が発生した場合、以下のコマンドでマイグレーションをロールバックできます:

       sqlx migrate revert

4. **環境変数**: JWT_SECRET が未設定の場合、アプリケーションは起動時にエラーを出力して終了します。本番環境へのデプロイ前に検証できます。

## Artifacts and Notes

**マイグレーション実行ログ**:

    $ sqlx migrate run
    Applied migration 20251114100000 create_users_table (42ms)

**パスワードハッシュ化ベンチマーク**:

    $ cargo bench password_hash
    test password_hash_benchmark ... bench:  120,345,678 ns/iter (+/- 5,234,567)

**JWTトークン例**:

    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

**エラーレスポンス例**:

    HTTP/1.1 401 Unauthorized
    Content-Type: application/json

    {"error":"Invalid credentials","code":"AUTH_INVALID_CREDENTIALS"}

## Interfaces and Dependencies

**依存ライブラリ**:

- `bcrypt = "0.15"` - パスワードハッシュ化
- `jsonwebtoken = "8.3"` - JWT生成・検証
- `serde = { version = "1.0", features = ["derive"] }` - JSON シリアライゼーション
- `sqlx = { version = "0.7", features = ["postgres", "runtime-tokio-native-tls"] }` - データベースアクセス

**主要な型定義**:

`src/models/user.rs`:

    pub struct User {
        pub id: i32,
        pub email: String,
        pub password_hash: String,
        pub created_at: DateTime<Utc>,
        pub updated_at: DateTime<Utc>,
    }

`src/routes/auth.rs`:

    #[derive(Deserialize)]
    pub struct LoginRequest {
        pub email: String,
        pub password: String,
    }

    #[derive(Serialize)]
    pub struct LoginResponse {
        pub token: String,
        pub expires_at: DateTime<Utc>,
    }

`src/auth/jwt.rs`:

    pub fn generate_token(user_id: i32) -> Result<String, jsonwebtoken::errors::Error>
    pub fn validate_token(token: &str) -> Result<Claims, jsonwebtoken::errors::Error>

**データベーススキーマ**:

    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
