# 適用例：坂本竜馬（司馬遼太郎『竜馬がゆく』）の部分プロファイル

この例は、フレームワークの使い方を具体的に示すための参考プロファイル。全12層のうち主要な層のみ記入している（部分適用パターンの例）。

    meta:
      schema_version: "1.0"
      framework_name: "Character DNA"
      mode: "extract"
      character:
        name: "坂本竜馬"
        aliases: ["竜馬", "坂本さん", "才谷梅太郎"]
        age: "20代後半〜30代前半（物語の大半）"
        gender: "男"
        occupation: "脱藩浪士 → 海援隊隊長"
        social_position: "土佐の下級武士出身"
        era_setting: "幕末"
        archetype: "trickster / visionary"
        narrative_role: "protagonist"
        one_line: "天衣無縫の楽天家でありながら、日本の未来を構想する唯一の戦略家"
      source:
        title: "竜馬がゆく"
        author: "司馬遼太郎"
        medium: "novel"

    voice:
      register:
        base: "casual"
        shifts:
          frequency: "occasional"
          trigger: "相手の格や状況に応じて"
          shift_direction: "both"
      vocabulary:
        breadth: "moderate"
        signature_words: ["ぜよ", "いかんぜよ", "日本"]
        jargon_domains: ["航海", "政治", "商業"]
        profanity_level: "mild"
      sentence_patterns:
        typical_length: "short"
        structure_preference: "simple"
        jp_sentence_endings: ["ぜよ", "じゃ", "のう", "き"]
        jp_first_person: "わし"
        jp_role_language: "土佐弁"
      speech_rhythm:
        tempo: "natural"
        pause_pattern: "rare"
        interruption_tendency: "sometimes"
      verbal_tics:
        catchphrases: ["日本を今一度せんたくいたし申候", "世の中の人は何とも言わば言え"]
        filler_words: ["のう"]
        laugh_style: "豪快に笑う、声が大きい"
        silence_style: "考え込む時は急に黙り、目が遠くなる"
        examples:
          - "おまんら、日本はのう、このままではいかんぜよ"
          - "わしは、日本という国が好きでのう"

    psyche:
      core_drive:
        desire: "日本を列強から守り、新しい国を作る"
        fear: "日本が植民地化されること"
        need: "自分一人ではなく、多くの人を動かす仕組みを作ること"
        misbelief: null  # 竜馬は比較的misbeliefが少ないキャラクター
        wound: "幼少期の泣き虫としての劣等感"
      motivation:
        conscious_goals: ["薩長同盟", "大政奉還", "海軍創設"]
        unconscious_goals: ["誰にも縛られない自由な生き方"]
        what_they_would_die_for: "日本の未来"
        what_they_would_kill_for: "避けたいが、必要なら"
      inner_conflict:
        primary: "暴力革命 vs 平和的変革"
        conflict_awareness: "conscious"
        resolution_tendency: "confrontation"
      self_image:
        self_perception: "ordinary"
        gap_self_vs_real: "significant_gap"
        desired_self: "海の男"
      agency:
        locus_of_control: "internal"
        self_efficacy: "high"

    emotion:
      baseline:
        default_mood: "cheerful"
        emotional_temperature: "warm"
        resting_energy: "high"
      range:
        emotional_breadth: "wide"
        accessible_emotions: ["joy", "anger", "curiosity", "empathy"]
        blocked_emotions: ["self_pity"]
      expression:
        style: "expressive"
        congruence: "mostly_congruent"
        leak_channels: ["voice_volume", "body_movement", "eyes"]
      triggers:
        anger_triggers: ["日本を矮小化する言動", "理不尽な身分差別"]
        joy_triggers: ["海", "新しい知識", "同志との邂逅"]
        tenderness_triggers: ["おりょうの存在", "弱者への共感"]
      processing:
        processing_speed: "fast"
        recovery_time: "quick"
        rumination_tendency: "low"

    relation:
      attachment:
        style: "secure"
        trust_default: "open"
        trust_building: "直感的に人を見抜く"
      social_positioning:
        default_role: "mediator"
        power_orientation: "egalitarian"
        hierarchy_attitude: "pragmatic"
      interpersonal_style:
        warmth: "warm"
        openness: "open"
        directness: "direct"
        empathy_capacity: "natural"
        conflict_style: "collaborative"
      key_relationship_patterns:
        patterns: ["異なる立場の人間を結びつける仲介者"]
        relationship_to_intimacy: "comfortable"

    paradox:
      contradictions:
        surface_vs_depth: "天衣無縫の楽天家に見えるが、誰よりも深く日本の危機を認識している"
        belief_vs_action: "武力を否定しながらも、北辰一刀流の達人である"
        desire_vs_behavior: "自由を愛し組織に属さないのに、人と人を繋ぐ組織者でもある"
      blind_spots:
        what_they_cannot_see: ["自分の命が危険にさらされていること"]
        what_they_refuse_to_see: ["暗殺の可能性"]
      self_deceptions:
        performance: "何も考えていないような大らかさ"
        mask_crack_moments: ["日本の未来を語るとき、目が据わる"]
      irreplaceability:
        unique_combination: |
          土佐弁の素朴さ、型破りな行動力、戦略的構想力、
          そして身分や藩を超えて人を動かす天性の魅力の共存
        character_essence: |
          最も自由な人間でありながら、最も大きな責任を自ら背負った男
        what_no_other_character_does: |
          敵対する薩摩と長州を結びつけ、幕府を武力ではなく構想で倒す——
          この「不可能な仲介」は竜馬にしかできない

## この例から読み取れること

司馬遼太郎が描く竜馬は、複数の層が協働して「天衣無縫な革命家」を形成している：

- **声層**: 土佐弁 + casual + 短文。方言が親しみやすさを、短文が行動の速さを伝える
- **心理層**: 日本の未来という巨大な目標を持ちながら、misbeliefがほぼない。稀有な「健全な英雄」
- **感情層**: 基底がcheerfulでwarm。感情表出もexpressive。だからこそ、怒る場面の温度差が際立つ
- **関係層**: secure + egalitarian + mediator。身分制度が絶対の時代に、「対等に話す」ことが革命そのもの
- **矛盾層**: 「自由を愛する者が、最大の責任を担う」というパラドックスが物語の核心

これらの層を単独で再現しても竜馬にはならない。「土佐弁の豪快な男」は多くいる。しかし「土佐弁 + egalitarian + 戦略的構想力 + 暴力の否定 + 達人の腕前」の組み合わせは竜馬にほぼ固有である。キャラクターDNAとは、この組み合わせのことを指す。

## 設計モードとの違い

上記は「抽出モード」の例。設計モードの場合、`source` は空欄にし、`examples` には「こういう台詞を言いそう」「こういう行動を取りそう」という想定例を記入する。設計モードでは特に矛盾層（第12層）から着手することが重要——矛盾のないキャラクターは平板になる。

設計の出発点は `paradox.irreplaceability.character_essence`（一文でのキャラクター本質）であり、そこから逆算して他の層を構築していく。
