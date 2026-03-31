# 適用例：村上春樹（初期作品）の部分プロファイル

この例は、フレームワークの使い方を具体的に示すための参考プロファイル。全12層のうち主要な層のみ記入している（部分適用パターンの例）。

    meta:
      target:
        title: "風の歌を聴け / 1973年のピンボール"
        author: "村上春樹"
        original_language: "ja"
        genre: ["literary_fiction", "postmodern"]
        period: "postmodern"

    lexical:
      register:
        primary: "informal"
        secondary: "literary"
        register_shifts:
          frequency: "frequent"
          trigger: "ironic_contrast"
      density:
        vocabulary_breadth: "moderate"
      etymology:
        wago_kango_ratio: "和語寄り"
        neologism_frequency: "rare"
      repetition:
        keyword_repetition: "deliberate"
        pet_words: ["やれやれ", "もちろん", "つまり", "完璧な"]

    syntactic:
      sentence_length:
        mean: "short"
        variance: "high"
        short_sentence_function: "impact"
        long_sentence_function: "accumulation"
      structure:
        dominant_pattern: "SVO_simple"
        jp_sentence_ending: ["た", "のだ", "かもしれない", "と思った"]
      connectivity:
        conjunction_style: "polysyndeton"
        favorite_connectives: ["そして", "でも", "それから"]

    prosodic:
      sentence_rhythm:
        cadence_type: "staccato"
        rhythmic_signature: "短文の連打 → 突然の長文による呼吸"
      paragraph_rhythm:
        single_sentence_paragraphs: "frequent"
      pacing:
        default_tempo: "moderato"
        tempo_variation: "sudden_shifts"

    narrative:
      point_of_view:
        type: "first_person"
        first_person_variant: "retrospective"
        psychic_distance: "middle"
      narrator_character:
        reliability: "questionable"
        personality_intrusion: "subtle"
        commentary_type: ["ironic", "philosophical"]
        relationship_to_reader: "conversational"

    tonal:
      base_tone:
        primary: "detached"
        secondary: "melancholic"
        tonal_complexity: "dual"
      emotional_control:
        emotional_expression: "understated"
        sentimentality: "anti_sentimental"

    idiosyncratic:
      signatures:
        verbal_tics: ["文頭の接続詞", "数値による客観化", "ビールの銘柄指定"]
        trademark_moves: ["冒頭での時間的距離の宣言", "リスト的列挙", "翻訳調の乾いた会話"]
        unique_quality: "感情的な内容を、まるでカタログの説明文のように淡々と語る距離感"

## この例から読み取れること

村上春樹の初期文体は、複数の層が協働して「翻訳調の乾いた距離感」を形成している：

- **語彙層**: informal + 和語寄りなのに、文体が「日本語的」に感じられない。翻訳文学のレジスターを模倣している
- **統語層**: SVO_simple + 短文主体。日本語の複雑な入れ子構造を避け、英語的な単純構文を好む
- **韻律層**: staccato（スタッカート）なリズム。短文を連打してからの突然の長文が独特の呼吸を作る
- **語り層**: 一人称回想体 + 中程度の心理的距離。近すぎず遠すぎない、観察者的な立ち位置
- **声調層**: detached（超然）+ melancholic（憂鬱）。感情を抑制しつつ、底流に悲哀がある
- **特異性層**: 数値による客観化（「彼女は3回目のビールを飲んだ」のような）や、ブランド名の具体的記載が文体の指紋となっている

これらの層を単独で再現しても村上春樹にはならない。「SVO_simpleの短文」は多くの作家が使う。しかし「SVO_simple + 和語寄りinformal + staccato + detached + 数値客観化」の組み合わせは村上春樹の初期作品にほぼ固有である。文体DNAとは、この組み合わせのことを指す。
