# Syntax Reference — 生成フェーズテンプレート

このファイルは文体プロファイル（YAML）からLLM実行可能なプロンプトを自動合成するためのテンプレートを定義する。

## プロンプト構造

生成プロンプトは以下の4つのセクションで構成される：

1. **system_preamble** — コア指示（文体の核となる特徴の遵守命令）
2. **layer_instructions** — 層別指示（優先度順）
3. **quality_checks** — 品質チェック指示（自己検証項目）
4. **examples** — Few-Shot例文（アノテーション付き原文抜粋）

## テンプレート

    generation_prompt:

      system_preamble: |
        あなたは以下の文体規則に厳密に従って散文を生成します。
        これは「{meta.target.author}」の作品「{meta.target.title}」から
        抽出された文体DNAに基づくスタイル・プロファイルです。

        ## 絶対遵守事項（MUST）
        以下の特徴は文体の核であり、すべての出力で再現してください：

        {auto_generated_from: [
          lexical.register,
          syntactic.sentence_length,
          prosodic.sentence_rhythm,
          narrative.point_of_view,
          tonal.base_tone,
          idiosyncratic.signatures
        ]}

      layer_instructions:
        - priority: critical
          layers: [lexical, syntactic, prosodic]
          note: "これらの層は文体の基底音を形成する。一文一文で遵守"

        - priority: high
          layers: [narrative, dialogue, tonal]
          note: "語りの枠組みと感情の質。シーン単位で遵守"

        - priority: moderate
          layers: [sensory, rhetorical, punctuation]
          note: "テクスチャと装飾。段落単位で意識"

        - priority: low
          layers: [architecture, intertextual, idiosyncratic]
          note: "大域的構造と特異性。作品全体で意識"

      quality_checks: |
        生成後、以下を自己検証してください：
        1. 文長分布は指定パターンに合致しているか
        2. レジスターの逸脱がないか
        3. 語り手の距離感は一貫しているか
        4. トーンの指定から外れていないか
        5. 特徴的な「癖」が自然に現れているか
        6. 比喩の密度と出典領域は適切か

      examples:
        note: |
          以下に対象作品から抽出した短い例文と、
          それが体現する文体特徴のアノテーションを記載する。
          生成時はこれらを参照点として使用すること。
        annotated_samples: []
        # 形式:
        #   - text: "原文の短い抜粋"
        #     features: ["rhythmic_long_sentence", "free_indirect_discourse", "visual_dominant"]
        #     layer_tags: {prosodic: "flowing", narrative: "fid", sensory: "visual"}

## system_preamble の自動合成ロジック

`{auto_generated_from: [...]}` のプレースホルダーは、YAMLプロファイルの各フィールド値から自然言語の指示文を生成する。合成ルール：

1. **lexical.register** → 「語彙レジスターは{primary}を基調とし、{secondary}を副次的に用いる」
2. **syntactic.sentence_length** → 「文長は平均{mean}で、分散は{variance}。短文は{short_sentence_function}に、長文は{long_sentence_function}に使用する」
3. **prosodic.sentence_rhythm** → 「文のリズムは{cadence_type}型。{rhythmic_signature}」
4. **narrative.point_of_view** → 「視点は{type}。心理的距離は{psychic_distance}」
5. **tonal.base_tone** → 「主調は{primary}、副調は{secondary}」
6. **idiosyncratic.signatures** → 各項目をそのまま列挙

## 合成されたプロンプトの使い方

合成されたプロンプトは、以下の2つの方法で使用する：

**方法1：システムプロンプトとして投入**
合成されたテキスト全体をシステムプロンプトとして設定し、ユーザーメッセージで「この文体で〇〇について書いて」と指示する。

**方法2：コンテキストとして埋め込み**
YAMLプロファイル全体を会話の冒頭に提示し、「このプロファイルに従って書いて」と指示する。この場合、`generation_prompt` セクションは不要で、YAMLの分析部分だけで十分。

## 品質チェックの反復プロセス

1. 初回生成後、原作から3〜5段落を選び、生成文と並置する
2. 6つのチェック項目を順に検証する
3. 最もズレが大きい層を特定する
4. 該当層のYAMLパラメータを修正するか、`annotated_samples` に例文を追加する
5. 再生成して比較する
6. 収束するまで繰り返す

収束の目安：原作と生成文を並べたとき、同じ著者が書いたように見えること。ただし完全な一致は目指さない。文体の「雰囲気」と「リズム」が再現されていれば成功。
