---
name: aidlc-common
description: >
  Common rules shared across all AIDLC phases. Load at workflow start after orchestrator.
  Contains session continuity, state rules, audit format, transition steps, welcome message,
  and error handling. Slim version — question format in aidlc-questions, construction rules
  in aidlc-construction-rules (loaded on demand).
---

# AIDLC Common Rules (Slim)

---

## Session Continuity

### Audit Rotation (on resume)

When resuming (`aidlc-state.md` exists):
1. `head -n 5 aidlc-docs/audit.md` — check first timestamp
2. If entries from a **previous calendar day**: move to `aidlc-docs/audit/YYYY-MM-DD.md`
3. If all today: do nothing

### Welcome Back Prompt

When `aidlc-state.md` exists:

```markdown
**Welcome back!**

Based on `aidlc-state.md`:
- **Project**: [Project.Type]
- **Stage**: [Current Work.Stage]
- **Unit**: [Current Work.Unit]
- **Step**: [Current Work.Step]

**Resume context** (from `## Resume`):
- Skills to load: [list from Skills line]
- Key decisions: see `audit.md`

**What would you like to work on today?**
- A) Continue — Pick up from current step
- B) Switch — Work on a different backlog item
- C) Review — Revisit a previous stage

[Answer]: 
```

### Mandatory: Load Resume Manifest

On resume, read `aidlc-state.md` `## Resume` section. Activate the listed skills. Each skill's Step 1 declares which context files to load. Do NOT guess or load extra files.

### Mandatory: Load RULES.md

If `RULES.md` exists at workspace root, read it at session start. Its contents are **hard constraints** that override default workflow behavior. User-defined rules take precedence over skill defaults where they conflict.

### Context Pipeline — Discard After Use

| After stage completes | Discard from context |
|---|---|
| Requirements Analysis | Reverse-eng artifacts (captured in requirements.md) |
| App Design | Full requirements.md + stories.md (answers summaries sufficient) |
| Construction starts | execution-plan.md (state tracks what to execute) |
| Questions answered | {stage}-questions.md (answers summary is the reference) |

**NEVER discard**: `aidlc-state.md`, `GOAL.md`, `RULES.md`, `*-answers.md`, design docs during construction, `backlog.md`

### Targeted Code Reads

- Never read entire files for debugging — use error output to identify file:line, then `read --offset --limit`
- Discard raw code after fix — retain one-line fix summary
- Search first (grep/sem tools) before reading

---

## Welcome Message

Display ONCE at start of new workflow:

```markdown
# 👋 Welcome to AI-DLC!

**Three-Phase Lifecycle:**
- 🔵 **INCEPTION** — Planning & Design
- 🟢 **CONSTRUCTION** — Implementation & Test
- 🟡 **OPERATIONS** — Deployment pipeline, monitoring, runbooks, production readiness gate

**Key Principles:** Adaptive stages • User approval at each gate • Complete audit trail • Design-first

Let's begin!
```

---

## Stage Transition (compressed)

See `aidlc-orchestrator` for the canonical Stage Transition steps. Summary:
1. **Log**: Append narrative to `aidlc-progress.md` (record line range START-END) + append decision entry to `audit.md`
2. **Update state**: In `aidlc-state.md` — mark row `[x]`, update `## Current Work`, update `## Resume` manifest, set `## Next`
3. **Update GOAL.md**: If this stage produced an architectural choice, tech stack selection, or major direction change — append one line to `## Key Decisions`. Skip for routine stage completions.
4. **Load next skill**

---

## Audit Logging (lightweight)

### Format

```markdown
## [Stage] — [ISO 8601 timestamp]
**Decision**: [What was decided or approved]
**Detail**: progress.md:[START]-[END]
---
```

### Rules
- ALWAYS append — never overwrite
- Log decisions and approvals, not raw transcripts
- One entry per stage completion or significant decision
- Never read audit.md except: `head -n 5` for rotation, `tail -n 50` when user asks history

---

## Checkpoint Enforcement

- Mark `[x]` immediately after completing ANY step — same interaction
- Two levels: plan-level (within stage) and stage-level (`aidlc-state.md`)
- No exceptions

---

## Adaptive Depth

| Depth | When |
|---|---|
| **Minimal** | Simple, clear request |
| **Standard** | Normal complexity |
| **Comprehensive** | Complex, high-risk |

All defined artifacts are created; depth controls detail level within them.

---

## Error Handling

| Severity | Action |
|---|---|
| Critical | Workflow cannot continue — escalate to user |
| High | Stage cannot complete — present alternatives |
| Medium | Continue with workaround — log it |
| Low | Note and proceed |

