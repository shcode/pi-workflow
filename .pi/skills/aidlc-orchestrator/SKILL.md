---
name: aidlc-orchestrator
description: >
  Master router for AI-Driven Development Life Cycle (AIDLC) software development workflow.
  Load FIRST when user requests software development, coding, building apps, implementing features,
  or any task involving writing or modifying code. Orchestrates which AIDLC stage skills to load.
  Progressive disclosure: only loads stage skills when needed.
---

# AIDLC Orchestrator

## Priority

This workflow OVERRIDES all other built-in workflows for software development tasks.

## Adaptive Principle

Workflow adapts to the work. AI assesses stages needed based on: user intent, codebase state, complexity, risk.

---

## pmai Delegated Mode

**pmai** is a project management tool that delegates tasks to pi as an AI agent. It spawns pi in an isolated git worktree with a `task.md` brief, then collects the output (diff, summary, log) after pi exits.

**Check FIRST, before any other logic**: if a file named `task.md` exists in the working directory, read it and look for `## AIDLC Mode`.

### AIDLC Mode: inception
- Skip normal startup sequence and welcome message
- Load `aidlc-common` + `aidlc-extensions` (no opt-in prompts — skip directly to enforcing any already-enabled extensions)
- Skip `aidlc-workspace` — working directory IS the workspace, treat as **greenfield** unless source files exist (brownfield)
- If `PI_PMAI_CONTRACT_VERSION` is set: use pmai interactive Q&A mode (emit `questions` JSON events, block on stdin for answers) — see `aidlc-questions` skill
- Run full INCEPTION phase: Workspace Detection → Requirements → [Stories] → Workflow Planning → [App Design] → Units Generation
- All `aidlc-docs/` artifacts written to working directory
- On completion: write `aidlc-docs/inception-complete.json` with units and dependency map, then append a short summary to the `progress.md` path specified in `task.md`

### AIDLC Mode: construction
- Skip ALL inception stages
- Read from `task.md`:
  - `Unit:` — name of the unit to construct
  - `Domain:` — domain label (optional)
  - `Inception docs:` — relative path to inception artifacts (e.g. `../../_base/aidlc-docs/`)
  - `Unit backlog:` — relative path to this unit's backlog file
- Load `aidlc-common` + `aidlc-construction-rules` + `aidlc-extensions` (re-enforce enabled extensions)
- **Read `Unit backlog:` file first** — this is the single entry point for the unit. Find the current stage via `## Current Step`.
- Read inception docs from the `Inception docs:` path (read-only — never write there)
- Run CONSTRUCTION phase for the specified unit only: [Functional Design] → [NFR] → [Infra Design] → Code Generation → Build and Test
- Track unit progress in `aidlc-docs/backlog/{unit-name}.md` (relative to working directory)
- On completion: append a short summary to the `progress.md` path specified in `task.md`

**If `task.md` exists but has no `## AIDLC Mode` line**: treat as a plain task description — continue with normal startup sequence below.

---

## Fast Path (Simple Changes)

**Condition**: Brownfield + ALL of:
- Scope ≤ 3 files
- Single clear fix (bug, typo, config, small refactor)
- No new components/services/business logic
- No NFR/security impact

**Fast path sequence** (skip common/extensions/questions loading):
1. Read `aidlc-state.md` (confirm brownfield, get workspace root)
2. Log intent in `audit.md` (one-line entry)
3. Make the code change
4. Run build/tests
5. One-line audit entry with result

**Skip ALL other stages.** No welcome message, no extensions scan, no question format.

**Override**: User says "full workflow" → ignore fast path, run normal sequence.

---

## Normal Startup Sequence

1. Load `aidlc-common` skill (session continuity, state rules, audit format)
2. Load `aidlc-extensions` skill (discover opt-in extensions)
3. Display welcome message once (from `aidlc-common`)
4. Begin Workspace Detection (`aidlc-workspace` skill)

**On resume** (aidlc-state.md exists): `aidlc-workspace` detects this and presents Welcome Back prompt instead of re-scanning.

---

## Stage Router

