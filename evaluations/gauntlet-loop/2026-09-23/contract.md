## Task
1. 対象プロンプトに従ってシナリオを実行し、成果物（利用者への返答として出す本文）を作る。対象は /Users/annenpolka/ghq/github.com/annenpolka/skills/gauntlet-loop/SKILL.md を Read して使う。他のskill、evaluations/ ディレクトリ、リポジトリの他ファイルは読まない。利用者への質問が必要な場面では、質問を成果物に書いてそこで止める（実際に返答は来ない）。
2. 成果物を指定パスに Write し、下の報告構造で返す。

## Report structure
- Deliverable: 書いたファイルのパスと一行要約
- Requirement achievement: 各項目 ○ / × / partial（理由つき）
- Trace（Understanding / Planning / Execution / Formatting を OK / stuck / skipped で。全部OKなら `Trace: all OK` の一行でよい）
- Unclear points (structured): 各問題を Issue / Cause（指示側の原因）/ General Fix Rule（クラス単位の規則）/ Phase の形で
- Discretionary fill-ins: 指示で決まっておらず自分の判断で埋めたところ（箇条書き）
- Retries: 同じ判断をやり直した回数と理由
