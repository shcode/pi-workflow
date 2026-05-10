---
name: aidlc-common
description: >
  Common rules shared across all AIDLC phases. Load at workflow start after orchestrator.
  Contains session continuity, content validation, question formatting, audit logging,
  depth levels, welcome message rules, and error handling. Required before any stage execution.
---

# AIDLC Common Rules

Load this skill at the start of every AIDLC workflow session.

---

## Session Continuity

### Audit Rotation (on resume)

When resuming a project (`aidlc-state.md` exists), rotate stale entries out of `audit.md`:
1. `head -n 5 aidlc-docs/audit.md` — check first timestamp only
2. If entries exist from a **previous calendar day** (not today):
   - Create `aidlc-docs/audit/` directory if it doesn't exist
   - Move all entries older than today to `aidlc-docs/audit/YYYY-MM-DD.md` (using the entry date)
   - Leave only today's entries (or header only) in `audit.md`
3. If all entries are from today: do nothing

This is the ONLY time `audit.md` content is read — solely for date-checking during rotation.

### Welcome Back Prompt

When returning to existing project (aidlc-state.md exists):

```markdown
**Welcome back! I can see you have an existing AI-DLC project in progress.**

Based on `aidlc-state.md`:
- **Project**: [Project.Type]
- **Current Stage**: [Project.Stage]
- **Current Work**: [Current Work.Stage / Unit / Step]
- **Next**: [Next field]

**What would you like to work on today?**
- A) Continue — Pick up from [Next step description]
- B) Review — Show and revisit a previous stage

[Answer]: 
```

### Mandatory: Load Previous Stage Artifacts

Before resuming ANY stage, automatically read all relevant artifacts from previous stages.

**NEVER read these files for context:**
- `audit.md` — Append-only decision log. Write-only for the AI. Exception: `tail -n 50` when user asks about history.
- `aidlc-progress.md` — Append-only narrative log. Write-only for the AI. Exception: targeted `read --offset --limit` using line range from audit.md `Detail` field when user explicitly asks about history.

**Readable artifacts by stage:**
- **Reverse Engineering**: architecture.md, code-structure.md, api-documentation.md
- **Requirements Analysis**: requirements.md, requirement-verification-answers.md (compact summary only)
- **User Stories**: stories.md, personas.md, story-generation-plan.md
- **Application Design**: components.md, component-methods.md, services.md
- **Units Generation**: unit-of-work.md, unit-of-work-dependency.md, unit-of-work-story-map.md
- **Per-Unit Design**: functional-design.md, nfr-requirements.md, nfr-design.md, infrastructure-design.md
- **Code Stages**: All code files, plans, AND all previous readable artifacts

### Smart Context Loading by Stage
- **Early Stages**: Load `aidlc-state.md` (compact) + workspace analysis
- **Requirements/Stories**: Load `aidlc-state.md` + reverse engineering + requirements artifacts
- **Design Stages**: Load `aidlc-state.md` + requirements + stories + architecture + design artifacts
- **Code Stages**: Load `aidlc-state.md` + ALL design artifacts + existing code files

`aidlc-state.md` contains a `## Current Work` section (active stage, unit, step) sufficient for resume — never read `aidlc-progress.md` for context.

---

## Welcome Message

Display ONCE at start of new workflow:

```markdown
# 👋 Welcome to AI-DLC (AI-Driven Development Life Cycle)!

I'll guide you through an adaptive software development workflow.

**Three-Phase Lifecycle:**
- 🔵 **INCEPTION** — Planning & Design (workspace, requirements, stories, planning, design, units)
- 🟢 **CONSTRUCTION** — Implementation & Test (per-unit design, code generation, build & test)
- 🟡 **OPERATIONS** — Deployment & Monitoring (placeholder)

**Key Principles:**
- ⚡ Adaptive: stages evaluated based on your needs
- 🎯 Efficient: simple changes skip unnecessary steps
- 📋 Comprehensive: complex changes get full coverage
- 🔍 Transparent: execution plan shown before work begins
- 📝 Documented: complete audit trail
- 🎛️ User Control: you approve or request changes at each stage

**What Happens Next:**
1. Analyze workspace (new vs existing project)
2. Gather requirements and ask clarifying questions
3. Create execution plan with proposed stages
4. You review and approve
5. Execute with checkpoints at each stage
6. Working code with documentation and tests

Let's begin!
```

