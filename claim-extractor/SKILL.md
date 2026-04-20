---
name: claim-extractor
description: |
  テキストから検証可能な主張を5カテゴリ（数値・固有名詞・時間・因果・引用）に分類して抽出するextractorスキル。
  判定・修正・検証は行わない。主張の可視化だけを行い、レビュー対象のリストとして提供する。
  Use when:
  (1) User wants to audit text for verification candidates ("lint", "validate", "check claims")
  (2) Reviewing AI-generated content for potential errors before fact-checking
  (3) User says "主張を抽出", "claim抽出", "検証候補をリストアップ", "怪しい箇所を探して"
  (4) Preparing text for downstream verification (by human or LLM judge)
  Do NOT use for: validation itself, correction, fact-checking with external sources.
  This skill lists candidates for review. It never says what is right or wrong.
---

# Claim Extractor

テキストから**検証可能な主張**を抽出し、形式的性質で分類するスキル。判定は下さない。リストを並べるだけ。

## Why

テキストには、後から正誤を判定できる主張が散らばっている。例えば:

- 「夏目漱石は1867年に生まれた」── 数値と固有名詞の検証可能主張
- 「このAPIは1秒あたり1000リクエストを処理できる」── 数値とスループット主張
- 「前章で述べた通り、この設計はthread-safeである」── 内部参照と設計主張
- 「東京駅から新宿駅まで山手線で15分」── 固有名詞と所要時間

これらは外部辞書・先行テキスト・計算・人間の知識によって後から検証できる形を持つ。

**検証を自動化しようとすると、ドメイン辞書が無限に増える**。漢字の画数、歴史的事実、地名、API仕様、法令 ── 網羅は不可能。

このスキルは**検証を諦めて抽出だけに徹する**。ドメインに依存しない形で主張を列挙する。抽出されたリストは、人間のレビュー、別のLLMによる検証、特定ドメインの検証器、何にでも渡せる中間表現になる。

## Scope

### 扱う
- 数値を含む主張
- 固有名詞の出現
- 時間・日付・曜日の主張
- 明示的な因果関係
- 出典・参照の主張

### 扱わない
- 正誤判定（pass/fail を出さない）
- 修正案の生成
- 外部データソースの参照（辞書・API・RAG・Web検索すべて禁止）
- 美学・情動・文体の評価
- 主張の意味論的解釈

## 5 Categories

### 1. numeric（数値言明）

数値を含む主張すべて。単位あり・なし、算術あり・なし問わず抽出する。

**抽出対象**:
- 算用数字: `19`, `4.2`, `0.7`
- 漢数字: `十九`, `百五十`, `千`
- 単位付き: `3ミリ`, `十九画`, `三十六・五度`, `1948年`
- 〇記法（小数点）: `〇・七` = 0.7, `〇・〇一` = 0.01
- 算術主張: 「16を4で割ると4」「週に4.2ミリ」「3倍に増えた」
- 比較主張: 「前年より0.6度低い」「平均の2倍」

**components**:
- `value`: 正規化した数値（可能な範囲で）
- `unit`: 単位（ミリ、度、画、秒、ページ、人、回、年 など。なければnull）
- `expression`: 算術表現そのもの（例: "16を4で割ると4"）。単純数値ならnull
- `operands`: 算術の被演算子（例: [16, 4]）
- `operator`: `"割る"`, `"かける"`, `"足す"`, `"引く"`, `"の○倍"` 等
- `claimed_result`: 計算結果として主張された値

日本語数値表現の正規化は常識的な範囲で行う。曖昧な場合は`value`にnullを入れて`surface`を残す。取りこぼすよりは曖昧に出す。

### 2. proper_noun（固有名詞言明）

人名・地名・組織名・作品名・ブランド名など、**特定の個体を指す固有名詞**。

