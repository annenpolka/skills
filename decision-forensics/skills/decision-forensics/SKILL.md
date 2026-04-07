---
name: decision-forensics
description: |
  エージェントの意思決定を構造的に記録・検証するスキル。
  行動前にpre-declaration（意図・選択・棄却理由）を強制し、
  行動後にcounterfactual prediction（反実仮想予測）とdrift-check（漂流検出）を記録する。
  This skill should be used when the user says "decision-forensics", "意思決定を記録して",
  "forensics on", "判断を追跡して", "decision record", "forensicsを有効にして",
  "forensics off", "forensics停止", "track decisions", "decision tracking",
  "record my reasoning", or wants to track and verify agent decision quality.
  Also triggered by "forensics audit", "decision audit", "監査して",
  "credibility check" for reviewing accumulated decision records.
---

# Decision Forensics

Structural measurement of agent epistemic honesty. Record decisions BEFORE action, verify AFTER action. Make post-hoc rationalization structurally impossible.

## Core Mechanism

PreToolUse hooks deny Write/Edit/Bash unless a pre-declaration exists. The agent must declare intention, chosen approach, and rejected alternatives before any action is allowed.

```
ACTIVATE  → init.sh creates scratch/decision-forensics/.active
PRE-DECLARE → Write pending.json (intention + chosen + rejected)
ACTION    → Hook validates pending.json → allows tool use
POST-RECORD → Record outcome + counterfactuals + drift
AUDIT     → Every 5 records, run structural verification
DEACTIVATE → Remove .active flag
```

## Storage: scratch/ directory

Decision Forensicsはプロジェクトローカルの `scratch/decision-forensics/` にデータを保存する。
`scratch/` は draftsnap（作業記録ツール）が管理する一時作業ディレクトリで、`.gitignore` に追加して運用する。
`draftsnap ensure` を実行すると `scratch/` の初期化・gitignore設定・sidecarリポジトリ構築が行われる。
プロジェクトごとにレコードが分離されるため、横断的な汚染が起きない。

```
$PWD/scratch/decision-forensics/
├── .active          # 有効フラグ
├── pending.json     # 現在のpre-declaration（一時ファイル）
├── records/         # pre-*.json / post-*.json
└── audits/          # audit結果
```

## Activation / Deactivation

Activate — まず `draftsnap ensure` で `scratch/` ディレクトリを初期化してから init を実行する:

```bash
draftsnap ensure && bash $CLAUDE_PLUGIN_ROOT/scripts/init.sh
```

Creates `scratch/decision-forensics/.active` flag. All subsequent Write/Edit/Bash calls require pre-declaration.

Deactivate:

```bash
rm scratch/decision-forensics/.active
```

Hooks become passthrough. Existing records are preserved.

## Pre-Declaration (Before Action)

Before any Write/Edit/Bash, create `scratch/decision-forensics/pending.json` with the Write tool:

```json
{
  "id": "<uuid>",
  "timestamp": "<ISO8601>",
  "pre": {
    "intention": "What will be done and why",
    "chosen": {
      "description": "The chosen approach",
      "rationale": "Why this was chosen over alternatives"
    },
    "rejected": [
      {
        "description": "Alternative approach considered",
        "rationale": "Why this was not chosen"
      }
    ],
    "context": "Current situation, constraints, and goals"
  }
}
```

**Validation rules enforced by hook:**
- All fields required
- `pre.rejected` must have at least 1 entry
- Each rejected entry must have both `description` and `rationale`

Generate `id` as UUID v4 format. Use `date -u +"%Y-%m-%dT%H:%M:%SZ"` for timestamp.

### Parallel Tool Calls (expected_actions)

デフォルトではpending.jsonは1アクションで消費される。複数のtool callをparallel実行する場合、`pre.expected_actions` を指定する:

```json
{
  "pre": {
    "expected_actions": 3,
    "intention": "...",
    ...
  }
}
```

PostToolUseがアクション回数をカウントし、`expected_actions` に達した時点でpending.jsonを消費する。未指定時は `1` として扱われる。

## Post-Record (After Action)

After action completes, the PostToolUse hook archives the pre-declaration and prompts for post-record. Create `scratch/decision-forensics/records/post-<id>.json`:

```json
{
  "id": "<same-id-as-pre>",
  "timestamp": "<ISO8601>",
  "post": {
    "outcome": "What actually happened",
    "counterfactuals": [
      {
        "alternative": "The rejected approach (copy from pre.rejected)",
        "prediction": "What would have happened if this had been chosen",
        "confidence": 0.7
      }
    ],
    "drift": null
  }
}
```

**Requirements:**
- One counterfactual entry per rejected alternative (ALL mandatory)
- `confidence`: 0.0 to 1.0 scale
- `drift`: set to `null` if outcome matches declared intention. Otherwise provide a DriftReport:

```json
{
  "drift": {
    "declared_intention": "From pre-declaration",
    "actual_outcome": "What actually happened",
    "divergence": "Where and how they diverged",
    "explanation": "Why the divergence occurred"
  }
}
```

## Exempt Operations

The following operations skip hook enforcement:
- Writes to `scratch/decision-forensics/` (meta-writes for records themselves)
- Bash commands containing `decision-forensics` or `scratch/decision-forensics` (script execution)

These exemptions prevent infinite loops where recording a decision requires a decision record.

## Audit

Every 5 decision records, the PostToolUse hook signals audit timing. Run:

```bash
bash $CLAUDE_PLUGIN_ROOT/scripts/audit.sh
```

The audit script provides structural analysis: record counts, pairing status, field completeness. For semantic analysis (contradiction detection, counterfactual plausibility), perform the following:

1. Read paired pre/post records from `scratch/decision-forensics/records/`
2. Check internal consistency: do chosen rationale and rejection rationales tell a coherent story?
3. Evaluate counterfactual predictions: are they specific and falsifiable?
4. Review drift reports: are divergence explanations plausible?
5. Assign credibility score per record (0.0-1.0)

See [references/analysis.md](references/analysis.md) for detailed audit procedures and scoring rubric.

## Report

蓄積されたDecision Recordを人間可読なMarkdown形式で出力する:

```bash
bash $CLAUDE_PLUGIN_ROOT/scripts/report.sh
```

report.shはpre/postペアを時系列で整形出力する。ユーザーに `decision-forensics report` や `レポートを見せて` と言われたら、このスクリプトの出力を取得し、必要に応じてLLMとして文脈の補足や要約を加えて提示する。

## Data Model

See [references/data-model.md](references/data-model.md) for complete type definitions including DecisionRecord, Alternative, Counterfactual, DriftReport, and IntentionAudit.

## Scripts

| Script | Purpose | Invocation |
|--------|---------|------------|
| `scripts/init.sh` | Initialize `scratch/decision-forensics/` and set `.active` flag | Manual (activation) |
| `scripts/pre-check.sh` | PreToolUse hook: validate pending declaration exists | Automatic (hook) |
| `scripts/post-record.sh` | PostToolUse hook: archive pre-record, prompt post-record | Automatic (hook) |
| `scripts/audit.sh` | Structural audit of decision record pairs | Manual / prompted |
| `scripts/report.sh` | 人間可読なMarkdownレポートを生成 | Manual |

## Reference Files

- **[references/data-model.md](references/data-model.md)** — Complete type definitions for all data structures
- **[references/analysis.md](references/analysis.md)** — Audit procedures, credibility scoring rubric, contradiction detection patterns
