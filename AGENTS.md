---
type: skill-pack
description: Personal AIDLC workflow — 18 progressive-disclosure skills for pi
author: shcode
tags: [pi, workflow, aidlc, skills, progressive-disclosure]
---

# AGENTS.md

> **Audience**: This file is for **contributors and maintainers** of the AIDLC skill pack. End users should read `USAGE.md`.

## Project overview

Personal AIDLC (AI-Driven Development Life Cycle) workflow optimized for pi coding agents. This repo contains 18 progressive-disclosure skills that load on-demand during software development tasks.

## Distribution model

This repo is the **source of truth** for the AIDLC workflow. It is not consumed directly — it is installed into target projects via `install.sh`.

### Multi-agent architecture

`core-workflow.md` is the **universal steering document** for all agents. It contains a slim always-on trigger. The full workflow detail lives in `aidlc-orchestrator/SKILL.md`, which is loaded on demand by pi and referenced directly by other agents.

| Agent | Steering file | Full workflow |
|---|---|---|
| **pi** | `AGENTS.md` ← `core-workflow.md` (slim trigger) | `aidlc-orchestrator` skill (progressive disclosure) |
| **Claude Code** | `CLAUDE.md` ← `core-workflow.md` (slim trigger) | `aidlc-orchestrator` skill (loaded as context) |
| **GitHub Copilot** | `.github/copilot-instructions.md` ← `core-workflow.md` | `aidlc-orchestrator` skill (loaded as context) |
| **Kiro** | `AGENTS.md` ← `core-workflow.md` (slim trigger) | `aidlc-orchestrator` skill (loaded as context) |

**Key rule**: `core-workflow.md` is a slim always-loaded trigger for all agents. `aidlc-orchestrator/SKILL.md` is the single source of truth for the full workflow. Changes to workflow rules go in the orchestrator skill only.

**Key rule**: `.pi/` is pi-specific progressive disclosure. `core-workflow.md` is agent-agnostic — never add agent-specific logic there.

```
AIDLC repo (this project)
  │
  ├── install.sh ───────────────────┐
  │   copies .pi/skills/*           │
  │   copies core-workflow.md  ─────┤  (all agents: slim trigger)
  │                                 ▼
  │                         target project
  │                           ├── .pi/skills/      # 20 skills (pi only)
  │                           ├── .pi/extensions/  # task panel, etc. (pi only)
  │                           ├── AGENTS.md        # pi + kiro ← core-workflow.md
  │                           ├── CLAUDE.md        # Claude Code ← core-workflow.md
  │                           └── .github/
  │                               └── copilot-instructions.md  # Copilot ← core-workflow.md
  │
  ├── AGENTS.md (this file) ────► contributor/maintainer guide
  ├── core-workflow.md ─────────► slim always-on trigger (all agents)
  ├── USAGE.md ─────────────────► end-user documentation
  └── README.md ────────────────► public project readme
```

## Repository structure

```
.
├── AGENTS.md                  # This file — contributor/maintainer guide
├── core-workflow.md           # Slim always-on trigger → installed for ALL agents
├── install.sh                 # Distribution script
├── USAGE.md                   # End-user documentation
├── README.md                  # Public project readme
├── LICENSE
└── .pi/
    ├── skills/
    │   ├── aidlc-orchestrator/
    │   │   └── SKILL.md           # Stage router — entrypoint for all AIDLC tasks
    │   ├── aidlc-common/
    │   │   └── SKILL.md           # Slim shared rules (session continuity, state, audit)
    │   ├── aidlc-stage-common/
    │   │   └── SKILL.md           # Canonical stage protocol — loaded on demand by stage skills
    │   ├── aidlc-questions/
    │   │   └── SKILL.md           # Question format + answer validation (loaded on demand)
    │   ├── aidlc-construction-rules/
    │   │   └── SKILL.md           # Design-first + mid-construction rules (loaded on demand)
    │   ├── aidlc-workspace/
    │   │   └── SKILL.md           # Greenfield/brownfield detection + resume
    │   ├── aidlc-requirements/
    │   │   └── SKILL.md           # Requirements analysis
    │   ├── aidlc-stories/
    │   │   └── SKILL.md           # User stories (conditional)
    │   ├── aidlc-workflow-plan/
    │   │   └── SKILL.md           # Execution plan + Mermaid viz
    │   ├── aidlc-app-design/
    │   │   └── SKILL.md           # Component/service design (conditional)
    │   ├── aidlc-units/
    │   │   └── SKILL.md           # Multi-unit decomposition (conditional)
    │   ├── aidlc-functional-design/
    │   │   └── SKILL.md           # Per-unit business logic design
    │   ├── aidlc-nfr/
    │   │   └── SKILL.md           # Per-unit NFR requirements + design
    │   ├── aidlc-infra-design/
    │   │   └── SKILL.md           # Per-unit infrastructure mapping
    │   ├── aidlc-ui-design/
    │   │   └── SKILL.md           # Per-unit UI components via Storybook
    │   ├── aidlc-code-gen/
    │   │   └── SKILL.md           # Per-unit code generation
    │   ├── aidlc-build-test/
    │   │   └── SKILL.md           # Build instructions, tests, integration
    │   ├── aidlc-operations/
    │   │   └── SKILL.md           # Deployment pipeline, monitoring, runbooks, readiness gate
    │   ├── aidlc-reverse-eng/
    │   │   └── SKILL.md           # Brownfield codebase analysis
    │   └── aidlc-extensions/
    │       ├── SKILL.md           # Extension manager — scans and loads opt-ins
    │       ├── security-baseline.md
    │       ├── security-baseline.opt-in.md
    │       ├── property-based-testing.md
    │       ├── property-based-testing.opt-in.md
    │       ├── resiliency-baseline.md
    │       └── resiliency-baseline.opt-in.md
    └── extensions/
        └── aidlc-task-panel.ts    # Persistent task panel TUI extension
```

