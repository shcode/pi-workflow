---
name: aidlc-orchestrator
description: >
  Master router for AI-Driven Development Life Cycle (AIDLC) software development workflow.
  Load FIRST when user requests software development, coding, building apps, implementing features,
  or any task involving writing or modifying code. Orchestrates which AIDLC stage skills to load.
  Mirrors `core-workflow.md` in the repo root — that file is the canonical source.
  Progressive disclosure: only loads stage skills when needed.
---

# AIDLC Orchestrator

## Priority

This workflow OVERRIDES all other built-in workflows for software development tasks.

## Adaptive Principle

Workflow adapts to the work. AI assesses stages needed based on: user intent, codebase state, complexity, risk.

## Canonical Source

This skill mirrors `core-workflow.md` in the repo root. If discrepancies exist, core-workflow.md wins.

## Startup Sequence

1. **Load `aidlc-common`** skill (shared rules: validation, audit, questions, depth levels, welcome message)
2. **Load `aidlc-extensions`** skill (discover opt-in extensions, deferred loading)
3. **Display welcome message** once (embedded in `aidlc-common`)
4. **Begin Workspace Detection** (`aidlc-workspace` skill)

## Fast Path (Simple Changes)

**Condition**: Brownfield project + user request matches ALL of:
- Scope ≤ 3 files
- Single clear fix (bug fix, typo, config change, small refactor)
- No new components, services, or business logic
- No NFR/security impact

**Fast path sequence**:
1. Workspace Detection (auto-proceed, no approval)
2. Log intent in `audit.md`
3. Skip directly to Code Generation (minimal plan: list files to change + rationale)
4. Build and Test

**Skip**: Requirements, Stories, Workflow Plan, App Design, Units, Functional Design, NFR, UI Design, Infra Design.

**User override**: If user says "full workflow" or "run all stages", ignore fast path.

## Stage Router

For each stage: load skill → execute → present completion → wait for explicit approval → log in `audit.md` → update `aidlc-state.md`. Complete each unit fully before next unit.

| Phase | Stage | Condition | Skill |
|---|---|---|---|
| 🔵 INCEPTION | Workspace Detection | ALWAYS | `aidlc-workspace` |
| 🔵 INCEPTION | Reverse Engineering | Brownfield, stale/no artifacts | `aidlc-reverse-eng` |
| 🔵 INCEPTION | Requirements Analysis | ALWAYS (adaptive depth) | `aidlc-requirements` |
| 🔵 INCEPTION | User Stories | User-facing features | `aidlc-stories` |
| 🔵 INCEPTION | Workflow Planning | ALWAYS | `aidlc-workflow-plan` |
| 🔵 INCEPTION | Application Design | New components/services | `aidlc-app-design` |
| 🔵 INCEPTION | Units Generation | Multi-unit decomposition | `aidlc-units` |
| 🟢 CONSTRUCTION | Functional Design | New business logic (per-unit) | `aidlc-functional-design` |
| 🟢 CONSTRUCTION | NFR Requirements | Performance/security (per-unit) | `aidlc-nfr` |
| 🟢 CONSTRUCTION | UI Design | New UI components (per-unit) | `aidlc-ui-design` |
| 🟢 CONSTRUCTION | Infrastructure Design | Infrastructure changes (per-unit) | `aidlc-infra-design` |
| 🟢 CONSTRUCTION | Code Generation | ALWAYS (per-unit) | `aidlc-code-gen` |
| 🟢 CONSTRUCTION | Build and Test | ALWAYS (after all units) | `aidlc-build-test` |

🟡 **OPERATIONS**: Placeholder for future deployment/monitoring workflows.

**Note**: `aidlc-nfr` skill covers both NFR Requirements and NFR Design stages (they always run together).

## Parallel Construction Batch

**Condition**: Multiple units in `unit-of-work-dependency.md` with no inter-dependencies (no edges between them in dependency matrix).

**Pre-check**: Read `aidlc-docs/inception/application-design/unit-of-work-dependency.md`. If dependency matrix shows independent groups, parallel execution is eligible.

**Execution**:

