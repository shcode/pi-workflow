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

### Inception (project-wide, tracked in `aidlc-state.md`)
| # | Stage | Condition | Skill |
|---|---|---|---|
| 1 | Workspace Detection | ALWAYS | `aidlc-workspace` |
| 2 | Reverse Engineering | Brownfield, stale/no artifacts | `aidlc-reverse-eng` |
| 3 | Requirements Analysis | ALWAYS (adaptive depth) | `aidlc-requirements` |
| 4 | User Stories | User-facing features | `aidlc-stories` |
| 5 | Workflow Planning | ALWAYS | `aidlc-workflow-plan` |
| 6 | Application Design | New components/services | `aidlc-app-design` |
| 7 | Units Generation | Multi-unit decomposition | `aidlc-units` |

### Construction (per-unit, tracked in `backlog/{unit-name}.md`)
| # | Stage | Condition | Skill |
|---|---|---|---|
| 1 | Functional Design | New business logic | `aidlc-functional-design` |
| 2 | NFR Requirements & Design | Performance/security | `aidlc-nfr` |
| 3 | UI Design | New UI components | `aidlc-ui-design` |
| 4 | Infrastructure Design | Infrastructure changes | `aidlc-infra-design` |
| 5 | Code Generation | ALWAYS | `aidlc-code-gen` |

### Final (project-wide, tracked in `aidlc-state.md` row 8)
| Stage | Condition | Skill |
|---|---|---|
| Build and Test | After ALL units done | `aidlc-build-test` |

🟡 **OPERATIONS**: Placeholder for future deployment/monitoring workflows.

### Additional skills loaded on demand:
| Skill | When loaded |
|---|---|
| `aidlc-questions` | First stage that asks clarifying questions |
| `aidlc-construction-rules` | First construction stage begins |

## Stage Transition (3 steps)

After completing any stage:
1. **Log**: Append narrative to `aidlc-progress.md` (record line range START-END) + decision entry to `audit.md`
2. **Update state**:
   - **Inception stages**: Mark row `[x]` in `aidlc-state.md`, update `## Current Work`, `## Resume`, `## Next`
   - **Construction stages**: Mark row `[x]` in `backlog/{unit-name}.md`, update its Current Step + Resume. Update `aidlc-state.md` `## Current Work` Step only.
3. **Load next skill**

**Skill caching**: Once a skill file is read in a session, it stays in context. Do NOT re-read.

## Construction Flow

1. Inception completes → all units added to `backlog.md` as `[todo]`
2. Agent picks first `[todo]` unit (or asks user) → marks `[in progress]` → creates `backlog/{unit}.md`
3. `aidlc-state.md` `## Current Work`: Phase = CONSTRUCTION, Unit = unit name
4. Execute construction stages per `backlog/{unit}.md` checklist
5. Unit complete → mark `[done]` in `backlog.md` → pick next unit
6. All units `[done]` → Build and Test (project-wide, `aidlc-state.md` row 8)

## State File Rules

| File | Access | Purpose |
|---|---|---|
| `aidlc-state.md` | READ + UPDATE | Project-wide stages + Current Work + Resume (~45 lines, bounded). |
| `backlog/{unit}.md` | READ + UPDATE | Per-unit construction progress. Created at Units Generation. |
| `backlog.md` | READ + UPDATE | Master tracker. Read at session start + planning. |
| `aidlc-progress.md` | APPEND-ONLY | Narrative log. Never read except targeted offset+limit via audit.md pointers. |
| `audit.md` | APPEND-ONLY | Decision log. Never read except: `head -n 5` for rotation, `tail -n 50` for history. |

## Resume Manifest

The `## Resume` section in `aidlc-state.md` is the **single source of truth** for cold resume:

```markdown
## Resume
### Load
| Purpose | Path |
|---------|------|
| Requirements | inception/requirements/requirement-verification-answers.md |
| Design | inception/application-design/components.md |
| Unit progress | backlog/auth-service.md |

### Decisions
- Auth: Auth0 with MFA required
- Architecture: Monolith with modules
- Stack: Next.js + Prisma + PostgreSQL
```

A new session reads `aidlc-state.md` and loads ONLY what `## Resume` specifies. No guessing.

## Cross-Cutting Rules

- Questions use `[Answer]:` file-based format or `ask_user_question` tool (see `aidlc-questions` skill)
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
├── GOAL.md                         # Project goal summary (created after workflow planning)
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
│   ├── backlog/                    # Per-unit construction tracking
│   │   └── {unit-name}.md
│   ├── aidlc-state.md              # Project-wide routing + Resume (~45 lines)
│   ├── aidlc-progress.md           # Append-only narrative (write-only)
│   ├── backlog.md                  # Master work tracker
│   └── audit.md                    # Append-only decision log (write-only)
```
