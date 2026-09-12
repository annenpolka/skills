# レビュー・改訂・復旧

## 反対providerレビュー

完了runのfindingは `unreviewed` のまま扱う。反対provider（Devin↔DeepSeek）に `export-peer` のpacketを渡し、`research-artifacts review` でレビュー成果物を取り込む。レビューはfinding IDの実在、verdict、basis findingの実在を検証する。`superseded` は別findingをbasisに要求する。レビューのrevision順序は単調でなければならない。

改訂は `research-artifacts revise` を使い、直前reviewをpacketとcandidate bytesへ束縛してから新candidateを作る。束縛が一致しないreviewから候補を生成しない。`previousIssues` はreviewerの記述のまま保持し、著者の `authorResponses` と分離する。改訂packetは `peerReview.round` を1つ進め、`reviewedArtifactSha256` を新candidateのhashへ更新し、`candidateDraft` に新candidateを持つ。元のpacket・candidate・draftsは変更しない。

rereviewは専用verbではない。改訂後の `packet.json` と `candidate.json` を入力に `research-artifacts review` をもう一度実行し、新しいreviewを改訂packetに記録された次の `peerReview.round` と新candidate bytesへ束縛する。`rereview` というaliasは存在せず、hash・round・その他の生成値はwriterが決めるので手で書き換えない。

親は意味・採用・未解決の不一致を判断する。反対providerの同意、引用の機械的一致、hashの一致、`receipt.json` の完了は、親の意味的受入や設計採用の証明ではない。人間が毎件の結果を承認する必要はないが、利用者の制約と実際の実装許可は保持する。

## review → revise → rereview の実例

既に供給されたpacket/candidate/draftsの材料化は、standaloneの `research-artifacts.mjs` だけで完結し、ledger init・profile・provider/helper設定・親台帳reviewを必要としない。各commandは新しい `--out` ディレクトリへ書き、既存ディレクトリは `output_exists` で拒否される。writerはproviderを起動しない。

第1回review（reviewer draftを材料化）:

```bash
node <skill>/scripts/research-artifacts.mjs review \
  --packet  .runtime/research/runs/<runId>/peer/packet.json \
  --candidate .runtime/research/runs/<runId>/peer/candidate.json \
  --draft   .runtime/research-artifacts/review-1.draft.json \
  --out     .runtime/research-artifacts/review-1
```

改訂（review-1/review.jsonを束縛し、author draftを材料化）:

```bash
node <skill>/scripts/research-artifacts.mjs revise \
  --packet  .runtime/research/runs/<runId>/peer/packet.json \
  --candidate .runtime/research/runs/<runId>/peer/candidate.json \
  --review  .runtime/research-artifacts/review-1/review.json \
  --draft   .runtime/research-artifacts/revision-1.draft.json \
  --out     .runtime/research-artifacts/revision-1
```

第2回review（rereview。改訂後のpacket.jsonとcandidate.jsonを入力に、rereviewer draftを材料化。この例は元packetがround 1なので新しいroundは2）:

```bash
node <skill>/scripts/research-artifacts.mjs review \
  --packet  .runtime/research-artifacts/revision-1/packet.json \
  --candidate .runtime/research-artifacts/revision-1/candidate.json \
  --draft   .runtime/research-artifacts/rereview-1.draft.json \
  --out     .runtime/research-artifacts/rereview-1
```

`--draft` はモデルが書いた意味フィールドとsource範囲だけを含む。`quote`・`sha256`・`line`、writerが生成するID（finding ID等）、`round`・`reviewedArtifactSha256`・`packetId`・`coverage.reviewedFindingIds` などの生成値はwriterが確定するので、draftやCLI引数で与えない。ただしreview draftの `peerReview.issues[].id`（例: `P1`）とrevision draftの `issueResponses[].id`（例: `P1`）は利用者が与えるissue識別子であり、`findingId`・`basisFindingIds` は既存findingへの必須参照で、draftに記入する。

## 成果物パス・receipt・remainingChecks