**抽出対象**:
- 人名（フルネーム・姓のみ・名のみ）: `夏目漱石`, `田中`, `Einstein`
- 敬称付き: `田中先生`, `山田部長`, `Dr. Smith`
- 組織・団体名: `NASA`, `朝日新聞`, `Anthropic`, `京都大学`
- 作品・製品名: `源氏物語`, `React`, `iPhone`, `C言語`
- 地名（特定の場所）: `東京駅`, `シリコンバレー`
- カタカナ固有名詞: 一般名詞と判別しにくいが、文脈から特定個体を指すもの

**扱わないもの**: 代名詞、一般名詞、役職名単独（"先生"だけ、"部長"だけ）、総称（"日本人"等）

**components**:
- `name`: 固有名詞本体（敬称を除いた形）
- `honorific`: 敬称（先輩・先生・氏・様・さん・くん・ちゃん・Dr.・Prof. など）。なければnull
- `type_hint`: `"person"` | `"place"` | `"organization"` | `"work"` | `"unknown"`
- `kana_form`: カタカナ表記の場合そのまま

**重要**: このカテゴリは**初出判定をしない**。「前の章で出てきたか」「作中で定義されているか」の判断はスキルの範囲外。固有名詞を全て列挙するだけ。下流が判定する。

### 3. temporal（時間言明）

日付・曜日・時刻・期間・相対時間表現。

**抽出対象**:
- 絶対日付: `2026年3月7日`, `1948年`, `March 7, 2026`
- 曜日: `火曜日`, `Monday`
- 時刻: `午後4時`, `4:02 PM`, `14:30`
- 期間: `3分間`, `16日後`, `1週間`, `3ヶ月`
- 相対表現: `来週`, `先週の火曜日`, `昨年`, `next Monday`
- 日付＋曜日の組: `3月7日（火）`

**components**:
- `expression_type`: `"absolute"` | `"relative"` | `"weekday"` | `"duration"` | `"time_of_day"`
- `raw`: 原文の該当箇所
- `normalized`: ISO形式に正規化可能なら（"2026-03-07"等）。不可ならnull
- `reference_point`: 相対表現の基準点（明示されていれば）

### 4. causal（因果言明）

因果・条件・時間的順序を示す明示的な構文。

**抽出対象**:
- 因果接続: `〜だから〜`, `〜ので〜`, `〜ため〜`, `〜によって〜`
- 条件: `〜すると〜`, `〜ば〜`, `〜なら〜`, `〜とき〜`
- 順序: `〜てから〜`, `〜あと〜`, `〜まえに〜`
- 英語: `because`, `so that`, `if...then`, `since`, `therefore`

**扱わないもの**: 文脈から推測される因果、並列・逆接（"しかし"等）

**components**:
- `connector`: 使われた接続語（"だから"・"ので"・"because"等）
- `antecedent`: 原因側の節
- `consequent`: 結果側の節
- `type`: `"explicit_cause"` | `"condition"` | `"sequence"`

### 5. reference（引用・参照言明）

テキスト外部または過去のテキストへの参照。

**抽出対象**:
- 内部参照: `前章で述べた通り`, `本稿の結論では`, `図3に示すように`
- 外部参照: `論文によると`, `〜の著書で`, `公式ドキュメントには`, `RFC 2616では`
- 発言引用: `〜が言った`, `〜と書いてある`, `〜と述べている`
- データ・計測への参照: `測定の結果`, `先行研究では`, `アンケートによると`

**components**:
- `referent`: 参照対象そのもの（"前章"、"論文"、"公式ドキュメント"等）
- `reference_type`: `"internal"` | `"external"` | `"unclear"`
- `signal`: 参照を示す表現（"によれば"・"書いてある"・"述べている"等）

## Output Format

デフォルトはJSON。ユーザー指定でMarkdownテーブルでも出す。

### JSON形式

