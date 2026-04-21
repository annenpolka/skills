---
name: microcommit-protocol
description: |
  Step-by-step implementation protocol with explicit user approval at every step.
  Use when: (1) User says "microcommit", "one step at a time", "explain everything",
  (2) User wants to understand and approve every implementation decision,
  (3) User explicitly rejects autonomous/batch execution.
  Core principle: Agent has NO discretion. Every block requires explicit approval.
---

# Microcommit Protocol

ユーザーがシステムの全容を「完全に理解しながら」構築するためのプロトコル。

## 核心原則

**エージェントに裁量を与えない。**

- すべてのブロックを1つずつ提示し、停止する
- 「よしなにやっておきました」は禁止
- 自明に見えるものも省略しない
- ユーザーが承認するまで絶対に次へ進まない

## 動作サイクル

```
分解 → 提示 → 停止 → 承認待ち → 記録 → 次へ
```

### 1. 分解

作業を最小単位（ブロック）に分解する。

| 粒度 | 例 |
|------|-----|
| Level 1（既定） | 1関数、1テーブル、1設定ファイル |
| Level 0 | 1行、1定数、1カラム |
| Level 2 | 1機能を構成する複数ブロック |

粒度はユーザーが変更するまで固定。エージェントは勝手に変えない。

### 2. 提示フォーマット

```
【Step #n: 今回積み上げるパーツ】
パーツ名（例：「ユーザーモデルの定義」）

【合意対象内容】
- 項目1
- 項目2
- 項目3
（3つ以内に収める）

【解説】
何をしているか: 平易な言葉で、このパーツの役割
なぜ必要か: システム全体におけるこのパーツの位置づけ
備考: 既存コードからの流用有無、関連ソース、注意点
```

必須記載事項：
- ファイルはリポジトリルートからのパス
- DBはテーブル名・カラム名・型
- 外部依存はパッケージ名・バージョン

### 3. 停止

提示したら**必ず停止**。例外なし。

### 4. 承認待ち

| ユーザーの発話 | 解釈 |
|---------------|------|
| 肯定（OK, k, うん, 👍, いいよ） | 承認→実装→次へ |
| 疑問（?, なんで, 詳しく） | 詳細説明→再度停止 |
| それ以外 | 修正要求として対応→再度停止 |

発話解釈の詳細は [references/interpretation.md](references/interpretation.md) を参照。

### 5. 記録

承認されたブロックは設計書に追記する。修正があった場合は内容も記録。

## セッション開始

```
了解。Level 1で進める。

【Step #1: 最初のパーツ】
パーツ名

【合意対象内容】
- 内容1
- 内容2

【解説】
何をしているか: ...
なぜ必要か: ...
備考: ...
```

## 禁止事項

- 複数ブロックを承認なしに実行
- 「定型的だから」と判断して省略
- 粒度を勝手に変更
- 「残りは同様なので省略」
- 承認前に次の話を始める

## 参照

- [references/interpretation.md](references/interpretation.md) - ユーザー発話の解釈ルール
- [references/examples.md](references/examples.md) - セッション例
