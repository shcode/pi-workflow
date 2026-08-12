# AI-DLC for Pi

Personal AIDLC workflow optimized for [pi](https://github.com/mariozechner/pi) coding agents.

## Structure

```
.pi/skills/
├── aidlc-orchestrator/          # Master router — load first
├── aidlc-common/                # Shared rules, validation, audit
├── aidlc-extensions/            # Extension manager + rules
├── aidlc-workspace/             # Workspace detection
├── aidlc-reverse-eng/           # Reverse engineering (brownfield)
├── aidlc-requirements/          # Requirements analysis
├── aidlc-stories/               # User stories
├── aidlc-workflow-plan/         # Workflow planning
├── aidlc-app-design/            # Application design
├── aidlc-units/                 # Units generation
├── aidlc-functional-design/     # Functional design (per-unit)
├── aidlc-nfr/                   # NFR requirements + design (per-unit)
├── aidlc-infra-design/          # Infrastructure design (per-unit)
├── aidlc-ui-design/             # UI design — Storybook-first (per-unit)
├── aidlc-code-gen/              # Code generation (per-unit)
├── aidlc-build-test/            # Build and test (project-wide)
├── aidlc-operations/            # Deployment, monitoring, runbooks (project-wide)
└── aidlc-questions/             # Question format + ambiguity detection

core-workflow.md                 # Steering doc (installed as AGENTS.md / CLAUDE.md)
```

## Usage

In a pi session, the orchestrator auto-loads on software development tasks.

Or manually:
```
/skill:aidlc-orchestrator
```

## State Files

Generated in `aidlc-docs/` during workflow:

| File | Purpose | Size |
|------|---------|------|
| `aidlc-state.md` | Compact routing table | ~50 lines, bounded |
| `aidlc-progress.md` | Narrative progress tracker (append-only) | Grows with project |
| `audit.md` | Decision log (archived daily to `audit/YYYY-MM-DD.md`) | Append-only |
| `backlog.md` | Units, features, tech debt, deferred decisions | Grows with project |
| `GOAL.md` | Project goal, requirements summary, key decisions | Written once at Workflow Planning |
| `backlog/{unit}.md` | Per-unit construction progress + required reading list | One per unit |

## pmai Integration

This skill pack supports [pmai](https://github.com/pmai/pmai) — a project management tool
that delegates tasks to pi as an AI agent. When pmai spawns pi with a `task.md` brief,
the orchestrator detects two modes:

- **inception** — runs the full AIDLC lifecycle; supports interactive Q&A via
  `PI_PMAI_CONTRACT_VERSION` env var
- **construction** — runs construction phase only for a single unit; reads inception
  artifacts from the shared base clone

Standalone pi usage is unaffected — pmai mode only activates when `task.md` with
`## AIDLC Mode` is present.