---

## Content Validation

### Mandatory: Validate Before File Creation

**CRITICAL**: All generated content MUST be validated before writing to files.

#### ASCII Diagram Standards
1. **VALIDATE** each diagram:
   - Count characters per line (all lines MUST be same width)
   - Use ONLY: `+` `-` `|` `^` `v` `<` `>` and spaces
   - NO Unicode box-drawing characters
   - Spaces only (NO tabs)
3. **TEST** alignment by verifying box corners align vertically

#### Mermaid Diagram Validation
1. Check for invalid characters in node IDs (alphanumeric + underscore only)
2. Escape special characters in labels: `"` → `\"` and `'` → `\'`
3. Validate flowchart syntax
4. **FALLBACK**: If Mermaid validation fails, use text-based workflow representation

#### Pre-Creation Validation Checklist
- [ ] Validate embedded code blocks (Mermaid, JSON, YAML)
- [ ] Check special character escaping
- [ ] Verify markdown syntax correctness
- [ ] Test content parsing compatibility
- [ ] Include fallback content for complex elements

#### Validation Failure Handling
1. Log the error
2. Use fallback content
3. Continue workflow
4. Inform user

---

## Question Format Guide

### Rule: File-Based Questions with [Answer]: Tags

Create `aidlc-docs/{stage}-questions.md` with questions and `[Answer]:` tags for user to fill in.

### Question Format

**With options** (when ≤5 concrete choices exist):
```markdown
**Short Header**: Question text?
- A) OptionLabel — One-sentence description
- B) OptionLabel — One-sentence description
- C) Other — Describe your own approach

[Answer]: 
```

**Free-form** (no clear concrete choices):
```markdown
**Short Header**: Question text?

[Answer]: 
```

**Group related questions under a Markdown heading:**
```markdown
## Authentication
**Provider**: Which auth provider should we use?
- A) Auth0 — Managed service, OAuth/OIDC, good for B2C
- B) Cognito — AWS-native, ideal if already on AWS
- C) Custom JWT — Full control, more implementation work
- D) Other — Different provider or approach

[Answer]: 

**MFA**: Should MFA be enforced?
- A) Yes, required — All users must enroll
- B) Optional — Available but not forced
- C) No — Skip MFA entirely

[Answer]: 
```

### Question Rules
- Max 5 options per question + **Other** (always include Other as last option)
- Option labels must be self-contained (answer makes sense without the description)
- Create `{stage}-questions.md` in `aidlc-docs/` with `[Answer]:` tags
- **HARD STOP**: After creating the questions file, STOP. Do NOT fill `[Answer]:` tags yourself. Do NOT proceed. Wait for the USER to edit the file and provide their answers. The agent NEVER writes answers — only the user does.
- Do not proceed until ALL `[Answer]:` tags are filled by the user
- **When in doubt, ask** — overconfidence leads to poor outcomes. Default to asking rather than assuming. Evaluate ALL relevant question categories; don't skip areas without justification.

### Compact Answers Summary (after answers arrive)

After the user fills all `[Answer]:` tags, create `{phase-name}-answers.md`:

```markdown
| # | Question | Answer | Notes |
|---|----------|--------|-------|
| 1 | Primary auth? | Auth0 | |
| 2 | MFA required? | Yes, required | |
```

- Future stages read this summary for context — not the raw conversation
- Question ≤10 words condensed; Answer = chosen label or free-text summary
- **After creating the answers summary, discard the questions file from context.** Do NOT re-read `{stage}-questions.md` — the answers summary is the only reference going forward.

### Contradiction and Ambiguity Detection

**MANDATORY**: After user fills all `[Answer]:` tags, check for contradictions and ambiguities.

**Vague responses to flag**: "mix of", "somewhere between", "not sure", "depends", "maybe", "probably"

If contradictions or vagueness found:
1. Add follow-up questions with `[Answer]:` tags to the same questions file
2. Ask user to fill the new tags before proceeding
3. Wait for second submission before proceeding
4. After resolution, update compact answers summary

---

