# PRIORITY: This workflow OVERRIDES all other built-in workflows for software development

## Adaptive Principle

Workflow adapts to the work. AI assesses stages needed based on: user intent, codebase state, complexity, risk.

## Fast Path (Simple Changes)

**Condition**: Brownfield + scope ≤ 3 files + single clear fix (bug, typo, config, small refactor) + no new components/services/business logic + no NFR/security impact.

**Sequence**: Workspace Detection (auto) → Code Generation (minimal plan) → Build & Test. All other stages skipped.

**Override**: User says "full workflow" → ignore fast path.

## Startup Sequence

1. Read `aidlc-common` skill (shared rules: validation, audit, questions, depth levels, welcome message)
2. Read `aidlc-extensions` skill (discover opt-in extensions, deferred loading)
3. Display welcome message once (embedded in `aidlc-common`)
4. Begin Workspace Detection (`aidlc-workspace` skill)

## Stage Router

For each stage: read skill file → execute → present completion → wait for explicit approval → append to `audit.md` → update `aidlc-state.md` + append to `aidlc-progress.md`. Complete each unit fully before next unit.

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

**Skill caching**: Once a skill file is read in a session, it stays in context. Do NOT re-read a skill file already in your conversation. Only read a skill file once per session.

After completing any stage:
1. Get current line count of `aidlc-progress.md` (`wc -l`)
2. Append narrative to `aidlc-progress.md` (human-facing log)
3. Get new line count → record as `START-END`
4. Update `aidlc-state.md` (set row `[x]`, update Stage/Next, update `## Current Work`)
5. Determine next stage from router above
6. Read next skill file from the skills directory (e.g., `skills/aidlc-workspace/SKILL.md`)
7. Pass context (brownfield flag, requirements, etc.)
8. Append to `audit.md` with `Detail: progress.md:START-END`

## State File Rules

| File | Access | Purpose |
|---|---|---|
| `aidlc-state.md` | READ + UPDATE | Compact routing table + `## Current Work` (~35 lines, bounded). NEVER add rows. |
| `aidlc-progress.md` | APPEND-ONLY | Narrative log. Never read except targeted offset+limit via audit.md pointers when user asks about history. |
| `audit.md` | APPEND-ONLY | Decision log. Never read except: `head -n 5` for rotation, `tail -n 50` when user asks about history. |
| `backlog.md` | READ + UPDATE | Features / Tech Debt / Deferred Decisions. Read at requirements + workflow planning. |

## Cross-Cutting Rules

- Content validation before file creation
- Questions in `{stage}-questions.md` files (A-E + Other, `[Answer]:` tags)
- Extensions are hard constraints; check `Enabled` status in `aidlc-state.md` `## Extensions` table
- Welcome message displayed once only
- When in doubt, ask — overconfidence leads to poor outcomes
- Design-first: code must match approved design documents

## Key Principles

- Only execute stages that add value
- Show plan before starting
- User can include/exclude stages
- Append ALL inputs to `audit.md` with ISO 8601 timestamps — never overwrite
- Mark checkboxes `[x]` immediately in same interaction
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
│   │   │   ├── ui-design/
│   │   │   └── code/              # Markdown summaries
│   │   └── build-and-test/
│   ├── storybook/                  # 📖 Stories + wireframe stubs
│   ├── operations/                 # 🟡 Placeholder
│   ├── aidlc-state.md              # Compact routing table + Current Work (~35 lines)
│   ├── aidlc-progress.md           # Append-only narrative (write-only)
│   ├── backlog.md                  # Features / Tech Debt / Deferred Decisions
│   └── audit.md                    # Append-only decision log (write-only)
```
