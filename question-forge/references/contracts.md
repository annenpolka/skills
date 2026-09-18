# qforge v0.1 — 契約の叩き台

状態: 新規の内部契約案。qlint、TypeSafe SDK、AI SDKの既存型をそのまま転記したものではない。既存ツールとの互換性は接続時に検証する。

## 1. 四層を分ける

1. **Goal Contract**: 目的、成果物、必須条件、選好、認可、予算。
2. **Domain Probe**: どの判断をどのシナリオで区別するか。
3. **Question / Binding**: 局所的な質問、型、適用範囲、投影state。
4. **Execution / Observation**: backend入力、raw output、正規化された状態、派生解釈。

Jev固有の型名や上限はprovider adapterへ閉じ込める。内部のpredicateをdirect APIのnoulへ変換することと、AI SDKのbooleanへ変換することを別実装とする。

## 2. Goal Contract

```typescript
type GoalContract = {
  id: string;
  revision: number;
  objective: string;
  requestedArtifacts: string[];
  successConditions: string[];
  hardConstraints: string[];
  preferences: string[];
  sourceScope: string[];
  authorityRef: string;
  budgetGrantRef: string | null;
};
```

自然言語の制約があるだけでは、強制境界が実装されたことにならない。authorityRefは既存の実行環境の許可を参照する。未提供のgrantを生成して使わない。

## 3. Evidence

```typescript
type EvidenceItem = {
  id: string;
  revision: number;
  kind:
    | 'source_statement'
    | 'observed_execution'
    | 'authored_requirement'
    | 'hypothesis'
    | 'model_interpretation';
  text: string;
  sourceRef: string | null;
  sourceVersion: string | null;
  locator: string | null;
  contentHash: string;
  worldId: string;
  derivedFrom: string[];
  sensitivity: string;
};
```

source_statementは、その出典が述べている内容であり、現実における真実を自動保証しない。実行結果にはコマンド、環境、snapshot、観測範囲を結び付ける。秘密を含む原文と共有可能な投影は別に保持する。

## 4. Probe wrapper

```typescript
type DomainProbe = {
  id: string;
  revision: number;
  decisionRefs: string[];
  scenarioRef: string;
  questionSpecRef: string;
  bindingRef: string;
  semanticRole:
    | 'meaning' | 'assumption' | 'boundary' | 'counterexample'
    | 'alternative' | 'relation' | 'evidence' | 'verification'
    | 'goal_relevance' | 'next_observation';
  sourceRefs: string[];
  assumptionRefs: string[];
  outcomeUse: Record<string, string>;
  clusterId: string;
  contrastGroup: string | null;
  executionDependencies: string[];
  relevanceGates: string[];
};
```

outcomeUseは「この結果なら何を変えるか／何を調べるか」を記述する。これは制御側のmetadataであり、そのまま判定器へ送らない。

質問の改訂、条件の変更、意味保存と仮定した言い換えを識別する。IDだけを再利用して古い回答を書き換えない。再実行の同一質問は新規domain probeではないが、課金対象の評価試行にはなる。

## 5. QuestionSpecとBinding

QuestionSpecのmodeは `extract / interpret / predict` とする。規範的な判断はmodeとは別にpolicyRefsを持たせる。予測が未来のラベルを持たないこと自体は拒否理由ではないが、その予測に必要と定義した入力が欠ければabstainする。

内部outputは次の三種類とする。

```typescript
type OutputSpec =
  | {
      kind: 'predicate';
      criteria: { yes: string; no: string };
    }
  | {
      kind: 'choice';
      criteria: Record<string, string>;
    }
  | {
      kind: 'ordinal';
      levels: string[];
    };
```

QuestionSpecはinstructions、inputs、policyRefs、applicability、evidenceBoundary、unknownの扱い、outputを持つ。入力を省略可能とするなら明示的な契約を設ける。v0.1の例では列挙したinputsをすべて必須とする。

Bindingは、実在するstate fieldへの対応、projection、実行可能なapplicability gate、実行可能なsufficiency gate、利用するprovider profileを持つ。

自然言語だけのgateと、実際に評価されたgateを区別する。gateを評価していないことをtrueとして通さない。

## 6. 適用・十分性の扱い

### 6.1 実行前に分かるもの

必須入力が欠ける、世界や版が不一致、対象外であることを構造から判定できる場合は、backendへ送らず理由を残す。

### 6.2 意味判定が必要なもの

同じstateから作れるgate質問と本体質問は一緒に評価できる。gateが採用条件を満たすまで、本体のraw answerは観測値として保持しても判断へ使わない。

gateの判断がモデル由来なら、その誤りの可能性も残る。static gateと同じ保証を与えない。高影響の判断では原文・外部検証を別途確認する。

