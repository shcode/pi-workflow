# AI-DLC for Pi

Personal AIDLC workflow optimized for [pi](https://github.com/mariozechner/pi) coding agents.

## Structure

```
.pi/skills/
├── aidlc-orchestrator/          # Master router — load first
├── aidlc-common/                # Shared rules, validation, audit
├── aidlc-extensions/            # Extension manager + rules
├── aidlc-workspace/             # Workspace detection
├── aidlc-requirements/          # Requirements analysis
├── aidlc-stories/               # User stories
├── aidlc-workflow-plan/         # Workflow planning
├── aidlc-app-design/            # Application design
├── aidlc-units/                 # Units generation
├── aidlc-functional-design/     # Functional design
├── aidlc-nfr/                   # NFR requirements + design
├── aidlc-infra-design/          # Infrastructure design
├── aidlc-code-gen/              # Code generation
└── aidlc-build-test/            # Build and test

core-workflow.md                 # Steering doc (installed as user's AGENTS.md)
```

## Usage

In a pi session, the orchestrator auto-loads on software development tasks.

Or manually:
```
/skill:aidlc-orchestrator
```

## State Files

Generated during workflow:
- `aidlc-docs/aidlc-state.md` — compact routing table (~30 lines, bounded)
- `aidlc-docs/aidlc-progress.md` — unbounded progress tracker
- `aidlc-docs/audit.md` — append-only audit trail (archived daily)
