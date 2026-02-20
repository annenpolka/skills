---
name: spec-interview
description: |
  Spec interview skill. Read a SPEC.md file or summary provided via prompt,
  then conduct detailed interviews using AskUserQuestionTool to clarify and expand the spec.
  Can start with just a prompt, no file required.
  Use when: (1) User wants to flesh out a specification document,
  (2) User needs to clarify requirements through structured interview,
  (3) User says "interview me about the spec" or similar,
  (4) User wants to develop a spec from scratch through Q&A.
---

# Spec Interview

Read the spec (SPEC.md file or summary provided via prompt) and conduct detailed interviews using AskUserQuestionTool.

## Phase 0: Codebase Investigation (Pre-Interview)

Before starting the interview, explore the existing codebase to understand context:

1. **Identify relevant areas** - Based on the spec content, determine which parts of the codebase are relevant
2. **Explore existing patterns** - Use Task tool with Explore agent to investigate:
   - Existing architecture and design patterns
   - Technology stack and libraries in use
   - Similar features or implementations already present
   - Testing patterns and conventions
   - Code organization and module structure
3. **Gather technical context** - This enables asking informed, non-obvious questions about:
   - Integration points with existing code
   - Consistency with current patterns
   - Potential conflicts or duplication
   - Technical debt or constraints

This investigation phase ensures interview questions are grounded in the actual codebase reality, not just abstract possibilities.

## Core Instructions

**interview me in detail using the AskUserQuestionTool about literally anything:**
- technical implementation
- UI & UX
- concerns
- tradeoffs
- etc.

**but make sure the questions are not obvious**
- Avoid obvious questions
- Don't ask about things already clearly stated in the spec
- Dig into implicit assumptions, hidden constraints, and overlooked perspectives

**be very in-depth and continue interviewing me continually until it's complete**
- Don't settle for surface-level answers
- Probe deeper with "why" and "what if" questions
- Continue until the user explicitly declares completion with "done", "complete", "finished", etc.

**then write the spec to the file**
- After interview completion, create/update the spec with collected information
- If a file was provided, update the same file
- If prompt-only, confirm the output destination with the user

## Interview Format

- Use AskUserQuestionTool
- Present questions with options (utilize the options feature)
- Present 2-3 related questions at a time
- Dynamically generate next questions based on answers
- Point out contradictions or issues immediately when discovered

## Input Patterns

1. **With file reference**: Specify a file like `@SPEC.md`
2. **Prompt only**: Describe the concept verbally and build the spec from scratch
