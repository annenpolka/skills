---
name: constraint-as-output
description: |
  Constraint-as-Output (CaO): 成果物の代わりに制約セットを生成するスキル。
  コード、スキル、システム、エージェント指示、仕様書、プロットなど、あらゆる成果物を
  「それを一意に決定する制約セット」として出力する。
  Use when:
  (1) User says "制約で書いて", "CaO", "constraint set", "制約セットで"
  (2) User wants to define what something should be before building it
  (3) User needs agent-to-agent communication protocol design
  (4) User wants to extract constraints from existing output ("reverse CaO", "逆CaO")
  (5) Design phase of any system, skill, or agent where shape matters more than implementation
  Do NOT use for: direct implementation, analysis, debugging.
  CaO is TDD for LLM output. Write the test (constraints) first, generate later.
---

# Constraint-as-Output (CaO)

成果物を書くな。成果物を決定する制約を書け。

## Why

LLMへの指示は自然言語で書かれるため曖昧さを含む。CaOは指示をテスト可能な述語の集合に変換し、出力空間を明示的に定義する。

制約セットは成果物よりも短く、再利用可能で、検証可能。制約に違反した出力はリジェクトできる。

## Format

```yaml
cao:
  name: [制約対象の名前]
  shape:
    [出力の構造を型定義として記述]
  invariants:
    - [有効な出力が満たすべき条件]
  deny:
    - [有効な出力が満たしてはならない条件。invariantsに優先する]
  bounds:
    - [リソース制限: トークン数、行数、ファイル数、実行時間等]
  determination: [over | exact | under]
  free_dimensions:
    - [生成エージェントの裁量に委ねる次元を明示]
```

各フィールド:

- **shape**: 出力の骨格。型シグネチャに相当する
- **invariants**: 全ての有効な出力が満たす条件。テストのassert
- **deny**: 全ての有効な出力が違反しない条件。invariantsとの衝突時はdenyが勝つ
- **bounds**: 量的制限。行数、個数、時間等の上下限
- **determination**: 制約セットが出力空間をどの程度絞るか（後述）
- **free_dimensions**: 意図的に制約しない次元。省略ではなく明示的な宣言

## Determination（決定度）

- **over** — 制約が矛盾し有効な出力が存在しない。制約を削れ
- **exact** — 出力が一意に決まる。テンプレートと等価。自由度ゼロ
- **under** — 複数の有効な出力が存在する。生成エージェントに裁量がある

最も生産的なCaOは **under**。形は決めるが質感に自由度を残す。

## Workflow

### Forward CaO（制約→成果物）

1. ユーザーが「何を作りたいか」を述べる
2. 成果物を直接書かず、CaO formatで制約セットを出力する
3. ユーザーが制約セットをレビュー・修正する
4. 承認後、制約セットに基づいて成果物を生成する（別のターンで）

### Reverse CaO（成果物→制約）

1. ユーザーが既存の成果物を提示する
2. その成果物を再現するための最小制約セットを逆算する
3. 最小性テスト: 任意の1制約を削除して劣った出力が許容されるなら冗長→削除

## Writing Rules

1. **テスト可能性**: 各制約は第三者がpass/failで判定できること。「良い」「適切な」は制約ではない
2. **最小性**: 出力空間を変えない制約は削除する
3. **denyの優先**: denyとinvariantsが矛盾したらdenyが勝つ
4. **free_dimensionsの明示**: 省略ではなく意図的な宣言として書く
5. **述語化**: 形式的述語で書けるなら書く。ドメインが言語的（小説、仕様書）な場合、自然言語の制約は許容するが、テスト可能性は維持する

## Anti-patterns

- ❌ 制約を曖昧な形容詞で書く（「ユーザーフレンドリーであること」）
- ❌ determinationを省略する（意図せずoverやexactになるリスク）
- ❌ free_dimensionsを書かない（暗黙の自由度は事故の元）
- ❌ 制約セットの中に実装を混ぜる（shapeに具体コードを書く）
- ❌ 全ての側面を制約する（exactになり金太郎飴を生む）
- ❌ denyを書かない（denyの輪郭が形を決める。invariantsだけでは不十分）