## Skill authoring

### Required structure

Each skill lives in `.pi/skills/<name>/` and **must** contain `SKILL.md`.

```
.pi/skills/aidlc-example/
└── SKILL.md           # Required. Skill name = directory name.
```

### Naming convention

- Format: `aidlc-<stage>` — kebab-case, matches stage name in router
- Examples: `aidlc-orchestrator`, `aidlc-code-gen`, `aidlc-build-test`
- Support skills: `aidlc-common`, `aidlc-stage-common`, `aidlc-questions` — loaded on demand, NOT stages

### Cross-skill references

- Load other skills via `/skill:<name>` or `Follow [Protocol](aidlc-stage-common)` — never inline content from another skill
- Relative paths in a skill resolve against the skill directory (parent of `SKILL.md`)
- The orchestrator skill is the single router — do not add stage routing logic in other skills
- The `aidlc-stage-common` skill defines canonical stage protocols — stage skills reference it instead of duplicating procedural flow

### Performance budget

| Phase | Lines loaded | Before (no skills) |
|-------|-------------|-------------------|
| Per stage | ~460–700 | ~1700 |
| **Reduction** | **~60%** | — |

**Skill authors must stay within ~700 lines**. If a skill grows larger, split or compress content. This is a hard constraint.

## Extension authoring

Extensions are opt-in rule sets discovered at runtime.

### File layout

Each extension requires two files in `.pi/skills/aidlc-extensions/`:

| File | Purpose |
|------|---------|
| `<name>.md` | Full extension rules — loaded as hard constraints when enabled |
| `<name>.opt-in.md` | Prompt text shown during Requirements Analysis opt-in question |

The extension manager (`aidlc-extensions/SKILL.md`) scans this directory recursively. New files are auto-discovered. If an extension needs to appear in the opt-in prompt, ensure the manager's discovery logic references it.

### Current extensions

| Extension | Files | When to enable |
|-----------|-------|----------------|
| Security Baseline | `security-baseline.md`, `security-baseline.opt-in.md` | Production apps |
| Property-Based Testing | `property-based-testing.md`, `property-based-testing.opt-in.md` | Business logic, data transformations |

## State files

These files are generated in `aidlc-docs/` during workflow execution. Skill authors must know their contracts:

| File | Purpose | Contract |
|------|---------|----------|
| `aidlc-state.md` | Routing table + Resume manifest | ~45 lines, bounded. NEVER add rows. Updated after every stage. |
| `aidlc-progress.md` | Narrative progress tracker | Unbounded. All per-unit/per-step detail goes here. |
| `audit.md` | Append-only decision log | Archived daily to `audit/YYYY-MM-DD.md`. Always append, never overwrite. |

## How to work on this project

### Contribution lifecycle

1. **Design**: Open an issue/discussion describing the skill or workflow change
2. **Implement**: Edit skill files in `.pi/skills/*/SKILL.md` or extension files
3. **Sync**: Update dependent files per the matrix below
4. **Validate**: Run `./install.sh /tmp/test-project` and verify structure
5. **Document**: Update `README.md` or `USAGE.md` if user-facing behavior changes
6. **Commit**: Follow conventional commits

### Synchronization matrix

| If you modify... | You must also update... |
|---|---|
| Add/remove/rename a skill | `aidlc-orchestrator/SKILL.md` stage router, `USAGE.md` stage table, `AGENTS.md` repo structure |
| Workflow principles/rules | `aidlc-orchestrator/SKILL.md` (single source of truth for full workflow) |
| Startup trigger / always-on rules | `core-workflow.md` (slim trigger for all agents) |
| Question format changes | `aidlc-questions/SKILL.md` (single source for question rules) |
| Construction rules changes | `aidlc-construction-rules/SKILL.md` (single source for design-first rules) |
| Extension files | `aidlc-extensions/SKILL.md` discovery logic if the extension needs explicit prompt registration |
| `install.sh` behavior | `USAGE.md` installation section |
| Add new agent support | `install.sh` agent-specific copy block, `USAGE.md` agent table |

### Validation checklist

Before committing changes:

```bash
# 1. Install to a temp project
mkdir -p /tmp/test-aidlc && ./install.sh /tmp/test-aidlc

# 2. Verify all pi resources copied
ls /tmp/test-aidlc/.pi/skills/ | wc -l   # expect 20 skill dirs
ls /tmp/test-aidlc/.pi/extensions/ | wc -l  # expect >=1 extension

# 3. Verify steering files created for all agents
test -f /tmp/test-aidlc/AGENTS.md && echo "AGENTS.md OK"
test -f /tmp/test-aidlc/CLAUDE.md && echo "CLAUDE.md OK"
test -f /tmp/test-aidlc/.github/copilot-instructions.md && echo "copilot-instructions.md OK"

# 4. Verify every skill has SKILL.md
find .pi/skills -mindepth 2 -maxdepth 2 -name "SKILL.md" | wc -l   # expect 20

# 5. Check for broken relative references in skills
grep -rn "\](" .pi/skills/ | grep -v "http" | grep -v "SKILL.md" || echo "No local relative refs found"
```

## Key principles

- **Progressive disclosure**: Only load the skill for the current stage
- **Bounded state**: `aidlc-state.md` never grows beyond ~30 lines
- **Unbounded progress**: `aidlc-progress.md` tracks per-unit/per-step detail
- **Compact answers**: Questions → one-line-per-answer summaries
- **Daily audit archive**: `audit.md` archived to `audit/YYYY-MM-DD.md`
- **No emergent behavior**: All stage transitions are explicit, logged, and user-approved
