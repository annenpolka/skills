# Syntax Reference — 12層YAMLスキーマ完全版

このファイルは文体DNA分析で使用する12層すべてのYAMLフィールド定義を含む。各フィールドの選択肢とその意味を記載している。

分析時はこのスキーマを参照しながら、対象作品の各フィールドを埋めていく。不明な項目は `null` または省略可。`examples` フィールドには原文からの短い抜粋を記載する。

## 目次

1. [メタ情報層](#メタ情報層)
2. [第1層：語彙層（Lexical）](#第1層語彙層lexical)
3. [第2層：統語層（Syntactic）](#第2層統語層syntactic)
4. [第3層：韻律層（Prosodic）](#第3層韻律層prosodic)
5. [第4層：語り層（Narrative）](#第4層語り層narrative)
6. [第5層：対話層（Dialogue）](#第5層対話層dialogue)
7. [第6層：感覚層（Sensory）](#第6層感覚層sensory)
8. [第7層：修辞層（Rhetorical）](#第7層修辞層rhetorical)
9. [第8層：句読層（Punctuation）](#第8層句読層punctuation)
10. [第9層：構造層（Architectural）](#第9層構造層architectural)
11. [第10層：声調層（Tonal）](#第10層声調層tonal)
12. [第11層：間テクスト層（Intertextual）](#第11層間テクスト層intertextual)
13. [第12層：特異性層（Idiosyncratic）](#第12層特異性層idiosyncratic)

---

## メタ情報層

    meta:
      schema_version: "2.0"
      framework_name: "Syntax Reference"
      target:
        title: ""                    # 作品タイトル
        author: ""                   # 著者名
        original_language: ""        # 原語（ja / en / fr / etc.）
        publication_year: null       # 出版年
        genre: []                    # ジャンルタグ（例: ["literary_fiction", "magical_realism"]）
        period: ""                   # 文学的時代区分（例: "postmodern", "meiji", "modernist"）
      analysis:
        analyst: ""                  # 分析者
        date: ""                     # 分析日
        sample_size: ""              # サンプルサイズ（例: "全編" / "第1-3章" / "冒頭50頁"）
        confidence: ""               # 分析確信度（high / medium / low）
        notes: ""                    # 分析上の注記

---

## 第1層：語彙層（Lexical）

語彙選択は文体の最も基礎的な指紋。Stylometryの研究では、機能語の頻度分布が著者同定において最も有力な特徴量であることが一貫して示されている。

    lexical:
      register:
        primary: ""
        # 選択肢: colloquial / informal / neutral / formal / literary / archaic / mixed
        secondary: null
        register_shifts:
          frequency: ""              # rare / occasional / frequent / constant
          trigger: ""                # 切替トリガー（例: "dialogue_to_narration", "ironic_contrast"）
          examples: []

      density:
        type_token_ratio: ""         # low(< 0.4) / medium(0.4-0.6) / high(> 0.6)
        hapax_frequency: ""          # low / medium / high
        vocabulary_breadth: ""       # narrow / moderate / expansive / encyclopedic

      etymology:
        # 日本語の場合
        wago_kango_ratio: ""         # 和語寄り / 均衡 / 漢語寄り / カタカナ語混在
        # 英語の場合
        latinate_germanic_ratio: ""  # germanic_heavy / balanced / latinate_heavy
        # 共通
        neologism_frequency: ""      # none / rare / occasional / frequent
        archaism_frequency: ""       # none / rare / occasional / frequent
        jargon_domains: []           # 専門用語の出典分野（例: ["medical", "nautical"]）
        examples: []

      pos_tendencies:
        adjective_density: ""        # sparse / moderate / rich / excessive
        adverb_density: ""           # sparse / moderate / rich / excessive
        noun_concreteness: ""        # abstract_heavy / balanced / concrete_heavy
        verb_dynamism: ""            # stative_heavy / balanced / dynamic_heavy
        signature_patterns: []       # 例: ["nominalization_heavy", "連体修飾の多重入れ子"]
        examples: []

      repetition:
        keyword_repetition: ""       # avoided / natural / deliberate / obsessive
        pet_words: []                # 著者が偏愛する語
        avoided_words: []            # 意図的に回避される語
        collocations: []             # 特徴的な語の組み合わせ
        examples: []

---

## 第2層：統語層（Syntactic）

文の構造パターンは、語彙以上に著者の「思考のリズム」を反映する。POS n-gramの分布が著者の構文的指紋として機能する。

    syntactic:
      sentence_length:
        mean: ""                     # short(< 15w) / medium(15-30w) / long(30-50w) / very_long(> 50w)
        variance: ""                 # uniform / moderate / high / extreme
        distribution_shape: ""       # normal / right_skewed / bimodal / irregular
        short_sentence_function: ""  # impact / pacing / dialogue / emphasis
        long_sentence_function: ""   # description / stream_of_consciousness / accumulation / analysis
        examples:
          shortest_typical: ""
          longest_typical: ""

      structure:
        dominant_pattern: ""         # SVO_simple / compound / complex / compound_complex / fragment
        # 日本語特有
        jp_clause_nesting_depth: ""  # shallow(1-2) / moderate(3-4) / deep(5+)
        jp_sentence_ending: []       # 文末表現パターン（例: ["だ・である", "のだった"]）
        # 英語特有
        en_clause_type_ratio: ""     # independent_heavy / balanced / dependent_heavy
        en_relative_clause_freq: ""  # rare / moderate / frequent
        # 共通
        inversion_frequency: ""      # none / rare / occasional / frequent
        ellipsis_frequency: ""       # none / rare / occasional / frequent
        parallelism_frequency: ""    # none / rare / occasional / frequent / structural_backbone
        examples: []

      sentence_opening:
        dominant_openings: []
        # 選択肢例: subject_first / adverbial_first / conjunction_first /
        #           participial / interrogative / existential / temporal_marker
        variety: ""                  # low / moderate / high
        signature_openings: []       # 著者固有の文頭パターン
        examples: []

      modification:
        pre_modification_density: "" # light / moderate / heavy
        post_modification_density: "" # light / moderate / heavy
        appositive_frequency: ""     # rare / occasional / frequent
        parenthetical_frequency: ""  # rare / occasional / frequent
        parenthetical_function: ""   # clarification / irony / tangent / emotional_aside
        examples: []

      connectivity:
        conjunction_style: ""        # asyndeton / polysyndeton / balanced / varied
        transition_explicitness: ""  # implicit / mixed / explicit
        inter_sentence_cohesion: ""  # loose / moderate / tight
        favorite_connectives: []
        examples: []

---

## 第3層：韻律層（Prosodic）

Virginia Woolfが「スタイルとはリズムである」と述べたように、散文におけるリズムは文体の最も本能的な層。

    prosodic:
      sentence_rhythm:
        cadence_type: ""             # staccato / flowing / undulating / periodic / irregular
        rhythmic_signature: ""       # 自由記述（例: "short-short-long の三拍子パターン"）
        clausula_pattern: ""         # 文末のリズムパターン（例: "下降終止"）
        breath_unit: ""              # short_gasps / natural_breath / extended_phrase / marathon
        examples: []

      paragraph_rhythm:
        mean_length: ""              # short(1-3sent) / medium(4-8sent) / long(9-15sent) / very_long(16+)
        length_variance: ""          # uniform / moderate / high / extreme
        internal_structure: ""       # topic_sentence_driven / spiral / associative / climactic
        paragraph_as_unit: ""        # atomic / fluid
        single_sentence_paragraphs: "" # never / rare / occasional / frequent / signature_move
        examples: []

      pacing:
        default_tempo: ""            # adagio / andante / moderato / allegro / presto
        tempo_variation: ""          # stable / gradual_shifts / sudden_shifts / constant_flux
        acceleration_technique: ""   # sentence_shortening / detail_reduction / dialogue_increase
        deceleration_technique: ""   # sentence_lengthening / sensory_detail / reflection_insertion
        climax_approach: ""          # gradual_build / sudden_shift / rhythmic_intensification
        examples: []

      silence:
        white_space_usage: ""        # minimal / standard / generous / expressive
        section_break_frequency: ""  # rare / moderate / frequent
        ellipsis_as_silence: ""      # none / rare / occasional / frequent / structural
        what_is_left_unsaid: ""      # 自由記述
        examples: []

---

## 第4層：語り層（Narrative）

語りの技法は作品の認識論的フレームを決定する。Genetteの語りの三層（voice / mood / time）を基盤とする。

    narrative:
      point_of_view:
        type: ""                     # first_person / second_person / third_limited / third_omniscient /
                                     # third_objective / multiple_pov / shifting
        person_consistency: ""       # strict / mostly_consistent / fluid
        first_person_variant: ""     # experiencing_I / narrating_I / unreliable / retrospective
        focalization: ""             # zero(全知) / internal(限定) / external(行動のみ) / variable
        psychic_distance: ""         # intimate / close / middle / distant / cinematic
        distance_shifts: ""          # stable / gradual / sudden / oscillating
        examples: []

      temporality:
        base_tense: ""               # past / present / mixed
        jp_tense_style: ""           # 日本語: た形 / る形 / だった / である
        tense_shifts:
          frequency: ""              # never / rare / occasional / frequent
          function: ""               # flashback / emphasis / immediacy / habitual
        chronology: ""               # linear / analeptic / proleptic / fragmented / circular
        duration_handling: ""        # scene_dominant / summary_dominant / balanced / stretch_heavy
        frequency_handling: ""       # singulative / iterative / repetitive / mixed
        examples: []

      narrator_character:
        reliability: ""              # reliable / questionable / unreliable / deliberately_deceptive
        self_awareness: ""           # naive / moderate / highly_self_aware / metafictional
        personality_intrusion: ""    # invisible / subtle / moderate / strong / dominant
        commentary_frequency: ""     # none / rare / occasional / frequent / constant
        commentary_type: []          # philosophical / ironic / empathetic / judgmental / ambiguous
        relationship_to_reader: ""   # distant / professional / conversational / intimate / conspiratorial
        examples: []

      consciousness:
        thought_representation: []   # direct_thought / indirect_thought / free_indirect_discourse /
                                     # stream_of_consciousness / psychonarration / narrated_monologue
        dominant_mode: ""
        interiority_depth: ""        # surface / moderate / deep / abyssal
        consciousness_flow: ""       # ordered / associative / fragmented / chaotic
        examples: []

---

## 第5層：対話層（Dialogue）

    dialogue:
      proportion:
        dialogue_to_narration: ""    # rare(< 10%) / low(10-25%) / balanced(25-50%) /
                                     # dialogue_heavy(50-75%) / dominant(> 75%)
        placement_pattern: ""        # clustered / evenly_distributed / scene_dependent
        longest_exchange: ""         # brief(< 5 turns) / moderate(5-15) / extended(15-30) / marathon(30+)

      notation:
        quotation_style: ""          # standard_quotes / guillemets / dashes /
                                     # japanese_brackets / unmarked / mixed
        speech_tag_style: ""         # said_dominant / varied_verbs / minimal_tags / tagless / adverb_heavy
        tag_position: ""             # pre / post / mid / varied / omitted
        attribution_frequency: ""    # every_line / most_lines / occasional / minimal
        examples: []

      voice_differentiation:
        idiolect_distinctness: ""    # undifferentiated / slight / moderate / strong / extreme
        differentiation_method: []   # vocabulary / syntax / register / dialect /
                                     # speech_rhythm / catch_phrases / silence_patterns
        class_markers: ""            # none / subtle / explicit
        age_markers: ""              # none / subtle / explicit
        jp_role_language: ""         # none / subtle / moderate / heavy
        jp_sentence_final_particles: ""
        examples: []

      subtext:
        subtext_density: ""          # transparent / light / moderate / heavy / opaque
        nonverbal_integration: ""    # none / minimal / moderate / rich / dominant
        interruption_frequency: ""   # none / rare / occasional / frequent
        interruption_content: []     # gesture / thought / environment / action
        examples: []

---

## 第6層：感覚層（Sensory）

    sensory:
      modality_distribution:
        visual: ""                   # dominant / strong / moderate / weak / absent
        auditory: ""
        tactile: ""
        olfactory: ""
        gustatory: ""
        kinesthetic: ""
        proprioceptive: ""
        dominant_sense: ""
        synesthesia_frequency: ""    # none / rare / occasional / frequent
        examples: []

      description_strategy:
        detail_density: ""           # minimalist / selective / moderate / rich / maximalist
        detail_selection: ""         # functional / atmospheric / symbolic / encyclopedic / idiosyncratic
        description_placement: ""    # front_loaded / integrated / rear_loaded / avoided
        static_vs_dynamic: ""        # static_tableau / mostly_static / balanced / mostly_dynamic / kinetic
        abstraction_level: ""        # concrete_only / concrete_dominant / balanced / abstract_dominant
        examples: []

      embodiment:
        body_awareness: ""           # disembodied / low / moderate / high / hypersomatic
        physicality_type: []         # pain / pleasure / fatigue / hunger / illness / arousal / movement
        body_as_metaphor: ""         # never / rare / occasional / frequent
        examples: []

---

## 第7層：修辞層（Rhetorical）

    rhetorical:
      figurative:
        metaphor_density: ""         # bare / sparse / moderate / rich / saturated
        metaphor_type: ""            # conventional / creative / extended / dead / mixed
        metaphor_domains: []         # 比喩の出典領域（例: ["nature", "machinery", "body"]）
        simile_frequency: ""         # none / rare / occasional / frequent
        simile_connector: []         # 使用される比較語（例: ["ように", "みたいに"]）
        personification_frequency: ""
        metonymy_frequency: ""
        metaphor_originality: ""     # cliched / conventional / fresh / startling / opaque
        examples: []

      devices:
        anaphora: ""                 # none / rare / occasional / frequent / structural
        epistrophe: ""
        chiasmus: ""
        antithesis: ""
        hyperbole: ""
        litotes: ""
        irony_frequency: ""          # none / rare / occasional / frequent / pervasive
        irony_type: []               # verbal / situational / dramatic / cosmic
        humor_type: []               # none / dry / absurd / dark / slapstick / wordplay / observational
        examples: []

      symbolism:
        symbol_usage: ""             # none / sparse / moderate / dense / allegorical
        symbol_transparency: ""      # opaque / suggestive / moderate / obvious / heavy_handed
        recurring_symbols: []
        motif_patterns: []
        examples: []

---

## 第8層：句読層（Punctuation）

句読点の使用パターンは、しばしば意識的制御の外にあるため、著者同定において強力な特徴量となる。

    punctuation:
      basic:
        comma_density: ""            # minimal / standard / heavy / excessive
        semicolon_usage: ""          # never / rare / moderate / frequent / structural
        colon_usage: ""              # never / rare / moderate / frequent
        dash_usage: ""               # never / rare / moderate / frequent / signature
        dash_type: ""                # em_dash / en_dash / double_hyphen / jp_dash(――)
        dash_function: []            # parenthetical / dramatic_pause / list / interruption / afterthought

      special:
        ellipsis_frequency: ""       # never / rare / occasional / frequent / pervasive
        ellipsis_function: []        # trailing_off / hesitation / time_passing / censorship / silence
        exclamation_frequency: ""    # never / rare / occasional / frequent
        question_in_narration: ""    # never / rare / occasional / frequent
        parentheses_frequency: ""    # never / rare / occasional / frequent / nested

      unconventional:
        capitalization: ""           # standard / expressive / e_e_cummings_style / ALL_CAPS_moments
        jp_katakana_for_emphasis: "" # never / rare / occasional / frequent
        jp_hiragana_opening: ""      # none / selective / frequent
        jp_furigana_usage: ""        # none / technical_only / expressive / frequent
        typographic_play: ""         # none / minimal / occasional / experimental
        examples: []

---

## 第9層：構造層（Architectural）

    architecture:
      scene:
        scene_entry: ""              # abrupt / transitional / establishing_shot / in_medias_res / gradual
        scene_exit: ""               # clean_break / trailing / cliffhanger / dissolve / circular
        scene_length: ""             # vignette / short / medium / long / epic
        scene_density: ""            # sparse_action / balanced / event_packed

      transitions:
        between_scenes: ""           # hard_cut / white_space / transitional_passage / temporal_marker
        between_chapters: ""         # continuation / time_skip / pov_shift / thematic_link / cliffhanger
        temporal_transitions: ""     # explicit_markers / implicit / associative / unmarked
        spatial_transitions: ""      # described / implied / cinematic_cut / character_movement
        examples: []

      information:
        exposition_method: ""        # frontloaded / drip_feed / dialogue_embedded /
                                     # retrospective / never_explained / iceberg
        backstory_delivery: ""       # flashback / memory / dialogue / narration / documents / avoided
        foreshadowing: ""            # none / subtle / moderate / heavy / dramatic_irony
        revelation_pacing: ""        # early / gradual / withheld / twist_dependent
        reader_knowledge_vs_character: "" # aligned / reader_ahead / reader_behind / shifting
        examples: []

---

## 第10層：声調層（Tonal）

    tonal:
      base_tone:
        primary: ""                  # 例: melancholic / ironic / earnest / detached / lyrical / brutal
        secondary: ""
        tonal_complexity: ""         # monochrome / dual / layered / kaleidoscopic
        tone_stability: ""           # consistent / mostly_stable / shifting / volatile

      emotional_control:
        emotional_range: ""          # restricted / moderate / wide / extreme
        emotional_expression: ""     # suppressed / understated / balanced / expressive / raw
        sentimentality: ""           # anti_sentimental / restrained / moderate / sentimental / melodramatic
        empathy_direction: ""        # narrator_to_character / character_to_character /
                                     # narrator_to_reader / universal / withheld
        catharsis_approach: ""       # denied / delayed / earned / sudden / ambiguous
        examples: []

      intellectual_stance:
        certainty_level: ""          # dogmatic / confident / questioning / uncertain / nihilistic
        complexity_embrace: ""       # simplifying / balanced / complexity_seeking / labyrinthine
        didacticism: ""              # never / rare / subtle / moderate / overt
        philosophical_density: ""    # none / light / moderate / heavy / dominant
        examples: []

---

## 第11層：間テクスト層（Intertextual）

    intertextual:
      references:
        allusion_frequency: ""       # none / rare / occasional / frequent / dense
        allusion_domains: []         # 引用元の領域（例: ["classical_mythology", "pop_culture"]）
        allusion_transparency: ""    # obscure / moderate / accessible / explicit
        epigraph_usage: ""           # none / chapter_level / section_level

      genre_awareness:
        genre_compliance: ""         # orthodox / conventional / bending / subversive / genre_blind
        meta_awareness: ""           # none / subtle / moderate / overt / deconstructive
        pastiche_elements: []        # 模倣・引用される文体（例: ["fairy_tale", "legal_document"]）
        examples: []

---

## 第12層：特異性層（Idiosyncratic）

他の層に収まらない、その著者だけの「癖」を記録する層。計算文体論では、まさにこの特異性が著者同定の決め手となる。

    idiosyncratic:
      signatures:
        verbal_tics: []              # 無意識的な言語癖
        structural_habits: []        # 構造的な癖（例: ["3要素列挙の偏愛"]）
        avoidance_patterns: []       # 意図的・無意識的な回避パターン
        trademark_moves: []          # 著者のトレードマーク

      observations:
        reading_experience: ""       # 読書体験の全体的印象を自由記述
        closest_comparable: []       # 最も近い文体の他作家
        unique_quality: ""           # この著者だけの替えがたい特質を一文で
        examples: []