### 6.3 内容上の「記載なし」と情報不足

完全な特定段落を対象に「この段落に指定があるか」を問う場合、記載なしは内容上の回答になり得る。しかし、リポジトリの一部を読んだだけで「仕様全体に指定がない」と拡張しない。

## 7. Observation

```typescript
type ObservationStatus =
  | 'not_run'
  | 'answered'
  | 'abstained'
  | 'not_applicable'
  | 'error';

type Observation = {
  probeRef: string;
  questionRevision: number;
  packetRef: string | null;
  status: ObservationStatus;
  reasonCodes: string[];
  method: 'jev' | 'deterministic' | 'generative_analysis' | 'none';
  value: unknown | null;
  rawAnswerRef: string | null;
  probabilities: Record<string, number> | null;
  providerConfidence: number | null;
  derivedMaxProbability: number | null;
  derivedMargin: number | null;
  evidenceRefs: string[];
  modelRef: string | null;
  adoption: 'unused' | 'advisory' | 'checked';
};
```

rawAnswerRefがあってもstatusがansweredになるとは限らない。gate不成立ならabstainedやnot_applicableになり得る。valueをnullにしたときも、raw outputは監査用に残せる。

providerConfidenceはproviderの値をそのまま記録する。Noulには通常nullを置く。derivedMaxProbabilityで上書きしない。checkedは外部のどのcheckを通したかへの参照を必要とし、最終的な人間の承認とは別である。

## 8. Runtime validation

### Request

- 一意のID、許可された型、空でないinstructions。
- Choiceの少なくとも二候補、ordinalの少なくとも二level。最大値はprovider profileで検証。
- 出典と版、required bindings、worldの整合性。
- instructions/criteria/stateを含む全payloadのsecret/sensitivity検査。
- 実際の送信先、model、adapter version、authorization、budget reservation。
- 同一packetの全質問が共有stateの全項目を受け取ってよいこと。
- token budget。正確なtokenizerがない場合、推定であることと安全余裕を明記。

### Response

- 期待するID集合があるか。欠損を暗黙に生成しない。
- 応答typeと要求typeが対応するか。
- 確率が有限数で0〜1か。キー集合が要求と一致するか。
- 分布合計が明示したtoleranceで1となるか。
- Choiceのchoiceが既知候補で、最大確率の候補集合に入るか。tieは許可。
- Scoreが定義した範囲内か。API契約に従い分布と期待位置の整合性を検査。
- provider confidenceがある場合、有限数で0〜1か。max probability一致は要求しない。
- usageの不明、costの不明、provider/modelの不明を明示する。

一問の不正を理由に、正常な他の回答を架空の値で置換しない。packet全体の完全性は別に記録し、部分成功として扱う。

## 9. Provider profile

profileに持つ情報の例を示す。値は実装時に接続経路で確認する。

```text
provider id / endpoint policy
requested model / resolved model
question type mapping
request token budget
state + longest question token budget, if applicable
choice option limit / score level limit
question count limit, if explicitly documented
rate limits / retry behavior
response validation tolerances
token accounting method
price source / checked date
supports observed usage / observed cost
```

公式directのAPI endpointは `POST https://api.typesafe.ai/v1/systemone`。現在の確認事項と出典はDESIGN.mdの事実セクションへまとめてある。提供経路の互換性を推測で埋めない。

## 10. Relation

```typescript
type Relation = {
  id: string;
  kind: string;
  sourceRefs: string[];
  targetRefs: string[];
  worldId: string;
  scope: string;
  origin: 'declared' | 'deterministic_derivation' | 'model_proposed';
  evidenceRefs: string[];
  enforcement: 'advisory' | 'checked_constraint';
};
```

`kind`は任意の魔法的な論理演算子ではない。v0.1では実装した少数のrelationだけを扱い、未知のkindは評価しない。自然言語の含意を宣言したことと、その含意を確認したことを分ける。

## 11. Budget ledger

少なくとも、計画・予約・送信・応答・清算・不明という状態遷移を記録する。timeout後は送信されていないと断定しない。retryに新しい予約が必要となることを明示する。

domain_probe_specsのほか、meta_evaluations、gate_evaluations、domain_evaluation_attempts、HTTP requests、generator使用、tool使用を別に集計する。その合計が共通budget grantへ収まるようにする。

価格から計算した見積とproviderから得た実績を混同しない。価格情報やusageがない場合に合計$0を出さない。

## 12. Export

最終出力は、summary / decisions / open items / evidence / requested artifact / ledgerとする。

公開・commit向けの成果物は既存の境界に従い、raw stateや秘密を含むログを自動同梱しない。今回の配布物は架空の例のみを含み、実ユーザーのsource snapshotを含まない。