### Inception (project-wide, tracked in `aidlc-state.md`)
| # | Stage | Condition | Skill |
|---|---|---|---|
| 1 | Workspace Detection | ALWAYS | `aidlc-workspace` |
| 2 | Reverse Engineering | Brownfield, stale/no artifacts | `aidlc-reverse-eng` |
| 3 | Requirements Analysis | ALWAYS (adaptive depth) | `aidlc-requirements` |
| 4 | User Stories | User-facing features | `aidlc-stories` |
| 5 | Workflow Planning | ALWAYS | `aidlc-workflow-plan` |
| 6 | Application Design | New components/services | `aidlc-app-design` |
| 7 | Units Generation | Multi-unit decomposition | `aidlc-units` |

### Construction (per-unit, tracked in `backlog/{unit-name}.md`)
| # | Stage | Condition | Skill |
|---|---|---|---|
| 1 | Functional Design | New business logic | `aidlc-functional-design` |
| 2 | NFR Requirements & Design | Performance/security | `aidlc-nfr` |
| 3 | UI Design | New UI components | `aidlc-ui-design` |
| 4 | Infrastructure Design | Infrastructure changes | `aidlc-infra-design` |
| 5 | Code Generation | ALWAYS | `aidlc-code-gen` |

### Final (project-wide, tracked in `aidlc-state.md` rows 8-9)
| # | Stage | Condition | Skill |
|---|---|---|---|
| 8 | Build and Test | After ALL units done | `aidlc-build-test` |
| 9 | Operations | After Build and Test complete | `aidlc-operations` |

🟢 **OPERATIONS**: Deployment pipeline, monitoring/alerting, runbooks, production readiness gate. Final phase of the AIDLC lifecycle.

### Additional skills loaded on demand:
| Skill | When loaded |
|---|---|
| `aidlc-questions` | First stage that asks clarifying questions |
| `aidlc-construction-rules` | First construction stage begins |

---

## Stage Transition (3 steps)

After completing any stage:
1. **Log**: Append narrative to `aidlc-progress.md` (record line range START-END) + decision entry to `audit.md`
2. **Update state**:
   - **Inception stages**: Mark row `[x]` in `aidlc-state.md`, update `## Current Work`, `## Resume`, `## Next`
   - **Construction stages**: Mark row `[x]` in `backlog/{unit-name}.md`, update its Current Step. Update `aidlc-state.md` `## Current Work` Step.
3. **Load next skill**

**Skill caching**: Once loaded, a skill stays in context. Do NOT re-load.

---

## Construction Flow

### Single-Unit Shortcut

**Condition**: Workflow Planning determines only 1 unit of work (no decomposition needed).

**Skip**: Units Generation stage entirely. Instead:
1. Create `backlog/main.md` directly with construction stages
2. Add `- [todo] main — [project description]` to `backlog.md`
3. Proceed to construction immediately

This avoids the overhead of Units Generation for simple projects.

### Multi-Unit Flow

1. Inception completes → all units added to `backlog.md` as `[todo]`.
2. Agent picks first `[todo]` unit (or asks user) → reads `backlog/{unit}.md` for dependencies and current step → marks `[in progress]`
3. `aidlc-state.md` `## Current Work`: Phase = CONSTRUCTION, Unit = unit name
4. Load `aidlc-construction-rules` skill (once, cached)
5. Execute stages per `backlog/{unit}.md` checklist. Update `aidlc-state.md` `## Current Work` Step only.
6. Unit complete → mark `[done]` in `backlog.md` → pick next unit.
7. All units `[done]` → Build and Test (project-wide, `aidlc-state.md` row 8) → Operations (project-wide, row 9)

### New Feature Mid-Project

When user requests work outside existing units:
1. Add to `backlog.md` under `## Features`
2. Current unit → `[pending]` in `backlog.md`
3. Create `backlog/{feature}.md` with appropriate stages (mini-inception + construction)
4. `aidlc-state.md` `## Current Work` Unit = new feature name
5. Execute stages per `backlog/{feature}.md`
6. When done → `[done]`, switch back to previous `[pending]` unit

`aidlc-state.md` is NEVER overwritten or reset. It's the project shell.

---

## State File Rules

| File | Access | Purpose |
|---|---|---|
| `aidlc-state.md` | READ + UPDATE | Project-wide stages + Current Work + Resume (~50 lines, bounded). |
| `backlog/{unit}.md` | READ + UPDATE | Per-unit construction progress. Created at Units Generation. |
| `backlog.md` | READ + UPDATE | Master tracker. Read at session start + planning. |
| `aidlc-progress.md` | APPEND-ONLY | Narrative log. Never read except targeted offset+limit via audit.md pointers. |
| `audit.md` | APPEND-ONLY | Decision log. Never read except: `head -n 5` for rotation, `tail -n 50` for history. |

