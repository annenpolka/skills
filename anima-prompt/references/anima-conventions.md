# Anima Conventions

出典レベル: ★ = としあきdiffusion Wiki記載 / ◇ = コミュニティ検証記事 / ？ = 推測・未検証
最終更新: 2026-07-09（Anima情報は流動期。半年単位で棚卸しすること）

## 1. スロット1のタグ辞書

### 品質タグ ★
- 標準: `masterpiece, best quality`
- score系（PonyV7準拠）◇: `score_9`〜`score_1`。positiveはscore_7以上、negativeにscore_1〜3
- 注意 ★: masterpiece多用は「マスピ絵」化する。`(masterpiece, best quality:0.4)` で緩和できるが
  ガチャ性が上がるトレードオフ
- 短く整理する。Illustrious式の品質タグ山盛りは逆効果 ◇

### メタ/画風タグ ★
- wiki例示: `highres, absurdres, anime screenshot, official art`（`jpeg artifacts`はネガ側）
- アニメ塗り誘導 ★◇: `anime screenshot` / `anime screencap` / `japanese anime` / `flat color`
  （欧米系の濃い画風の出現を緩和する）
- 高精細一枚絵 ◇: `detailed illustration, clean illustration`
- スクリーンショット明示があるときのみscreencap系を使う。「シネマティック」だけでは
  screencap扱いにしない ◇

### 年代タグ ★（スロットの存在）◇（語彙）
- `newest`, `year 2025` 等。新しめの絵柄に寄せるならnewest

### レーティングタグ ★（必須・排他）
| Animaタグ | 対応（wiki表記） |
|-----------|------------------|
| safe | danbooru general |
| sensitive | sensitive |
| nsfw | nsfw（questionable相当） |
| explicit | explicit |

- **SDXL時代の `general` は `safe` に改名されている。generalと書かない** ★
- このスキルの規約: デフォルトはsafe。ユーザーの明示がない限り格上げしない
- NSFW回避を強めたい場合: positive側に`safe`＋negative側に`nsfw, explicit`を併用 ◇

## 2. アーティストタグ ★

- 形式: `@artist name`（**@必須・スペース区切り・アンダースコア不使用**）
- @がないと効果が大幅に弱まる（公式説明）★
- 複数指定可: `@name a, @name b` ◇
- Illustriousの `artist:名前` 形式とは非互換 ◇
- ユニークな絵柄のアーティストタグはネガティブ側への影響も大きい。強度調整を推奨 ★
- 実在作家の画風模倣は生成物の扱いに注意。このスキルはユーザーが名指ししない限り追加しない

## 3. ネガティブプリセット

### base（wiki推奨）★
```
worst quality, low quality, score_1, score_2, score_3, 6 fingers, 6 toes,
ai-generated, bad eyes, bad pupils, bad iris, bad hands, bad fingers
```

### ロゴ抑制（wikiが強く推奨——Animaはロゴを描きたがる）★（推奨自体）◇（語彙）
```
logo, watermark, signature, text, artist name
```

### 構図暴れ抑制 ◇
```
multiple views, split view, grid view, cropped, out of frame
```
短いプロンプトで構図を勝手に広げる癖への対処。

### 3D風抑制 ◇
```
3d, cgi, render
```
`2D`をネガに入れるのは危険——アニメ絵そのものと近く、欲しい方向まで削る。

### 原則 ◇
- 短く始めて、崩れたら足す。Illustrious式の長大ネガ移植はどのタグが効いたか追跡不能になる
- bad anatomy系の大量投入より、ポジティブ側でポーズ・服・人数を具体化する方が効く
  （公式も「短い/情報不足プロンプトの望まぬ出力はsafetyタグ＋詳細なpositiveで防げ」としている）

## 4. 推奨設定 ◇（公式README引用とされる記事由来）

- 解像度: 512²〜1536²。**Hires.fixより最初から大きく出す方が品質が出やすい**。
  1536超が必要ならベース解像度を上げてHires.fixオフが安全
- 出力が「溶ける」: CFGを3.0〜4.0に下げる、またはStepsを36〜40に上げる
- Turbo系LoRA使用時 ★: CFG1 / Steps 8〜12。**ネガティブ無効化**。強度1.0なら品質タグ不要、
  0.7以下に弱めるとマスピ感が緩和され出力に幅が出る
- 相談・比較の際はTurbo有無を必ず明記する ★（wikiのローカルルール化した教訓）
- 生成時間はSDXL比で約2倍 ★（DiTの計算密度による）

## 5. マルチキャラレシピ ◇

1. 人数タグ直後に関係性: `2girls, duo, holding hands` / `2girls, back-to-back`
2. 各キャラは「上から下」順で記述: 髪色→髪の長さ→髪型→目→表情→上衣→下衣→靴→小物
3. **名前だけ並べると特徴が混ざる**。名前＋基本外見をセットで書く（公式Tips準拠）
4. 位置関係・相互作用・誰が誰に何をするかは自然文で補強する（nl-led寄りに倒す）

例:
```
2girls, duo, holding each other's hands,
angel girl, red halo, long white hair, red eyes, red angel wings, black dress,
devil girl, white horns, long black hair, blue eyes, blue demon wings, white dress,
floating in midair, bodies facing each other
```

## 6. 絵柄安定化の優先順位 ★◇

ベースモデルは設計思想として絵柄非固定 ★。プロンプト単体で固定しようとしない。

1. 派生モデルを使う（絵柄が安定している派生ほどプロンプトの効きは鈍る。一長一短 ★）
2. 絵柄LoRAを併用する ◇
3. `@アーティスト` タグ ★
4. メジャー作品タイトル ★
5. 品質タグ・スタイルタグの重み調整（0.5〜0.7） ★

## 7. タグ方言 ◇

- 英語・小文字・スペース区切り。アンダースコアは原則不使用（`score_N` のみ例外）
- Danbooru/Gelbooruで語彙が割れる場合はGelbooru寄りを選ぶ
- 純自然文で書く場合は具体的・説明的に2文以上。短すぎる自然文は破綻しやすい ★
- 光・奥行き・後処理系タグ（`backlighting, rim light, depth of field, bokeh,
  volumetric lighting` 等）はプロンプト後半にまとめる
- 強調の初期値は1.2〜1.4程度から。全部に重みを付けない。重要タグだけ ◇

## 8. 既知の癖メモ

- 画像内テキスト描画は不得手 ◇。文字要求は小物・表情・構図・雰囲気に変換する
  （例: 「お誕生日おめでとう」→ `birthday cake, balloons, confetti, celebration`）
- 矛盾タグは矛盾のまま画像化される ◇。腕4本・関節逆折りは同一部位への二重指示を疑う
- 品質タグとネガティブの影響力が大きく、変えると画風ごと変わる ◇。
  好みのフォーマットが定まったら凍結する
