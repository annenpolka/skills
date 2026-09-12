---
name: speculative-research
description: 対象プロジェクトの構想を投機的に調査するskill。conceptの登録・検索、台帳のtick/継続、Devin/DeepSeekによる反対providerレビューと改訂、親の受入、停止・復旧・改善を扱う。
---

# Speculative Research

あるプロジェクトの構想を、証拠に基づく調査台帳へ蓄積する。主な読者は後続のassistantであり、人間が毎件の結果を承認することを前提にしない。ユーザーの制約と、実際に与えられた実装許可を保持する。このskillは他のrepoへ単独コピーして使える。

## 役割分担

- **script が強制するもの**: profile検証、pinned scope、隠し/認証/credential/env/シンボリックリンク/traversal拒否、台帳の世代・hash・lock、状態遷移、provider起動前のsnapshotとharness、引用の原バイト生成、receipt。判定・意味・scope・状態は同梱のMoonBitが所有し、NodeはIO・hash・読込だけを行う。
- **agent が行うもの**: どのconceptを立てるか、調査結果の意味判断、反対providerレビューの指名、親としての意味的受入・設計採用、未解決点の切り分け。反対providerの同意や引用/hashの機械的な一致は、親の意味的受入とは別に扱う。

## 操作の選択

- 最初にどの操作かを決め、その操作に必要な前提だけを適用する。台帳の登録・検索はledger CLI（`research.mjs`）、既に供給されたpacket/candidate/draftの材料化はstandaloneのartifact writer（`research-artifacts.mjs`）、実際のprovider実行・継続は設定済みprovider前提のrun/`continue`である。
- 供給済みファイルの材料化は、ledger init・profile・provider/helper設定を必要としない。`--out` へ新しい出力ディレクトリを指定する。
- provider実行・継続は、設定済みprofile（pinned policy・helper絶対パス）と利用可能なproviderを前提とする。
- 前提・versionの確認も操作制約に従い、禁止されたコマンドをversion確認のためだけに実行しない。操作に不要なprerequisite probeを足さず、通常利用に一律のgit禁止を課さない。

## 前提

以下は、選択した操作が台帳CLIの登録・検索またはprovider実行・継続を必要とするときの前提である。既に供給されたpacket/candidate/draftの材料化だけを行う場合は Node 24+ とプロジェクトrootのcwdを使い、profile・helper・provider設定・init は要求しない。

- 通常時の前提は、Node 24+、PATH上の `git`（snapshot provenance用）、Devin Python helper用の `python3`、そして別途install済みの **devin-delegate** / **opencode-delegate** helperとそのCLI。MoonBit compiler・package install・再ビルドは不要。追加platform・providerを要求しない。
- profileには、既にinstall済みの **devin-delegate**（Python helper）と **opencode-delegate**（Node helper）の絶対パスを指定する。このskillはhelperを同梱せず、認証・設定をコピーしない。
- `init --profile` は台帳を新規作成するときだけ行う。プロジェクト名・許可root・helper絶対パスを台帳へ固定する。以後の命令は外部profileを読まず、固定値でscope判定する。profile変更でscopeは広がらない。既存台帳の登録・検索や、供給済みファイルの材料化で `init` を再実行しない。
- この版が対応するprovider/modelは **Devin `swe-2-max`/`ask`** と **OpenCode Go `opencode-go/deepseek-v4.1-flash`/`plan`/`pure`** のみ。別アカウント・別model・自動fallbackはない。
- 作業ディレクトリは対象プロジェクトroot。scriptはskill内の絶対パスで呼ぶ。

```bash
# 台帳を新規作成するときだけ
cd /path/to/project
node /path/to/skill/scripts/research.mjs init --profile profile.json
```

profile形式とhelper前提は [references/profile.md](references/profile.md)。全verb・出力・状態遷移は [references/commands.md](references/commands.md)。packet/draft/review/reviseの最小形とreceipt/coverageの意味は [references/artifacts.md](references/artifacts.md)。レビュー/改訂/復旧は [references/review-recovery.md](references/review-recovery.md)。由来・hash・保守は [references/provenance.md](references/provenance.md)。