### Recovery Patterns

- **Interrupted stage**: Load plan, find last `[x]`, resume from next unchecked step
- **Corrupted state**: Backup → ask user → regenerate from existing artifacts
- **Missing artifacts**: Identify → regenerate if possible → else ask user
- **User skips stage**: Confirm implications → log in audit → mark SKIPPED → proceed

---

## Backlog Management

`aidlc-docs/backlog.md` — master tracker for units, features, tech debt, deferred decisions.

### Item Format
```
- [todo] item-name (unit: {unit-name}) (domain: {domain}) — brief description
- [in progress] item-name (unit: {unit-name}) (domain: {domain}) — brief description
- [pending] item-name (unit: {unit-name}) (domain: {domain}) — interrupted/blocked/waiting
- [done] item-name (unit: {unit-name}) (domain: {domain}) — brief description
```
- `(unit: {unit-name})` — the unit of work this item belongs to. Use `cross-unit` if it spans multiple units.
- `(domain: {domain})` — omit for single-domain projects.
- Units of work themselves omit the `(unit:)` tag — they ARE the unit.

### Per-Item Tracking (`backlog/{item-name}.md`)

Every backlog item gets its own tracking file with the stages IT needs:

**Unit of work** (from inception → only needs construction):
```markdown
# Unit: {unit-name}

## Domain
{domain-name, or — if single-domain project}

## Dependencies
<!-- Units this unit depends on. Empty if none. -->
- {dep-unit-name}

## Stages
| # | Stage | Status |
|---|-------|--------|
| 1 | Functional Design | [ ] |
| 2 | NFR Requirements & Design | [ ] |
| 3 | UI Design | [ ] |
| 4 | Infrastructure Design | [ ] |
| 5 | Code Generation | [ ] |

## Current Step
[Current step within the active stage]

**New feature** (added mid-project → needs mini-inception + construction):
```markdown
# Feature: {feature-name}

## Unit
{unit-name, or cross-unit if spans multiple units}

## Domain
{domain-name, or — if single-domain project}

## Dependencies
<!-- Inherited from the unit this feature belongs to. Add extras if needed. -->
- {dep-unit-name}

## Stages
| # | Stage | Status |
|---|-------|--------|
| 1 | Requirements Analysis | [ ] |
| 2 | Workflow Planning | [ ] |
| 3 | Application Design | [ ] |
| 4 | Functional Design | [ ] |
| 5 | Code Generation | [ ] |

## Current Step
[Current step within the active stage]

```

**Rules**:
- Created when an item transitions to `[in progress]`
- Agent determines which stages the item needs (skip what’s not relevant)
- `aidlc-state.md` is NEVER overwritten — it’s the project shell
- `aidlc-state.md` `## Current Work` Unit = active item name
- Build and Test (project-wide) runs after ALL units reach `[done]` — tracked in `aidlc-state.md` row 8

### Switching Items
1. Update current item’s `backlog/{item}.md` (save current step)
2. Mark current item `[pending]` in `backlog.md`
3. Mark new item `[in progress]` in `backlog.md`
4. Update `aidlc-state.md` `## Current Work` Unit = new item name
5. Read `backlog/{new-item}.md` for progress

### When to Read
Read `backlog.md` on every fresh session. Pick first `[in progress]` or ask user to choose from `[todo]`.

### Adding New Features Mid-Project
When user requests work outside existing units:
1. Determine which unit the feature belongs to (ask user if unclear). If it spans multiple units, tag as `cross-unit`.
2. Add to `backlog.md` under `## Features` with `(unit: {unit-name})` tag
3. Current unit → `[pending]`
4. Create `backlog/{feature}.md` with appropriate stages (mini-inception if needed) — set `## Unit`, `## Domain`, `## Dependencies` (inherited from parent unit). Each stage's Step 1 declares its context.
5. **Update `unit-of-work-dependency.md`** — add the new unit with its dependencies (empty list if none)
6. **Update `unit-of-work.md`** — add the new unit definition and responsibilities
7. For any existing unit that depends on the new unit: update its `backlog/{unit}.md` `## Dependencies`
8. Switch `## Current Work` to the new feature
9. When done → mark `[done]`, switch back to previous unit

---

## Terminology

- **Phase**: INCEPTION / CONSTRUCTION / OPERATIONS
- **Stage**: Individual activity within a phase
- **Domain**: Business grouping / bounded context. Not always 1:1 with Unit of Work — see `aidlc-units`
- **Unit of Work**: Logical grouping of stories for development
- **Service**: Independently deployable component
- **Module**: Logical grouping within a service
- **Component**: Reusable building block
