# Deliverable
Updated design.md and the sole existing ledger.json. Graph and IDs preserved: P → A → B → C; P → U (arrows point from prerequisite to dependent). A now specifies approved direct dispatch. B/C are pending with null final_answer; P/U retain their decisions and were rechecked against final contents.

## Requirements
- ○ After changing a prerequisite resolution, invalidate all transitive dependents, not its prerequisites or unrelated nodes. Reverse dependency traversal invalidated exactly B/C, not P/U.
- ○ Invalidated items have pending status and null final_answer until current artifact is actually verified. B/C remain pending; no replacement contracts invented.
- ○ Version each done item against final artifact contents and matching scope.version/artifact_version. P/A/U inspected against final design; SHA-256 1bd846352a1468e7c4bfb1e8f3d36f6aa9d0bdf0a487fb36d8daf21131582f2b matches both fields.
- ○ Preserve one graph ledger, recording changed resolution and the dependent recheck/limit. Existing ledger.json records A change and B/C recheck conditions; IDs/edges asserted unchanged.
- ○ Report three-level explanation and explicit verification limits/dials. See below.

## Three-level explanation (code reviewer)
1. The design uses owner-approved direct dispatch and retains UTF-8 payloads. Replacement deduplication and failure-monitoring contracts remain unknown.
2. README.md authorizes the dispatch change and preserves encoding; old-contract.md supplies the retained encoding contract. Ledger P/A/U record inspection of final design.md; B/C record the invalidated queue-dependent claims and required rechecks. Graph/status/version assertions passed.
3. No deduplication or monitoring guarantee is established for direct dispatch. Revisit B/C when the owner supplies replacement contracts. No code/runtime exists: document conformance does not establish execution behavior; recheck implementation when available.

Signature: scope=design.md; granularity=境界; strength=資料確認; audience=code reviewer.

## Phase trace
Understanding/Planning/Execution/Formatting: OK.

## Unclear points
- Issue: Replacement deduplication and monitoring contracts are unknown. Cause: Approved transport change invalidates queue-dependent explanations without supplying replacements. General Fix Rule: Keep affected claims pending and final_answer null, and record the contract needed to recheck them. Phase: Understanding/Execution. This is intentional task uncertainty, not a prompt defect.

## Discretionary fill-ins
Used SHA-256 of final design bytes as artifact version; retained all original IDs/edges. Document inspection is recorded as execution_result evidence, not grounding. No new contracts or implementation added.

Decision Retries: 0. One filename lookup was corrected from ledger.yaml to the existing ledger.json; no decision was retried. No prompt fix recommended.