## 基本フロー

1. 構想を受け取り、対象scope内の質問を `add` で登録する。scopeは固定root内に限る。
2. `tick` でqueued taskを1件claimする。runはsnapshot→brief→provider helper→結果harness→receiptの順に進む。出力は台帳へ未レビューとして取り込むまで確定しない。
3. 個別のtask/findingと、findingに紐づくreceipt/provenanceは `query` で取り出す。`status` は件数・状態の集計に留まる。出典はsnapshot限りで、現行ソースとの差は `currentSourceStatus` として再検証を要求する。
4. 反対providerのレビュー成果物は `research-artifacts` の `review`/`revise` で材料化し、必要なら `research.mjs review` で親台帳reviewとして別途記録する。親が意味を確認して採用を決める。
5. `reopen` はdone taskを再調査する操作で、revise/rereviewの材料化には不要。問題時は `pause`、死んだlockや中断runは `recover`。理由・未確認は削らない。

## 検索と結果の解釈

- `status` は件数と状態の集計のみを返し、個別の質問は返さない。実際の質問・finding・reviewは `query` で取り出し、空の結果を台帳が空である証明にしない。
- 検索は前後空白の除去とASCII大文字の小文字化だけを行うsubstring一致。task/findingの実IDは完全一致の入口になるが、concept IDに専用の完全一致検索はない。
- `query` は既定でtask listとfinding listをそれぞれ新しい順に20件まで返す。これに対し、返却findingに付随する親台帳reviewは上限や順序の対象外で区別される。`total` は一致総数、`truncated` は取得が不完全であることを示し、追加のlimit flagはない。
- queued task・finding・設計採用は別段階。`requiresRevalidation` は常にtrueで、出典hashやreviewでは消えない。出典hash比較・親台帳review・反対provider成果物は別に扱い、`peerExport` の完了はpacket/candidateの出力だけを示す。詳細は [references/commands.md](references/commands.md)。

## 連続運用

- 連続調査は `tick` をホスト環境のschedulerまたは既存heartbeatへ接続して行う。このreleaseはschedulerや固定のautomation IDを作らない。重複起動は既存heartbeatの更新で避ける。
- 同一ledgerのtickは同時に1つだけ。並列tickの隔離が実証されるまで直列に呼ぶ。
- 進行中の調査器を編集・再ビルドしない。停止・再開は `pause`/`resume`/`recover` で表現する。

## 改善

改善は実運用で観測した摩擦と具体的な根拠から始め、委譲の前に境界を定めた改善と固定した受入基準を決める。著者作業→反対providerレビュー→元sessionでの訂正→相手の再レビュー→親の意味確認の順に進め、研究者の停止と所有processのcleanup確認が取れたときだけ適用する。改善を毎tickで行う義務はなく、このworkflowは実装・scopeの許可やscheduler・全体frameworkを作らない。手順は [references/review-recovery.md](references/review-recovery.md)。

## 厳守事項

- 外部profileの変更で既存台帳のscopeを広げない。台帳のpinned policyが唯一の正本。
- 隠し・認証・credential・env path、traversal、root外、シンボリックリンクは拒否される。証拠はconcept scopeと凍結manifestの内側のみ。
- 子質問は親scopeを継承するだけで拡張できない。frozen snapshotの外へ問いを広げない。
- provider helperは凍結snapshotをcwdとし、許可操作を絞って起動する（Devinは `ask`、DeepSeekは `plan`/`pure` とread限定）。このcwdとmodeはOS隔離ではない。成功してもcleanup未確認なら採用せず、停止後の応答で再開しない。
- 生ログ・認証情報・個人台帳をこのskillや配布物へ含めない。通常利用で再ビルドしない。
- 形式検証や検査成功を、実providerの品質や人間の意図の充足と混同しない。