- `export-peer` は指定した `--out`（run統合時は `runs/<runId>/peer/`）に `packet.json`・`candidate.json`・`review-brief.txt`・`receipt.json` と `source/` を書く。
- `review` は `--out` に `review.json`・`source-refs.json`・`draft.json`・`receipt.json` を書く。最終の `peerReview.disposition` は `review.json` の `peerReview.disposition` にある。
- `revise` は `--out` に `candidate.json`・`packet.json`・`draft.json`・`source-refs.json`・`receipt.json` を書く。改訂roundと新candidate hashは `packet.json` の `peerReview` にある。
- 各 `receipt.json` はその操作の出力完了markerであり、意味的受入・設計採用の証明ではない。
- remainingChecksは系統ごとに別である。reviewerの `reviews[].remainingChecks`、reviewerの `coverage.unperformedChecks`、著者の改訂draftの `remainingChecks` を分けて報告する。著者の値は `revision-*/draft.json` に残り、`revise` のstdout要約だけを唯一の記録にしない。後続のreviewer resolutionで消えたものと扱わない。

## 材料化と親台帳reviewの区別

- `research-artifacts.mjs` の材料化は反対providerの成果物を生成するだけで、台帳へreviewを記録しない。
- 台帳の親reviewは `research.mjs review FILE` で別途記録する。反対provider成果物と親台帳reviewは相互に置き換えない。

## 継続（同一session訂正）

`invalid_output` のblocked taskだけ `continue TASK_ID` できる。元runの凍結snapshot・session ID・modelを再利用し、同じ台帳の `runs/` ツリー配下に新しいrunディレクトリを作る。新runは `continuedFromRunId` で元run系へリンクする（初回の継続は元runを指し、連鎖が元runへ遡る）。元runのreceipt・`acceptance-input.json`・凍結source bytesは変更しない。元の凍結bytesが1つでも変わっていればproviderを起動せず失敗する。訂正後のrunは新しいreceiptを持つ。session切替やmodel変更や同一runディレクトリの上書きはせず、`tick`/`retry` で代用しない。

## 停止・中断・cleanup

- providerは専用process groupとして起動する。cleanup未確認の完了は採用せず、`recovery-needed.json` のbarrierを立てる。
- barrierが存在する間、`tick`/`continue` は `recovery_requires_confirmed_helper_shutdown` で拒否する。
- 中断・timed_out・permission_requiredはfindingを残さない。taskはblockedになり、`retry` を待つ。
- 停止後の遅延応答で再開しない。停止は `pause` と `recover` の状態で表現する。

## 復旧

`recover` はowner PIDが生存していないlockだけを `abandoned-locks/` へ退避し、中断runを `interrupted` receiptで閉じる。owner生存または所有不明のlockは触らない。復旧後の台帳は通常のreply検証を通ってから採用する。

## 委譲時の注意

- 調査・レビューを外部modelへ委譲する場合も、認証値・個人台帳・生ログ・credentialsを送らない。
- 同じledgerのtickを重複起動しない。並列実行は隔離を実証するまで行わない。
- 委譲先の自己申告の成功ではなく、固定した受入と差分を親が確認する。

## 改善の委譲

研究者自身の改善も調査と同じ委譲境界に従う。

1. 実運用で観測した摩擦と、それを示す具体的な根拠を記録する。根拠のない改善は起動しない。
2. 委譲の前に、対象ファイル・変えない契約・固定した受入基準を含む境界を定めた改善を書く。
3. 著者providerへ実装・許可された検査・一次修正まで委譲し、変更ファイル・実行した検査・未解決点を返させる。
4. 反対provider（Devin↔DeepSeek）が独立にレビューし、具体的な指摘を元の著者sessionへ返す。著者は指摘を反映し、相手の再レビューが済むまで閉じない。
5. 親が意味・契約の保持・差分を独立に確認してから採用する。同意やhashの一致を採用の証明にしない。
6. 適用は研究者が停止し所有processのcleanup確認が取れた場合のみ行う。cleanup未確認のbarrierが残る間は適用しない。改善を毎tickで行う義務はなく、このworkflowは実装・scopeの許可を与えない。
