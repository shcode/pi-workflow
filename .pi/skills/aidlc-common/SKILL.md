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

### Welcome Back Prompt

When returning to existing project (aidlc-state.md exists):

```markdown
**Welcome back! I can see you have an existing AI-DLC project in progress.**

Based on your `aidlc-state.md` (compact routing table) and `aidlc-progress.md` (progress tracker), here's your current status:
- **Project**: [from aidlc-state.md Project.Type]
- **Current Stage**: [from aidlc-state.md Project.Stage]
- **Next Stage**: [from aidlc-state.md Next]
- **Last Completed**: [last [x] row in aidlc-state.md Stages table]
- **Progress Detail**: [from aidlc-progress.md Current Status]

**What would you like to work on today?**

A) Continue where you left off ([Next step description])
B) Review a previous stage ([Show available stages])

[Answer]:
```

### Mandatory: Load Previous Stage Artifacts

Before resuming ANY stage, automatically read all relevant artifacts from previous stages.

**NEVER read these files for context:**
- `audit.md` — Append-only decision log. Write-only for the AI. For human reference only.
- Full `*-questions.md` files — Read the compact `*-answers.md` summary instead.

**Readable artifacts by stage:**
- **Reverse Engineering**: architecture.md, code-structure.md, api-documentation.md
- **Requirements Analysis**: requirements.md, requirement-verification-answers.md (compact summary only)
- **User Stories**: stories.md, personas.md, story-generation-plan.md
- **Application Design**: components.md, component-methods.md, services.md
- **Units Generation**: unit-of-work.md, unit-of-work-dependency.md, unit-of-work-story-map.md
- **Per-Unit Design**: functional-design.md, nfr-requirements.md, nfr-design.md, infrastructure-design.md
- **Code Stages**: All code files, plans, AND all previous readable artifacts

### Smart Context Loading by Stage
- **Early Stages**: Load `aidlc-state.md` (compact, ~30 lines) + workspace analysis
- **Requirements/Stories**: Load `aidlc-state.md` + reverse engineering + requirements artifacts
- **Design Stages**: Load `aidlc-state.md` + requirements + stories + architecture + design artifacts
- **Code Stages**: Load `aidlc-state.md` + ALL artifacts + `aidlc-progress.md` (if per-unit context needed)
- **Code Stages**: Load ALL artifacts + existing code files

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

### Rule: Never Ask Questions in Chat

**CRITICAL**: ALL questions must be placed in dedicated question files. NEVER ask questions directly in chat.

#### File Naming
- Use descriptive names: `{phase-name}-questions.md`

#### Question Structure

```markdown
## Question [Number]
[Clear, specific question text]

A) [First meaningful option]
B) [Second meaningful option]
[...additional options as needed...]
X) Other (please describe after [Answer]: tag below)

[Answer]:
```

**CRITICAL**:
- "Other" is MANDATORY as the LAST option for every question
- Minimum: 2 meaningful options + Other
- Maximum: 5 meaningful options + Other
- Do NOT make up options just to fill slots

### Compact Answers Summary (Context-Efficient)

After answers are validated, create `{phase-name}-answers.md` — a compact one-line-per-answer table. Future stages read this summary, NOT the full question file.

**Format**:
```markdown
| # | Question | Answer | Notes |
|---|----------|--------|-------|
| 1 | Primary auth? | C — SSO | |
| 2 | Platform? | B — Web+Mobile | |
```

- Question column: ≤10 words condensed
- Answer column: letter + option text
- Notes: "Other" free-text, contradictions, clarifications

### Contradiction and Ambiguity Detection

**MANDATORY**: After reading user responses, check for contradictions and ambiguities.

**Vague responses to flag**: "mix of", "somewhere between", "not sure", "depends", "maybe", "probably"

If contradictions found:
1. Create `{phase-name}-clarification-questions.md`
2. Explain the issue
3. Ask targeted multiple-choice questions to resolve
4. Wait for answers before proceeding
5. After resolution, update compact answers summary

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

---
```

### Correct Tool Usage for audit.md

✅ CORRECT: Read file, then append/edit.
❌ WRONG: Read file, then completely overwrite with old + new content.

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

- **Canonical state files are READ-ONLY**: `aidlc-state.md`, `aidlc-progress.md`, `audit.md`
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
5. **Update** `aidlc-progress.md` with the design change note
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
