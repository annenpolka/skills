# プロジェクトprofile

`init` のときだけ `--profile FILE` を指定する。他のverbで `--profile` を渡すと `profile_only_for_init` で拒否される。profileは初期化時に検証され、許可rootとhelper絶対パスが台帳へ固定される。以後に外部profileを書き換えても台帳のscope・helperは変わらない。

## provider helper（前提）

このskillはprovider helperを同梱しない。実行環境の前提は Node 24+、PATH上の `git`（snapshot provenance用）、`python3`（Devin Python helper用）。次を利用者環境へ**既にinstall済み**であることが前提（helperとそのCLI。認証・設定はコピーしない）：

- `devinHelper`: `devin-delegate` のPython helper（ACP relay）。Devin `--model swe-2-max --mode ask` 用。
- `deepseekHelper`: `opencode-delegate` のNode helper。OpenCode Go `--model opencode-go/deepseek-v4.1-flash --agent plan --pure` 用。

いずれも絶対パスで指定する。**下の雛形のパスは実行不可のplaceholderである。実際にinstallされたhelperの絶対パスへ置き換えること。** helperをこのskill内へコピーしたり、相対パスや存在しない既定値を書いたりしない。

## 必須フィールド（これ以外は拒否）

| field | 型 | 制約 |
|---|---|---|
| `schemaVersion` | number | `1` のみ |
| `projectName` | string | 非空。provider briefに埋め込まれる |
| `allowedRoots` | string[] | 非空。root相対の正準path。ディレクトリは末尾 `/`、ファイルは完全一致 |
| `devinHelper` | string | install済み `devin-delegate` helperへの絶対パス |
| `deepseekHelper` | string | install済み `opencode-delegate` helperへの絶対パス |

## rootとscopeの規則

- 許可rootはプロジェクトroot相対。`../`、先頭 `/`、`\`、`.`始まり、`auth`/`credential`/`.env` を含む要素は拒否。
- ディレクトリrootは末尾 `/` の接頭辞としてのみ一致する。`src/` は `src/a.mbt` を許可し、`src` は許可しない。
- ファイルroot（例 `src/component.txt`）は完全一致のみ。親ディレクトリを許可しない。
- concept scopeの各要素も同じ規則で検証され、固定rootの内側でなければならない。子質問は親scopeを継承する。
- シンボリックリンク、隠しpath、credential系、env系はsnapshot収集と読み込みの両方で拒否される。

## 雛形（placeholderは必ず置換）

```json
{
  "schemaVersion": 1,
  "projectName": "Notebook",
  "allowedRoots": ["src/", "docs/"],
  "devinHelper": "/absolute/path/to/installed/devin-delegate/scripts/acp_relay.py",
  "deepseekHelper": "/absolute/path/to/installed/opencode-delegate/scripts/relay.mjs"
}
```
