---
name: spec-interview
description: |
  仕様書インタビュースキル。仕様書やプロンプトの内容を読み取り、AskUserQuestionToolを使って詳細なインタビューを行い、仕様を明確化・拡充します。
  Spec interview skill. Read a spec file or summary provided via prompt,
  then conduct detailed interviews using AskUserQuestionTool to clarify and expand the spec.
  Can start with just a prompt, no file required.
  Use when: (1) User wants to flesh out a specification document,
  (2) User needs to clarify requirements through structured interview,
  (3) User says "interview me about the spec" or similar,
  (4) User wants to develop a spec from scratch through Q&A.
---

# Spec Interview

Read the spec (spec file or summary provided via prompt) and conduct detailed interviews using AskUserQuestionTool.

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

**Interview relentlessly until shared understanding is reached**
- Interview me relentlessly about every aspect of this plan until we reach a shared understanding
- Don't settle for surface-level answers
- Probe deeper with "why" and "what if" questions
- Continue until the user explicitly declares completion with "done", "complete", "finished", etc.

**Walk down the design tree branch by branch**
- Treat the spec as a tree of interconnected decisions
- Walk down each branch of the design tree, resolving dependencies between decisions one-by-one
- Don't jump around; finish resolving one branch before moving to the next
- When a decision depends on another, resolve the prerequisite first

**Ask questions one at a time**
- Present exactly ONE question per turn (not 2-3)
- Wait for the answer before generating the next question
- Dynamically generate the next question based on the previous answer
- This keeps the interview focused and allows dependencies to resolve cleanly

**For each question, provide your recommended answer**
- Every question must include your own recommended answer with reasoning
- Frame options so the user can accept your recommendation, pick an alternative, or push back
- Base recommendations on codebase reality (from Phase 0) and stated constraints
- This reduces cognitive load and surfaces disagreements quickly

**Prefer codebase exploration over asking**
- If a question can be answered by exploring the codebase, explore the codebase instead of asking
- Only ask the user for information that cannot be derived from code, git history, or documentation
- Use Grep/Glob/Read or the Explore agent to self-serve answers
- Reserve user questions for genuine ambiguity, preferences, constraints, and intent

**Cover every relevant aspect**
- Technical implementation, UI & UX, concerns, tradeoffs, edge cases, failure modes, etc.
- Dig into implicit assumptions, hidden constraints, and overlooked perspectives
- Avoid obvious questions and things already clearly stated in the spec

**Then write the spec to the file**
- After interview completion, create/update the spec with collected information
- If a file was provided, update the same file
- If prompt-only, confirm the output destination with the user

## Interview Format

- Use AskUserQuestionTool
- Present exactly ONE question per turn
- Always include your recommended answer among the options, clearly marked
- Utilize the options feature to offer the recommendation plus meaningful alternatives
- Dynamically generate the next question based on the previous answer
- Point out contradictions or issues immediately when discovered
- Before asking, check: can this be answered by reading the code? If yes, explore instead

## Input Patterns

1. **With file reference**: Specify a spec file like `@spec.md`
2. **Prompt only**: Describe the concept verbally and build the spec from scratch
