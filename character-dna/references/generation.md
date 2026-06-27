# Character DNA — 生成フェーズテンプレート

このファイルはキャラクタープロファイル（YAML）からLLM実行可能なプロンプトを自動合成するためのテンプレートを定義する。

## プロンプト構造

生成プロンプトは以下の4つのセクションで構成される：

1. **system_preamble** — コア指示（キャラクターの核となる特徴の遵守命令）
2. **layer_instructions** — 層別指示（優先度順）
3. **quality_checks** — 品質チェック指示（自己検証項目）
4. **examples** — Few-Shotシーン例（アノテーション付き台詞・行動・内面描写の抜粋）

## テンプレート

    generation_prompt:

      system_preamble: |
        あなたは以下のキャラクタープロファイルに厳密に従って
        人物の台詞・行動・内面描写を生成します。
        これは「{meta.character.name}」（{meta.source.title}）から
        抽出されたキャラクターDNAに基づくプロファイルです。

        ## 絶対遵守事項（MUST）
        以下の特徴はキャラクターの核であり、すべての出力で再現してください：

        {auto_generated_from: [
          voice.register,
          voice.verbal_tics,
          psyche.core_drive,
          emotion.baseline,
          emotion.expression,
          paradox.contradictions
        ]}

      layer_instructions:
        - priority: critical
          layers: [voice, psyche, emotion]
          note: |
            これらの層はキャラクターの基底音を形成する。
            一台詞一動作で遵守。
            - 声層: この人物の口調・語彙・リズムは代替不可能。
              他のキャラクターと混同される台詞を書いてはならない。
            - 心理層: すべての行動選択は core_drive から演繹可能でなければならない。
              「なぜこの行動を取るか」が心理層と矛盾する場合、行動を修正する。
            - 感情層: 感情の表出様式は expression.style に従う。
              「suppressed」なキャラクターが突然饒舌に感情を語ることはない
              （mask_crack_momentsを除く）。

        - priority: high
          layers: [cognition, body, relation]
          note: |
            シーン単位で遵守。
            - 認知層: この人物が「何に気づき、何を見落とすか」は
              認知スタイルから決定される。
            - 身体層: 癖動作・ストレスサインは自然に埋め込む。
              身体描写がないシーンでも、存在感は posture と movement_quality で示す。
            - 関係層: 他キャラクターとの距離感は attachment.style と
              interpersonal_style から導出する。

        - priority: moderate
          layers: [behavior, values, aesthetics]
          note: |
            エピソード単位で意識。
            - 行動層: ストレス応答と防衛機制は behavior.stress_response と
              defense_mechanisms に従う。
            - 価値層: 選択の基準と禁忌は values から逸脱しない。
            - 美意層: 環境描写・嗜好の言及に aesthetics を反映する。

        - priority: low
          layers: [history, arc, paradox]
          note: |
            作品全体で意識。
            - 履歴層: 過去への言及・フラッシュバックは history から取る。
            - 変容層: キャラクターの変化は arc.trajectory に沿って進める。
            - 矛盾層: 一貫性の中に亀裂を意図的に配置する。

      quality_checks: |
        生成後、以下を自己検証してください：
        1. この台詞は、このキャラクター以外が言いそうにないか？
           （一人称・文末・語彙選択・リズムがvoice層に合致しているか）
        2. 行動の動機はpsyche.core_driveと整合しているか？
        3. 感情の表出はemotion.expression.styleに従っているか？
           （congruenceが「masked」のキャラクターが素直に感情を言語化していないか）
        4. 認知の偏りが反映されているか？
           （cognition.attention.what_they_notice_firstに基づいた描写か）
        5. 身体の癖が自然に現れているか？
           （body.mannerisms.habitual_gesturesが不自然に列挙されていないか）
        6. 他者との距離感がrelation.attachment.styleと一貫しているか？
        7. 矛盾が活きているか？
           （paradox.contradictionsが適切に表出しているか、
            または意図的に隠蔽されているか）

      examples:
        note: |
          以下に対象キャラクターから抽出した短いシーン例と、
          それが体現するキャラクター特徴のアノテーションを記載する。
          生成時はこれらを参照点として使用すること。
        annotated_scenes: []
        # 形式:
        #   - type: "dialogue" / "action" / "inner" / "interaction"
        #     text: "原文の短い抜粋"
        #     context: "シーンの状況"
        #     features: ["verbal_tic", "defense_mechanism", "emotional_leak"]
        #     layer_tags:
        #       voice: "signature_ending"
        #       emotion: "masked_anger"
        #       body: "stress_tell"
        #     why_this_is_characteristic: "なぜこのシーンがこのキャラクターらしいか"

## system_preamble の自動合成ロジック

`{auto_generated_from: [...]}` のプレースホルダーは、YAMLプロファイルの各フィールド値から自然言語の指示文を生成する。合成ルール：

1. **voice.register** → 「口調は{base}を基調とする。{shifts.trigger}に応じて{shifts.shift_direction}に切り替わる」
2. **voice.verbal_tics** → 「口癖: {catchphrases}。文末: {jp_sentence_endings}。間投詞: {filler_words}」
3. **psyche.core_drive** → 「核心的欲求: {desire}。核心的恐怖: {fear}。誤信念: {misbelief}」
4. **emotion.baseline** → 「基底気分は{default_mood}。感情温度は{emotional_temperature}」
5. **emotion.expression** → 「感情表出は{style}。一致度は{congruence}。漏出経路: {leak_channels}」
6. **paradox.contradictions** → 各矛盾をそのまま列挙

## 合成されたプロンプトの使い方

合成されたプロンプトは、以下の2つの方法で使用する：

**方法1：システムプロンプトとして投入**
合成されたテキスト全体をシステムプロンプトとして設定し、ユーザーメッセージで「このキャラクターとして〇〇の場面を書いて」と指示する。

**方法2：コンテキストとして埋め込み**
YAMLプロファイル全体を会話の冒頭に提示し、「このプロファイルに従って書いて」と指示する。この場合、`generation_prompt` セクションは不要で、YAMLの分析部分だけで十分。

**方法3：syntax-referenceとの併用**
文体プロファイルとキャラクタープロファイルを同時に使用する場合：
- 文体プロファイルは地の文全体のスタイルを制御する
- キャラクタープロファイルは当該人物の台詞・行動・内面を制御する
- 対話層（syntax-reference）と声層（character-dna）が競合する場合、
  キャラクター固有の台詞は声層を、地の文中の対話描写は対話層を優先する

## 品質チェックの反復プロセス

1. 初回生成後、原作から3〜5シーンを選び、生成文と並置する
2. 7つのチェック項目を順に検証する
3. 最もズレが大きい層を特定する
4. 該当層のYAMLパラメータを修正するか、`annotated_scenes` にシーン例を追加する
5. 再生成して比較する
6. 収束するまで繰り返す

収束の目安：生成されたキャラクターの台詞を原作のキャラクターの台詞に混ぜたとき、違和感なく紛れること。ただし完全な一致は目指さない。キャラクターの「核」と「声」が再現されていれば成功。

## 複数キャラクターの同時使用

一つの作品で複数キャラクターのプロファイルを使用する場合：

1. 各キャラクターのプロファイルを並列で提示する
2. キャラクター間の関係性を relation 層の相互参照で記述する
3. 会話シーンでは、発話者の voice 層を切り替えながら生成する
4. 品質チェックで「二人の台詞を入れ替えても成立するか」をテストする。
   成立してしまう場合、voice 層の差別化が不十分