```markdown
### Parallel Batch: [Unit Group Names]

**Units in this batch**: [A, B, C] (no inter-dependencies detected)

**Parent agent responsibilities**:
- Read dependency matrix, identify independent group
- Launch parallel sub-agents (1 per unit)
- Wait for ALL completions
- Merge `.parallel/` temp outputs into canonical paths
- Update `aidlc-state.md` once (batch completion)
- Append `audit.md` once (batch entry)
- Present unified summary for single user approval

**Sub-agent scope**:
- Loads: `/skill:aidlc-common` + per-unit stage skills
- Reads: ALL inception artifacts + unit-specific prior stage outputs
- Writes: `aidlc-docs/construction/.parallel/{unit-name}/` ONLY
- NEVER writes to `aidlc-state.md`, `aidlc-progress.md`, or `audit.md`
- Executes: Functional Design → NFR → Infra Design → Code Gen (per unit plan)

**Merge rule**: After all sub-agents complete, parent moves:
`aidlc-docs/construction/.parallel/{unit}/*` → `aidlc-docs/construction/{unit}/*`
Then deletes `.parallel/{unit}/`.
```

**Post-batch**: Single approval prompt. If user requests changes, spawn targeted sub-agent for specific unit only.

**Failure Handling**:
- **Sub-agent fails**: Retry once with fresh context. If still failing, mark unit as `FAILED` in batch results.
- **Partial completion**: Merge successful units immediately. Present failed units separately to user.
- **Timeout** (no `.complete` file after reasonable time): Terminate sub-agent, mark unit `TIMEOUT`.
- **Escalation**: If ≥2 units fail in a batch, pause and present all errors to user for decision:
  - Fix individually (spawn targeted sub-agent per failed unit)
  - Skip failed units and continue
  - Abort batch and retry sequentially

## How to Route to Next Skill

After completing any stage:
1. Get current line count of `aidlc-progress.md` (`wc -l`)
2. Append narrative to `aidlc-progress.md` (human-facing log)
3. Get new line count → record as `START-END`
4. Update `aidlc-state.md` (set row `[x]`, update Stage/Next, update `## Current Work`)
5. Determine next stage from router above
6. Load next skill via `/skill:<name>`
7. Pass context (brownfield flag, requirements, etc.)
8. Append to `audit.md` with `Detail: progress.md:START-END`

## Cross-Cutting Rules (from `aidlc-common`)

- Content validation before file creation
- Questions presented inline in response; user runs `/answer` to navigate (pi-answer TUI)
- Extensions are hard constraints; check `Enabled` status in `aidlc-state.md` `## Extensions` table
- Welcome message displayed once only

## Key Principles

- Only execute stages that add value
- Show plan before starting
- User can include/exclude stages
- Log ALL inputs in `audit.md` with ISO 8601 timestamps — always append, never overwrite
- Mark checkboxes `[x]` immediately in same interaction
- `aidlc-state.md` = compact routing table + Current Work (~35 lines, bounded). NEVER add rows.
- `aidlc-progress.md` = append-only narrative log for humans. Agents NEVER read it.
- Construction phases: standardized 2-option completion messages
- No emergent behavior
- App code in workspace root ONLY; docs in `aidlc-docs/` ONLY

## Directory Structure

```
<WORKSPACE-ROOT>/                   # ⚠️ APPLICATION CODE
├── [project structure]
│
├── aidlc-docs/                     # 📄 DOCUMENTATION ONLY
│   ├── inception/                  # 🔵
│   │   ├── plans/
│   │   ├── reverse-engineering/    # Brownfield
│   │   ├── requirements/
│   │   ├── user-stories/
│   │   └── application-design/
│   ├── construction/               # 🟢
│   │   ├── plans/
│   │   ├── {unit-name}/
│   │   │   ├── functional-design/
│   │   │   ├── nfr-requirements/
│   │   │   ├── nfr-design/
│   │   │   ├── infrastructure-design/
│   │   │   ├── ui-design/              # Storybook component inventory
│   │   │   └── code/               # Markdown summaries
│   │   └── build-and-test/
│   ├── operations/                 # 🟡 Placeholder
│   ├── aidlc-state.md        # Compact routing table + Current Work (~35 lines, bounded)
│   ├── aidlc-progress.md     # Append-only narrative log (human-facing, agents never read)
│   ├── backlog.md            # Features, tech debt, deferred decisions
│   └── audit.md              # Append-only audit trail
```
