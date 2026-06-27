# Character DNA — 12層YAMLスキーマ完全版

このファイルはキャラクターDNA分析で使用する12層すべてのYAMLフィールド定義を含む。各フィールドの選択肢とその意味を記載している。

分析時はこのスキーマを参照しながら、対象キャラクターの各フィールドを埋めていく。不明な項目は `null` または省略可。`examples` フィールドには原作からの短い抜粋（台詞・描写）を記載する。設計モードでは `examples` に想定される表現例を記載する。

### スキーマ運用ルール

- **enum値の選択**: `# 選択肢:` で列挙された値はクローズドenum。最適な値が存在しない場合は、最も近い既存値を採用し、ギャップを `meta.analysis.notes` またはその層の `examples` に注記する。enum値を新造してはならない。
- **`# 例:` で示された値**: オープンフィールド。記載例は参考であり、自由記述で構わない。
- **`examples` サブフィールドの役割分担**: 各層内の `examples` はその層の特徴を示す具体例（台詞・描写）を格納する。`generation_prompt.examples.annotated_scenes` は生成参照用のアノテーション付きシーンであり、層内 `examples` とは重複してよい。
- **重層的概念のenum運用**: 一部の単一enumフィールドは概念的に複数の次元を含みうる（例: `emotional_breadth` は内的振幅と表出幅、`body_relationship` は道具的関係と解離的関係）。このような場合、キャラクターの**基底的特質**（capacity / 潜在的な幅）をenum値として選び、表出面の制約や副次的側面は同層の `examples` または関連フィールド（`expression.style` 等）で記述する。`thinking_style` の `primary` / `secondary` 方式が使える層ではそれを活用する。
- **ソースアクセスとconfidence**: `meta.analysis.confidence` は分析の確信度を示す。ソースに直接アクセスして分析した場合は `high` を基準とし、記憶・知識ベースの抽出では `medium` を上限とする。`meta.analysis.sample_size` には実際のアクセス方法を記載する（例: "TVシリーズ全話視聴済み（記憶ベース）"）。

## 目次

