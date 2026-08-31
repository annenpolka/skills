# Authentication and Model Transports

The skill itself must not store provider secrets.

The bundled runner resolves a transport for each role independently.

The Dreamer is normally external. The host agent is normally the Red Pen, so critic credentials are optional.

## Resolution order

For a role prefix such as `HDD_DREAMER` or `HDD_CRITIC`, the runner uses an explicit `<PREFIX>_TRANSPORT` when set.

If it is not set, it infers:

1. `command` when `<PREFIX>_CMD` exists;
2. `openrouter` for the Dreamer when `OPENROUTER_API_KEY` exists;
3. otherwise `manual`.

## OpenRouter

Reference configuration for the original DeepSeek R1 line:

```bash
export OPENROUTER_API_KEY='sk-or-v1-...'
export HDD_DREAMER_TRANSPORT='openrouter'
export HDD_DREAMER_MODEL='deepseek/deepseek-r1'
```

Do not confuse the original R1 slug with the later `deepseek/deepseek-r1-0528` unless the newer model is intentionally desired.

Optional settings:

```bash
export HDD_DREAMER_MAX_TOKENS='16384'
export HDD_DREAMER_TEMPERATURE='0.7'
export HDD_HTTP_REFERER='https://example.invalid/hdd-loop'
export HDD_APP_TITLE='hdd-loop'
```

The runner calls OpenRouter's OpenAI-compatible chat-completions endpoint using only Python's standard library.

## Generic OpenAI-compatible endpoint

Useful for local servers or other providers:

```bash
export HDD_DREAMER_TRANSPORT='openai-compatible'
export HDD_DREAMER_BASE_URL='http://127.0.0.1:8080/v1'
export HDD_DREAMER_MODEL='deepseek-r1'
export HDD_DREAMER_API_KEY='optional-token'
```

`HDD_DREAMER_BASE_URL` may be a `/v1` base or a full `/chat/completions` URL.

Use equivalent `HDD_CRITIC_*` variables if an external critic is desired.

## Command adapter

Any program that reads the prompt from stdin and writes the model response to stdout can be used.

```bash
export HDD_DREAMER_TRANSPORT='command'
export HDD_DREAMER_CMD='my-llm-cli --model deepseek-r1'
```

The runner tokenizes the command using shell-like quoting but does not invoke a shell pipeline.

This is intentionally generic so authentication can remain entirely inside the user's existing CLI.

## Manual mode

With no usable external transport, Dreamer invocation is still supported.

Run:

```bash
python3 scripts/hdd.py dream
```

The runner writes a prompt under:

```text
.hdd/current/outbox/NNNN-dreamer-prompt.md
```

Here `current` points to the selected trial. When operating on a named or exact-path
workspace, read the prompt from that trial's `outbox/` directory instead.

Run that prompt in OpenRouter Chat or any other model UI, save the response, then ingest it:

```bash
python3 scripts/hdd.py ingest-dreamer --file r1-response.md
```

The runner then prepares the Red Pen request.

This mode is first-class. Direct API authentication is an optimization, not a requirement of HDD.

## External critic

The recommended default is to let the host agent perform Red Pen analysis.

For unattended loops, configure a separate critic:

```bash
export HDD_CRITIC_TRANSPORT='openai-compatible'
export HDD_CRITIC_BASE_URL='https://provider.example/v1'
export HDD_CRITIC_MODEL='grounded-critic-model'
export HDD_CRITIC_API_KEY='...'
```

or a command adapter:

```bash
export HDD_CRITIC_TRANSPORT='command'
export HDD_CRITIC_CMD='critic-cli --json'
```

The external critic must follow the JSON contract in `references/RED_PEN.md`.

## Secret handling

The runner:

- never writes API keys to `.hdd`;
- never prints full API keys;
- does not automatically parse `.env` files;
- reads secrets only from process environment variables;
- passes prompts over stdin in command mode rather than command-line arguments.

Use `python3 scripts/hdd.py doctor` to inspect transport resolution without printing secrets.
