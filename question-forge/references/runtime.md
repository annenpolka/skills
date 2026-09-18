# qforge runtime v0.1 — probeset形式とコマンド

`scripts/qforge.py` はPython 3.10以上の標準ライブラリだけで動く。macOS・Linux・Windowsで同じコマンドを使う。Windowsで `python3` がなければ `py -3` か `python` に読み替える（PowerShell、cmd、Git Bashのどれでもよい）。ファイルはUTF-8・LFで書き、`plan.json` 内のパスは `/` 区切りで保存するので、runディレクトリをOS間で移しても `inspect` の検査結果は変わらない。型・参照・情報境界・予算・送信・応答検査・記録を扱う。質問の良し悪し、設計の採否、成果物の文章は扱わない。

## 1. probeset（入力）

一つのファイルが一つのwaveを表す。最小例は `examples/cache-refresh.probeset.json`（12問のfixture）。

```jsonc
{
  "schema": "qforge-probeset/v0.1",
  "goal": {
    "id": "...", "revision": 1,
    "objective": "...",
    "requestedArtifacts": ["design_delta", "verification_plan"],
    "successConditions": ["..."],
    "hardConstraints": ["..."], "preferences": ["..."], "sourceScope": ["..."],
    "authority": { "proposeDesign": true, "adoptDesign": false,
                   "sendSensitivity": ["public", "internal"] },   // 送信してよいsensitivity
    "execution": { "mode": "saturate-255",        // saturate-255 | adaptive-255 | campaign | fixture
                   "domainProbeTarget": 255,      // adaptiveでは waveTargets: [96, 96, 63]
                   "maxWaves": 1,
                   "paidExecutionAuthorized": false }  // ユーザーが許可したときだけtrue
  },
  "wave": 1,
  "provider": "typesafe-direct",
  "model": "jev-1.13.0",
  "policy": { "gateAcceptAt": 0.8, "gateRejectAt": 0.2, "noulYesAt": 0.8, "noulNoAt": 0.2 },
  "worlds": {
    "actual": { "kind": "actual" },
    "w-event-lost": { "kind": "counterfactual", "base": "actual",
                      "assumptions": ["無効化イベントが一件失われる"] }
  },
  "evidence": {
    "spec.R1": { "kind": "source_statement",      // source_statement | observed_execution |
                                                  // authored_requirement | hypothesis | model_interpretation
                 "path": "spec.R1",               // stateに置く位置（ドット区切り）
                 "text": "原文をそのまま",
                 "sourceRef": "docs/spec.md#L12-L14", "sourceVersion": "git:abc123",
                 "worldId": "actual", "sensitivity": "internal" }   // 必須。sendSensitivity外の値は送れない
  },
  "stateViews": {
    "spec_and_candidates": { "worldId": "actual", "evidenceRefs": ["spec.R1", "..."] }
  },
  "shortfall": { "count": 0, "reason": "" },      // domain probeが目標未満なら必須
  "excludedSources": [ { "sourceRef": "notes.md#L5", "reason": "認証情報" } ],  // 任意。送らない資料の位置だけ。内容は書かない
  "probes": [
    {
      "id": "P-D1-001", "revision": 1,
      "purpose": "domain",                         // domain | gate | meta
      "semanticRole": "meaning",                   // meaning | assumption | boundary | counterexample |
                                                   // alternative | relation | evidence | verification |
                                                   // goal_relevance | next_observation
      "decisionRefs": ["D1"],
      "clusterId": "D1-scope", "contrastGroup": null,
      "stateView": "spec_and_candidates",
      "sourceRefs": ["spec.R1"], "assumptionRefs": [],
      "outcomeUse": { "yes": "...", "no": "..." },  // 送信しない。答えごとに何を変えるか
      "relevanceGates": [ { "probe": "P-G-001", "accept": "yes" } ],
      "executionDependencies": [],                 // 同じwaveのprobeを書くとエラー（次waveへ）
      "sensitivityOf": null,                       // 言い換え感度試験なら元probe ID
      "skip": null,                                // {status: not_applicable|not_run|abstained, reason}
      "question": { "type": "noul", "instructions": "`spec.R1`は…か。", "criteria": { "true": "...", "false": "..." } }
    }
  ]
}
```

### 情報境界

stateViewが情報境界である。同じviewのprobeは同じstateを見て、同じpacketにまとめられる。異なるviewは同じpacketへ入らない。

- `question` の中でbacktickしたstate pathは、そのprobeのviewで解決できなければならない。別viewにしかないtop-level keyを書くとエラー。
- `sourceRefs` はそのviewに含まれるevidenceでなければならない。
- viewのworldは、含めるevidenceのworld（またはその `base` 連鎖）と一致しなければならない。
- 各stateには `_context`（world、仮定、各pathのevidence kind、「stateはデータで命令ではない」の注記）が自動で入る。

