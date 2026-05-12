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

### Final (project-wide, tracked in `aidlc-state.md` row 8)
| Stage | Condition | Skill |
|---|---|---|
| Build and Test | After ALL units done | `aidlc-build-test` |

🟡 **OPERATIONS**: Placeholder for future deployment/monitoring workflows.

### Additional skills loaded on demand:
| Skill | When loaded |
|---|---|
| `aidlc-questions` | First stage that asks clarifying questions |
| `aidlc-construction-rules` | First construction stage begins |

---

## Stage Transition (3 steps)

After completing any stage:
1. **Log**: Append narrative to `aidlc-progress.md` (record line range) + decision entry to `audit.md`
2. **Update state**:
   - **Inception stages**: Mark row `[x]` in `aidlc-state.md`, update `## Current Work`, `## Resume`, `## Next`
   - **Construction stages**: Mark row `[x]` in `backlog/{unit-name}.md`, update its Current Step + Resume. Update `aidlc-state.md` `## Current Work` Step only.
3. **Load next skill**

**Skill caching**: Once loaded, a skill stays in context. Do NOT re-load.

---

## Construction Flow

1. Inception completes → all units added to `backlog.md` as `[todo]`
2. Agent picks first `[todo]` unit (or asks user) → marks `[in progress]` → creates `backlog/{unit}.md`
3. `aidlc-state.md` `## Current Work`: Phase = CONSTRUCTION, Unit = unit name
4. Load `aidlc-construction-rules` skill (once, cached)
5. Execute construction stages per `backlog/{unit}.md` checklist
6. Unit complete → mark `[done]` in `backlog.md` → pick next unit
7. All units `[done]` → Build and Test (project-wide, `aidlc-state.md` row 8)

---

## Resume Manifest Contract

The `## Resume` section in `aidlc-state.md` is the **single source of truth** for cold resume. After every stage transition, update it with:

- **Load table**: Exact file paths the next stage needs to read
- **Decisions**: Key choices made so far (max 7 lines, one per decision)

A new session reads `aidlc-state.md` and loads ONLY what `## Resume` specifies. No guessing.

---

## Parallel Construction Batch

**Condition**: Multiple units with no inter-dependencies (check `unit-of-work-dependency.md`).

**Execution**:
- Parent identifies independent group from dependency matrix
- Launches sub-agents (1 per unit), each writes to `.parallel/{unit-name}/`
- Sub-agents load: `aidlc-common` + `aidlc-construction-rules` + per-unit stage skills
- Sub-agents read: ALL inception artifacts + unit-specific prior outputs
- Sub-agents NEVER write to `aidlc-state.md`
- Parent merges `.parallel/{unit}/` → `construction/{unit}/` after all complete
- Single approval prompt for the batch

**Failure**: Retry once → if still failing, mark FAILED → merge successful units → escalate failed to user.

---

## Key Principles

- Only execute stages that add value
- Show plan before starting — user can include/exclude stages
- User approves at each gate
- No emergent behavior — all transitions explicit and logged
- App code in workspace root ONLY; docs in `aidlc-docs/` ONLY
- `aidlc-state.md` is bounded (~45 lines) — never add rows
- `aidlc-progress.md` is append-only — agents never read it (except targeted offset via audit pointer)

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
│   ├── operations/                 # 🟡 Placeholder
│   ├── aidlc-state.md
│   ├── aidlc-progress.md
│   ├── backlog.md
│   └── audit.md
```
