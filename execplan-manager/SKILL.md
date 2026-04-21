---
name: execplan-manager
description: Create, update, validate, and manage Codex Execution Plans (ExecPlans) - living design documents that guide agents through implementing features. Use when creating new execution plans, updating existing ones with progress/decisions, managing milestones, or validating plan completeness and compliance with PLANS.md specification.
---

# ExecPlan Manager

## Overview

ExecPlanは、コーディングエージェントが機能実装を進めるための実行可能な設計ドキュメント（Execution Plan）です。このスキルは、ExecPlanの作成、更新、検証、マイルストーン管理を支援します。

ExecPlanは「リビングドキュメント」として、実装の進行に合わせて継続的に更新され、すべての設計判断、発見、進捗を記録します。

## Core Capabilities

### 1. ExecPlanの新規作成

新しいExecPlanを作成する際は、以下の手順に従います:

**Step 1: テンプレートの使用**

`assets/execplan-skeleton.md`から開始します。このテンプレートには、PLANS.md仕様に準拠したすべての必須セクションが含まれています。

**Step 2: Purpose / Big Pictureの記述**

ユーザー視点で「なぜこの変更が重要か」を数文で説明します:
- 実装後にユーザーができるようになること
- 動作確認の方法（コマンド例と期待される出力）

**重要**: 技術的な詳細ではなく、観察可能な成果に焦点を当てます。

**Step 3: Context and Orientationの充実**

実装者が初心者であると仮定して、以下を明確に記述します:
- リポジトリの現状（関連ファイルをフルパスで記載）
- 使用する専門用語の定義（初出時に必ず説明）
- 主要なファイル構成とその役割

**Step 4: Plan of WorkとConcrete Stepsの詳細化**

- **Plan of Work**: 散文形式で、編集・追加する内容を順序立てて説明
- **Concrete Steps**: 実行するコマンドを正確に記載し、期待される出力例を含める

**Step 5: Validation and Acceptanceの定義**

実装が成功したことを検証する方法を、具体的な入出力例とともに記述します:
- テストコマンドとその期待結果
- 手動確認の手順と観察すべき動作
- エンドツーエンドシナリオ例

**Step 6: 必須セクションの確認**

以下のセクションがすべて存在することを確認:
- Purpose / Big Picture
- Progress
- Surprises & Discoveries
- Decision Log
- Outcomes & Retrospective
- Context and Orientation
- Plan of Work
- Concrete Steps
- Validation and Acceptance
- Idempotence and Recovery
- Artifacts and Notes
- Interfaces and Dependencies

### 2. 既存ExecPlanの更新

ExecPlanは実装の進行に合わせて継続的に更新します。

**Progressセクションの更新**

作業を開始する前、完了した直後、そして途中で停止する際に更新します:

```markdown
## Progress

- [x] (2025-11-14 10:00:00Z) データベーススキーマ設計完了
- [x] (2025-11-14 10:30:00Z) usersテーブルのマイグレーション作成
- [ ] JWTトークン生成ロジックの実装（開始: 認証ヘルパー関数の設計、残: トークン検証とリフレッシュ）
- [ ] /api/auth/loginエンドポイントの実装
```

**タイムスタンプの形式**: `(YYYY-MM-DD HH:MM:SSZ)`を使用し、進捗速度の測定に役立てます。

**Decision Logへの記録**

設計判断を行った際は、必ず記録します:

```markdown
## Decision Log

- Decision: JWTトークンの有効期限を24時間に設定
  Rationale: ユーザビリティとセキュリティのバランスを考慮。頻繁な再ログインは避けつつ、トークン漏洩時のリスクを限定する。
  Date/Author: 2025-11-14 10:45:00Z / Initial implementer
```

**Surprises & Discoveriesへの記録**

予期しない挙動、バグ、最適化、性能トレードオフを発見した場合は記録します:

```markdown
## Surprises & Discoveries

- Observation: bcryptのコスト係数を12に設定すると、Raspberry Pi 3B+ではハッシュ化に約500msかかることが判明
  Evidence: ベンチマークテストの結果、cost=10で約120ms、cost=12で約480ms。
```

**Artifacts and Notesへの追加**

重要なターミナル出力、diff、ログを記録します（簡潔に、成功を証明する内容に焦点を当てる）。

### 3. マイルストーン管理

大きな機能実装を複数のマイルストーンに分割する場合:

**マイルストーンの定義**

各マイルストーンは以下を含む段落で導入します:
- スコープ（何を達成するか）
- マイルストーン終了時に存在するもの
- 実行するコマンド
- 期待される受け入れ基準

**プロトタイピングマイルストーン**

不確実性が高い場合、明示的にプロトタイピングマイルストーンを設けます:

