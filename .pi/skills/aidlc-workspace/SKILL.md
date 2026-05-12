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
  - **Current** (exists + <30 days + all 7 artifacts present): Skip to Requirements Analysis
  - **Stale or missing**: Next is Reverse Engineering
  - **User requests rerun**: Reverse Engineering regardless

## Step 4: Create State Files

### `aidlc-docs/aidlc-state.md`

```markdown
# AI-DLC State

## Project
- **Type**: [Greenfield/Brownfield]
- **Start**: [ISO timestamp]
- **Workspace**: [Absolute path]

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

## Resume
<!-- Updated after every stage. New sessions load ONLY these files for context. -->
<!-- GOAL.md is always included once it exists. -->

### Load
| Purpose | Path |
|---------|------|
| Goal | GOAL.md |

### Decisions
<!-- Max 7 lines. Key choices that constrain future stages. -->
```

**Rules**:
- `aidlc-state.md` is BOUNDED (~45 lines max). Contains: Stages, Extensions, Current Work, Next, Resume.
- Update `## Resume` after every stage with the artifacts the NEXT stage needs.
- `## Decisions` captures key choices (tech stack, architecture, auth approach, etc.) — max 7 lines, one per decision.
- `## Current Work` updates at each meaningful checkpoint.

### `aidlc-docs/aidlc-progress.md`

```markdown
# AI-DLC Progress

<!-- APPEND-ONLY: Line numbers are stable. audit.md references line ranges here. -->
```

### `aidlc-docs/backlog.md`

```markdown
# Backlog

<!-- Status: [todo] | [in progress] | [pending] | [done] -->

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
