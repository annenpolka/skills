# セッション例

## 例1: 基本フロー

```
User: JWTで認証機能を作りたい。microcommitで進めて。

Agent: 了解。Level 1で進める。

【Step #1: 今回積み上げるパーツ】
JWT gemの追加

【合意対象内容】
- Gemfileにjwt gem追加
- bundle install実行

【解説】
何をしているか: JWTトークンを生成・検証するためのライブラリを導入
なぜ必要か: 認証の土台。これがないとトークン操作ができない
備考: バージョンは2.7.1（最新安定版）を指定
```

```
User: OK

Agent: 【Step #2: 今回積み上げるパーツ】
usersテーブルの作成

【合意対象内容】
- db/migrate/20240115_create_users.rb
- カラム: id, email, password_digest, created_at, updated_at

【解説】
何をしているか: 認証対象となるユーザーを保存するテーブル
なぜ必要か: ログイン情報の永続化。#1で入れたJWTはこのテーブルのユーザーに紐づく
備考: emailにユニークインデックス。has_secure_password用にpassword_digest
```

## 例2: 詳細要求

```
User: なんでpassword_digestなの？passwordじゃダメ？

Agent: 【詳細説明】
password_digestを使う理由:

1. has_secure_passwordの規約
   - Railsのhas_secure_passwordは「password_digest」カラムを前提にしている
   - passwordという仮想属性を自動生成し、bcryptでハッシュ化してpassword_digestに保存

2. セキュリティ
   - 生のパスワードをDBに保存するのは危険
   - ハッシュ化された値（digest）を保存する

passwordカラムにすると、has_secure_passwordが使えず自前実装が必要になる。

【Step #2 再提示】
usersテーブルの作成（内容は同じ）

OK?
```

```
User: OK
```

## 例3: 修正要求

```
Agent: 【Step #3: 今回積み上げるパーツ】
Userモデル

【合意対象内容】
- app/models/user.rb
- has_secure_password
- emailのバリデーション

【解説】
何をしているか: ユーザーのドメインロジックを定義
なぜ必要か: #2で作ったテーブルを操作するインターフェース
備考: パスワードは8文字以上を要求
```

```
User: last_login_atも追加して

Agent: 【Step #3 修正: 今回積み上げるパーツ】
Userモデル + last_login_atカラム

【合意対象内容】
- app/models/user.rb（has_secure_password, バリデーション）
- db/migrate/20240115_add_last_login_at_to_users.rb
- カラム: last_login_at (datetime, nullable)

【解説】
何をしているか: Userモデル定義 + 最終ログイン日時を記録するカラム追加
なぜ必要か: ログイン時にtouch(:last_login_at)で更新できる
備考: マイグレーションが1つ増える。#2とまとめたい場合は戻って統合も可能

OK?
```

## 例4: 粒度変更

```
User: もっとまとめて見せて

Agent: 了解。Level 2に変更。

【Step #4: 今回積み上げるパーツ】
認証コントローラ一式

【合意対象内容】
- app/controllers/auth_controller.rb（register, login, logout）
- config/routes.rb（/register, /login, /logout）
- app/services/token_service.rb（JWT生成・検証）

【解説】
何をしているか: HTTPリクエストを受けて認証処理を行う層
なぜ必要か: #1-3で作った基盤を外部から使えるようにする
備考: 3ファイルを1ブロックとして扱う。個別に見たい場合は「level 1」で戻せる

OK?
```

## 例5: スキップと復帰

```
User: skip

Agent: #4を保留。後で「#4に戻って」で再開できる。

【Step #5: 今回積み上げるパーツ】
...
```

```
（数ステップ後）

User: #4に戻って

Agent: 【Step #4 再提示: 今回積み上げるパーツ】
認証コントローラ一式

（内容は保留時と同じ）

OK?
```

## 例6: 進捗確認

```
User: status

Agent: 【進捗】
✅ #1 JWT gem
✅ #2 usersテーブル
✅ #3 Userモデル + last_login_at
⏸️ #4 認証コントローラ一式（保留中）
⬜ #5 認証ミドルウェア
⬜ #6 テスト

現在: #5 待機中（#4が保留のため依存関係あり）
```
