# claude-code-delegate evaluation

fresh な実行主体（opencode サブエージェント、ラウンドごとに新規）が `claude-code-delegate` を読み、
**実際の `claude -p` 委譲**を実行した。親は成果物・テスト・ファイルハッシュを独立に検証し、
自己申告の unclear point を「スキル欠陥 / チェックリスト起因 / ハーネス起因 / 評価設計起因」に裁定した。
対象は委譲プロトコル（成功判定・権限・resume・証拠保存）であり、モデル品質やコスト比較ではない。

| Round | Candidate | A | B | C | 新規スキル欠陥 | Consecutive clear |
|---|---|---|---|---|---|---|
| iter1 | v1 | ○ 100% | ○ 100% | ○ 100% | 5 | 0 |
| iter2 | v2 | ○ 100% | — | ○ 100% | 4 | 0 |
| iter3 | v3 | ○ 100% | ○ 100% | ○ 100% | 3 | 0 |
| iter4 | v4 | ○ 100% | ○ 100% | ○ 100% | 2 | 0 |
| iter5 | v5 | ○ 100% | ○ 100% | ○ 100% | 0 | 1 |
| iter6 | v5 | ○ 100% | ○ 100% | ○ 100% | 5 | 0 (reset) |
| iter7 | v6 | ○ 100% | ○ 100% | ○ 100% | 4 | 0 |
| iter8 | v7 | ○ 100% | ○ 100% | ○ 100% | 2 | 0 |
| iter9 | v8 | ○ 100% | ○ 100% | ○ 100% | 0 | 1 |
| iter10 | v8 | ○ 100% | ○ 100% | ○ 100% | 3 | 0 |
| iter11 | v8 | ○ 100% | ○ 100% | ○ 100% | 1 | 0 |
| iter12 | v9 | ○ 100% | ○ 100% | ○ 100% | 1 | 0 |
| iter13 | v9 | ○ 100% | ○ 100% | ○ 100% | 2 | 0 |
| iter14 | v10 | ○ 100% | ○ 100% | ○ 100% | 1 | 0 |
| iter15 | v10 | ○ 100% | ○ 100% | ○ 100% | 0 | 1 |
| iter16 | v11 | ○ 100% | ○ 100% | ○ 100% | 0 | 1 |
| iter17 | v11 | ○ 100% | ○ 100% | ○ 100% | 0 | 2 |
| iter18 | v11 | ○ 100% | ○ 100% | ○ 100% | 0 | 3 |
| holdout H | v11 | — | — | — | 0 | holdout 5/5 ○ |

要件チェックリストは各ラウンド開始前に固定し（[scenarios.json](scenarios.json)）、ラウンド後も変更していない。
3連続クリア（iter16–18）と未使用シナリオ（holdout: SIGTERM→同一セッション resume）の 5/5 で収束とした。

**主要な発見（v11 までに修正済み）**:
- **実効権限モードの欠陥（重大）**: ユーザー設定 `permissions.defaultMode="auto"` の環境で `--safe-mode` かつ
  `--permission-mode` 未指定の run は `system/init` に `auto` を報告し、auto 対応モデルでは編集が無言で
  自動承認された（明示 `--permission-mode default` では拒否）。スキルは毎回モードを明示し `system/init` を
  検証する形へ変更（validation.json p17–p19）。
- read-only 委譲の証拠所有（executor 側 allowlist か caller 側 rerun かを事前に決める）、非破壊コマンド形（`-B`）と
  no-change 述語のスコープ、baseline 依存の主張は caller が所有し閉じ方に abstention 行を要求、resume 時の
  ロード境界フラグ再指定、出力形式は「レポートが何を述べる必要があるか」で選ぶ、等。
- 台帳: [failure-patterns.json](failure-patterns.json) に 33 パターン、非阻害観察 12 件を記録。

**制約**:
- ハーネスが canonical な Task 使用量（tool_uses / duration_ms）を公開しないため、厳密な数値収束は未検証。
- チェックリストは実行主体に提示されるため、項目によってはスキルを読まずに充足しうる（定性シグナルを主とした）。
- フィクスチャは小規模（1モジュール + テスト）で、スキルの操作を測るものであり大規模開発の品質ではない。
- ハーネスの sanity run が一部ワークスペースに `__pycache__` を残した（iter18-B / iterH）。executor の baseline に
  含まれ、委譲による変更ではない（results.json に注記）。
- 既知の編集上の残件: Prepare の file-creation 規則は3ラウンドの加筆で冗長な文になっている（意味は正しいが
  読みにくい）。収束後の凍結を優先して v11 のまま出荷し、hash は package-manifest.json に記録した。
- 生ログ・実行主体のセッション・認証情報は配布しない。

- [判定と制限](results.json)
- [固定シナリオ](scenarios.json)
- [失敗パターン台帳](failure-patterns.json)
- [配布した skill の hash](package-manifest.json)
