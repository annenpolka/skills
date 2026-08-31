# Dreamer Prompting Policy

The Dreamer must not be told that it is the Dreamer in an HDD loop.

This file documents orchestration policy for the host agent. Do not paste it directly into the external model prompt.

## Rule

Compile meta-aware HDD state into an in-world prompt before every Dreamer turn.

The external Dreamer may receive:

- the seed situation;
- a sanitized previous field report;
- behavior already demonstrated;
- facts and limits that are now known inside the world;
- the operator's current request;
- new constraints phrased as newly discovered facts.

The external Dreamer must not receive HDD control vocabulary such as:

- HDD or Hallucination-Driven Design;
- Dreamer;
- Red Pen;
- Ledger;
- Preserve / Rejected / Harvest Candidate as methodological categories;
- stop-condition scoring or novelty evaluation;
- instructions to "satisfy the critic" or "evolve the design".

Open Questions and Harvest Candidates are host/critic state and are intentionally withheld from the Dreamer unless a human explicitly turns one into an in-world request.

## Why

The reference `vc witness` run showed a failure mode where meta leakage changed the model's mode of thought. Later turns began with phrases such as "We are under Red Pen pressure" and became feasibility/design monologues instead of artifact usage traces.

Earlier Vesper/9 exploration was stronger because the model believed only that it was inside an unfamiliar environment and had to operate it.

## Prompt compilation

Translate control state as follows:

- Preserve -> behavior already demonstrated in the world;
- Established -> facts previously observed;
- Rejected -> interpretations now known to be wrong or unavailable;
- Constraints -> newly confirmed limits;
- Human Pressure -> current operator request or newly supplied fact;
- Red Pen pressure -> new information or conditions that have just become known;
- Open Questions -> keep private by default;
- Harvest Candidates -> keep private.

Do not rewrite the raw transcript. Preserve it for audit. Sanitize only the view shown to the next Dreamer.
