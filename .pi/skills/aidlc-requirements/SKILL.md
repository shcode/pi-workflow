---
name: aidlc-requirements
description: >
  AIDLC Requirements Analysis stage. Load during inception phase to gather and document
  functional and non-functional requirements. Adaptive depth - minimal/standard/comprehensive
  based on complexity. Always executes. Handles extension opt-in prompts.
---

# Requirements Analysis

**Purpose**: Gather and validate requirements

**Condition**: ALWAYS EXECUTE (adaptive depth)

---

## Adaptive Depth

- **Minimal**: Simple, clear request - document intent analysis only
- **Standard**: Normal complexity - gather functional and non-functional requirements
- **Comprehensive**: Complex, high-risk - detailed requirements with traceability

See `aidlc-common` skill for depth-levels reference. Load `aidlc-questions` skill for question format.

---

## Execution Steps

### Step 1: Load Context

**IF brownfield project**:
- Load `aidlc-docs/inception/reverse-engineering/architecture.md`
- Load `aidlc-docs/inception/reverse-engineering/component-inventory.md`
- Load `aidlc-docs/inception/reverse-engineering/technology-stack.md`

**IF `aidlc-docs/backlog.md` exists and has open items**:
- Read `backlog.md`
- Ask: "There are open backlog items. Should any be included in this session?" (inline, one question)
- If yes: include selected items as requirements candidates; mark as `[>]` in backlog.md

### Step 2: Analyze User Request (Intent Analysis)

#### 2.1 Request Clarity
- **Clear**: Specific, well-defined, actionable
- **Vague**: General, ambiguous, needs clarification
- **Incomplete**: Missing key information

#### 2.2 Request Type
- New Feature, Bug Fix, Refactoring, Upgrade, Migration, Enhancement, New Project

#### 2.3 Initial Scope Estimate
- Single File, Single Component, Multiple Components, System-wide, Cross-system

#### 2.4 Initial Complexity Estimate
- Trivial, Simple, Moderate, Complex

### Step 3: Determine Requirements Depth

Based on request analysis, determine depth (minimal/standard/comprehensive).

### Step 4: Assess Current Requirements

Analyze whatever user has provided:
- Intent statements (already logged in audit.md)
- Existing requirements documents
- Pasted content or file references
- Convert non-markdown documents to markdown

### Step 5: Thorough Completeness Analysis

**CRITICAL**: Evaluate ALL areas and ask questions for ANY that are unclear:
- **Functional Requirements**: Core features, user interactions, system behaviors
- **Non-Functional Requirements**: Performance, security, scalability, usability
- **User Scenarios**: Use cases, user journeys, edge cases, error scenarios
- **Business Context**: Goals, constraints, success criteria, stakeholder needs
- **Technical Context**: Integration points, data requirements, system boundaries
- **Quality Attributes**: Reliability, maintainability, testability, accessibility

**When in doubt, ask questions** - incomplete requirements lead to poor implementations.

### Step 5.1: Extension Opt-In Prompts

**MANDATORY**: Scan all loaded `*.opt-in.md` files for `## Opt-In Prompt` sections. Include each question in the clarifying questions file.

After receiving answers:
1. Record each extension's enablement status in `aidlc-docs/aidlc-state.md` under `## Extensions` (compact table):

```markdown
## Extensions
| Name | Enabled |
|------|---------|
| [Extension Name] | [Yes/No] |
```

2. **Deferred Rule Loading**: For extensions opted IN, load full rules file now (strip `.opt-in.md`, append `.md`). For opted OUT, do NOT load.

### Step 6: Q&A

Load `aidlc-stage-common` for Standard Q&A with:
- Questions path: `inception/plans/requirements-questions.md`
- Answers path: `inception/requirements/requirement-verification-answers.md`
- Categories: Functional Requirements, Non-Functional Requirements, User Scenarios, Business Context, Technical Context, Quality Attributes

Note: No plan file for requirements — the questions ARE the plan. Generate the compact answers summary as `requirement-verification-answers.md` with one row per Q+A (condensed question ≤10 words).

### Step 7: Generate Requirements Document

**PREREQUISITE**: Step 6 gate AND Step 6.5 compact summary complete

Create `aidlc-docs/inception/requirements/requirements.md`:
- Include intent analysis summary at top (user request, request type, scope, complexity)
- Include both functional and non-functional requirements
- Incorporate user's answers to clarifying questions
- Provide brief summary of key requirements

### Step 8: Update State Tracking

Follow Stage Transition from `aidlc-orchestrator`: mark row 3 `[x]` in `## Stages`, update `## Current Work`, update `## Resume` manifest, set `## Next`.

### Step 9: Present Completion

Load `aidlc-stage-common` completion message for: "🔍 Requirements Analysis", `aidlc-docs/inception/requirements/`, "[User Stories/Workflow Planning]"

> [IF User Stories will be skipped: add "📝 **Add User Stories**" option]

Wait for explicit user approval. Record approval response with timestamp.
