# annenpolka/skills

Claude Code 用のスキルとプラグイン。

## Skills

| Name | Description |
|------|-------------|
| **codebase-investigator** | リポジトリの網羅的静的調査。アーキテクチャレビュー、技術的負債評価、オンボーディング |
| **constraint-as-output** | 成果物の代わりに制約セット（CaO）を生成。shape/invariants/deny/bounds で出力空間を定義 |
| **debug-mode** | 構造化されたprintf デバッグ。仮説生成→計装→ログ分析→verdict のワークフロー |
| **deep-research** | Web検索を活用した多層リサーチ。9層の因果構造フレームワークで表層から根本要因まで分析 |
| **emergent-engine** | 創発的LLM実行環境。allow/deny list で出力を制御し、入力に存在しない新規の跳躍のみを出力 |
| **godoku** | 誤読による創造的変形。入力テキストを構造的に誤読し、歪みの幾何学から新規の創造物を生成 |
| **hdd-loop** | Hallucination-Driven Design。未実装の道具を既に存在するものとして使わせ、批評・制約・現実化を反復して新しいアフォーダンスを発掘 |
| **kaisetsu** | Gemini 3.8 Flash による独立した技術解説・感想戦。自己完結HTMLでの読者向け再構成と説明ギャップの監査 |
| **preact-zero-mock** | Preact + HTM でゼロビルドWebモック。npm不要、ブラウザで直接開けるプロトタイプ |
| **sanitize-artifacts** | 生成成果物からプロンプト履歴・制作制約・修正痕跡を除去し、会話なしで成立する一貫した最終成果物へ再構成 |
| **spec-interview** | 仕様書インタビュー。AskUserQuestion で仕様を対話的に明確化・拡充 |
| **syntax-reference** | 文体DNA抽出・再現。12の構造層で文体をYAML符号化し、LLMによる高精度な文体模倣を実現 |
| **ui-exploration** | 基準画像と制御された複数案を比較し、人間の視覚判断でUIを反復改善 |

## Plugins

| Name | Description |
|------|-------------|
| **decision-forensics** | Ghost Protocol。行為は全て通過させ、git commit時にretrospective（反実仮想予測＋ドリフト検出）を強制。commitするなら振り返れ |

### decision-forensics の仕組み

```
edit, bash, write ...  → フリーパス（PostToolUse が action-log.jsonl に自動記録）
git commit             → PreToolUse が未振り返りアクションを検出 → DENY
retrospective を書く    → scratch/ への書き込みなので skip → 通る
git commit             → 未振り返り 0 件 → フリーパス
```

データは `scratch/decision-forensics/` に保存。`draftsnap ensure` で初期化。

## Install

```bash
claude /plugin install annenpolka/skills decision-forensics
```

スキル単体は `~/.claude/skills/` にコピーするか、このリポジトリをマーケットプレースとして登録:

```json
// ~/.claude/settings.json
{
  "extraKnownMarketplaces": {
    "annenpolka-skills": {
      "source": {
        "source": "github",
        "repo": "annenpolka/skills"
      }
    }
  }
}
```
