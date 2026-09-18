# Question Forge v0.1 — 設計パッケージ

255個の型付き質問をJevへ展開し、目的に向けて意味・前提・反例・代替案を探索するSkillの設計案。

## 内容

| ファイル | 用途 |
|---|---|
| `DESIGN.md` | 全体構想、事実と設計提案、アーキテクチャ、255問の配分、実行、検証、実装順 |
| `SKILL.md` | 作業エージェント向けのSkill手順の叩き台 |
| `references/contracts.md` | 入力、probe、観測、relation、provider、budgetの内部契約案 |
| `references/probe-operators.md` | 17の質問展開操作と、255問生成用の指示 |
| `examples/cache-refresh.md` | 架空のキャッシュ仕様による12問のfixture解説 |
| `examples/cache-refresh.request.json` | TypeSafe direct API形式の未実行入力例 |
| `examples/cache-refresh.probes.json` | 質問と判断・出典・使い道を結ぶmetadata例 |
| `examples/cache-refresh.probeset.json` | 上の2ファイルをruntime入力形式にした12問のfixture |
| `scripts/qforge.py` | runtime（check / plan / inspect / send / ingest / normalize / report） |
| `references/runtime.md` | probeset形式とruntimeコマンド |
| `tests/` | runtimeのunit test（`python3 -m unittest tests/test_qforge.py`）と記録済みJev応答 |

## 最初に読む場所

DESIGN.mdの1、3、6、8、9、15節で、目的、255問の作り方、一斉展開と適応探索、次の一手、初版の範囲を掴める。実装へ渡す場合はcontractsも読む。

## 状態

Phase 0のruntime（`scripts/qforge.py`）を同梱する。TypeSafe direct経路で12問fixtureの送信・検査・記録を2026-09-18に一度実行した（1 request、観測3,282 input tokens）。255問の実タスクでの有用性、既存qlintとの互換性、Cloudflare経路は未検証。付属例は架空入力で、実在するシステムの評価ではない。`tests/fixtures/` の応答はそのfixtureに対する実際のJev応答の記録である。

APIキーは `TYPESAFE_API_KEY` またはmacOS Keychainの `typesafe-api` から読む。資料とJSON例を読むだけでは課金は発生しないが、例をAPIへ送れば課金対象になる。

本パッケージは既存リポジトリへ自動配置していない。AGENTS.md、フック、認可設定を変更する手順も含めていない。

## 主要な設計判断

初版はSkill主体とし、runtimeを型・projection・batch・接続・記録に絞る。saturate-255を標準、adaptive-255を比較対象とする。確率と証拠、情報不足と否定、提案と承認を分ける。問いの目的は良い数字を出すことではなく、設計・調査・検証の次の一手を変えることである。
