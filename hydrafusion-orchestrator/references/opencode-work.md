# OpenCodeを作業担当にする

ユーザーが今回の作業にOpenCodeを指定した場合、インストール済み `opencode-delegate` を読み、そのhelperで実行する。通常のLuna workerをOpenCodeに置き換える。比較のために両方を起動しない。

`provider/model` は現在の依頼・既存の承認から選び、正確なIDを渡す。過去の試用モデル `deepseek/deepseek-v4.1-flash-expires-on-0910` は日付限定の履歴であり、通常の既定モデルではない。可用性が不明なときだけ確認し、使えないモデルを黙って代替しない。

1. 短い依頼書に目的、作業場所、編集範囲、制約、完成条件を記す。
2. 既存helperの `--cd`、`--model`、`--agent build`、`--brief` で実装を委譲する。引数、権限、timeoutは利用中のopencode-delegateの手順に従う。
3. 終了したら `result.json`、実際の差分、必要な確認を検証する。`completed` は作業の正しさを保証しない。
4. 局所修正は返されたsession IDと差分の指示で再開する。同じモデルを明示し、初めから調査し直さない。

通常の作業にbenchmarkの非公開採点器、依存ライブラリの読取禁止、実験用sandbox brokerを持ち込まない。既存の作業権限とユーザー変更を尊重し、必要な場合だけ別checkoutを使う。`--pure` はOS隔離ではない。権限エラーをモデルの能力不足として扱わず、無条件の権限拡大や繰り返し起動をしない。

helperが記録したusage・costは取得済みの範囲で使う。単価0の報告を無料と解釈したり、外部providerの消費をCodex creditsへ推測換算したりしない。価格確認や過去セッション全件のexportを、毎回の実装完了条件にしない。
