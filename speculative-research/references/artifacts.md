# 成果物フォーマット（最小）

writerはモデルが書いた意味フィールドと厳密なsource範囲だけを受け取り、`quote`・`sha256`・`line`、writerが生成するID（finding ID等）、`round`・`reviewedArtifactSha256`・`packetId`・`coverage.reviewedFindingIds` などの生成値は自分で確定する。これらwriter生成namespaceの値を入力へ書くと拒否される。一方、review draftの `peerReview.issues[].id`（例: `P1`）とrevision draftの `issueResponses[].id`（例: `P1`）は利用者が与えるissue識別子であり、`findingId`・`basisFindingIds` は既存findingへの必須参照である。これらは生成値ではないのでdraftに記入する。

## packet（凍結source）

```json
{
  "packetId": "<runId>",
  "frozenSourceRoot": "/absolute/snapshot/dir",
  "allowedSourceFiles": [{"path": "docs/hook.mbt", "sha256": "<64hex>"}],
  "selectedFindings": [{"findingId": "f1", "statement": "...", "evidence": [{"path": "docs/hook.mbt", "quote": "..."}]}],
  "tasks": [{"taskId": "q1"}],
  "peerReview": {"round": 1, "reviewedArtifactSha256": "<candidate bytes sha>", "candidateDraft": {}, "previousIssues": []}
}
```

`allowedSourceFiles` の全pathを読んでhash照合してから引用を生成する。drift・欠落・余分は失敗する。

## research draft（`research --packet --draft --out`）

```json
{"format": "source-ranges-v1",
 "findings": [{"statement": "...", "kind": "source|inference",
   "evidenceRefs": [{"path": "docs/hook.mbt", "fromLine": 1, "toLine": 1}],
   "limitations": ["static"], "decisionImpact": "..."}],
 "nextQuestions": [{"question": "...", "decisionIfTrue": "...", "decisionIfFalse": "...", "kind": "constraint|counterexample|alternative|integration", "priority": 1}]}
```

`fromLine`/`toLine` は1始まりの包含範囲。出力は `result.json`（正規化したfinding）・`source-refs.json`（区間とhash）・`draft.json`・`receipt.json`。

## review draft（`review --packet --candidate --draft --out`）

```json
{"reviews": [{"findingId": "f1", "verdict": "supported|qualified|refuted|unresolved", "note": "...",
   "basisFindingIds": ["f1"], "sourceRefs": [{"path": "docs/hook.mbt", "fromLine": 1, "toLine": 1, "kind": "support|scope_limit|counterexample"}],
   "remainingChecks": []}],
 "questionActions": [], "infrastructureObservations": [],
 "coverage": {"unreadSources": ["docs/hook.mbt"], "unperformedChecks": ["reason"]},
 "peerReview": {"disposition": "no_open_issues|changes_requested|disputed|incomplete",
   "issues": [{"id": "P1", "findingId": "f1", "state": "open|resolved|disputed", "note": "..."}]}}
```

`coverage.unreadSources` は `allowedSourceFiles` の完全一致pathのみ。未読の理由は `unperformedChecks` へ書く。出力は `review.json`・`source-refs.json`・`draft.json`・`receipt.json`。reviewerは `packet.peerReview.previousIssues` の全idを現状態で保持する。

## revision draft（`revise --packet --candidate --review --draft --out`）

```json
{"findingPatches": [{"findingId": "f1", "statement": "...", "limitations": ["static"], "decisionImpact": "..."}],
 "issueResponses": [{"id": "P1", "state": "resolved|disputed", "note": "..."}],
 "remainingChecks": []}
```

全 `previousIssues` idへ1回ずつ応答する。出力 `candidate.json`・`packet.json`（round+1、`previousIssues` は元reviewのまま、`authorResponses` を併記、`reviewedArtifactSha256` は新candidate hash）・`source-refs.json`・`draft.json`・`receipt.json`。元candidate fileは変更しない。

## receiptとcoverageの意味

- `receipt.json` は `files:[{path, sha256, bytes}]` を持ち、各hashは**公開した実bytes**のもの。最後に排他的に書かれ、途中失敗では作られたreceiptだけ削除される。成功markerの存在は意味採否とは無関係。
- `revise` のstdoutの `receipt` は `null` のことがあるが、成功した公開では `<out>/receipt.json` が最後に書かれるので、stdoutのreceiptフィールドではなく出力ディレクトリの `receipt.json` を完了証跡として読み、そのhash・file記録を実際の出力bytesと照合する。
- `coverage.reviewedFindingIds` はwriterが導出し、reviewerは指定できない。未レビューは `unreviewedFindingIds` に入る。
- 引用の機械的一致、hashの一致、反対providerの同意は、親の意味的受入・設計採用とは別である。

## ハンドオフの結合とremainingChecks

- `revise` の出力 `packet.json` は `peerReview.round` を1つ進め、`reviewedArtifactSha256` を新candidate hash、`candidateDraft` を新candidate、`previousIssues` を束縛したreviewのissuesのまま、`authorResponses` を著者の応答として持つ。改訂後の `candidate.json` と組で次の `review`（rereview）に渡す。
- 元のpacket・candidate・draftsは変更しない。reviewerの記述と著者の応答は別フィールドで保持し、解決の判断は著者応答の自己申告だけに依存しない。
- remainingChecksは系統ごとに別である。reviewerの `reviews[].remainingChecks`、reviewerの `coverage.unperformedChecks`、著者の改訂draftの `remainingChecks`（`revision-*/draft.json` に残る）を分けて報告し、後続reviewで消えたとみなさない。
- 各操作の `receipt.json` は出力完了のmarkerであり、意味的受入・設計採用の証明ではない。