## Audit Logging Requirements

### Mandatory Rules
- Log EVERY user input with timestamp in `audit.md`
- Capture user's COMPLETE RAW INPUT exactly as provided (never summarize)
- Log every approval prompt with timestamp BEFORE asking user
- Record every user response with timestamp AFTER receiving it
- **ALWAYS append** to `audit.md` - NEVER overwrite entire file
- Use ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`
- Include stage context for each entry

### Audit Log Format
```markdown
## [Stage Name or Interaction Type]
**Timestamp**: [ISO timestamp]
**User Input**: "[Complete raw user input - never summarized]"
**AI Response**: "[AI's response or action taken]"
**Context**: [Stage, action, or decision made]
**Detail**: progress.md:[START]-[END]

---
```

### Progress Line Reference (`Detail` field)

Every audit entry that has a corresponding narrative in `aidlc-progress.md` MUST include the `Detail` field with line range.

**How to record**:
1. Before appending to `aidlc-progress.md`, get current line count: `wc -l < aidlc-docs/aidlc-progress.md`
2. Append the narrative section to `aidlc-progress.md`
3. Get new line count after append
4. Record in audit entry: `**Detail**: progress.md:{start+1}-{end}`

**Agent lookup flow** (when user asks about history):
1. Read tail of `audit.md` — `tail -n 50 aidlc-docs/audit.md`
2. Find the relevant entry's `Detail: progress.md:START-END`
3. Read just that section: `read --offset=START --limit=(END-START+1)` on `aidlc-progress.md`

**Exception to write-only rule**: Agent MAY read `aidlc-progress.md` with specific offset+limit when:
- User explicitly asks about history, past decisions, or previous work
- A `Detail` pointer from `audit.md` provides the exact line range

Never read the entire file. Always use targeted offset+limit from the pointer.

### Correct Tool Usage for audit.md

✅ CORRECT: Append new entry to end of file (no read needed).
❌ WRONG: Read entire file, then overwrite with old + new content.

---

## Plan-Level Checkbox Enforcement

### Mandatory Rules
1. **NEVER complete any work without updating plan checkboxes**
2. **IMMEDIATELY after completing ANY step, mark that step [x]**
3. Update in the SAME interaction where work is completed
4. **NO EXCEPTIONS**

### Two-Level Tracking
- **Plan-Level**: Track detailed execution within each stage
- **Stage-Level**: Track overall workflow progress in `aidlc-state.md`

---

## Adaptive Depth

When a stage executes, ALL its defined artifacts are created. The "depth" refers to detail level within artifacts, which adapts to problem complexity.

**Factors influencing detail**:
1. Request Clarity
2. Problem Complexity
3. Scope
4. Risk Level
5. Available Context
6. User Preferences

**Guiding principle**: "Create exactly the detail needed for the problem at hand - no more, no less."

| Depth | When to Use |
|-------|-------------|
| **Minimal** | Simple, clear request. Concise artifacts with essential detail. |
| **Standard** | Normal complexity. Standard artifacts with typical detail. |
| **Comprehensive** | Complex, high-risk. Extensive detail with traceability. |

---

## Error Handling

### Severity Levels
- **Critical**: Workflow cannot continue
- **High**: Stage cannot complete as planned
- **Medium**: Stage can continue with workarounds
- **Low**: Minor issues, don't block progress

### Common Recovery Patterns

**Interrupted Stage**:
1. Load stage plan file
2. Identify last completed step (last [x] checkbox)
3. Resume from next uncompleted step

**Corrupted aidlc-state.md**:
1. Create backup: `aidlc-state.md.backup`
2. Ask user which stage they're on
3. Regenerate from scratch, mark completed stages based on existing artifacts

**Missing Artifacts**:
1. Identify missing artifacts
2. Determine if regenerable
3. If yes: Return to creating stage and regenerate
4. If no: Ask user to provide manually

**User Wants to Skip Stage**:
1. Confirm user understands implications
2. Document skip reason in `audit.md`
3. Mark stage as "SKIPPED" in `aidlc-state.md`
4. Proceed to next stage

## Sub-Agent Temp-File Rule

When executing as a sub-agent in a parallel construction batch:

- **`aidlc-state.md` is READ-ONLY during stage execution** — only updated at stage transitions and checkpoints
- **`aidlc-progress.md` and `audit.md` are WRITE-ONLY** — append only, never read by AI
- **Write to temp workspace only**: `aidlc-docs/construction/.parallel/{unit-name}/`
- **Mirror directory structure**: If canonical path is `construction/unit-a/functional-design/`, temp path is `construction/.parallel/unit-a/functional-design/`
- **Signal completion**: Write empty file `.parallel/{unit-name}/.complete` when done
- **Parent merges**: Never self-promote temp files to canonical paths

## Design-First Construction Rule

**CRITICAL**: Before EVERY code change (write, edit, file creation) during construction, the agent MUST verify against the design document.

**Mandatory pre-change check**:
1. Read the relevant design artifact for the unit being worked on:
   - `functional-design.md` — data models, schemas, business logic
   - `nfr-design.md` — performance/security patterns
   - `infrastructure-design.md` — service mappings, deployment
   - `components.md` / `services.md` — component boundaries, interfaces
2. Confirm the intended code change matches the design specification
3. Only proceed if the design explicitly supports the change

**If design is ambiguous or missing the detail**:
- Do NOT guess or invent behavior
- Trigger the **Mid-Construction Design Change** process below
- Update the design document FIRST, then implement

**If code change contradicts the design**:
- STOP immediately
- Do NOT proceed with the edit
- Trigger design change process to resolve the mismatch
- Log the discrepancy in `design-changes.md`

This rule applies to ALL file modifications during construction phases.

## Mid-Construction Design Changes

**Rule**: Design documents are living artifacts. If a design-level issue is discovered during construction, update the design BEFORE continuing with code.

**When to trigger**:
- Requirement gap discovered while coding
- Design inconsistency found during implementation
- New constraint invalidates prior design decision
- Scope change requested by user mid-construction
- **Design-First check fails** — design doesn't support intended code change

**Process**:
1. **Pause** current coding work
2. **Identify** which design document(s) are affected
3. **Update** the relevant design doc in `aidlc-docs/inception/` with the change
4. **Create** `aidlc-docs/construction/design-changes.md` if it doesn't exist, append the delta:
   ```markdown
   ## [ISO timestamp] — [Unit Name]
   **Change**: [what changed]
   **Reason**: [why it changed]
   **Affected documents**: [list of updated design files]
   **Impact on construction**: [which units/stages affected]
   ```
5. **Append to** `aidlc-progress.md` with the design change note
6. **Log** in `audit.md`
7. **Continue** construction with updated design

**Never** code around a design flaw without updating the design document. The design doc is the source of truth — if the code reveals a design error, fix the design first.

---

## Terminology Quick Reference

- **Phase**: High-level lifecycle phase (INCEPTION, CONSTRUCTION, OPERATIONS)
- **Stage**: Individual workflow activity within a phase
- **Unit of Work**: Logical grouping of stories for development
- **Service**: Independently deployable component
- **Module**: Logical grouping within a service/monolith
- **Component**: Reusable building block (class, function, package)

---

## Backlog Management

`aidlc-docs/backlog.md` — lightweight tracker for deferred features, tech debt, and open decisions.

### When to Add

Add items to backlog when:
- Scope is explicitly deferred during requirements ("out of scope for now")
- A new idea arises during construction that would change scope
- Tech debt is identified during code gen or review
- A decision is deferred (e.g., "choose caching strategy later")
- User says "add X to backlog"

### Format

```markdown
# Backlog

## Features
- [ ] Description — Added YYYY-MM-DD · Source: [requirements/stories/construction]

## Technical Debt
- [ ] Description — Added YYYY-MM-DD

## Deferred Decisions
- [ ] Description — Added YYYY-MM-DD · Context: brief reason
```

### When to Read

Read `backlog.md` when:
- Starting Requirements Analysis (ask "any backlog items to include in this session?")
- Starting Workflow Planning (check if backlog items affect scope)
- User says "show backlog" or "promote backlog item"

**Do NOT** auto-promote backlog items. User must explicitly request inclusion.

### Item Lifecycle

`[ ]` open → `[>]` in progress (explicitly included in current workflow) → `[x]` done
