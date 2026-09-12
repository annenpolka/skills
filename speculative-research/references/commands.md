# CLI verb と状態

入口は3つ。すべて対象プロジェクトrootをcwdにして、skill内の絶対パスで呼ぶ。stdoutは常に単一JSON。失敗時は `exitCode 1`。

```bash
node <skill>/scripts/research.mjs <verb> [args] [--dir PATH]
node <skill>/scripts/research-artifacts.mjs <command> [flags]
node <skill>/scripts/research-evidence.mjs <command> [flags]
```

## research.mjs

| verb | 効果 |
|---|---|
| `init --profile FILE` | profile検証、pinned policyとhelper configを保存。既存台帳には `already_initialized` |
| `add FILE` | conceptと初期task群を追加。既存concept/task ID・重複質問は拒否 |
| `status` | 件数と状態の集計のみ。個別の質問は検索で取り出す |
| `query TEXT` | 保存済みtask/finding/reviewの検索。task listとfinding listは既定20件・新しい順、付随reviewは別扱い。解釈は「検索（query）と結果の読み方」 |
| `tick` | queued taskを1件claimして調査runを実行 |
| `continue ID` | `invalid_output` のblocked taskを同一session・同一snapshotで訂正 |
| `pause` / `resume` | provider起動を止める。pause中のclaim/continueは拒否 |
| `retry ID` / `unpark ID` | blocked→queued / parked→queued |
| `park ID REASON` / `reopen ID REASON` | queued/blockedを保留 / doneを再開。理由は必須 |
| `review FILE` | findingへのレビューを記録（`verdict`, `basisFindingIds` 必須） |
| `recover` | 死んだlockと中断runを復旧。生存ownerのlockは触れない |

`--dir PATH` で台帳場所を変えられる（既定 `.runtime/research`）。

## 検索（query）と結果の読み方

`status` は件数と状態だけを返し、個別の質問は返さない。質問・finding・reviewの実体は `query TEXT` で取り出す。結果が空でも、台帳が空である証明にはならない。`status` の件数と、検索語を変えた `query` を組み合わせて確認する。queryはread-onlyの取出しであり、保存済み記録を返すだけで、task状態・記録済みの親台帳review・既存の受入/採用判断を変更しない。doneのtaskや親review済みのfindingも返りうる。設計採用は親の別判断で、queryの取出し自体が新たな受入/採用を成立させるわけではなく、親台帳のreviewは反対provider（Devin↔DeepSeek）の成果物とは別物である。

### 一致規則

- 検索語と対象フィールドは前後の空白を除去し、ASCIIの `A`–`Z` だけを小文字化して比較する。通常検索はトークン分割やハイフン固有の処理を行わないsubstring一致。
- taskは `question` と所属conceptの `title` に一致する。
- findingは `statement`・`decisionImpact`・所属conceptの `title`・対応taskの `question`・各 `evidence.path` に一致する。
- 完全一致のtask IDはそのtaskと、そのtaskに属するfindingを返す。完全一致のfinding IDはそのfindingへ到達する。concept IDに専用の完全一致検索（IDによる配下task/findingのナビゲーション）はない。ID文字列はtitleなど検索可能なproseにsubstring一致しうるが、任意のconcept IDを指定してその配下のtaskが返ることは保証しない。
- 質問文やfinding IDを推測せず、`query` の結果に現れた実IDを使う。

### 件数と打切り

- 既定ではtask listとfinding listをそれぞれ新しい順に20件まで返す。`total` は一致総数、`truncated` は返却上限に達して取得が不完全なことを示す。
- `reviews` は返却されたfinding IDに対応する親台帳reviewだけを伴う。reviewはfindingと一緒にしか返らない。
- 追加のlimit flagはない。coreの `request.limit` は利用者向けflagとして公開されていない。

### 結果注釈の意味

- `requiresRevalidation` はquery envelopeと各返却findingに常に `true` で入る。findingが0件でも、出典hashが一致していても `true` のままで、`currentSourceStatus`・`currentSources` や記録済みreviewでは変わらない。これを `false` にする操作も存在しない。「未レビューだから」や「drift時だけ」と解釈しない。
- `currentSourceStatus`/`currentSources` は、finding出典パスの現在hashをsnapshot時と比較した結果（`matching`/`changed`/`missing`/`unavailable`）だけを表し、親の判断やreview状態を表さない。
- `epistemicStatus` と `reviews` は親台帳のreviewを反映する。反対provider（Devin↔DeepSeek）のpeer-review成果物は別物で、台帳のreviewへ自動では入らない。台帳のreviewが空でも、反対providerレビュー成果物が存在しない証明にはならない。
- `peerExport.status` が `completed` なのは、そのrunのpeer入力（packet/candidate）の出力が完了したことだけを意味する。反対providerレビューの完了・親の受入・設計採用を証明しない。

## add と親reviewの入力例

`add FILE` が受理する最小形:

```json
{
  "concept": {"id": "routing", "title": "Notebook routing", "premise": "Unadopted design", "scope": ["src/"]},
  "tasks": [
    {"id": "routing-q1", "question": "Can routing reuse this component?", "decisionIfTrue": "reuse", "decisionIfFalse": "investigate adapter", "kind": "constraint", "priority": 5}
  ]
}
```

`kind` は `constraint|counterexample|alternative|integration`、`priority` は1..5。scopeの各要素はpinned root内でなければならない。

親がfindingを記録する `review FILE` の最小形:

```json
{
  "findingId": "<queryで取得した実ID>",
  "verdict": "qualified",
  "note": "static evidence only; runtime unverified",
  "basisFindingIds": ["<実ID>"],
  "reviewer": "codex-parent"
}
```

`verdict` は `supported|refuted|qualified|superseded`。`basisFindingIds` は非空で既存finding IDのみ（`superseded` は別findingをbasisに要求）。finding IDはrun完了時に `<runId>-finding-N` として生成されるので推測せず、`query` で実際のIDを取得してから記入する。

これは台帳内の親reviewである。providerが書く反対providerレビューdraft（`research-artifacts review --packet --candidate --draft --out` の `reviews[]` / `peerReview.issues` / `sourceRefs`）とは別の成果物であり、相互に置き換えない。

## research-artifacts.mjs

| command | flags | 効果 |
|---|---|---|
| `research` | `--packet --draft --out` | source-ranges draftから正確な引用と `receipt.json` を生成 |
| `review` | `--packet --candidate --draft --out` | 反対providerレビュー成果物を生成 |
| `revise` | `--packet --candidate --review --draft --out` | レビューに束縛した改訂候補を生成 |
| `export-peer` | `--ledger --run --out [--include]` | 完了runのpeer packetを出力 |

`--out` は既存だと `output_exists`、凍結source内・ledger内（runのpeer以外）は拒否。`receipt.json` は最後に書かれ、途中失敗では消される。

## research-evidence.mjs

`quote` / `locate` / `review` の読み取り専用検査。packet/refs/review/candidateと凍結sourceだけを読み、書き込みもprovider起動もしない。

## runの状態

`preparing` → `launch_pending` → provider実行 → `collected` → 受入。receipt statusは `completed` / `failed` / `timed_out` / `permission_required` / `interrupted` / `invalid_output` / `source_changed`。`completed` はmodel・session・cleanup・snapshot不変・findings・checksを通過したものだけ。turn偶奇でprovider/modelが交互に決まる。
