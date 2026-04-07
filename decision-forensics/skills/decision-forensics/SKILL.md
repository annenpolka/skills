---
name: decision-forensics
description: |
  エージェントの意思決定を構造的に記録・検証するスキル（Ghost Protocol）。
  行為は全て通過させ、N件ごとにretrospective（反実仮想予測＋ドリフト検出）を強制する。
  gateではなく鏡。行為の流れを止めずに判断の質を可視化する。
  This skill should be used when the user says "decision-forensics", "意思決定を記録して",
  "forensics on", "判断を追跡して", "decision record", "forensicsを有効にして",
  "forensics off", "forensics停止", "track decisions", "decision tracking",
  "record my reasoning", or wants to track and verify agent decision quality.
  Also triggered by "forensics audit", "decision audit", "監査して",
  "credibility check", "forensics report", "レポートを見せて"
  for reviewing accumulated decision records.
---

# Decision Forensics (Ghost Protocol)

行為を止めるな。鏡だけを置け。commitする時だけ、振り返れ。

行為は全て通す。PostToolUseが裏で全行為を記録する。`git commit` 時にPreToolUseが未振り返りアクションの有無を確認し、あればcommitをブロックしてretrospectiveを要求する。

## Core Mechanism

```
edit src/main.rs   → フリーパス
edit config.json   → フリーパス
bash cargo test    → フリーパス
grep handleError   → フリーパス

git commit         → 未振り返りアクション4件 → DENY（retro書け）
RETROSPECTIVE      → scratch/への書き込みはskip → 通る
.last_retro_seq更新 → scratch/への書き込みはskip → 通る
git commit         → 未振り返り0件 → フリーパス
```

ルールは1つ: **commitするなら振り返れ。**

## Storage: scratch/ directory

Decision Forensicsはプロジェクトローカルの `scratch/decision-forensics/` にデータを保存する。
`scratch/` は draftsnap（作業記録ツール）が管理する一時作業ディレクトリで、`.gitignore` に追加して運用する。
`draftsnap ensure` を実行すると `scratch/` の初期化・gitignore設定・sidecarリポジトリ構築が行われる。
プロジェクトごとにレコードが分離されるため、横断的な汚染が起きない。

```
$PWD/scratch/decision-forensics/
├── .active              # 有効フラグ
├── .last_retro_seq      # 最後にretroした時点のseq番号
├── action-log.jsonl     # 全行為の自動記録（hookが書く、人間は触らない）
├── retrospectives/      # retro-001.json, retro-002.json, ...
└── audits/              # audit結果
```

## Activation / Deactivation

Activate — まず `draftsnap ensure` で `scratch/` ディレクトリを初期化してから init を実行する:

```bash
draftsnap ensure && bash $CLAUDE_PLUGIN_ROOT/scripts/init.sh
```

Creates `scratch/decision-forensics/.active` flag. All subsequent Write/Edit/Bash are logged automatically.

Deactivate:

```bash
rm scratch/decision-forensics/.active
```

Hooks become passthrough. Existing records are preserved.

### Retrospective interval

デフォルトは5アクションごと。変更する場合:

```bash
echo "10" > scratch/decision-forensics/.retro_interval
```

## Action Log (Automatic)

PostToolUseフックが全てのWrite/Edit/Bash実行後に `action-log.jsonl` へ自動追記する。エージェントの手動操作は不要。

```jsonl
{"seq":1,"timestamp":"2026-04-07T15:35:00Z","tool":"Bash","input_summary":"echo test > /tmp/t.txt"}
{"seq":2,"timestamp":"2026-04-07T15:36:00Z","tool":"Edit","input_summary":"Edit → src/main.rs"}
{"seq":3,"timestamp":"2026-04-07T15:37:00Z","tool":"Bash","input_summary":"git add && git commit"}
```

## Retrospective (Agent writes every N actions)

commit時にdebt gateが発火したら、`scratch/decision-forensics/retrospectives/retro-NNN.json` を作成する。retrospective作成後、`echo <最新seq> > scratch/decision-forensics/.last_retro_seq` でシーケンスを更新する:

```json
{
  "id": "retro-001",
  "covers": [1, 2, 3, 4, 5],
  "timestamp": "2026-04-07T16:00:00Z",
  "entries": [
    {
      "seq": 1,
      "what_happened": "テストファイルを/tmpに作成",
      "alternatives": [
        {
          "road_not_taken": "プロジェクト内に作成",
          "counterfactual": "git statusが汚れた",
          "confidence": 0.9
        }
      ],
      "drift": null
    }
  ],
  "pattern": "N件を俯瞰して見えたパターンや傾向（optional）"
}
```

**Requirements:**
- `covers`: このretrospectiveがカバーするアクションのseq番号配列
- `entries`: 各アクションに対する振り返り
  - `what_happened`: 実際に何をしたか
  - `alternatives[]`: 選ばなかった道。各々に `road_not_taken`, `counterfactual`, `confidence` (0.0-1.0)
  - `drift`: 意図との乖離。なければ `null`。あれば `{declared_intention, actual_outcome, divergence, explanation}`
- `pattern` (optional): N件を俯瞰して見える判断パターン・傾向

## Exempt Operations

以下の操作はログ対象外:
- `scratch/decision-forensics/` への書き込み（ログやretrospective自体の記録）
- `decision-forensics` を含むBashコマンド（スクリプト実行）

## Report

蓄積されたaction logとretrospectiveを人間可読なMarkdown形式で出力する:

```bash
bash $CLAUDE_PLUGIN_ROOT/scripts/report.sh
```

ユーザーに `decision-forensics report` や `レポートを見せて` と言われたら、このスクリプトの出力を取得し、必要に応じて文脈の補足や要約を加えて提示する。

## Audit

```bash
bash $CLAUDE_PLUGIN_ROOT/scripts/audit.sh
```

カバレッジ検証: action logの全アクションがretrospectiveでカバーされているかを確認する。

## Scripts

| Script | Purpose | Invocation |
|--------|---------|------------|
| `scripts/init.sh` | Initialize `scratch/decision-forensics/` and set `.active` flag | Manual (activation) |
| `scripts/pre-check.sh` | PreToolUse hook: git commit時にretro要求 | Automatic (hook) |
| `scripts/post-record.sh` | PostToolUse hook: action-log.jsonlへの記録 | Automatic (hook) |
| `scripts/weight.jq` | アクション重みスコアリング（report用） | report.shから呼出 |
| `scripts/report.sh` | 人間可読なMarkdownレポートを生成 | Manual |
| `scripts/audit.sh` | カバレッジ監査 | Manual / prompted |

## Reference Files

- **[references/data-model.md](references/data-model.md)** — Complete type definitions for all data structures
- **[references/analysis.md](references/analysis.md)** — Audit procedures, credibility scoring rubric, contradiction detection patterns
