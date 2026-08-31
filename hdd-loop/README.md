# hdd-loop

An Agent Skills-compatible package for **Hallucination-Driven Design (HDD)**.

HDD uses a speculative Dreamer model to experience a not-yet-existing artifact as already usable, then iteratively applies Red Pen pressure, continuity constraints, capability removal, and late implementation grounding to harvest novel affordances.

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
python3 scripts/hdd.py dream
```

If no Dreamer transport is configured, the last command writes a manual prompt under `.hdd/outbox/`.

See `references/AUTH.md` for OpenRouter, OpenAI-compatible, command, and manual transports.

## Reference Dreamer

The historical reference loop used the original DeepSeek R1 behavior because its willingness to over-complete speculative environments was useful for affordance exploration.

The method does not require R1 and does not treat its hallucinations as factual evidence.
