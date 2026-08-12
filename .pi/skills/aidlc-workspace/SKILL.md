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

**Check for pmai delegated mode first**: if `task.md` exists in the working directory and contains `## AIDLC Mode`, the orchestrator already handled routing — do NOT run workspace detection. This skill is not loaded in pmai delegated mode.

Check if `aidlc-docs/aidlc-state.md` exists:
- **If exists**: This is a resume. Read `aidlc-state.md` → follow `## Resume` manifest → present Welcome Back prompt (from `aidlc-common`). Do NOT re-run workspace detection.
- **If not exists**: Continue with new project assessment (Step 2+)

## Step 2: Scan Workspace for Existing Code

Scan for:
- Source code files (.java, .py, .js, .ts, .jsx, .tsx, .kt, .go, .rs, .rb, .php, .c, .cpp, .cs, etc.)
- Build files (pom.xml, package.json, build.gradle, Cargo.toml, etc.)
- Project structure indicators

Record:
```markdown
## Workspace State
- **Existing Code**: [Yes/No]
- **Programming Languages**: [List]
- **Build System**: [Maven/Gradle/npm/etc.]
- **Project Structure**: [Monolith/Microservices/Library/Empty]
- **Workspace Root**: [Absolute path]
```

## Step 3: Determine Next Phase

**Empty workspace** (greenfield):
- `brownfield = false`
- Next: Requirements Analysis

**Has existing code** (brownfield):
- `brownfield = true`
- Check `aidlc-docs/inception/reverse-engineering/reverse-engineering-timestamp.md`:
  - **Current** (exists + all 7 artifacts present + no git commits since timestamp): Skip to Requirements Analysis
  - **Stale** (git commits exist since last analysis): Ask user "Codebase has changed since last analysis. Re-run Reverse Engineering?" If yes → Reverse Engineering. If no → skip.
  - **Missing** (no timestamp or artifacts): Next is Reverse Engineering
  - **User explicitly requests rerun**: Reverse Engineering regardless

**Staleness check**: `git log --since="[timestamp from file]" --oneline -- . ':!aidlc-docs' | wc -l` — if >0, codebase changed.

## Step 4: Create State Files

### `aidlc-docs/aidlc-state.md`

```markdown
# AI-DLC State

## Project
- **Type**: [Greenfield/Brownfield]
- **Start**: [ISO timestamp]
- **Workspace**: [Absolute path]

## Stages (Project-wide)
| # | Stage | Status |
|---|-------|--------|
| 1 | Workspace Detection | [ ] |
| 2 | Reverse Engineering | [ ] |
| 3 | Requirements Analysis | [ ] |
| 4 | User Stories | [ ] |
| 5 | Workflow Planning | [ ] |
| 6 | Application Design | [ ] |
| 7 | Units Generation | [ ] |
| 8 | Build and Test | [ ] |
| 9 | Operations | [ ] |

## Extensions
| Name | Enabled |
|------|---------|

## Current Work
| Field | Value |
|-------|-------|
| Phase | INCEPTION |
| Stage | Workspace Detection |
| Unit | — |
| Step | Starting |

## Next
[Next stage name]

## Resume
<!-- Updated after every stage. New sessions load ONLY these files for context. -->
<!-- GOAL.md is always included once it exists. -->

### Skills
aidlc-orchestrator, aidlc-common, aidlc-extensions

### Load
| Purpose | Path |
|---------|------|
| Goal | GOAL.md |
| Rules | RULES.md |
```

**Rules**:
- `aidlc-state.md` tracks project-wide stages: Inception (1-7) + Build and Test (8) + Operations (9).
- Per-unit construction stages are tracked in `backlog/{unit-name}.md`.
- During CONSTRUCTION, `## Current Work` Unit = active backlog item name.
- Update `## Resume` after every stage with artifacts the NEXT stage needs.

### `aidlc-docs/aidlc-progress.md`

```markdown
# AI-DLC Progress

<!-- APPEND-ONLY: Line numbers are stable. audit.md references line ranges here. -->
```

### `aidlc-docs/backlog.md`

```markdown
# Backlog

<!-- Status: [todo] | [in progress] | [pending] | [done] -->
<!-- Per-unit construction progress tracked in backlog/{unit-name}.md -->

## Units of Work

## Features

## Technical Debt

## Deferred Decisions
```

### `aidlc-docs/audit.md`

```markdown
# AI-DLC Audit Log

<!-- WRITE-ONLY for agents. Archived daily to audit/YYYY-MM-DD.md -->
```

Create `aidlc-docs/backlog/` directory.

## Step 5: Present Completion

**Brownfield:**
```markdown
# 🔍 Workspace Detection Complete

• **Project Type**: Brownfield
• [Summary of findings]
• **Next**: Proceeding to **Reverse Engineering**...
```

**Greenfield:**
```markdown
# 🔍 Workspace Detection Complete

• **Project Type**: Greenfield
• **Next**: Proceeding to **Requirements Analysis**...
```

## Step 6: Auto-Proceed

No user approval required — automatically proceed to next phase.

## Step 7: Update State

1. Mark row 1 `[x]` in Stages table
2. Update `## Current Work` (Stage = next stage name)
3. Update `## Next`
4. Update `## Resume` → Load table with paths the next stage needs:
   - Brownfield → reverse-eng artifacts (if they exist)
   - Greenfield → empty (requirements stage needs no prior artifacts)
5. Append to `aidlc-progress.md` + `audit.md`