---

## Resume Manifest Contract

The `## Resume` section in `aidlc-state.md` is the **single source of truth** for cold resume. After every stage transition, update it with:

- **Skills**: Which skills the agent needs to load on resume

`GOAL.md` is always read on resume once it exists. `RULES.md` if it exists.

A new session reads `aidlc-state.md` and activates the listed skills. Each skill's Step 1 declares its own context — no static Load table. No guessing.

Example during construction:
```markdown
## Resume
### Skills
aidlc-orchestrator, aidlc-common, aidlc-construction-rules, aidlc-code-gen
```

---

## Mid-Workflow Changes

Users may request changes to the plan or stage execution at any time. Handle all requests explicitly — never silently alter state.

### Adding a skipped stage
1. Confirm request and check all prerequisite stages are complete
2. Warn if later artifacts may need updating
3. Add stage to plan with rationale, mark PENDING in `aidlc-state.md`
4. Execute normally; log in `audit.md`

### Skipping a planned stage
1. State what will be missing and consequences for downstream stages
2. Get explicit user confirmation of the impact
3. Mark stage SKIPPED in `aidlc-state.md`; log reason in `audit.md`

### Restarting current stage
1. Ask what specifically needs to change
2. Offer: (A) modify existing artifacts or (B) full restart
3. If restart: archive existing artifacts as `{artifact}.backup`, reset checkboxes, re-execute from beginning

### Restarting a completed stage
1. Identify all downstream stages that depend on it
2. Warn user: "Restarting X requires redoing: [list of affected stages]"
3. Get explicit confirmation, then archive all affected artifacts and reset affected rows in `aidlc-state.md`

### Changing depth mid-flight
1. Confirm the new depth level
2. Update the execution plan note; adjust approach for current stage
3. Log change in `audit.md`

### General rules
- **Always confirm** before destructive changes (archive before overwrite)
- **Update all tracking** — `aidlc-state.md`, plan checkboxes, `audit.md` must stay in sync
- **Offer modification over restart** when possible — restart is a last resort
- Log every mid-workflow change with: request, impact assessment, user confirmation, action taken

---

## Cross-Cutting Rules

- Questions use `[Answer]:` file-based format or `ask_user_question` tool (see `aidlc-questions` skill)
- Extensions are hard constraints; check `Enabled` status in `aidlc-state.md` `## Extensions` table
- Design-first: code must match approved design documents (see `aidlc-construction-rules` skill)
- Welcome message displayed once only
- When in doubt, ask — overconfidence leads to poor outcomes

## Key Principles

- Only execute stages that add value
- Show plan before starting — user can include/exclude stages
- User approves at each gate
- No emergent behavior — all transitions explicit and logged
- App code in workspace root ONLY; docs in `aidlc-docs/` ONLY
- `aidlc-state.md` is bounded (~50 lines) — never add rows
- `aidlc-progress.md` is append-only — agents never read it (except targeted offset via audit pointer)
- Log decisions in `audit.md` with ISO 8601 timestamps — always append, never overwrite
- Mark checkboxes `[x]` immediately in same interaction

---

## Directory Structure

```
<WORKSPACE-ROOT>/                   # ⚠️ APPLICATION CODE
├── [project structure]
│
├── aidlc-docs/                     # 📄 DOCUMENTATION ONLY
│   ├── inception/
│   │   ├── plans/
│   │   ├── reverse-engineering/
│   │   ├── requirements/
│   │   ├── user-stories/
│   │   └── application-design/
│   ├── construction/
│   │   ├── plans/
│   │   ├── {unit-name}/
│   │   │   ├── functional-design/
│   │   │   ├── nfr-requirements/
│   │   │   ├── nfr-design/
│   │   │   ├── infrastructure-design/
│   │   │   ├── ui-design/
│   │   │   └── code/
│   │   └── build-and-test/
│   ├── storybook/
│   ├── operations/                 # 🟢 Deployment pipeline, monitoring, runbooks
│   ├── aidlc-state.md
│   ├── aidlc-progress.md
│   ├── backlog.md
│   └── audit.md
```
