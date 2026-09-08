# Image generation and editing through Grok Build

Use this workflow when the user requests Grok-generated images or edits to existing art. It uses the installed `grok` CLI through ACP: `image_gen` for text-only generation, `image_edit` when `referenceImages` is supplied. The helper does not call another provider or implement the Imagine HTTP API itself. Video and bulk generation remain outside this entrypoint.

## Run and review

1. Write the user's image brief and aspect ratio to a JSON file. For an edit or likeness-preserving variation, inspect the source art and add its local path(s) to `referenceImages`; these image bytes will be sent to Grok for the requested edit. Choose a **new absolute output directory** whose parent exists. Use a durable artifact location for deliverables and a temporary location for probes. No Git repository is needed.
2. Run the helper below. An explicitly requested Grok image or edit is authorization for the corresponding one-image operation using the existing Grok authentication route. Preserve earlier authorization for image revisions in the same task. Reuse that authorization; do not ask again merely because this is an image. If `XAI_API_KEY` is already present, the helper uses it; otherwise it references validated existing cached Grok login. Do not add an API key, change accounts, or upgrade a subscription as a fallback.
3. Require exit code zero, `ok: true`, and the returned local artifact. Open `images[0].path` with the available image viewer, check the brief/composition and actual dimensions, and show it to the user with `![description](/absolute/path/image.jpg)` (use the returned extension). The helper checks the PNG/JPEG container, dimensions, size, and SHA-256; it does not fully decode the pixels or judge visual quality.
4. For an authorized revision, use a new directory, a revised prompt, and the relevant original or previously generated local image as a reference when needed. Each call starts a new session and produces one image. Do not silently retry a failure, timeout, or missing artifact: inspect the normalized error first, since a generation may already have consumed quota. When an error requires an account change, report it and let the user decide.

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

## Reference images

```json
{
  "schemaVersion": 1,
  "prompt": "Preserve the character in the first image and use the pose in the second. Keep the staff and its attached lantern together.",
  "referenceImages": ["/absolute/character.png", "/absolute/pose.png"],
  "aspectRatio": "16:9",
  "timeoutMs": 300000
}
```

`referenceImages` accepts 1–8 distinct absolute paths to local PNG/JPEG files, in priority order; omit the field for text-only generation. URLs, data URLs, empty arrays and relative paths are not accepted as request inputs. References must be regular files with one hard link; leaf symlinks are rejected. Each image is limited to 12 million pixels, and the combined source bytes to 32 MiB. These are helper bounds, not a guarantee about provider limits. File headers are inspected; Codex must still view/decode the originals and output.

The helper copies validated bytes into private `workspace/references/` files, starts Grok with only `image_edit`, and requires every requested copy in the tool's `image` array, in order. It checks the source and copy hashes again after the run. A Grok process changing a reference makes the result fail; this is detection after execution, not filesystem isolation.

If ACP advertises image prompts, the same bytes are attached as image content blocks with MIME types and durable file URIs. The audit can then resolve same-turn `[Image #N]` tokens to the copies. If ACP does not advertise image prompts, the helper sends the explicit file paths to `image_edit`, which reads and uploads those image bytes itself. This remains image-conditioned editing; no text-only fallback is permitted. `attachmentMode` makes the selected transport visible. Never invent attachment tokens when no images were attached.

For **one reference**, native `image_edit` preserves the input image's aspect ratio and ignores the requested ratio. For **multiple references**, it uses `aspectRatio`. The native tool may resize or compress reference images before upload, so this route does not guarantee pixel-exact preservation or transparency. References may include prior returned images, but each invocation uses a new session; it does not edit by recalling a previous session's attachment number.

The helper shares the code wrapper's absolute-entry-only `PATH` validation. If the host has empty or relative entries, supply an explicit absolute `PATH` containing Node, Grok (unless passed by absolute path), and system tools. Preserve necessary trusted runtime entries.

Stdout is one normalized JSON result. Success returns `images` entries with absolute `path`, `mimeType`, `width`, `height`, `bytes`, and `sha256`, plus `visualReviewRequired: true`. `tool` identifies `image_gen` or `image_edit`; `attachmentMode` is `none`, `acp-images`, or `tool-reference-paths`. For edits, `references` records the private copy paths, dimensions, size, MIME type and SHA-256. A private `result.json` records the same result. Output directories are created as `0700`, artifacts as `0600`; existing output directories are rejected and never overwritten. The directory also retains the private Grok session/runtime and a working directory containing any reference copies, including on failures. Share the returned image file, not the entire runtime directory. No automatic cleanup, staging, commit, or publication occurs.