1. [メタ情報層](#メタ情報層)
2. [第1層：声層（Voice）](#第1層声層voice)
3. [第2層：心理層（Psyche）](#第2層心理層psyche)
4. [第3層：感情層（Emotion）](#第3層感情層emotion)
5. [第4層：認知層（Cognition）](#第4層認知層cognition)
6. [第5層：身体層（Body）](#第5層身体層body)
7. [第6層：関係層（Relation）](#第6層関係層relation)
8. [第7層：行動層（Behavior）](#第7層行動層behavior)
9. [第8層：価値層（Values）](#第8層価値層values)
10. [第9層：美意層（Aesthetics）](#第9層美意層aesthetics)
11. [第10層：履歴層（History）](#第10層履歴層history)
12. [第11層：変容層（Arc）](#第11層変容層arc)
13. [第12層：矛盾層（Paradox）](#第12層矛盾層paradox)

---

## メタ情報層

    meta:
      schema_version: "1.0"
      framework_name: "Character DNA"
      mode: ""                         # extract（抽出）/ design（設計）
      character:
        name: ""                       # キャラクター名
        aliases: []                    # 別名・愛称・コードネーム
        age: ""                        # 年齢または年齢帯
        gender: ""                     # 性別・ジェンダー
        species: ""                    # 種族（人間以外の場合）
        occupation: ""                 # 職業・役割
        social_position: ""            # 社会的地位・階層
        era_setting: ""                # 時代設定
        archetype: ""                  # 元型（例: "mentor", "trickster", "shadow"）
        narrative_role: ""             # 物語上の役割（例: "protagonist", "antagonist", "foil"）
        one_line: ""                   # このキャラクターを一文で表現
      source:
        title: ""                      # 出典作品（抽出モード時）
        author: ""                     # 作者
        medium: ""                     # 媒体（novel / manga / anime / game / film / original）
      analysis:
        analyst: ""                    # 分析者
        date: ""                       # 分析日
        sample_size: ""                # 分析対象範囲（例: "全編" / "1-3巻" / "第1章"）
        confidence: ""                 # 分析確信度（high / medium / low）
        notes: ""                      # 分析上の注記

---

## 第1層：声層（Voice）

キャラクターの声はその人物の最も直接的な指紋。読者は台詞だけでそのキャラクターだと識別できるべきである。声は心理と感情の表出装置であり、最も「表面に現れる」層。

    voice:
      register:
        base: ""
        # 選択肢: vulgar / colloquial / casual / neutral / polite / formal / literary / archaic
        shifts:
          frequency: ""                # never / rare / occasional / frequent / constant
          trigger: ""                  # 切替トリガー（例: "anger", "social_context", "intimacy_level"）
          shift_direction: ""          # up（丁寧化）/ down（砕け化）/ both
          examples: []

      vocabulary:
        breadth: ""                    # narrow / moderate / wide / encyclopedic
        signature_words: []            # 口癖・頻用語
        avoided_words: []              # 使わない語・忌避語
        jargon_domains: []             # 専門用語の分野（例: ["military", "medical", "otaku"]）
        profanity_level: ""            # none / mild / moderate / heavy / constant
        loanword_tendency: ""          # 外来語・カタカナ語の使用傾向
                                       # avoided / rare / natural / frequent / excessive

      sentence_patterns:
        typical_length: ""             # terse / short / medium / long / verbose
        structure_preference: ""       # fragments / simple / compound / complex / mixed
        # 日本語特有
        jp_sentence_endings: []        # 文末表現パターン（例: ["だ", "だな", "じゃねえか", "かしら"]）
        jp_first_person: ""            # 一人称（例: "俺", "私", "僕", "あたし", "わし"）
        jp_second_person: ""           # 二人称（例: "お前", "あんた", "君", "あなた"）
        jp_particles: []               # 特徴的な助詞使い（例: ["さ", "ぜ", "わ", "の"]）
        jp_role_language: ""           # 役割語（例: "老人語", "お嬢様語", "武士語"）
        # 英語特有
        en_contractions: ""            # never / rare / standard / heavy
        en_slang_era: ""               # 時代・地域のスラング特徴

      speech_rhythm:
        tempo: ""                      # slow_deliberate / measured / natural / rapid / staccato
        pause_pattern: ""              # none / rare / frequent / dramatic / stuttering
        breath_length: ""              # short_gasps / natural / extended / marathon
        interruption_tendency: ""      # never / rare / sometimes / frequent / constant
        trailing_off_frequency: ""     # never / rare / occasional / frequent

      verbal_tics:
        catchphrases: []               # 決め台詞・口癖
        filler_words: []               # 間投詞・つなぎ語（例: ["えーと", "まあ", "その"]）
        speech_habits: []              # 発話癖（例: ["語尾を伸ばす", "疑問形で終える", "独り言が多い"]）
        laugh_style: ""                # 笑い方の特徴（例: "含み笑い", "高笑い", "鼻で笑う"）
        silence_style: ""             # 沈黙の質（例: "重圧的", "穏やか", "不気味", "考え込む"）
        examples: []

---

## 第2層：心理層（Psyche）

キャラクターの内的エンジン。すべての行動と選択の根源となる層。エニアグラムの「中心的恐怖と中心的欲求」の構造を参照し、動機を階層的に記述する。

    psyche:
      core_drive:
        desire: ""                     # 最も深い欲求（例: "to be loved", "to be free", "to prove worth"）
        fear: ""                       # 最も深い恐怖（例: "abandonment", "helplessness", "meaninglessness"）
        need: ""                       # 物語的に必要なもの（desireと異なることが多い）
        misbelief: ""                  # 誤った信念（例: "愛されるには完璧でなければならない"）
        wound: ""                      # 心の傷の核心（例: "幼少期の遺棄体験"）

      motivation:
        conscious_goals: []            # 自覚している目標
        unconscious_goals: []          # 自覚していない目標
        motivation_hierarchy: []       # 動機の優先順位（上から強い順）
        what_they_would_die_for: ""    # 命を賭けるもの
        what_they_would_kill_for: ""   # 殺すに値するもの（または「ない」）

      inner_conflict:
        primary: ""                    # 主要な内的葛藤（例: "duty_vs_desire", "safety_vs_freedom"）
        secondary: ""                  # 副次的内的葛藤
        conflict_awareness: ""         # 葛藤の自覚度
                                       # oblivious / dimly_aware / conscious / tormented / resolved
        resolution_tendency: ""        # 葛藤の解決傾向
                                       # avoidance / suppression / intellectualization /
                                       # confrontation / oscillation / surrender
        examples: []

      self_image:
        self_perception: ""            # 自己認識（例: "worthless", "special", "ordinary", "dangerous"）
        gap_self_vs_real: ""           # 自己認識と実態のズレ
                                       # aligned / slight_gap / significant_gap / delusional
        desired_self: ""               # なりたい自分
        feared_self: ""                # なりたくない自分
        examples: []

      agency:
        locus_of_control: ""           # internal / external / mixed / shifting
        self_efficacy: ""              # very_low / low / moderate / high / grandiose
        learned_helplessness: ""       # none / mild / moderate / severe
        examples: []

---

## 第3層：感情層（Emotion）

感情の「容器」の形状と「水」の流れ方を記述する。同じ怒りでも、爆発する怒り、凍りつく怒り、笑顔の下の怒りでは表現がまったく異なる。

    emotion:
      baseline:
        default_mood: ""               # 基底状態（例: "calm", "anxious", "cheerful", "melancholic", "guarded"）
        emotional_temperature: ""      # cold / cool / warm / hot / volatile
        resting_energy: ""             # lethargic / low / moderate / high / restless

      range:
        emotional_breadth: ""          # constricted / narrow / moderate / wide / extreme
        accessible_emotions: []        # アクセスしやすい感情
                                       # 例: ["anger", "joy", "curiosity"]
        blocked_emotions: []           # 抑圧・遮断された感情
                                       # 例: ["grief", "vulnerability", "rage"]
        forbidden_emotions: []         # 自分に「許していない」感情
                                       # 例: ["weakness", "neediness", "pleasure"]

      expression:
        style: ""                      # suppressed / understated / controlled / expressive / volatile / performative
        congruence: ""                 # 感情と表出の一致度
                                       # transparent / mostly_congruent / selective / masked / inverted
        leak_channels: []              # 感情が漏れ出る経路
                                       # 例: ["hands", "voice_pitch", "breathing", "eyes", "word_choice"]
        display_rules: []              # 表出ルール（例: ["anger_ok_sadness_not", "public_composure"]）

      triggers:
        anger_triggers: []             # 怒りのトリガー
        fear_triggers: []              # 恐怖のトリガー
        joy_triggers: []               # 喜びのトリガー
        shame_triggers: []             # 恥のトリガー
        tenderness_triggers: []        # 柔らかさのトリガー
        trigger_intensity: ""          # hair_trigger / sensitive / normal / thick_skinned / armored

      processing:
        processing_speed: ""           # instant / fast / moderate / slow / delayed
        emotional_memory: ""           # short / normal / long / elephantine
        recovery_time: ""              # instant / quick / moderate / slow / lingering
        rumination_tendency: ""        # none / low / moderate / high / obsessive
        examples: []

---

## 第4層：認知層（Cognition）

「この人物はどのように世界を認識し、情報を処理するか」を記述する。知能の高低ではなく、思考のスタイルと方向性。

    cognition:
      thinking_style:
        primary: ""                    # analytical / intuitive / practical / creative /
                                       # associative / systematic / narrative / dialectical / literal
        secondary: ""
        abstraction_level: ""          # concrete_only / concrete_leaning / balanced /
                                       # abstract_leaning / abstract_dominant
        processing_mode: ""            # sequential / parallel / holistic / fragmented

      attention:
        focus_pattern: ""              # scattered / shifting / selective / intense / hyperfocused
        what_they_notice_first: []     # 最初に注目するもの
                                       # 例: ["threats", "emotions", "patterns", "details", "exits"]
        what_they_miss: []             # 見落としがちなもの
                                       # 例: ["others_feelings", "own_needs", "obvious_solutions"]
        curiosity_direction: []        # 好奇心の向き先
                                       # 例: ["how_things_work", "people", "abstract_ideas"]

      reasoning:
        decision_speed: ""             # impulsive / quick / deliberate / slow / paralyzed
        decision_basis: ""             # gut_feeling / emotion / logic / rules / consensus / authority
        risk_assessment: ""            # reckless / bold / calculated / cautious / risk_averse
        planning_horizon: ""           # immediate / short_term / medium_term / long_term / generational
        cognitive_biases: []           # 顕著な認知バイアス
                                       # 例: ["confirmation_bias", "catastrophizing",
                                       #       "black_white_thinking", "optimism_bias"]

      intelligence:
        type: []                       # Gardner的多重知能
                                       # 例: ["linguistic", "spatial", "interpersonal",
                                       #       "bodily_kinesthetic", "musical"]
        knowledge_domains: []          # 知識が深い分野
        ignorance_domains: []          # 知識が乏しい分野
        learning_style: ""             # observational / experimental / verbal / kinesthetic / social
        meta_cognition: ""             # 自己の思考についての認識
                                       # unaware / limited / moderate / reflective / obsessive
        examples: []

---

## 第5層：身体層（Body）

キャラクターの物理的存在感。外見の美醜ではなく、「その人物がどのように空間を占有し、身体を通じて世界と関わるか」を記述する。

    body:
      presence:
        physical_impression: ""        # 他者に与える第一印象（例: "威圧的", "透明", "温かい"）
        space_occupation: ""           # 空間の占有傾向
                                       # shrinking / minimal / natural / expansive / dominating
        movement_quality: ""           # 動きの質
                                       # rigid / precise / fluid / languid / explosive / clumsy
        posture_default: ""            # デフォルトの姿勢
                                       # 例: "猫背", "直立", "壁にもたれる", "腕を組む"

      distinguishing_features:
        signature_appearance: []       # 外見的特徴（例: ["赤い髪", "三日月の傷", "義手"]）
        clothing_tendency: ""          # 服装の傾向（例: "常に黒", "無頓着", "過剰に装飾的"）
        scent: ""                      # 匂い（例: "煙草", "花", "無臭", "鉄"）
        voice_quality: ""              # 声の物理的特徴
                                       # 例: "低くて掠れた", "鈴のように澄んだ", "鼻にかかった"

      mannerisms:
        habitual_gestures: []          # 癖動作（例: ["髪を触る", "眼鏡を押し上げる", "指を鳴らす"]）
        stress_tells: []               # ストレス時の身体的サイン
                                       # 例: ["唇を噛む", "貧乏ゆすり", "呼吸が浅くなる"]
        comfort_gestures: []           # 自己慰撫動作
                                       # 例: ["腕をさする", "ペンを回す", "首の後ろに手をやる"]
        emotional_leakage: []          # 感情が身体に漏れる箇所
                                       # 例: ["目元", "肩の緊張", "手の震え"]

      sensory_relationship:
        dominant_sense: ""             # visual / auditory / tactile / olfactory / gustatory / kinesthetic
        sensory_sensitivity: ""        # dulled / low / normal / heightened / overwhelming
        comfort_sensations: []         # 安心する感覚（例: ["温かい飲み物", "毛布の重み"]）
        aversion_sensations: []        # 嫌悪する感覚（例: ["大きな音", "べたつく触感"]）

      physicality:
        body_relationship: ""          # 自分の身体との関係
                                       # dissociated / uncomfortable / neutral / comfortable /
                                       # proud / instrumental / sensual
        physical_capabilities: ""      # 身体能力（例: "戦闘訓練済み", "病弱", "運動神経抜群"）
        health_status: ""              # 健康状態の特記事項
        examples: []

---

## 第6層：関係層（Relation）

「この人物は他者とどのように関わるか」を記述する。個別の関係ではなく、関係性のパターンと傾向。

    relation:
      attachment:
        style: ""                      # secure / anxious_preoccupied / dismissive_avoidant /
                                       # fearful_avoidant / disorganized
        trust_default: ""              # paranoid / guarded / cautious / moderate / open / naive
        trust_building: ""             # 信頼を築く条件
                                       # 例: "一貫した行動を長期間見せること"
        trust_breaking: ""             # 信頼が壊れる条件
                                       # 例: "一度の嘘で完全に壊れる"
        abandonment_response: ""       # 見捨てられたときの反応
                                       # pursue / withdraw / rage / freeze / self_blame / indifference

      social_positioning:
        default_role: ""               # leader / advisor / follower / loner / mediator /
                                       # entertainer / caretaker / rebel / observer
        power_orientation: ""          # submissive / deferential / egalitarian / dominant / controlling
        group_behavior: ""             # isolated / peripheral / participatory / central / orchestrating
        hierarchy_attitude: ""         # 権威・上下関係への態度
                                       # defiant / uncomfortable / pragmatic / respectful / reverent

      interpersonal_style:
        warmth: ""                     # cold / cool / neutral / warm / effusive
        openness: ""                   # sealed / guarded / selective / open / oversharing
        directness: ""                 # evasive / indirect / diplomatic / direct / blunt / brutal
        empathy_capacity: ""           # absent / limited / selective / natural / overwhelming
        conflict_style: ""             # avoidant / accommodating / competing / compromising / collaborative

      boundaries:
        personal_space: ""             # invaded / minimal / standard / wide / fortress
        emotional_boundaries: ""       # porous / flexible / firm / rigid / impenetrable
        boundary_violations: []        # 境界を侵害される主なパターン
        boundary_enforcement: ""       # 境界侵害への対処
                                       # allows / passive_aggressive / assertive / aggressive / cutting_off

      key_relationship_patterns:
        patterns: []                   # 繰り返す関係パターン
                                       # 例: ["rescuer_dynamic", "push_pull", "idealize_devalue",
                                       #       "one_sided_giving", "mentor_protege"]
        relationship_to_intimacy: ""   # 親密さへの態度
                                       # craving / ambivalent / comfortable / uncomfortable / terrified
        examples: []

---

## 第7層：行動層（Behavior）

「この人物は状況にどう反応し、何をするか」を記述する。心理層が「なぜ」、行動層が「どのように」。

    behavior:
      habits:
        daily_routines: []             # 日常的習慣（例: ["早起き", "就寝前の読書", "散歩"]）
        comfort_behaviors: []          # 安心行動（例: ["料理", "掃除", "筋トレ"]）
        nervous_habits: []             # 不安時の習慣（例: ["爪を噛む", "過食", "過剰労働"]）
        rituals: []                    # 儀式的行動（例: ["毎朝同じ順序で支度", "特定の迷信"]）

      stress_response:
        primary: ""                    # fight / flight / freeze / fawn / dissociate
        escalation_pattern: ""         # ストレス増大時の変化
                                       # 例: "fawn → fight（我慢の限界で爆発）"
        coping_strategies:
          adaptive: []                 # 適応的な対処
                                       # 例: ["exercise", "journaling", "talking"]
          maladaptive: []              # 非適応的な対処
                                       # 例: ["substance_use", "isolation", "self_harm"]
        breaking_point: ""             # 崩壊する状況（例: "信頼した人からの裏切り"）

      decision_making:
        style: ""                      # impulsive / spontaneous / balanced / deliberate / agonizing
        under_pressure: ""             # freezes / panics / sharpens / same_as_normal / reckless
        moral_flexibility: ""          # rigid / principled / pragmatic / flexible / amoral
        delegation_tendency: ""        # does_everything_alone / reluctant / balanced /
                                       # delegates_readily / avoids_responsibility

      defense_mechanisms:
        primary: []                    # 主要な防衛機制
                                       # 例: ["intellectualization", "humor", "projection",
                                       #       "denial", "sublimation", "displacement",
                                       #       "rationalization", "reaction_formation",
                                       #       "compartmentalization", "dissociation"]
        when_cornered: ""              # 追い詰められたときの最終防衛
                                       # 例: "冷笑で距離を作る", "完全に黙る", "攻撃に転じる"

      competence:
        skills: []                     # 実際のスキル・能力
        hidden_competencies: []        # 知られていない能力
        notable_incompetencies: []     # 目立つ苦手・無能
        relationship_to_competence: "" # 有能さへの態度
                                       # humble / matter_of_fact / proud / insecure / performative
        examples: []

---

## 第8層：価値層（Values）

「この人物にとって何が大切で、何が許せないか」を記述する。価値観は行動を制約し、選択の基準となる。

    values:
      moral_framework:
        orientation: ""                # deontological（義務論的）/ consequentialist（結果主義）/
                                       # virtue_ethics（徳倫理）/ care_ethics（ケア倫理）/
                                       # nihilistic / pragmatic / divine_command / mixed
        moral_flexibility: ""          # absolute / principled / contextual / fluid / absent
        justice_concept: ""            # 正義の概念
                                       # 例: "弱きを助け強きを挫く", "法が正義", "勝者が正義"

      priorities:
        hierarchy: []                  # 価値の優先順位（上から重要な順）
                                       # 例: ["freedom", "loyalty", "truth", "survival",
                                       #       "family", "justice", "beauty", "knowledge"]
        non_negotiables: []            # 絶対に譲れないもの
        sacrificeable: []              # 犠牲にできるもの

      beliefs:
        worldview: ""                  # 世界観（例: "people_are_fundamentally_good",
                                       #           "life_is_suffering", "everything_is_connected"）
        self_narrative: ""             # 自分の人生についての物語
                                       # 例: "私は生まれてくるべきではなかった"
        attitude_to_change: ""         # 変化への態度
                                       # resistant / cautious / accepting / embracing / addicted
        political_stance: ""           # 政治的立場（必要な場合のみ）

      taboos:
        personal_taboos: []            # 個人的禁忌（例: ["嘘をつくこと", "暴力", "不倫"]）
        taboo_reaction: ""             # 禁忌を侵された時の反応
                                       # visceral_disgust / cold_fury / disappointment / denial / violence
        hypocrisy_awareness: ""        # 自身の矛盾（言行不一致）への認識
                                       # blind / dimly_aware / conscious_but_unresolved / tormented
        examples: []

---

## 第9層：美意層（Aesthetics）

「この人物はどのようなものに美しさ・心地よさ・魅力を感じるか」を記述する。趣味嗜好はキャラクターの個性を最も手軽に伝える層であり、読者の共感・反感を直接的に左右する。

    aesthetics:
      taste:
        cultural_consumption: []       # 好む文化的コンテンツ
                                       # 例: ["古典文学", "パンクロック", "B級映画", "盆栽"]
        food_drink: []                 # 食の好み（例: ["甘い物が苦手", "ブラックコーヒー", "高級志向"]）
        environment_preference: ""     # 好む環境（例: "静かで暗い場所", "賑やかなカフェ"）
        season_preference: ""          # 好む季節と理由

      sensibility:
        beauty_concept: ""             # 美意識の方向性
                                       # functional / minimal / wabi_sabi / ornate / grotesque /
                                       # natural / artificial / chaotic / symmetrical
        humor_appreciation: []         # 好む笑いの種類
                                       # 例: ["dry_wit", "slapstick", "dark", "absurd", "wordplay"]
        what_moves_them: ""            # 心が動くもの（例: "夕暮れの光", "子どもの無邪気さ"）
        what_repels_them: ""           # 生理的に受け付けないもの

      style:
        personal_style: ""             # 自己表現のスタイル
                                       # 例: "無頓着", "ミニマル", "和洋折衷", "全身黒"
        organization: ""               # 整理整頓の傾向
                                       # chaotic / messy / functional / tidy / obsessively_organized
        attention_to_detail: ""        # ディテールへのこだわり
                                       # oblivious / casual / moderate / attentive / obsessive

      obsessions:
        current_fixations: []          # 現在の執着対象
        collecting_tendencies: []      # 蒐集傾向（物理的・精神的）
        guilty_pleasures: []           # 後ろめたい楽しみ
        examples: []

---

## 第10層：履歴層（History）

「この人物はどのように形成されたか」を記述する。過去のすべてではなく、現在の性格・行動に直接影響を与えている形成体験に焦点を当てる。

    history:
      formation:
        origin_environment: ""         # 育った環境（例: "都市部の中流家庭", "戦場", "孤児院"）
        key_relationships:
          primary_caregiver: ""        # 主養育者との関係の質
                                       # loving / conditional / neglectful / abusive / absent / idealized
          family_dynamics: ""          # 家族の力学（例: "過干渉の母と不在の父"）
          formative_friendships: []    # 人格形成に影響した友人関係

      pivotal_events:
        wounds: []                     # 人格に傷を残した出来事
                                       # 形式: {event: "", age: "", impact: ""}
        gifts: []                      # 人格に恩恵をもたらした出来事
                                       # 形式: {event: "", age: "", impact: ""}
        turning_points: []             # 人生の転換点
                                       # 形式: {event: "", age: "", before: "", after: ""}

      patterns:
        repeated_patterns: []          # 人生で繰り返されるパターン
                                       # 例: ["親しくなると自ら壊す", "困っている人を見捨てられない"]
        unresolved_business: []        # 未解決の過去の問題
        inherited_traits: []           # 親や環境から受け継いだもの
                                       # 例: ["母親の口癖", "父の怒り方", "故郷の方言"]

      anchors:
        objects: []                    # 大切にしている物（例: ["母の形見の時計", "最初の銃"]）
        places: []                     # 特別な場所（例: ["故郷の川", "初めて自由を感じた街"]）
        memories: []                   # 繰り返し思い出す記憶
        people: []                     # 心に残り続ける人物
        examples: []

---

## 第11層：変容層（Arc）

「この人物はどのように変化するか（あるいはしないか）」を記述する。物語の中でのキャラクターアークの設計・分析に使用する。

    arc:
      trajectory:
        type: ""                       # positive_growth / negative_decline / flat（不変）/
                                       # transformation / disillusionment / maturation /
                                       # corruption / redemption / cyclic
        starting_state: ""             # 開始時の状態（例: "臆病で自己否定的"）
        ending_state: ""               # 到達状態（例: "恐怖と共存しつつ行動できる"）
        what_changes: ""               # 変わるもの（例: "自己認識", "他者への信頼"）
        what_remains: ""               # 変わらないもの（例: "根底にある優しさ"）

      catalysts:
        external_catalysts: []         # 外的変化の触媒（例: ["仲間との出会い", "喪失体験"]）
        internal_catalysts: []         # 内的変化の触媒（例: ["限界の認識", "自己欺瞞の崩壊"]）
        resistance_points: []          # 変化に抵抗する瞬間
        point_of_no_return: ""         # 引き返せない地点

      growth:
        lessons_to_learn: []           # 学ぶべきこと
        lessons_resisted: []           # 学ぶことに抵抗するもの
        growth_method: ""              # 成長の方法
                                       # through_suffering / through_love / through_failure /
                                       # through_mentorship / through_self_reflection /
                                       # through_confrontation / refused
        setback_pattern: ""            # 後退のパターン
                                       # 例: "進歩した直後に古い行動に戻る"

      thematic:
        character_question: ""         # このキャラクターが体現する問い
                                       # 例: "人は本当に変われるのか"
        thematic_role: ""              # テーマ上の役割
                                       # 例: "自由の代償を示す", "許しの可能性を体現する"
        examples: []

---

## 第12層：矛盾層（Paradox）

他の層に収まらない、そのキャラクターだけの「替えがたさ」を記録する層。キャラクターを生き生きとさせるのは一貫性ではなく、一貫性の中にある亀裂——矛盾と逆説——である。

    paradox:
      contradictions:
        surface_vs_depth: ""           # 表面と深層の矛盾
                                       # 例: "冷酷に見えるが、実は最も傷つきやすい"
        belief_vs_action: ""           # 信念と行動の矛盾
                                       # 例: "自由を説くが、自分は誰よりも縛られている"
        desire_vs_behavior: ""         # 欲望と行動の矛盾
                                       # 例: "愛されたいのに、近づく人を遠ざける"
        self_image_vs_reality: ""      # 自己認識と実態の矛盾
                                       # 例: "自分は無価値だと信じているが、周囲は頼りにしている"

      blind_spots:
        what_they_cannot_see: []       # 見えないもの
                                       # 例: ["自分が他者に与える影響", "自分の優しさ"]
        what_they_refuse_to_see: []    # 見ることを拒否しているもの
                                       # 例: ["状況の絶望性", "自分の加害性"]
        defense_against_seeing: ""     # 見ないための防衛
                                       # 例: "ユーモアで誤魔化す", "忙しさで覆い隠す"

      self_deceptions:
        lies_to_self: []               # 自分についている嘘
                                       # 例: ["一人で大丈夫", "もう傷ついていない"]
        performance: ""                # 他者に見せている「演技」
                                       # 例: "有能で余裕のある大人", "何も気にしないふり"
        mask_crack_moments: []         # 仮面が割れる瞬間
                                       # 例: ["酔ったとき", "子どもを見たとき", "極限状況"]

      irreplaceability:
        unique_combination: ""         # このキャラクター固有の特徴の組み合わせ
                                       # 例: "知的な冷酷さと、動物への無防備な優しさの共存"
        character_essence: ""          # このキャラクターの本質を一文で
        what_no_other_character_does: "" # 他のキャラクターにはできないこと

      observations:
        first_impression: ""           # 初読時の全体的印象（自由記述）
        closest_comparable: []         # 最も近い造形の他作品キャラクター
        notes: ""                      # その他の観察
        examples: []
