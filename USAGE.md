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
├── .pi/skills/              # 19 AIDLC skills
│   ├── aidlc-orchestrator/
│   ├── aidlc-common/
│   ├── aidlc-extensions/
│   ├── aidlc-workspace/
│   ├── aidlc-reverse-eng/
│   ├── aidlc-requirements/
│   ├── aidlc-stories/
│   ├── aidlc-workflow-plan/
│   ├── aidlc-app-design/
│   ├── aidlc-units/
│   ├── aidlc-functional-design/
│   ├── aidlc-nfr/
│   ├── aidlc-infra-design/
│   ├── aidlc-ui-design/
│   ├── aidlc-code-gen/
│   ├── aidlc-build-test/
│   ├── aidlc-operations/
│   ├── aidlc-questions/
│   └── aidlc-construction-rules/
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
| 16 | `aidlc-operations` | Always — after Build and Test, deployment/monitoring/readiness |

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
| `aidlc-state.md` | Compact routing table | ~50 lines, bounded |
| `aidlc-progress.md` | Narrative progress tracker (append-only) | Grows with project |
| `audit.md` | Decision log, archived daily to `audit/YYYY-MM-DD.md` | Append-only |
| `backlog.md` | Units, features, tech debt, deferred decisions | Grows with project |
| `GOAL.md` | Project goal, requirements summary, key decisions | Written once |
| `backlog/{unit}.md` | Per-unit construction progress + required reading list | One per unit |

### Sample `aidlc-state.md`

```markdown
# AI-DLC State

## Project
- **Type**: Greenfield
- **Start**: 2026-01-01T00:00:00Z
- **Workspace**: /path/to/project

## Stages (Project-wide)
| # | Stage | Status |
|---|-------|--------|
| 1 | Workspace Detection | [x] |
| 2 | Reverse Engineering | [ ] |
| 3 | Requirements Analysis | [x] |
| 4 | User Stories | [ ] |
| 5 | Workflow Planning | [ ] |
| 6 | Application Design | [ ] |
| 7 | Units Generation | [ ] |
| 8 | Build and Test | [ ] |
| 9 | Operations | [ ] |

## Extensions
| Name | Enabled |
|------|---------|
| Security Baseline | No |
| Resiliency Baseline | No |
| Property-Based Testing | Yes |

## Current Work
| Field | Value |
|-------|-------|
| Phase | INCEPTION |
| Stage | Requirements Analysis |
| Unit | — |
| Step | Generating questions |

## Next
Workflow Planning

## Resume
### Skills
aidlc-orchestrator, aidlc-common, aidlc-extensions

### Load
| Purpose | Path |
|---------|------|
| Goal | GOAL.md |
| Requirements | inception/requirements/requirements.md |
```

### Git setup

`aidlc-docs/` contains generated artifacts. Add it to `.gitignore` if you don't want generated docs in version control:

```bash
echo "aidlc-docs/" >> .gitignore
```

Or commit it if you want to track design decisions and audit history.

## Extensions

Three opt-in extensions ship with the skills:

| Extension | When to Enable |
|-----------|----------------|
| Security Baseline | Production apps — enforces OWASP Top 10 2025 rules as blocking constraints |
| Resiliency Baseline | Business-critical workloads — enforces 15 reliability rules across 6 pillars |
| Property-Based Testing | Business logic, data transformations, serialization |

Enabled during Requirements Analysis via multiple-choice prompt. Disabled extensions never load — saves context.

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
  → Operations
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
  → Operations
```

Per-Unit Loop (for each unit):
```
Functional Design → NFR → Infra Design → Code Generation
```

Brownfield rule: **modify existing files in-place**. Never create duplicates like `ClassName_new.java`.

## pmai Integration

[pmai](https://github.com/pmai/pmai) is a project management web app that delegates tasks to pi as an AI agent. When pmai spawns pi with a `task.md` brief, the orchestrator detects the mode automatically — no manual setup needed.

### Modes

| Mode | What runs | When |
|------|-----------|------|
| `inception` | Full AIDLC lifecycle in the workspace repo | Developer initiates project planning in pmai |
| `construction` | Single-unit construction only | pmai dispatches a unit issue to pi |

### Interactive Q&A

When `PI_PMAI_CONTRACT_VERSION=1` is set by pmai, pi emits questions as structured JSON events to stdout instead of writing `[Answer]:` files. pmai surfaces these as interactive forms in the web UI. Answers flow back to pi via stdin.

Standalone pi usage is unaffected — all pmai behavior is gated on `task.md` presence and the env var.

### Parallel Construction

Each construction unit runs in an isolated git worktree on its own branch (`feat/aidlc-{unit}`). Units whose dependencies are all `[done]` are dispatched concurrently. Design artifacts are committed to git per unit; operational logs (`aidlc-progress.md`, `audit.md`) are session-scoped and stored in pmai's database.

### Required Reading

Each `backlog/{unit}.md` is pre-populated with a `## Resume → Load` table listing all design artifacts the agent must read before touching any code — including dependency unit artifacts. This works in both manual and pmai sessions.

---

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
