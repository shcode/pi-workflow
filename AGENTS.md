# AGENTS.md

## Project overview

Personal AIDLC (AI-Driven Development Life Cycle) workflow optimized for pi coding agents. This repo contains 15 progressive-disclosure skills that load on-demand during software development tasks.

## Repository structure

```
.
├── AGENTS.md              # This file
├── core-workflow.md       # Canonical workflow rules (installed as user's AGENTS.md)
├── install.sh             # Install script for user projects
├── USAGE.md               # Usage guide
├── README.md              # Repo readme
└── .pi/skills/            # 15 AIDLC skills + 4 extension files
    ├── aidlc-orchestrator/
    ├── aidlc-common/
    ├── aidlc-extensions/
    ├── aidlc-workspace/
    ├── aidlc-requirements/
    ├── aidlc-stories/
    ├── aidlc-workflow-plan/
    ├── aidlc-app-design/
    ├── aidlc-units/
    ├── aidlc-functional-design/
    ├── aidlc-nfr/
    ├── aidlc-infra-design/
    ├── aidlc-code-gen/
    └── aidlc-build-test/
```

## How to work on this project

When modifying skills or workflow rules:

1. Edit skill files in `.pi/skills/*/SKILL.md`
2. Edit extension files in `.pi/skills/aidlc-extensions/`
3. Update `core-workflow.md` if workflow structure changes
4. Update `USAGE.md` if user-facing behavior changes
5. Keep `core-workflow.md` and orchestrator skill in sync

## Key principles

- **Progressive disclosure**: Only load skill for current stage
- **Bounded state**: `aidlc-state.md` never grows beyond ~30 lines
- **Unbounded progress**: `aidlc-progress.md` tracks per-unit/per-step detail
- **Compact answers**: Questions → one-line-per-answer summaries
- **Daily audit archive**: `audit.md` archived to `audit/YYYY-MM-DD.md`

## Context window target

| Phase | Lines loaded | Before (no skills) |
|-------|-------------|-------------------|
| Per stage | ~460-700 | ~1700 |
| **Reduction** | **~60%** | — |
