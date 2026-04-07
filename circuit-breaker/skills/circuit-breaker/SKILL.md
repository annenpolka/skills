---
name: circuit-breaker
description: |
  努力が負になる瞬間を検出し、回路を切るスキル。
  時間減衰つきスコアリングで4パターンを監視:
  oscillation（同一ファイル振動）、retry（コマンド反復）、
  spiral（検索の空転）、scope_creep（触るファイルの拡大）。
  閾値を超えたら「STOP.」と出力する。助言しない。切るだけ。
  This skill should be used when the user says "circuit-breaker", "回路を切って",
  "breaker on", "ブレーカー", "oscillation check", "churn detection",
  "circuit-breaker off", "ブレーカー停止".
---

# Circuit Breaker

努力は常に正ではない。回路を切る。

## Patterns

**oscillation** — 同一ファイルにEdit/Writeが集中。時間減衰つきで、短時間に集中するほどスコアが高い。2時間前の3回と30秒前の3回を区別する。

**retry** — Bashコマンドの正規化後の一致。環境変数除去・パスbasename化・リダイレクト除去・空白正規化を施し、意味的に同一のコマンドを検出する。

**spiral** — Grep/Globが連続しEdit/Writeを挟まない。探しているが見つかっていない。探索が目的化している。

**scope_creep** — ウィンドウの前半と後半で触るファイル数が増加している。問題の把握が追いついていない。

## Scoring

各パターンは0.0-1.0の累積スコアを持つ。スコアは**時間減衰**する（指数減衰、半減期 = ウィンドウの半分に相当する秒数）。

スコアが0.6を超えたパターンが1つでもあればtripする。trip後、出力は2行:

```
STOP.
oscillation: parser.rs (2.45 heat)
```

**tripはブロックしない。** 通知のみ。回路を切るのは人間。

## Architecture

```
detect.sh (entry point, bash)
├── stdin → skip判定
├── バッファ追記 + truncate
└── jq -s -f score.jq .buffer.jsonl
    ├── oscillation_score (時間減衰 × ファイル集中度)
    ├── retry_score (正規化 × 時間減衰 × クラスタサイズ)
    ├── spiral_score (連続検索 × 時間減衰)
    ├── scope_creep_score (ファイル数の前半/後半比較)
    └── max(scores) ≥ 0.6 → trip
```

score.jqが全計算を担う。パターン追加はjqの関数追加のみ。

## Activation / Deactivation

```bash
draftsnap ensure && bash $CLAUDE_PLUGIN_ROOT/scripts/init.sh
```

```bash
rm scratch/circuit-breaker/.active
```

## Configuration

`scratch/circuit-breaker/.config`:

```json
{
  "window": 8,
  "trip_threshold": 0.6,
  "oscillation_threshold": 3,
  "retry_threshold": 3,
  "spiral_threshold": 5
}
```

現時点ではscore.jq内にデフォルト値がハードコードされている。.configの動的読み込みはfree dimension。

## Storage

```
$PWD/scratch/circuit-breaker/
├── .active        # 有効フラグ
├── .config        # 閾値設定
├── .buffer.jsonl  # ローリングバッファ (≤30 entries, auto-truncated)
└── .trips.log     # 発火履歴 (append-only)
```

`scratch/` は draftsnap が管理する。`draftsnap ensure` で初期化すること。
