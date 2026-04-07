---
name: circuit-breaker
description: |
  努力が負になる瞬間を検出し、回路を切るスキル。
  同一ファイルへの振動的編集（oscillation）、同一コマンドの反復（retry）、
  編集を伴わない検索の連鎖（spiral）を検出し、「STOP.」と出力する。
  助言しない。理由を述べない。切るだけ。
  This skill should be used when the user says "circuit-breaker", "回路を切って",
  "breaker on", "ブレーカー", "oscillation check", "churn detection",
  "circuit-breaker off", "ブレーカー停止".
  Also activated by init.sh to start monitoring work patterns.
---

# Circuit Breaker

努力は常に正ではない。回路を切る。

## What it detects

**oscillation** — 同一ファイルにEdit/Writeが閾値回以上（デフォルト: 8アクション中3回）。直して、戻して、直している。振動は仕事ではない。

**retry** — 同一/類似のBashコマンドが閾値回以上。同じことを試して同じ結果を得ている。

**spiral** — Grep/Globが閾値回以上連続し、その間にEdit/Writeがない。探しているが見つかっていない。探索が目的化している。

## What it does

パターンを検出したら、PostToolUseのsystemMessageで2行だけ出す:

```
STOP.
oscillation: parser.rs (4 edits in 8 actions)
```

理由は言わない。助言しない。回路を切るだけ。切った後に何をするかはユーザーが決める。

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
  "oscillation_threshold": 3,
  "retry_threshold": 3,
  "spiral_threshold": 5
}
```

- `window`: 直近何アクションを監視するか
- `oscillation_threshold`: 同一ファイルedit回数の閾値
- `retry_threshold`: 類似コマンド反復回数の閾値
- `spiral_threshold`: edit無し検索連続回数の閾値

## Storage

```
$PWD/scratch/circuit-breaker/
├── .active       # 有効フラグ
├── .config       # 閾値設定
├── .buffer.jsonl # ローリングバッファ（直近アクション、自動管理）
└── .trips.log    # 発火履歴
```

`scratch/` は draftsnap が管理する。`draftsnap ensure` で初期化すること。

## How it works internally

PostToolUseフックが全Write/Edit/Bash/Grep/Glob実行後に発火:
1. アクションをローリングバッファに追記
2. 直近window件のパターンを検査
3. 閾値超過 → `STOP.` + パターン名を出力
4. 超過なし → 無言で通過

ゼロ摩擦。パターンを踏むまで存在を感じない。踏んだ瞬間だけ現れて、切って、消える。
