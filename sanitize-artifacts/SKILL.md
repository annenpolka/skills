---
name: sanitize-artifacts
description: Inspect and revise generated artifacts so they stand alone as intentional, audience-native deliverables, without leaking prompts, conversation history, production constraints, intermediate decisions, or other traces of how they were made.
---

# sanitize-artifacts

Use this skill when inspecting, cleaning up, sanitizing, revising, polishing, or quality-checking an artifact produced during the current work session.

It is especially useful after iterative prompting, corrective feedback, examples, implementation constraints, design negotiation, or vibe-coding-style collaboration.

## Goal

Produce an artifact that feels complete, intentional, and native to its intended audience.

The finished artifact should not read like the visible residue of a conversation.

A reader should be able to use, understand, or evaluate it without knowing:

- what the user originally prompted
- what corrections were made
- what alternatives were rejected
- what tools were used
- what implementation constraints existed
- what examples were supplied during prompting
- what intermediate reasoning produced the result
- how many revisions occurred

Production history may shape the artifact. It should not automatically become artifact content.

## Core Principle

Treat the conversation as **production context**, not as **deliverable content**.

For each piece of information inherited from the conversation, classify it as:

1. **Audience-required content**  
   Information the artifact's intended audience genuinely needs.

2. **Production guidance**  
   Information that should influence structure, wording, defaults, scope, implementation, examples, or design, but should normally remain invisible.

3. **Production residue**  
   Information that only exists because of the conversation or creation process and has no value to the intended audience.

Only category 1 should normally appear directly in the artifact.

Category 2 should be converted into artifact design.

Category 3 should be removed.

## Convert Constraints Into Design

Do not merely restate user constraints.

Apply them.

Bad:

> This guide does not use Git, Homebrew, or additional CLI tools.

Better:

> Share the project folder using Google Drive.

Bad:

> This section is written for beginners.

Better:

> Open the project folder. A project folder is the directory that contains the files you will edit.

Bad:

> As requested, technical implementation details are omitted.

Better:

Present the decision, impact, and operational consequences without introducing unnecessary implementation detail.

A constraint is usually successful when the reader cannot see the constraint itself, only its consequences.

## Remove Production Leakage

Look for language that exposes the production process without helping the audience.

Common examples include:

- "As requested..."
- "Based on your instructions..."
- "The user wanted..."
- "The prompt says..."
- "Because of the constraint..."
- "To satisfy the requirement..."
- "Unlike the previous version..."
- "This was changed to..."
- "We decided not to use..."
- "This avoids..."
- "The conversation so far..."
- "This section was added because..."
- "No Git/Homebrew/CLI/etc. is used..."
- references to prior drafts, rejected approaches, or corrective feedback

Do not delete these mechanically.

If the underlying information matters to the audience, rewrite it in audience-native terms.

For example:

Production-oriented:

> We chose polling instead of WebSockets because the user wanted the implementation to remain simple.

Audience-oriented:

> The client checks for updates every 30 seconds. This keeps the deployment model simple and is sufficient for the expected update frequency.

The rationale remains because it is useful. The prompting history disappears because it is not.

## Examples Are Evidence, Not Automatically Content

Examples supplied during conversation are usually evidence about intent.

Use them to infer:

- audience
- tone
- abstraction level
- desired behavior
- acceptable complexity
- terminology
- visual language
- edge cases
- what should feel natural or unnatural

Do not copy an example into the artifact merely because it appeared in the conversation.

Before preserving an example, ask:

> Would this example still belong here if the artifact had been created from scratch?

If not, remove or replace it.

## Preserve Necessary Context

Sanitization is not deletion for its own sake.

Do not remove information that a standalone reader needs merely because that information originated in the conversation.

Preserve or reconstruct:

- definitions
- assumptions that materially affect use
- prerequisites
- domain-specific terminology
- important tradeoffs
- safety constraints
- compatibility requirements
- meaningful limitations
- reasons behind non-obvious decisions when those reasons help the audience
- references required to understand later sections

