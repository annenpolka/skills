# 由来・hash・保守

## 構成

```
SKILL.md
scripts/
  research.mjs             research CLI
  research-artifacts.mjs   writing/review/revise CLI
  research-evidence.mjs    read-only evidence CLI
  build-runtime.mjs        明示的なビルド/release helper（通常時は実行しない）
  lib/                     Node IO/process leaf と runtime検証
  runtime/
    manifest.json          入力・成果物・同梱testのhash manifest
    *.js                   コンパイル済みMoonBit（検証済みのみロード）
    src/<pkg>/*.mbt        同一buildの正確なMoonBit source
tests/
  portable-skill.test.mjs  受入testのbyte-identical同梱コピー（配布検証用）
references/
```

`manifest.json` の `tests` は配布検証用のhashで、通常利用のruntime必須入力ではない（`verifyRuntime` は `files`/`sources` のみ照合する）。`tests/portable-skill.test.mjs` は親の固定受入testのbyte-identicalコピーで、実行には `PORTABLE_SKILL` でskill rootを指す。build cache・`.git`・一時出力・provider log・私有runtime・絶対scratch pathはmanifestにも配布物にも含めない。

## 検証と再ビルド

- 通常利用では `scripts/lib/runtime.mjs` が `manifest.json` の全成果物とsourceをsha256照合してからimportする。不一致・未記載のJS混入・schema不一致はfail closedで、暗黙再ビルドしない。
- MoonBit判定を変更したときだけ、明示的に `node scripts/build-runtime.mjs` を実行する。このscriptは `moon check`/`moon build --target js --release --deny-warn` を実行し、成果物とsourceを `scripts/runtime/` へコピーしmanifestを書き直す。
- manifestの `toolchain` と `baseline.commit` はbuild時点の由来を記録する。拡張で変更したファイルはcommit差分として扱い、byte-identicalな由来と区別する。
- 対象のMoonBit moduleは `portable/research`。entriesは `run_cli`（research系）と `run_process_json`（processcontrol）。

## 移行状況

- このfolderは、Runeweaveのaccepted研究実装（baseline commit `b9c5f5abaecd11984374a3251147b1d073c0e539`）から抽出したportable branchである。Runeweaveで現在稼働中のコピーは、その既存entrypoint `dev/research.mjs` と既存のlive台帳の上に留まる。このfolderの抽出はlive台帳のmigrationではなく、別途reviewされたmigrationが行われるまで両者は独立に維持される。
- この配布物はRuneweaveの `dev/research.mjs` をimportせず、Runeweaveのcheckout・共有buildへ依存しない。配布物のentrypointは `scripts/research.mjs`（および `research-artifacts.mjs` / `research-evidence.mjs`）。Runeweave側の実装はbaselineおよび現行legacy consumerであり、この配布物のruntime依存ではない。
- 旧台帳の移行は自動化しない。pinned project policyを持たない台帳は、開く時点で `legacy_ledger_requires_migration: pinned project policy missing` として拒否され、履歴は書き換えられない。`policy_roots` はpinned policyを必須とし、rootsを暗黙に推定しない。この拒否は実装済み・文書化済みで、migration手順自体はこのreleaseの範囲外。

## 境界

- ゲーム・Docker・DB・共有ポート・親checkoutへ依存しない。Nodeは値・hash・IO・子プロセスの接着のみ。
- 許可されるprovider helperは設定された2つのみ。別account/modelや自動fallbackを追加しない。
- 私有の `.runtime/`・台帳・認証・素材・診断ログを配布物へ含めない。
