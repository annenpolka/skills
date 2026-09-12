# speculative-research evaluation

DeepSeekの新規sessionが固定シナリオを実行し、Devinがレビューした後、親が成果物と重要な境界を確認した。主な対象は構想登録・引用を含む改訂成果物の生成・同sessionでの訂正。

| Round | Classification | A | B | C | H | Consecutive clear |
|---|---|---|---|---|---|---|
| iter1 | diagnostic_confounded | ○ 100% | ○ 100% | ○ 100% | — | 0 |
| clean1 | valid_baseline | ○ 100% | ○ 100% | ○ 100% | — | 0 |
| clean2 | valid_improvement_with_unresolved_gaps | ○ 100% | ○ 90% | ○ 100% | — | 0 |
| clean3 | qualitative_clear_with_nonblocking_observations | ○ 100% | ○ 100% | ○ 100% | — | 1 |
| clean4 | qualitative_clear | ○ 100% | ○ 100% | ○ 100% | — | 2 |
| clean5 | qualitative_clear | ○ 100% | ○ 100% | ○ 100% | — | 3 |
| holdout | holdout_passed | — | — | — | ○ 100% | 3 |

3回の連続した定性的な確認と未使用ケースを通過した。標準Taskの実行回数・所要時間は取得できないため、数値指標による厳密な収束は未検証。初回の環境上の問題と不採用の推測も記録に残す。

判定項目は実行前に固定し、各ケース5項目（うち必須2項目）。必須がすべて満たされた場合だけ○、達成率は全項目の充足率。質問文・critical指定を修正に合わせて変更していない。

自己申告の迷い・改善希望と、親が根拠から認めた指示上の欠陥を区別した。利用者の追加指示に従い、影響を確認した無害なversion確認などは非阻害と判定し、元の実行記録と逸脱の分類は保持した。

引用・receipt・原本保存・run/session対応は実CLIで照合した。内側のprovider応答とレビューdraftは合成fixtureで、実providerの調査品質や実際の設計採用を示さない。

- [判定と制限](results.json)
- [固定シナリオ](scenarios.json)
- [失敗パターン](failure-patterns.json)
- [配布したskillのhash](package-manifest.json)

Providerの生ログ・私有台帳・認証情報は配布しない。
