# PRIORITY: This workflow OVERRIDES all other built-in workflows for software development

## Adaptive Principle

Workflow adapts to the work. AI assesses stages needed based on: user intent, codebase state, complexity, risk.

## Fast Path (Simple Changes)

**Condition**: Brownfield + scope ≤ 3 files + single clear fix (bug, typo, config, small refactor) + no new components/services/business logic + no NFR/security impact.

**Sequence**: Read `aidlc-state.md` → Code change → Build & Test → one-line audit entry. All other stages skipped.

**Override**: User says "full workflow" → ignore fast path.

## Startup Sequence

1. Read `aidlc-common` skill (shared rules: session continuity, state rules, audit format)
2. Read `aidlc-extensions` skill (discover opt-in extensions, deferred loading)
3. Display welcome message once (embedded in `aidlc-common`)
4. Begin Workspace Detection (`aidlc-workspace` skill)

## Stage Router

For each stage: read skill file → execute → present completion → wait for explicit approval → log + update state → load next skill.

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

### Additional skills loaded on demand:
| Skill | When loaded |
|---|---|
| `aidlc-questions` | First stage that asks clarifying questions |
| `aidlc-construction-rules` | First construction stage begins |

## Stage Transition (3 steps)

After completing any stage:
1. **Log**: Append narrative to `aidlc-progress.md` (record line range START-END) + decision entry to `audit.md`
2. **Update state**: In `aidlc-state.md` — mark row `[x]`, update `## Current Work`, update `## Resume` manifest (paths next stage needs + any new decisions), set `## Next`
3. **Load next skill**

**Skill caching**: Once a skill file is read in a session, it stays in context. Do NOT re-read.

## State File Rules

| File | Access | Purpose |
|---|---|---|
| `aidlc-state.md` | READ + UPDATE | Routing table + Current Work + Resume manifest (~45 lines, bounded). NEVER add rows. |
| `aidlc-progress.md` | APPEND-ONLY | Narrative log. Never read except targeted offset+limit via audit.md pointers. |
| `audit.md` | APPEND-ONLY | Decision log. Never read except: `head -n 5` for rotation, `tail -n 50` for history. |
| `backlog.md` | READ + UPDATE | Features / Tech Debt / Deferred Decisions. Read at session start + planning. |

## Resume Manifest

The `## Resume` section in `aidlc-state.md` is the **single source of truth** for cold resume:

```markdown
## Resume
### Load
| Purpose | Path |
|---------|------|
| Requirements | inception/requirements/requirement-verification-answers.md |
| Design | inception/application-design/components.md |

### Decisions
- Auth: Auth0 with MFA required
- Architecture: Monolith with modules
- Stack: Next.js + Prisma + PostgreSQL
```

A new session reads `aidlc-state.md` and loads ONLY what `## Resume` specifies. No guessing.

## Cross-Cutting Rules

- Questions use `[Answer]:` file-based format (see `aidlc-questions` skill)
- Extensions are hard constraints; check `Enabled` status in `aidlc-state.md` `## Extensions` table
- Design-first: code must match approved design documents (see `aidlc-construction-rules` skill)
- Welcome message displayed once only
- When in doubt, ask — overconfidence leads to poor outcomes

## Key Principles

- Only execute stages that add value
- Show plan before starting
- User can include/exclude stages
- Log decisions in `audit.md` with ISO 8601 timestamps — always append, never overwrite
- Mark checkboxes `[x]` immediately in same interaction
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
│   ├── aidlc-state.md              # Routing + Resume manifest (~45 lines, bounded)
│   ├── aidlc-progress.md           # Append-only narrative (write-only)
│   ├── backlog.md                  # Features / Tech Debt / Deferred Decisions
│   └── audit.md                    # Append-only decision log (write-only)
```