## Observed behavior and limits

Verified locally with **Grok Build 1.0.13 (5e9a58528b76)** on 2026-09-08 using cached login:

- `--tools image_gen` exposes the native generator in ACP. The runner also disables web, MCP and subagents, uses a fresh empty working directory and private Grok/HOME/XDG directories, caps turns at two, and requests at most one parallel image-generation call.
- The native `_meta["x.ai/tool"]` tuple is version `1`, namespace `grok_build`, kind/name `image_gen`, `read_only: false`. Initial calls may omit the display `kind`; subsequent updates use `other`. Input is `prompt` plus `aspect_ratio`; a later fragment adds `variant: "ImageGen"`.
- **The tool executes without `session/request_permission`.** The code wrapper's Edit/Write permission ledger cannot authorize this operation. The image helper rejects any unexpected permission request, audits tool identity/count/input/lifecycle, and cancels on unexpected activity. These are observation checks; they cannot undo quota use or a tool that already ran. Do not describe the one-image request as a hard billing cap or the private directory as OS sandboxing.
- Successful terminal updates return `rawOutput.type: "ImageGen"` and a local path at `<private-grok-home>/sessions/<percent-encoded-cwd>/<session-id>/images/<number>.jpg`. The helper binds all path components to the current session, rejects symlinks/hardlinks/oversized or unsupported files, and copies verified bytes to `image.jpg` (or `image.png`, detected from bytes). It ignores assistant prose and remote URLs as artifact evidence.
- Real square and 16:9 probes produced readable 1024×1024 and 1280×720 JPEGs. Exact resolutions and model availability remain CLI/account dependent; the input controls aspect ratio, not fixed dimensions, transparency, or image-model selection.

Reference editing was also verified on **Grok Build 1.0.13** on 2026-09-08 with existing local authentication. The session did not advertise ACP image prompts; `attachmentMode: "tool-reference-paths"` passed two private PNG copies to native `image_edit` and returned a fully decoded 1280×720 JPEG with one observed tool call. Source and copy hashes remained unchanged. The output retained the referenced character's attached lantern and costume more closely than text-only trials. This establishes native reference editing on that local account, not visual perfection or availability on every account.

The observed edit identity is namespace `grok_build`, **name `image_edit`, kind `image_gen`**, version `1`, `read_only: false`; the input adds an `image` array, its variant is `ImageEdit`, and the terminal output type is `ImageEdit`. The audit requires this exact combination and all selected references in order. ACP image-block delivery and same-turn token resolution are covered by mock tests; they were not exercised against the live CLI because it did not advertise that capability.

The runtime reuses the code wrapper's validated cached-auth reference and post-run mutation check. It does not copy auth into artifacts or emit Grok's raw messages. This is a trusted local CLI workflow, without hostile same-UID isolation. Native/system configuration and CLI version changes may affect behavior. Fail closed on an unrecognized tool contract and re-probe before adapting it.

Upstream implementation pointers: [native image_edit](https://github.com/xai-org/grok-build/blob/main/crates/codegen/xai-grok-tools/src/implementations/grok_build/image_edit/mod.rs), [native image_gen](https://github.com/xai-org/grok-build/blob/main/crates/codegen/xai-grok-tools/src/implementations/grok_build/image_gen/mod.rs), [structured MediaGenOutput](https://github.com/xai-org/grok-build/blob/main/crates/codegen/xai-grok-tools/src/types/output.rs). These are moving references; the local observations above establish the tested contract.

## Maintenance checks

```bash
node --test <skill-dir>/tests/grok-image.test.mjs
node --test <skill-dir>/tests/grok-delegate.test.mjs
```

The image tests use a temporary mock CLI and fake auth, exercise successful artifact extraction and failure paths, and consume no image quota. After changing Grok flags or ACP parsing, also run the affected image operation with user-authorized inputs and view the resulting image. Exercise both text generation and image editing in mocks; reference routing, capability negotiation, path substitution, file mutation and output variants need independent checks. A passing mock cannot prove the native tool is currently available.
