---
name: aidlc-workspace
description: >
  AIDLC Workspace Detection stage. Load when starting inception phase or when needing to
  assess project state, detect brownfield vs greenfield, scan existing code, or resume an
  existing AIDLC project. Determines next phase based on workspace findings.
---

# Workspace Detection

**Purpose**: Determine workspace state and check for existing AI-DLC projects

**Condition**: ALWAYS EXECUTE

---

## Step 1: Check for Existing AI-DLC Project

Check if `aidlc-docs/aidlc-state.md` exists:
- **If exists**: Resume from last phase (read `aidlc-state.md` only — compact table + `## Current Work` section covers all resume context)
- **If not exists**: Continue with new project assessment

**Note**: `aidlc-state.md` is a compact routing table + Current Work section (~35 lines, bounded). `aidlc-progress.md` is an append-only narrative log for human reference — agents never read it.

## Step 2: Scan Workspace for Existing Code

**Determine if workspace has existing code:**
- Scan workspace for source code files (.java, .py, .js, .ts, .jsx, .tsx, .kt, .kts, .scala, .groovy, .go, .rs, .rb, .php, .c, .h, .cpp, .hpp, .cc, .cs, .fs, etc.)
- Check for build files (pom.xml, package.json, build.gradle, etc.)
- Look for project structure indicators
- Identify workspace root directory (NOT aidlc-docs/)

**Record findings:**
```markdown
## Workspace State
- **Existing Code**: [Yes/No]
- **Programming Languages**: [List if found]
- **Build System**: [Maven/Gradle/npm/etc. if found]
- **Project Structure**: [Monolith/Microservices/Library/Empty]
- **Workspace Root**: [Absolute path]
```

## Step 3: Determine Next Phase

**IF workspace is empty (no existing code)**:
- Set flag: `brownfield = false`
- Next phase: Requirements Analysis

**IF workspace has existing code**:
- Set flag: `brownfield = true`
- Check for existing reverse engineering artifacts in `aidlc-docs/inception/reverse-engineering/`
- Determine staleness (check `reverse-engineering-timestamp.md` if it exists):
  - **Artifacts are current** if: `reverse-engineering-timestamp.md` exists AND is less than 30 days old AND all 7 artifact files are present
  - **Artifacts are stale** if: timestamp missing, older than 30 days, or any artifact file missing
- **IF artifacts exist and current**: Load them, skip to Requirements Analysis
- **IF artifacts stale or missing**: Next phase is Reverse Engineering
- **IF user explicitly requests rerun**: Next phase is Reverse Engineering regardless

## Step 4: Create State Files

Create `aidlc-docs/aidlc-state.md` (compact, bounded — agents read this for routing):

```markdown
# AI-DLC State

## Project
- **Type**: [Greenfield/Brownfield]
- **Start**: [ISO timestamp]
- **Stage**: INCEPTION - Workspace Detection

## Stages
| # | Phase | Stage | Status |
|---|-------|-------|--------|
| 1 | INCEPTION | Workspace Detection | [ ] |
| 2 | INCEPTION | Reverse Engineering | [ ] |
| 3 | INCEPTION | Requirements Analysis | [ ] |
| 4 | INCEPTION | User Stories | [ ] |
| 5 | INCEPTION | Workflow Planning | [ ] |
| 6 | INCEPTION | Application Design | [ ] |
| 7 | INCEPTION | Units Generation | [ ] |
| 8 | CONSTRUCTION | Functional Design | [ ] |
| 9 | CONSTRUCTION | NFR Requirements & Design | [ ] |
| 10 | CONSTRUCTION | UI Design | [ ] |
| 11 | CONSTRUCTION | Infrastructure Design | [ ] |
| 12 | CONSTRUCTION | Code Generation | [ ] |
| 13 | CONSTRUCTION | Build and Test | [ ] |

## Extensions
| Name | Enabled |
|------|---------|

## Current Work
| Field | Value |
|-------|-------|
| Stage | Workspace Detection |
| Unit | — |
| Step | Starting |

## Next
[Next stage name]
```

Create `aidlc-docs/aidlc-progress.md` (append-only narrative log — human reference only, agents use targeted offset reads via audit.md pointers):

```markdown
# AI-DLC Progress

<!-- APPEND-ONLY: Line numbers are stable (never shift). audit.md entries reference line ranges here. -->

## Current Status
[Free-form status description]

```

**Rule**: `aidlc-state.md` is BOUNDED (~35 lines). It contains ONLY: Stages checklist, Extensions table, Current Work, and Next. No append-only tables.

**Rule**: Update `## Current Work` in `aidlc-state.md` at each meaningful checkpoint:
- When entering a new stage (update Stage + Step)
- When switching items (update Unit to new backlog item name)
- When crossing a major boundary (plan approved, code gen parts, etc.)

Keep each value to one line. This section replaces reading `aidlc-progress.md` for resume context.

Create `aidlc-docs/backlog.md` (master work tracker — all units, features, tech debt):

```markdown
# Backlog

<!-- Status: [todo] | [in progress] | [pending] | [done] -->
<!-- Each item gets its own tracking file in backlog/{item-name}.md -->

## Units of Work

## Features

## Technical Debt

## Deferred Decisions
```

**Backlog item format** (one line per item):
```
- [todo] item-name — brief description
- [in progress] item-name — brief description
- [done] item-name — brief description
```

Create `aidlc-docs/backlog/` directory for per-item tracking files.

Per-item tracking file template and rules are in `aidlc-common` (Backlog Management section).

Create `aidlc-docs/audit.md` (append-only decision log — agents write here but NEVER read back):

```markdown
# AI-DLC Audit Log

<!-- WRITE-ONLY: Agents append entries here but never read this file for context. -->
<!-- For detailed narrative history, see: aidlc-docs/aidlc-progress.md -->
<!-- Archived daily to: aidlc-docs/audit/YYYY-MM-DD.md -->
```

## Step 5: Present Completion Message

**For Brownfield Projects:**
```markdown
# 🔍 Workspace Detection Complete

Workspace analysis findings:
• **Project Type**: Brownfield project
• [AI-generated summary of workspace findings in bullet points]
• **Next Step**: Proceeding to **Reverse Engineering** to analyze existing codebase...
```

**For Greenfield Projects:**
```markdown
# 🔍 Workspace Detection Complete

Workspace analysis findings:
• **Project Type**: Greenfield project
• **Next Step**: Proceeding to **Requirements Analysis**...
```

## Step 6: Automatically Proceed

- **No user approval required** - this is informational only
- Automatically proceed to next phase:
  - **Brownfield**: Reverse Engineering (if no artifacts) or Requirements Analysis
  - **Greenfield**: Requirements Analysis

## Logging

**MANDATORY**: Log initial user request in `audit.md` with complete raw input.
**MANDATORY**: Log workspace findings in `audit.md`.
