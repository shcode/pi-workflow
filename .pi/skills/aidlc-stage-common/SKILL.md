---
name: aidlc-stage-common
description: >
  Canonical stage protocols for AIDLC. Stage skills reference these to avoid
  duplicating the procedural flow. Loaded on demand when a stage skill says
  "Load `aidlc-stage-common` for ...".
---

# AIDLC Stage Common Protocol

## Standard Q&A

Used by stages that follow: Plan → Questions → Generate → Approve.

1. **Store plan** at `{plan-path}` (if specified)
2. **Q&A**: Load `aidlc-questions` and follow its MODE GATE. Create questions for the listed categories. **HARD STOP** — do NOT answer yourself. Wait for user.
3. **Analyze**: Review all answers for vague language ("mix of", "not sure", "depends", "maybe"). If ambiguous, create follow-up questions. Do not proceed until resolved or user says "proceed"
4. **Compact summary**: Create `{answers-path}` with one row per Q+A (condensed question ≤10 words)
5. **Generate artifacts** per the stage's artifact list
6. **Present**: completion message template with stage emoji, artifact path, next stage name
7. **Approval gate**: Wait for explicit user approval. On approval: log in `audit.md`, update progress tracking, mark stage `[x]`

## Question-Only

Same as Standard Q&A, but **skip step 1** (no plan file — questions ARE the plan).

Used by: NFR Requirements, NFR Design, Operations Part 1.

## Two-Part (Planning + Generation)

### Part 1: Planning
1. **Q&A**: Same as Standard Q&A steps 1-3 (plan + questions)
2. **Store plan** at `{plan-path}`
3. **Present plan** to user, wait for explicit approval before generation
4. **Log**: approval prompt + response in `audit.md`, mark Part 1 complete

### Part 2: Generation
1. **Load plan** from `{plan-path}`, find next uncompleted step
2. **Execute** steps sequentially, mark `[x]` after each
3. **Verify** all mandatory artifacts complete
4. **Present**: completion message template
5. **Approval gate**: Wait for explicit user approval. On approval: log in `audit.md`, update progress, mark stage `[x]`

## Completion Message Template

```markdown
# {emoji} {Stage Name} Complete{ - optional-unit-name}

[AI Summary - bullet points of key artifacts]

> **📋 REVIEW REQUIRED:** `{artifact-path}`
> **🚀 WHAT'S NEXT?** {next-stage}
> **You may:** 🔧 Request Changes | ✅ Approve & Continue
```

## Approval Gate Rule

- **Do NOT proceed** without explicit user approval
- If changes requested → return to generation step
- On approval → log in `audit.md`, update progress tracking, mark stage `[x]` in state