---

## Examples

### コードモジュール

```yaml
cao:
  name: focus-state-machine
  shape:
    states: enum
    transitions: map<state, list<{to: state, condition: predicate}>>
    sensors: list<{name: string, type: type, sample_rate: duration}>
    output: {current_state: state, since: timestamp, confidence: float}
  invariants:
    - 状態遷移は決定的（同一入力に対して同一遷移）
    - 全ての状態から少なくとも1つの遷移が存在する（デッドステートなし）
    - sensor値の欠損時にクラッシュしない
  deny:
    - 通知の送信（モジュールの責務外）
    - ゲーミフィケーション要素
    - タイマーベースの強制遷移（sensor fusionのみで決定する）
  bounds:
    - states: ≤ 5
    - sensors: ≤ 4
    - module LOC: ≤ 300
  determination: under
  free_dimensions:
    - 具体的な状態名
    - sensor fusionのアルゴリズム
    - サンプリングレート
```

### Agent Skill設計

```yaml
cao:
  name: codebase-investigator
  shape:
    skill_root:
      SKILL.md: markdown
      references/: directory
    output_per_invocation:
      findings: list<{finding: string, confidence: float, evidence_path: string}>
      summary: string
  invariants:
    - SKILL.md単体で動作する
    - 未使用時のコンテキスト消費はfrontmatterのみ
    - 各subagentのファイルスコープは重複しない
    - findingはevidence_pathのファイル内容から演繹可能
    - confidenceはevidenceの直接性に比例する（推測 ≤ 0.5, 直接証拠 ≥ 0.8）
  deny:
    - CLAUDE.mdに直接記述する
    - subagent間で状態を共有する
    - findingに修正提案を含める（調査フェーズでは事実のみ）
  bounds:
    - SKILL.md: ≤ 200 lines
    - subagent output: ≤ 200 tokens each
  determination: under
  free_dimensions:
    - subagentへのファイル分配アルゴリズム
    - findingのマージ戦略
    - summaryの文体と粒度
```

### 物語構造

```yaml
cao:
  name: sf-novel
  shape:
    structure: single_novel
    characters: {total: int, pov: list<character_id>}
    scenes: list<{layer: string, characters: list, event: event}>
    ending: {type: string, resolution: null}
  invariants:
    - 主人公の認識変化は地の文で直接言語化されない
    - 読者は行動変化から推測するが確定できない
    - 物語内時間は21日以内
  deny:
    - 解決・救済・和解で終わること
    - 明確な悪役の存在
    - テーマの地の文での直接言語化
    - 感情の名指し（「悲しかった」）を主要な感情表現にすること
    - SF設定の説明的パラグラフ
  bounds:
    - characters: 5-9
    - pov: 2-3
    - chapters: 12-20
  determination: under
  free_dimensions:
    - 時代・地理的設定
    - 主人公が「知る」ものの内容（作者自身が未決定でよい）
    - 文体
    - タイトル
```

### Reverse CaO

既存の成果物から制約を逆算する。手順: (1) shapeを型として抽出 → (2) 守っているルールをinvariantsへ → (3) 避けていることをdenyへ → (4) 各制約を1つずつ外して最小性テスト

```yaml
cao:
  name: debug-mode（逆算）
  shape:
    workflow: ordered_list<phase>
    hypothesis: {id, cause, verify, verdict}
    verdict: "CONFIRMED" | "REJECTED" | "INCONCLUSIVE"
    log_entry: {h: string, l: string, v: any, ts: number}
  invariants:
    - fixの提案はCONFIRMEDな仮説に対してのみ
    - 仮説は最低3つ生成する
    - instrumentation除去はユーザーが修正を確認した後のみ
  deny:
    - ログ分析前のfix提案
    - 仮説1つだけでの調査開始
    - setTimeout/sleepによる「修正」
  bounds:
    - hypotheses: 3-5
    - instrumentation points: 3-8
  determination: under
  free_dimensions:
    - 具体的な仮説の内容
    - instrumentation挿入箇所の選択
    - ログ分析時のjqクエリ構成
```
