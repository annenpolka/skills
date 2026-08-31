# hdd-loop

An Agent Skills-compatible package for **Hallucination-Driven Design (HDD)**.

HDD uses a speculative model to experience a not-yet-existing artifact as already usable, then iteratively applies Red Pen pressure, continuity constraints, capability removal, and late implementation grounding to harvest novel affordances. The external Dreamer is kept **diegetic**: it is not told that HDD, Red Pen, or a Ledger exists.

Before grounding, Red Pen records a reality-stripped affordance assessment that distinguishes a novel operation, a useful composition, a thin wrapper, and an idea that does not survive removal of fictional machinery.

## Package layout

```text
hdd-loop/
├── SKILL.md
├── README.md
├── scripts/
├── references/
└── assets/
```

`SKILL.md` is intentionally thinner than the complete method. Detailed material is progressively loaded from `references/`.

## Quick start

```bash
python3 scripts/validate_skill.py .
python3 scripts/hdd.py doctor
python3 scripts/hdd.py init --seed 'An unfamiliar development CLI is already installed. Discover and use it.'
python3 scripts/hdd.py preview-dream --check-meta
python3 scripts/hdd.py dream
```

`preview-dream --check-meta` is useful when changing prompt policy: it fails if core orchestration vocabulary leaks into the external Dreamer prompt.

Each `init` creates an independent timestamped trial under `.hdd/` and updates
`.hdd/current` to point at it. Name a trial with `init --trial NAME`; select an older
trial with commands such as `status --trial NAME`. Existing trials are left intact.

If no Dreamer transport is configured, the last command writes a manual prompt under
`.hdd/current/outbox/`.

See `references/AUTH.md` for OpenRouter, OpenAI-compatible, command, and manual transports.

## Reference Dreamer

The historical reference loop used the original DeepSeek R1 behavior because its willingness to over-complete speculative environments was useful for affordance exploration.

The method does not require R1 and does not treat its hallucinations as factual evidence.

## Prompt architecture

The host and Red Pen operate on the full HDD Ledger. Before each external Dreamer call, the runner compiles that meta state into an in-world field brief. Open Questions and Harvest Candidates are withheld by default. Exact prompts and raw responses remain in the workspace transcript for audit.
