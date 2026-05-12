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
- Key decisions: [list from Decisions section]
- Files to load: [list from Load table]

**What would you like to work on today?**
- A) Continue — Pick up from current step
- B) Switch — Work on a different backlog item
- C) Review — Revisit a previous stage

[Answer]: 
```

### Mandatory: Load Resume Manifest

On resume, read `aidlc-state.md` `## Resume` section. Load ONLY the files listed there. Do NOT guess or load extra files.

### Context Pipeline — Discard After Use

| After stage completes | Discard from context |
|---|---|
| Requirements Analysis | Reverse-eng artifacts (captured in requirements.md) |
| App Design | Full requirements.md + stories.md (answers summaries sufficient) |
| Construction starts | execution-plan.md (state tracks what to execute) |
| Questions answered | {stage}-questions.md (answers summary is the reference) |

**NEVER discard**: `aidlc-state.md`, `GOAL.md`, `*-answers.md`, design docs during construction, `backlog.md`

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
- 🟡 **OPERATIONS** — Deployment & Monitoring (placeholder)

**Key Principles:** Adaptive stages • User approval at each gate • Complete audit trail • Design-first

Let's begin!
```

---

## Stage Transition (compressed)

After completing any stage:
1. **Log**: Append narrative to `aidlc-progress.md` (record line range START-END) + append decision entry to `audit.md`
2. **Update state**: In `aidlc-state.md` — mark row `[x]`, update `## Current Work`, update `## Resume` manifest, set `## Next`
3. **Load next skill**

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
- [todo] item-name — brief description
- [in progress] item-name — brief description
- [pending] item-name — interrupted/blocked/waiting
- [done] item-name — brief description
```

### Per-Item Tracking
Each active item gets `aidlc-docs/backlog/{item-name}.md` (copy of `aidlc-state.md` at switch time).

### Switching Items
1. Copy `aidlc-state.md` → `backlog/{current-item}.md`
2. Update `backlog.md` statuses
3. Copy `backlog/{new-item}.md` → `aidlc-state.md` (or reset if new)

### When to Read
Read `backlog.md` on every fresh session. Pick first `[in progress]` or ask user to choose from `[todo]`.

---

## Terminology

- **Phase**: INCEPTION / CONSTRUCTION / OPERATIONS
- **Stage**: Individual activity within a phase
- **Unit of Work**: Logical grouping of stories for development
- **Service**: Independently deployable component
- **Module**: Logical grouping within a service
- **Component**: Reusable building block
