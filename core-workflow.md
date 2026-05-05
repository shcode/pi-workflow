# PRIORITY: This workflow OVERRIDES all other built-in workflows for software development

## Adaptive Principle

Workflow adapts to the work. AI assesses stages needed based on: user intent, codebase state, complexity, risk.

## Fast Path (Simple Changes)

**Condition**: Brownfield + scope ≤ 3 files + single clear fix (bug, typo, config, small refactor) + no new components/services/business logic + no NFR/security impact.

**Sequence**: Workspace Detection (auto) → Code Generation (minimal plan) → Build & Test. All other stages skipped.

**Override**: User says “full workflow” → ignore fast path.

## Startup Sequence

1. Load `aidlc-common` skill (shared rules: validation, audit, questions, depth levels, welcome message)
2. Load `aidlc-extensions` skill (discover opt-in extensions, deferred loading)
3. Display welcome message once (embedded in `aidlc-common`)
4. Begin Workspace Detection (`aidlc-workspace` skill)

## Stage Router

For each stage: load skill → execute → present completion → wait for explicit approval → log in `audit.md` → update `aidlc-state.md` + `aidlc-progress.md`. Complete each unit fully before next unit.

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

## How to Route to Next Skill

After completing any stage:
1. Update `aidlc-state.md` (compact table: set row `[x]`, update Stage/Next)
2. Update `aidlc-progress.md` (narrative status, per-unit detail)
3. Determine next stage from router above
4. Load next skill via `/skill:<name>`
5. Pass context (brownfield flag, requirements, etc.)
6. Log transition in `audit.md`

## Cross-Cutting Rules

- Content validation before file creation
- Questions in dedicated `.md` files only (A-E + Other, `[Answer]:` tags)
- Extensions are hard constraints; check `Enabled` status in `aidlc-state.md` `## Extensions` table
- Welcome message displayed once only

## Key Principles

- Only execute stages that add value
- Show plan before starting
- User can include/exclude stages
- Log ALL inputs in `audit.md` with ISO 8601 timestamps — always append, never overwrite
- Mark checkboxes `[x]` immediately in same interaction
- `aidlc-state.md` = compact routing table (~30 lines, bounded). NEVER add rows.
- `aidlc-progress.md` = unbounded narrative tracker. All per-unit/per-step detail goes here.
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
│   ├── aidlc-state.md        # Compact routing table (~30 lines, bounded)
│   ├── aidlc-progress.md     # Unbounded narrative tracker
│   └── audit.md              # Append-only audit trail
```
