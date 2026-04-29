# AIDLC for Pi — Usage Guide

## Prerequisites

- [pi](https://github.com/mariozechner/pi) installed and available
- Bash 4+ (for `install.sh`)
- A target project directory (existing or empty)

## Installation

### Option A: Clone first, then install

```bash
git clone <repo-url> ~/aidlc-workflows
~/aidlc-workflows/install.sh /path/to/your-project
```

### Option B: Install directly (if you already have the repo)

```bash
/path/to/aidlc-workflows/install.sh /path/to/your-project
```

Or from inside your project:

```bash
/path/to/aidlc-workflows/install.sh .
```

### What gets installed

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
│   ├── aidlc-build-test/
│   └── aidlc-reverse-eng/
└── AGENTS.md                # Workflow rules (do not edit)
```

### ⚠️ Reinstall warning

Re-running `install.sh` **overwrites** `.pi/skills/` and `AGENTS.md`. If you customize `AGENTS.md` with project context, you will lose it. Keep your project context in a separate file (see [Project context](#project-context) below).

## Project context

`AGENTS.md` is a system file copied from `core-workflow.md`. It contains workflow rules, not project information. **Do not edit it.**

Instead, create a separate context file for your project details. Pi will read it alongside `AGENTS.md`.

**Recommended**: Create `.pi/PROJECT.md` (or `PROJECT.md` in your project root):

```markdown
# Project context

## Overview
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
| Inception | ~450–700 | ~1700 |
| Construction (per-unit) | ~450–700 | ~1700 |
| **Reduction** | **~60%** | — |

## State Files

Generated in `aidlc-docs/` during workflow:

| File | Purpose | Size |
|------|---------|------|
| `aidlc-state.md` | Compact routing table | ~30 lines, bounded |
| `aidlc-progress.md` | Narrative progress tracker | Grows with project |
| `audit.md` | Append-only audit trail | Archived daily |

### Sample `aidlc-state.md`

```markdown
# AIDLC State

## Current Stage
| Status | Stage | Skill |
|--------|-------|-------|
| [x] | Workspace Detection | aidlc-workspace |
| [x] | Requirements Analysis | aidlc-requirements |
| [ ] | User Stories | aidlc-stories |
| [ ] | Workflow Planning | aidlc-workflow-plan |

## Extensions
| Extension | Status |
|-----------|--------|
| Security Baseline | Disabled |
| Property-Based Testing | Enabled |

## Project
- **Type**: Greenfield
- **Current unit**: —
```

### Git setup

`aidlc-docs/` contains generated artifacts. Add it to `.gitignore` if you don't want generated docs in version control:

```bash
echo "aidlc-docs/" >> .gitignore
```

Or commit it if you want to track design decisions and audit history.

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
Workspace Detection
  → Requirements
  → [User Stories]        (conditional)
  → Workflow Plan
  → [Application Design]  (conditional)
  → [Units]               (conditional)
  → Code Generation
  → Build & Test
```

**Brownfield** (existing project):
```
Workspace Detection
  → Reverse Engineering
  → Requirements
  → [User Stories]        (conditional)
  → Workflow Plan
  → [Application Design]  (conditional)
  → [Units]               (conditional)
  → Per-Unit Loop
  → Build & Test
```

Per-Unit Loop (for each unit):
```
Functional Design → NFR → Infra Design → Code Generation
```

Brownfield rule: **modify existing files in-place**. Never create duplicates like `ClassName_new.java`.

## Recovery

If a stage fails or you want to restart:

1. Check `aidlc-docs/aidlc-state.md` for current stage
2. Load the orchestrator skill to resume routing: `/skill:aidlc-orchestrator`
3. Or ask: "Continue from where we left off" — the orchestrator reads state and resumes

## Uninstalling

To remove AIDLC from a project:

```bash
rm -rf .pi/skills/ aidlc-docs/ AGENTS.md
```

This removes all skills, generated docs, and workflow rules. Your project code is untouched.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `install.sh` says "`.pi/skills/` not found" | Run the script from the `aidlc-workflows` repo root, not from the target project |
| Skill not found when loading | Verify `.pi/skills/<name>/SKILL.md` exists. Re-run `install.sh` if skills are missing |
| Orchestrator does not auto-load | Try manual trigger: `/skill:aidlc-orchestrator` |
| `AGENTS.md` overwritten after reinstall | Keep project context in `.pi/PROJECT.md`, not `AGENTS.md` |
| State files grow too large | `audit.md` is archived daily automatically. `aidlc-progress.md` is unbounded by design. |
| Brownfield: duplicate files created | Remind pi: "modify existing files in-place, do not create duplicates" |

## Tips

- **Be specific** in your initial request. "Build a REST API" → vague. "Build a REST API with JWT auth, PostgreSQL, and OpenAPI docs" → clear.
- **Approve plans before execution**. Every stage shows a plan first.
- **Use compact answers**. Answer questions with letter choices. The agent creates a one-line-per-answer summary for future stages.
- **Archive old audit files**. `audit.md` grows forever. The agent archives it daily to `audit/YYYY-MM-DD.md`.
