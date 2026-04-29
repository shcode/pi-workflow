# AIDLC for Pi — Usage Guide

## Installation

Run the install script from this repo against your project directory:

```bash
/path/to/aidlc-pi/install.sh /path/to/your-project
```

Or from inside your project:

```bash
/path/to/aidlc-pi/install.sh .
```

What gets installed:
```
your-project/
├── .pi/skills/              # 15 AIDLC skills
│   ├── aidlc-orchestrator/
│   ├── aidlc-common/
│   ├── aidlc-extensions/
│   ├── aidlc-workspace/
│   ├── aidlc-requirements/
│   ├── aidlc-stories/
│   ├── aidlc-workflow-plan/
│   ├── aidlc-app-design/
│   ├── aidlc-units/
│   ├── aidlc-functional-design/
│   ├── aidlc-nfr/
│   ├── aidlc-infra-design/
│   ├── aidlc-code-gen/
│   └── aidlc-build-test/
└── AGENTS.md                # Steering doc (edit this)
```

## Quick Start

### Auto-trigger

In pi, say anything about software development:

```
"Build a REST API for user management"
"Add authentication to my existing app"
"Fix the bug in the checkout flow"
```

The orchestrator skill auto-loads and routes to the right stage.

### Manual trigger

```
/skill:aidlc-orchestrator
```

## Workflow Stages

Stages load on-demand. Only the orchestrator + common + current stage skill are in context at any time.

| Order | Skill | When It Loads |
|-------|-------|---------------|
| 1 | `aidlc-orchestrator` | Always — master router |
| 2 | `aidlc-common` | Always — shared rules |
| 3 | `aidlc-extensions` | Always — scan opt-in extensions |
| 4 | `aidlc-workspace` | Always — detect greenfield/brownfield |
| 5 | `aidlc-reverse-eng` | Brownfield only — analyze existing code |
| 6 | `aidlc-requirements` | Always — gather requirements |
| 7 | `aidlc-stories` | Conditional — user-facing features |
| 8 | `aidlc-workflow-plan` | Always — create execution plan |
| 9 | `aidlc-app-design` | Conditional — new components/services |
| 10 | `aidlc-units` | Conditional — multi-unit decomposition |
| 11 | `aidlc-functional-design` | Per-unit — new business logic |
| 12 | `aidlc-nfr` | Per-unit — performance/security needs |
| 13 | `aidlc-infra-design` | Per-unit — infrastructure changes |
| 14 | `aidlc-code-gen` | Per-unit — generate/modify code |
| 15 | `aidlc-build-test` | Always — after all units |

## Context Window

| Phase | Lines loaded | Before (no skills) |
|-------|-------------|-------------------|
| Inception | ~450-700 | ~1700 |
| Construction (per-unit) | ~450-700 | ~1700 |
| **Reduction** | **~60%** | — |

## State Files

Generated in `aidlc-docs/` during workflow:

| File | Purpose | Size |
|------|---------|------|
| `aidlc-state.md` | Compact routing table | ~30 lines, bounded |
| `aidlc-progress.md` | Narrative progress tracker | Grows with project |
| `audit.md` | Append-only audit trail | Archived daily |

## Customizing AGENTS.md

After installation, edit `AGENTS.md` in your project:

```markdown
# AGENTS.md

## Project overview
My SaaS app for invoice management.

## Tech stack
- **Language**: TypeScript
- **Framework**: Next.js
- **Database**: PostgreSQL
- **Build tool**: pnpm
- **Test framework**: Vitest

## Setup commands
```bash
pnpm install
pnpm test
pnpm build
pnpm lint
```

## Code style
- Prettier for formatting
- ESLint with strict TypeScript rules
- Conventional commits
```

## Extensions

Two opt-in extensions ship with the skills:

| Extension | File | When to Enable |
|-----------|------|----------------|
| Security Baseline | `.pi/skills/aidlc-extensions/security-baseline.md` | Production apps |
| Property-Based Testing | `.pi/skills/aidlc-extensions/property-based-testing.md` | Business logic, data transformations |

Enable during Requirements Analysis. The orchestrator asks via multiple-choice question.

## Brownfield vs Greenfield

**Greenfield** (new project):
```
Workspace Detection → Requirements → Workflow Plan → Code Gen → Build & Test
```

**Brownfield** (existing project):
```
Workspace Detection → Reverse Engineering → Requirements → Workflow Plan → Per-Unit Loop → Build & Test
```

Per-Unit Loop (for each unit):
```
Functional Design → NFR → Infra Design → Code Generation
```

Brownfield rule: **modify existing files in-place**. Never create duplicates like `ClassName_new.java`.

## Recovery

If a stage fails or you want to restart:

1. Check `aidlc-docs/aidlc-state.md` for current stage
2. Load the relevant skill manually: `/skill:aidlc-code-gen`
3. Or ask: "Continue from where we left off" — the orchestrator reads state and resumes

## Tips

- **Be specific** in your initial request. "Build a REST API" → vague. "Build a REST API with JWT auth, PostgreSQL, and OpenAPI docs" → clear.
- **Approve plans before execution**. Every stage shows a plan first.
- **Use compact answers**. Answer questions with letter choices. The agent creates a one-line-per-answer summary for future stages.
- **Archive old audit files**. `audit.md` grows forever. The agent archives it daily to `audit/YYYY-MM-DD.md`.
