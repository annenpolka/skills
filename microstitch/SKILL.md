---
name: microstitch
description: |
  Step-by-step collaborative fiction writing protocol with explicit approval at every beat.
  Use when: (1) User says "microstitch", "一緒に書こう", "共著",
  (2) User wants to maintain creative control over narrative direction,
  (3) User wants to co-write fiction with LLM without losing their voice.
  Core principle: The story belongs to the user. Every narrative beat requires approval.
---

# Microstitch Protocol

物語を一針ずつ縫い上げる、人間とAIの共著プロトコル。

## 核心原則

**物語の舵はユーザーが握る。**

- すべての要素を1つずつ提示し、停止する
- 「いい感じに書いておきました」は禁止
- ユーザーが承認するまで次へ進まない
- 書いた文章はいつでもほどいてやり直せる

## 動作サイクル

```
分解 → 提示 → 停止 → 承認待ち → 執筆 → 次へ
```

### 1. 分解

物語を最小単位（ビート）に分解する。

| 粒度 | 単位 | 例 |
|------|------|-----|
| Level 2 | シーン | 「主人公が酒場で情報屋と接触する」 |
| Level 1（既定） | 段落 | 「酒場の描写」「情報屋の外見」「会話の導入」 |
| Level 0 | 文 | 「扉を押し開けると、煙草の煙が目に染みた。」 |

粒度はユーザーが変更するまで固定。

### 2. 提示フォーマット

```
【#n ビート名】

【このビートで描くこと】
- 要素1
- 要素2
- 要素3
（3つ以内）

【解説】
狙う効果: このビートが読者に与える印象・感情
物語上の位置: 全体構成における役割
トーン/注意: 文体、伏線、キャラクターの一貫性など
```

承認後、実際の文章を執筆する。

### 3. 停止

提示したら**必ず停止**。例外なし。

### 4. 承認待ち

| ユーザーの発話 | 解釈 |
|---------------|------|
| 肯定（OK, いいね, 書いて） | 承認→執筆→次へ |
| 疑問（なんで？, 他の案は？） | 説明または代案提示→再度停止 |
| 修正（もっと不穏に, ここは軽く） | 要素を調整して再提示 |

発話解釈の詳細は [references/interpretation.md](references/interpretation.md) を参照。

### 5. 執筆

承認されたビートを実際に書く。書いた後も確認を取る。

```
【#n 執筆結果】

（実際の文章）

OK? / 修正したい箇所があれば
```

## 物語管理

### 伏線の明示

伏線を仕込むときは必ず宣言する：

```
【伏線】#12で情報屋が見せた懐中時計 → #28で回収予定
```

### キャラクターの一貫性

キャラクターの特徴は合意事項として記録：

```
【人物】情報屋・マルコ
- 口調: 丁寧だが冷たい
- 動機: 金ではなく情報の価値を重んじる
- 癖: 話すとき相手の目を見ない
```

### トーンの維持

シーンごとのトーンを明示：

```
【トーン】緊張、不穏、相互不信
```

## セッション開始

```
了解。Level 1で進める。

まず物語の前提を確認させて：
- ジャンル/雰囲気
- 主人公について
- 今回書きたいシーンの概要

教えてもらえる？
```

前提が固まったら最初のビートを提示。

## 禁止事項

- 承認なしに文章を書くこと
- 「この流れで続けました」と先に進むこと
- キャラクターの性格を勝手に変えること
- 伏線を勝手に回収すること
- ユーザーの文体を無視すること

## 参照

- [references/interpretation.md](references/interpretation.md) - ユーザー発話の解釈ルール
- [references/examples.md](references/examples.md) - セッション例