```markdown
## Milestone 1: JWT検証のプロトタイプ (Prototyping)

このマイルストーンでは、jsonwebtoken crateがRS256をサポートし、
現在のトークン形式を解析できることを検証します。
プロトタイプは scratch/prototypes/jwt-poc/ に保存します。

受け入れ基準:
- RS256署名の検証が成功する
- トークンからユーザーIDとクレームを抽出できる
- 有効期限の検証が動作する
```

**マイルストーンの独立検証**

各マイルストーンは独立して検証可能であり、全体目標に向けて段階的に実装を進めます。

### 4. ExecPlanの検証

ExecPlanが仕様に準拠しているか確認するには、検証スクリプトを使用します:

```bash
python scripts/validate_execplan.py path/to/execplan.md
```

検証内容:
- すべての必須セクションが存在するか
- Progressセクションにチェックボックスがあるか
- 完了した項目にタイムスタンプがあるか
- Decision Logが適切なフォーマットか
- 日本語で記述されているか（PLANS.md仕様による）
- ネストされたトリプルバッククォートのコードフェンスを使用していないか

**検証エラーの修正**

エラーや警告が報告された場合、ExecPlanを更新して再度検証します。

## PLANS.md仕様の参照

詳細な仕様は `references/plans-spec.md` に記載されています。以下の場合に参照してください:

- ExecPlanの要件が不明確な場合
- フォーマット規則を確認したい場合
- べき等性、安全性に関するガイドラインを確認したい場合
- プロトタイピングマイルストーンの使い方を確認したい場合

仕様書には以下が含まれます:
- NON-NEGOTIABLE REQUIREMENTS（絶対要件）
- フォーマット規則（日本語での記述、マークダウン構文）
- ガイドライン（自己完結性、平易な言語、観察可能な成果）
- マイルストーンの記述方法
- リビングドキュメントとしての運用方法
- よくある失敗パターンと回避方法

## 実例の参照

`references/example-execplan.md` には、完全なExecPlanの実例が含まれています。以下を学ぶために参照してください:

- Purposeセクションの具体例（観察可能な成果の記述）
- Progressセクションのタイムスタンプ付きチェックリスト
- Decision Logの詳細な記録例
- Surprises & Discoveriesの証拠付き記録
- Concrete Stepsの詳細なコマンド例と期待される出力
- Validation and Acceptanceの具体的な検証手順

## Key Principles

ExecPlanを作成・更新する際の重要な原則:

1. **自己完結性**: ExecPlanには、初心者が成功するために必要なすべての知識と指示が含まれている
2. **観察可能な成果**: コンパイルだけでなく、実際に動作する機能を実装する
3. **専門用語の定義**: 初出時に必ず定義する（または使用しない）
4. **リビングドキュメント**: 進捗、発見、判断を継続的に記録する
5. **べき等性と安全性**: 複数回実行しても安全で、失敗時のリカバリー方法を明記する
6. **検証の必須化**: 成功を証明する方法を常に含める
7. **日本語での記述**: すべてのExecPlanは日本語で記述する（PLANS.md仕様による）

## Common Pitfalls to Avoid

❌ **避けるべきこと**:
- 未定義の専門用語の使用
- 外部ドキュメントへの参照
- 事前知識やコンテキストの仮定
- コンパイルはできるが動作しないコードの実装
- 読者への判断の委譲
- Progressセクション以外でのチェックリストの使用
- ネストされたトリプルバッククォートのコードフェンス（代わりにインデントを使用）
- 英語での記述（日本語で記述する）
- 必須セクションのスキップ

✅ **すべきこと**:
- すべての専門用語を定義する
- 必要な知識をExecPlan内に埋め込む
- 完全な初心者向けに記述する
- 観察可能で動作する成果に焦点を当てる
- ExecPlan内ですべての判断を行う
- 散文形式を使用する（Progressセクション以外）
- 期待される出力例とともにコマンドを示す
- 日本語で全体を記述する
- すべての必須セクションを最新の状態に保つ
- 具体的で検証可能な受け入れ基準を提供する

## Resources

### assets/execplan-skeleton.md
新しいExecPlanを作成する際のスケルトンテンプレート。すべての必須セクションが含まれており、プレースホルダーを埋めることで完全なExecPlanを作成できます。

### references/plans-spec.md
PLANS.mdの完全な仕様書。ExecPlanの要件、フォーマット規則、ガイドライン、よくある失敗パターンなどを網羅しています。

### references/example-execplan.md
ユーザー認証API実装の完全なExecPlan実例。すべてのセクションがどのように記述されるべきかを示す参考資料です。

### scripts/validate_execplan.py
ExecPlanがPLANS.md仕様に準拠しているか検証するPythonスクリプト。必須セクションの存在、フォーマット、タイムスタンプなどをチェックします。
