# Image generation through Grok Build

Use this workflow when the user requests Grok-generated images. It uses the installed `grok` CLI and its native `image_gen` tool through ACP. It does not call another image provider or implement the Imagine HTTP API itself. Image editing, reference uploads, video, and bulk generation are outside this entrypoint.

## Run and review

1. Write the user's image brief and aspect ratio to a JSON file. Choose a **new absolute output directory** whose parent exists. Use a durable artifact location for deliverables and a temporary location for probes. No Git repository is needed.
2. Run the helper below. An explicitly requested Grok image is authorization for one generation using the existing Grok authentication route. Reuse that authorization; do not ask again merely because this is an image. If `XAI_API_KEY` is already present, the helper uses it; otherwise it references validated existing cached Grok login. Do not add an API key, change accounts, or upgrade a subscription as a fallback.
3. Require exit code zero, `ok: true`, and the returned local artifact. Open `images[0].path` with the available image viewer, check the brief/composition and actual dimensions, and show it to the user with `![description](/absolute/path/image.jpg)` (use the returned extension). The helper checks the PNG/JPEG container, dimensions, size, and SHA-256; it does not fully decode the pixels or judge visual quality.
4. If the user requests a revision, use a new directory and a revised text prompt. Each call starts a new session and produces one image. Do not silently retry a failure, timeout, or missing artifact: inspect the normalized error first, since a generation may already have consumed quota. When an error requires an account change, report it and let the user decide.

```json
{
  "schemaVersion": 1,
  "prompt": "A small yellow rubber duck on a solid teal background, flat illustration, no text.",
  "aspectRatio": "16:9",
  "timeoutMs": 300000
}
```

```bash
node <skill-dir>/scripts/grok-image.mjs \
  --output-dir /absolute/new-image-job \
  --grok-bin /absolute/path/to/grok < image-request.json
```

`--grok-bin` defaults to `grok` on `PATH`. Request JSON goes on stdin, never the command line. Only `schemaVersion` and `prompt` are required. `aspectRatio` defaults to `auto`; accepted values are `auto`, `1:1`, `16:9`, `9:16`, `3:2`, `2:3`, `4:3`, and `3:4`. `timeoutMs` defaults to 300000 and is capped at 600000. Unknown request fields are rejected. The model may refine the wording of the brief; this is not byte-exact prompt forwarding.

The helper shares the code wrapper's absolute-entry-only `PATH` validation. If the host has empty or relative entries, supply an explicit absolute `PATH` containing Node, Grok (unless passed by absolute path), and system tools. Preserve necessary trusted runtime entries.

Stdout is one normalized JSON result. Success returns `images` entries with absolute `path`, `mimeType`, `width`, `height`, `bytes`, and `sha256`, plus `visualReviewRequired: true`. A private `result.json` records the same result. Output directories are created as `0700`, artifacts as `0600`; existing output directories are rejected and never overwritten. The directory also retains the private Grok session/runtime and an empty working directory, including on failures. Share the returned image file, not the entire runtime directory. No automatic cleanup, staging, commit, or publication occurs.

## Observed behavior and limits

Verified locally with **Grok Build 1.0.13 (5e9a58528b76)** on 2026-09-08 using cached login:

- `--tools image_gen` exposes the native generator in ACP. The runner also disables web, MCP and subagents, uses a fresh empty working directory and private Grok/HOME/XDG directories, caps turns at two, and requests at most one parallel image-generation call.
- The native `_meta["x.ai/tool"]` tuple is version `1`, namespace `grok_build`, kind/name `image_gen`, `read_only: false`. Initial calls may omit the display `kind`; subsequent updates use `other`. Input is `prompt` plus `aspect_ratio`; a later fragment adds `variant: "ImageGen"`.
- **The tool executes without `session/request_permission`.** The code wrapper's Edit/Write permission ledger cannot authorize this operation. The image helper rejects any unexpected permission request, audits tool identity/count/input/lifecycle, and cancels on unexpected activity. These are observation checks; they cannot undo quota use or a tool that already ran. Do not describe the one-image request as a hard billing cap or the private directory as OS sandboxing.
- Successful terminal updates return `rawOutput.type: "ImageGen"` and a local path at `<private-grok-home>/sessions/<percent-encoded-cwd>/<session-id>/images/<number>.jpg`. The helper binds all path components to the current session, rejects symlinks/hardlinks/oversized or unsupported files, and copies verified bytes to `image.jpg` (or `image.png`, detected from bytes). It ignores assistant prose and remote URLs as artifact evidence.
- Real square and 16:9 probes produced readable 1024×1024 and 1280×720 JPEGs. Exact resolutions and model availability remain CLI/account dependent; the input controls aspect ratio, not fixed dimensions, transparency, or image-model selection.

The runtime reuses the code wrapper's validated cached-auth reference and post-run mutation check. It does not copy auth into artifacts or emit Grok's raw messages. This is a trusted local CLI workflow, without hostile same-UID isolation. Native/system configuration and CLI version changes may affect behavior. Fail closed on an unrecognized tool contract and re-probe before adapting it.

Upstream implementation pointers: [native image_gen](https://github.com/xai-org/grok-build/blob/main/crates/codegen/xai-grok-tools/src/implementations/grok_build/image_gen/mod.rs), [structured MediaGenOutput](https://github.com/xai-org/grok-build/blob/main/crates/codegen/xai-grok-tools/src/types/output.rs). These are moving references; the local observations above establish the tested contract.

## Maintenance checks

```bash
node --test <skill-dir>/tests/grok-image.test.mjs
node --test <skill-dir>/tests/grok-delegate.test.mjs
```

The image tests use a temporary mock CLI and fake auth, exercise successful artifact extraction and failure paths, and consume no image quota. After changing Grok flags or ACP parsing, also run one explicitly authorized real generation and view the resulting image. A passing mock cannot prove the native tool is currently available.