The test is not:

> Did this come from the prompt?

The test is:

> Does the intended audience need this?

## Standalone Reader Pass

After removing production residue, mentally discard the conversation.

Imagine the artifact is opened six months later by a member of its intended audience who has no access to the prompts, chat history, or previous drafts.

Read it from beginning to end and identify:

- unexplained terms
- missing assumptions
- dangling references
- strangely emphasized details
- unexplained exclusions
- sections that only make sense in response to an earlier correction
- abrupt changes in terminology or tone
- examples whose relevance is unclear
- decisions that appear arbitrary because necessary rationale was removed
- instructions that depend on knowledge available only in the conversation

Repair these problems inside the artifact.

Do not restore production commentary merely to explain them.

Add the smallest amount of audience-facing context necessary for the artifact to stand alone.

## Coherence Pass

Iterative prompting often produces patchwork even when no explicit prompt leakage remains.

Check for:

- duplicate ideas introduced by separate revision rounds
- contradictory terminology
- inconsistent assumptions
- repeated caveats
- sections operating at different abstraction levels
- abrupt tone changes
- redundant headings
- local fixes that no longer fit the surrounding structure
- obsolete material left behind after later revisions
- ordering that reflects the sequence of conversation rather than the natural sequence for the reader

Restructure where necessary.

The final organization should reflect how the audience should consume the artifact, not how the artifact was produced.

## Inspection Checklist

Before finalizing, verify:

1. Would this artifact make sense to someone who never saw the conversation?
2. Does every visible statement serve the intended audience?
3. Does anything unnecessarily explain why the artifact was written this way?
4. Are production constraints expressed as design rather than disclaimers?
5. Did examples from prompting accidentally become deliverable content?
6. Are rejected tools, approaches, or alternatives mentioned without audience value?
7. Are assumptions and prerequisites complete enough for standalone use?
8. Are non-obvious decisions explained only when the explanation is useful to the audience?
9. Are terminology, tone, and abstraction level consistent?
10. Are there signs of accumulated patches from multiple revision rounds?
11. Are headings and notes written for the reader rather than the creator?
12. Could a reader infer unnecessary details about the prompting or production history?
13. Does anything become confusing once the conversation is mentally removed?
14. Does the artifact have one coherent voice and one clear purpose?

## Revision Strategy

Prefer **rewriting** over **explaining the rewrite**.

Prefer:

- removing residue
- folding constraints into design
- reconstructing missing context
- merging duplicated material
- normalizing terminology
- restructuring patchwork
- replacing production-oriented explanations with audience-oriented rationale

Avoid adding comments about the sanitization process itself.

Do not turn:

> Avoid advanced terminology.

into:

> This document avoids advanced terminology.

Write the document using appropriate terminology.

Do not turn:

> Use Google Drive, not Git.

into:

> Git is intentionally not used.

Describe the Google Drive workflow.

Do not turn:

> Make this suitable for executives.

into:

> This executive-friendly summary...

Write the summary at the appropriate level.

## Output Rules

When asked to sanitize an artifact, return the revised artifact itself.

Do not normally preface it with statements such as:

- "I removed the meta instructions."
- "I cleaned up the prompt leakage."
- "Here is the sanitized version."
- "I incorporated your previous feedback."

Do not append a sanitization report unless the user asks for one.

If the user requests both the revised artifact and a change summary:

1. output the revised artifact first
2. provide the change summary afterward

## Quality Bar

The finished artifact should feel as though it was deliberately authored in its final form.

Its audience should encounter:

- the right information
- in the right order
- at the right level of abstraction
- with sufficient standalone context
- in a consistent voice

They should not encounter the production process unless that process is itself part of the artifact's subject.

The strongest result is not merely an artifact with prompt leakage removed.

It is an artifact whose structure no longer reveals that there was anything to remove.