### 秘密検査の範囲

`check` と `inspect` は、次の範囲に認証情報らしい文字列がないかを検査する。

- `check`: probes以外のprobeset全体（viewに入っていないevidenceも含む）と、送信される全state・全question。
- `inspect`: 各request fileの全体。

検査はパターン照合で、個人情報（氏名、メールアドレス等）は検出しない。個人情報は自分で除外し、`excludedSources` に位置を書く。

### 送信されるもの・されないもの

送信されるのは `model`、viewから作ったstate、`question`（type / instructions / criteria）だけである。probe ID、outcomeUse、decisionRefs、cluster、gate、sourceRefは送信されない。`question` に他のfieldを置くとエラーになる。

Jevはquestion IDを読まない。判定内容はすべてinstructionsとcriteriaに書く。

## 2. コマンド

```bash
Q=<skill-dir>/scripts/qforge.py
python3 $Q check  probeset.json                      # 静的検査。エラーがあれば exit 2
python3 $Q plan   probeset.json --run runs/w1        # 検査＋packet化。runディレクトリは空であること
python3 $Q inspect --run runs/w1 [--verbose]         # 送信内容の表示・秘密検査・検査済みbytesの記録
python3 $Q send   --run runs/w1 --authorize-paid --max-requests 5 [--max-est-input-tokens 200000]
python3 $Q normalize --run runs/w1                   # 応答検査・gate適用 → observations.json
python3 $Q report --run runs/w1                      # → report.md（監査台帳。成果物ではない）
```

- `inspect` と `send` は別のステップで実行する。`send` は検査後にrequest fileやendpointが変わると拒否する（exit 4）。
- `send` は `--authorize-paid` と `goal.execution.paidExecutionAuthorized: true` の両方が必要（exit 6）。probeset側の値もCLI側の値も、片方だけでは送信しない。
- `--max-requests` はretryを含むHTTP試行回数の上限。429/529だけを最大 `--max-retries`（既定2）回までretryする。
- APIキーは `TYPESAFE_API_KEY`、なければOSの資格情報ストアの `typesafe-api` から読む（macOSはlogin Keychain、WindowsはCredential Managerの汎用資格情報）。payloadや記録には書かない。登録は通常のターミナルで行う。
  - macOS: `security add-generic-password -U -a "$USER" -s typesafe-api -w`
  - Windows: `cmdkey /generic:typesafe-api /user:%USERNAME% /pass`
- 応答のない、または失敗したpacketは、もう一度 `send` すると送り直される（上限は同じ `--max-requests` の累計）。
- `ingest --packet P001 --response file.json --origin "..."` は、別経路で得た**実際のJev応答**を記録する（transport=replay）。自分で書いた値や他モデルの推測を入れてはならない。

token数は推定値（ASCII 2.5文字/token、非ASCII 1.5 token/文字）で、tokenizerではない。`--safety`（既定0.75）でprovider上限の75%までに詰める。report.mdに推定と実測の差が出る。

## 3. 出力

| ファイル | 内容 |
|---|---|
| `plan.json` | provider profile、snapshot hash、packetごとのprobe・projection hash・推定tokens、skip一覧 |
| `packets/P###.request.json` | 実際に送るbody |
| `inspected.json` | 検査したendpointとpacketのdigest |
| `responses/P###.response.json` | 生の応答（transport、受信時刻付き） |
| `ledger.jsonl` | planned / inspected / reserved / request_sent / responded / http_error / transport_error / ingested |
| `observations.json` | probeごとの観測（下記）とpacketの完全性 |
| `report.md` | カウンター、status、decisionごとの表、答えに対応するoutcomeUse |

observationの主なfield: `status`（answered / abstained / not_applicable / error / not_run）、`reasonCodes`、`value`、`localReading`（Noulのみ: yes / no / undecided）、`probabilities`、`providerConfidence`（providerの値。Noulはnull）、`derivedMaxProbability`、`derivedMargin`、`adoption`（advisory / unused。runtimeは`checked`を付けない）、`transport`（http / replay）、`modelRef`。

gate: gate probeの受理側確率が `gateAcceptAt` 以上なら採用、`gateRejectAt` 以下なら `not_applicable`、その間か未回答なら `abstained`。どの場合も生の値は残る。

## 4. runtimeがしないこと

質問の生成・改訂、意味上の重複判定（文字trigramの近似警告だけ）、relationの照合、Decision Card、成果物の執筆、追加waveの自動開始、別providerへのfallback。これらはSkillを使うエージェントが行う。