```json
{
  "claims": [
    {
      "id": "c001",
      "category": "numeric",
      "surface": "1867年",
      "location": {"paragraph": 1, "start": 5, "end": 10},
      "components": {
        "value": 1867,
        "unit": "年",
        "expression": null,
        "operands": null,
        "operator": null,
        "claimed_result": null
      }
    }
  ],
  "coverage": {
    "total_claims": 47,
    "by_category": {
      "numeric": 18,
      "proper_noun": 12,
      "temporal": 8,
      "causal": 6,
      "reference": 3
    },
    "text_length": 15420
  }
}
```

### Markdown形式（要求時）

| ID | Category | Surface | Location | Key Fields |
|---|---|---|---|---|
| c001 | numeric | 1867年 | ¶1 | value=1867, unit=年 |
| c002 | proper_noun | 夏目漱石 | ¶1 | name=夏目漱石, type=person |

## Invariants（必ず守ること）

1. **surfaceは原文の逐語コピー**。要約・正規化・句読点の変更をしない
2. **locationを必ず出す**。段落インデックスと開始/終了offsetを出す。段落offsetが難しければ段落番号＋段落内offsetでも可
3. **判定を含めない**。「これは怪しい」「多分間違い」「事実と異なる」等の評価語を出さない
4. **曖昧な場合は抽出する**。取りこぼすより過剰抽出のほうが害が少ない
5. **同一箇所が複数カテゴリに該当する場合は別claimとして出す**。例: 「1867年」は numeric であり temporal でもある → 別々のclaimとして出力する
6. **カテゴリは5個固定**。新しいカテゴリを勝手に追加しない
7. **外部情報を使わない**。自分の知識を使って主張の正誤に踏み込まない。抽出者はあくまで抽出者
8. **coverageを必ず出力する**。取りこぼしの可視化のため

## Anti-patterns

- ❌ 「この年号は実際には1868年が正しい」と検証してしまう
- ❌ surfaceを「1867年」と原文どおりに書くべきところを「一八六七年」に変換する（逆もダメ）
- ❌ 固有名詞の初出判定を行う（「これは初出です」「前に登場しました」等と書かない）
- ❌ 因果の妥当性を判断する（「この因果は成立しない」等と書かない）
- ❌ カテゴリを増やす（「数値比較」「年号」等の細分化は不要、既存カテゴリに含める）
- ❌ 信頼度スコアを浮動小数点で出す（type_hintの列挙値のみ使う）
- ❌ claim間の関係を推論する（「この固有名詞が前のclaimの主語」等）
- ❌ 出力が長すぎると削る（検出漏れを隠すより、長くても全部出す）
- ❌ 意味論的判断をする（「この参照は妥当だ」「この計算は意味がない」等）

## Examples

### 入力例

```
夏目漱石は1867年に江戸で生まれ、1916年に49歳で亡くなった。
代表作『吾輩は猫である』は1905年に発表されたため、漱石の作家活動は比較的遅いスタートだった。
先行研究によれば、この遅さは彼の英国留学の影響とされる。
```

### 出力（JSON）

