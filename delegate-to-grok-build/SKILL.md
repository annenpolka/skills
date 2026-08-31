---
name: delegate-to-grok-build
description: Delegate a frozen, authorized code implementation, bug fix, refactor, or cleanup to Grok Build while Codex remains the author and auditor. Use only when the user explicitly asks Codex to have Grok or Grok Build edit code; do not use for consultation, exploration, deploys, production data, external or irreversible operations, or work without frozen scope and mechanical completion oracles.
---

# Delegate to Grok Build

Codex owns the task contract, authorization, verification, and final judgment. Grok Build is only the executor inside a transaction-local clone.

Before starting:

1. Freeze scope, write authorization, acceptance criteria, verification commands, limits, and human-owned residue with the user. Do not use this skill while those remain negotiable.
2. Read [references/delegation-contract.md](references/delegation-contract.md), create its strict task JSON, and show the user the consequential authorization choices.
3. Choose the execution profile explicitly. `hardened` currently requires macOS plus a positively probed `sandbox-exec` boundary; unsupported systems and rejected probes fail closed before Grok starts. Choose `trusted_local` only with user approval for that transaction and only for a trusted repository. Label it `transactional_only`: both profiles use transaction-private runtime homes, but same-UID executor or verifier code is not isolated from the source checkout or host state. Trusted-local cached auth is referenced only after strict duplicate-free JSON/file validation and is fingerprinted after every round; a refresh or hostile mutation is detected after the fact, not prevented or rolled back. Require an absolute-entry-only `PATH`; runtime Git/Grok/verifier/shell executables are transaction-bound and drift makes continuation or apply fail closed.
4. Run `scripts/grok-delegate.mjs start` with task JSON on stdin. Never put the task or feedback on the command line.
5. Audit the normalized result and artifacts. A Grok report is never evidence. Use `continue` only to address recoverable failures without widening the frozen contract.
6. Run `apply` only after `candidate_ready` and a final human review of the pending residue. `apply` changes the source working tree but never stages, commits, pushes, merges, rebases, or deploys. Use `discard` only when the user explicitly chooses to delete the transaction.

Keep semantic code quality and product judgment human-owned. The trusted-local source fingerprint includes tracked, untracked, and ignored source entries and detects source changes after execution; it does not prevent hostile same-UID writes. Edit/Write evidence binds observable paths and round deltas, not exact final bytes, so always review the final diff. Treat unavailable OS sandboxing, hardened verifier read confidentiality and inherited file descriptors, cached-auth mutation, repository-native or system/MDM configuration, Grok permission behavior across versions, exact-value-only secret redaction, same-UID state tampering, and concurrent apply races as unresolved trust decisions. Hostile code requires a separate container or VM boundary outside this skill.

Read [references/acp-contract.md](references/acp-contract.md) only when maintaining or debugging the ACP client.