```json
{
  "claims": [
    {
      "id": "c001",
      "category": "proper_noun",
      "surface": "夏目漱石",
      "location": {"paragraph": 1, "start": 0, "end": 4},
      "components": {
        "name": "夏目漱石",
        "honorific": null,
        "type_hint": "person",
        "kana_form": null
      }
    },
    {
      "id": "c002",
      "category": "numeric",
      "surface": "1867年",
      "location": {"paragraph": 1, "start": 5, "end": 10},
      "components": {"value": 1867, "unit": "年", "expression": null, "operands": null, "operator": null, "claimed_result": null}
    },
    {
      "id": "c003",
      "category": "temporal",
      "surface": "1867年",
      "location": {"paragraph": 1, "start": 5, "end": 10},
      "components": {
        "expression_type": "absolute",
        "raw": "1867年",
        "normalized": "1867",
        "reference_point": null
      }
    },
    {
      "id": "c004",
      "category": "proper_noun",
      "surface": "江戸",
      "location": {"paragraph": 1, "start": 11, "end": 13},
      "components": {"name": "江戸", "honorific": null, "type_hint": "place", "kana_form": null}
    },
    {
      "id": "c005",
      "category": "numeric",
      "surface": "1916年",
      "location": {"paragraph": 1, "start": 16, "end": 21},
      "components": {"value": 1916, "unit": "年", "expression": null, "operands": null, "operator": null, "claimed_result": null}
    },
    {
      "id": "c006",
      "category": "numeric",
      "surface": "49歳",
      "location": {"paragraph": 1, "start": 22, "end": 25},
      "components": {"value": 49, "unit": "歳", "expression": null, "operands": null, "operator": null, "claimed_result": null}
    },
    {
      "id": "c007",
      "category": "proper_noun",
      "surface": "吾輩は猫である",
      "location": {"paragraph": 2, "start": 4, "end": 11},
      "components": {"name": "吾輩は猫である", "honorific": null, "type_hint": "work", "kana_form": null}
    },
    {
      "id": "c008",
      "category": "numeric",
      "surface": "1905年",
      "location": {"paragraph": 2, "start": 13, "end": 18},
      "components": {"value": 1905, "unit": "年", "expression": null, "operands": null, "operator": null, "claimed_result": null}
    },
    {
      "id": "c009",
      "category": "causal",
      "surface": "1905年に発表されたため、漱石の作家活動は比較的遅いスタートだった",
      "location": {"paragraph": 2, "start": 13, "end": 50},
      "components": {
        "connector": "ため",
        "antecedent": "1905年に発表された",
        "consequent": "漱石の作家活動は比較的遅いスタートだった",
        "type": "explicit_cause"
      }
    },
    {
      "id": "c010",
      "category": "reference",
      "surface": "先行研究によれば",
      "location": {"paragraph": 3, "start": 0, "end": 8},
      "components": {
        "referent": "先行研究",
        "reference_type": "external",
        "signal": "によれば"
      }
    }
  ],
  "coverage": {
    "total_claims": 10,
    "by_category": {"numeric": 4, "proper_noun": 3, "temporal": 1, "causal": 1, "reference": 1},
    "text_length": 142
  }
}
```

この例で示されている重要な挙動:

- 「1867年」が numeric と temporal で別claimとして出る（Invariant 5）
- 「49歳」は unit="歳" の numeric として抽出される
- 「『吾輩は猫である』」は作品名として type_hint="work"
- 「江戸」は地名として type_hint="place"
- 「比較的遅い」「英国留学の影響とされる」等の曖昧な主張は抽出されない（形式的に検証可能な主張ではないため）
- 「先行研究によれば」は reference として抽出されるが、**その先行研究の内容の妥当性は判定しない**

## Workflow

1. ユーザーからテキストを受け取る
2. テキスト全体を段落単位で分割
3. 各段落を順に走査し、5カテゴリそれぞれの抽出ルールを適用する
4. 抽出結果を統合し、原文の出現順に並べる
5. IDを連番で付与する（c001, c002, ...）
6. coverageを集計する
7. 指定された出力形式で返す（デフォルトJSON）

## Notes on Japanese Numeric Expressions

日本語数値表現は多様なのでモデルの常識で幅広く捕捉する。以下のパターンは最低限カバーすること:

- 算用数字: `19`, `0.7`, `4.2`
- 漢数字（基数）: `一`〜`九`, `十`, `百`, `千`, `万`, `億`
- 漢数字（合成）: `十九`, `百五十`, `千二百三`
- 〇記法（小数点付き整数）: `〇・七` = 0.7, `〇・〇一` = 0.01
- 混合: `3ミリ` と `三ミリ` を同じvalueとして正規化
- 助数詞: 画、年、歳、人、回、度、ミリ、ページ等
- 算術文: 「AをBで割るとC」「AかけるB」「Aの○倍」
- 比較: 「Aより0.6高い/低い」「Aの2倍」

正規化に自信がない場合は`value`をnullにし、`expression`または`surface`で原文を保持する。**取りこぼすより曖昧に出す**。
