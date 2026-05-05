---
name: aidlc-code-gen
description: >
  AIDLC Code Generation stage. Load during construction per-unit to generate code, tests,
  and artifacts. Always executes per-unit. Has two parts: Part 1 Planning (create detailed
  code generation plan with explicit steps) and Part 2 Generation (execute approved plan).
  For brownfield, modify existing files in-place rather than creating duplicates.
---

# Code Generation

**Purpose**: Generate code for each unit of work

**Condition**: ALWAYS EXECUTE (per-unit)

**Note**: For brownfield projects, "generate" means modify existing files when appropriate, not create duplicates.

---

## Prerequisites
- Unit Design Generation complete for the unit
- NFR Implementation (if executed) complete for the unit
- UI Design complete (if unit has UI components) — `aidlc-docs/construction/{unit-name}/ui-design/component-inventory.md` must exist and be approved
- All unit design artifacts available
- Unit is ready for code generation

---

## PART 1: PLANNING

### Step 1: Analyze Unit Context

- [ ] Read unit design artifacts from Unit Design Generation
- [ ] Read unit story map to understand assigned stories
- [ ] Identify unit dependencies and interfaces
- [ ] **Check for UI Design artifacts**: if `aidlc-docs/construction/{unit-name}/ui-design/component-inventory.md` exists, read it now — it is the authoritative list of approved components and their story files
- [ ] Validate unit is ready for code generation

### Step 2: Create Detailed Unit Code Generation Plan

- [ ] Read workspace root from `aidlc-docs/aidlc-state.md` (Project section)
- [ ] Determine code location (see Critical Rules for structure patterns)
- [ ] **Brownfield only**: Review reverse engineering code-structure.md for existing files to modify
- [ ] Document exact paths (never aidlc-docs/)
- [ ] Create explicit steps for unit generation:
  - Project Structure Setup (greenfield only)
  - Business Logic Generation
  - Business Logic Unit Testing
  - Business Logic Summary
  - API Layer Generation
  - API Layer Unit Testing
  - API Layer Summary
  - Repository Layer Generation
  - Repository Layer Unit Testing
  - Repository Layer Summary
  - Frontend Components Generation (if applicable)
  - Frontend Components Unit Testing (if applicable)
  - Frontend Components Summary (if applicable)
  - Database Migration Scripts (if data models exist)
  - Documentation Generation (API docs, README updates)
  - Deployment Artifacts Generation
- [ ] Number each step sequentially
- [ ] Include story mapping references
- [ ] Add checkboxes [ ] for each step

### Step 3: Include Unit Generation Context

- [ ] Stories implemented by this unit
- [ ] Dependencies on other units/services
- [ ] Expected interfaces and contracts
- [ ] Database entities owned by this unit
- [ ] Service boundaries and responsibilities

### Step 4: Create Unit Plan Document

- [ ] Save as `aidlc-docs/construction/plans/{unit-name}-code-generation-plan.md`
- [ ] Include step numbering, unit context, dependencies, story traceability
- [ ] Emphasize this plan is the single source of truth for Code Generation

### Step 5: Summarize Unit Plan

Provide summary to user highlighting generation approach, step sequence, story coverage, total steps, estimated scope.

### Step 6: Log Approval Prompt

Log prompt with timestamp in `audit.md` BEFORE asking for approval.

### Step 7: Wait for Explicit Approval

Do not proceed until user explicitly approves the unit code generation plan. If changes requested, update plan and repeat.

### Step 8: Record Approval Response

Log user's approval response with timestamp in `audit.md`.

### Step 9: Update Progress

Mark Code Generation Part 1 complete: append entry to `aidlc-progress.md`, update `## Current Work` in `aidlc-state.md` (Step = "Part 1 complete, awaiting Part 2").

---

## PART 2: GENERATION

### Step 10: Load Unit Code Generation Plan

- [ ] Read plan from `aidlc-docs/construction/plans/{unit-name}-code-generation-plan.md`
- [ ] Identify next uncompleted step (first [ ] checkbox)
- [ ] Load context for that step

### Step 11: Execute Current Step

- [ ] Verify target directory from plan (never aidlc-docs/)
- [ ] **Brownfield only**: Check if target file exists
- [ ] Generate exactly what current step describes:
  - **If file exists**: Modify in-place (never create `ClassName_modified.java`, `ClassName_new.java`, etc.)
  - **If file doesn't exist**: Create new file
- [ ] Write to correct locations:
  - **Application Code**: Workspace root per project structure
  - **Documentation**: `aidlc-docs/construction/{unit-name}/code/` (markdown only)
  - **Build/Config Files**: Workspace root
- [ ] Follow unit story requirements
- [ ] Respect dependencies and interfaces

### Step 12: Update Progress

- [ ] Mark completed step as [x] in unit code generation plan
- [ ] Mark associated unit stories as [x] when finished
- [ ] Append to `aidlc-progress.md` (narrative entry, never read back)
- [ ] **Brownfield only**: Verify no duplicate files created
- [ ] Save all generated artifacts

### Step 13: Continue or Complete Generation

- [ ] If more steps remain, return to Step 10
- [ ] If all steps complete, proceed to self-review

### Step 13.5: Self-Review (Post-Generation)

Before presenting completion to user, verify generated code against design:

- [ ] Re-read `functional-design/` — confirm all domain entities and business rules are implemented
- [ ] Re-read `nfr-design/` (if exists) — confirm patterns applied (caching, retry, etc.)
- [ ] Re-read `ui-design/component-inventory.md` (if exists) — confirm all components match stories
- [ ] Cross-check unit stories: every acceptance criterion has corresponding code
- [ ] Verify no TODO/FIXME left in generated code (unless explicitly planned)

**If mismatches found**: fix them now (return to Step 11 for the specific file). Do not present completion with known gaps.

**If all checks pass**: proceed to Step 14.

### Step 14: Present Completion Message

```markdown
# 💻 Code Generation Complete - [unit-name]

[AI Summary - bullet points of modified/created files with paths]

> **📋 <u>**REVIEW REQUIRED:**</u>**
> Please examine generated code at:
> - **Application Code**: `[actual-workspace-path]`
> - **Documentation**: `aidlc-docs/construction/[unit-name]/code/`

> **🚀 <u>**WHAT'S NEXT?**</u>**
>
> **You may:**
>
> 🔧 **Request Changes** - Ask for modifications based on review
> ✅ **Continue to Next Stage** - Approve and proceed to [next-unit/Build & Test]
```

### Step 15: Wait for Explicit Approval

Do not proceed until user explicitly approves generated code.

### Step 16: Record Approval and Update Progress

Log approval in `audit.md`. Mark Code Generation row to `[x]` in `aidlc-state.md` (compact table, if final unit). Update `## Current Work` in `aidlc-state.md`. Append unit completion details to `aidlc-progress.md`.

---

## Critical Rules

### Code Location Rules
- **Application code**: Workspace root only (NEVER aidlc-docs/)
- **Documentation**: aidlc-docs/ only (markdown summaries)
- **Read workspace root** from `aidlc-state.md` (Project section) before generating

**Structure patterns by project type**:
- **Brownfield**: Use existing structure (e.g., `src/main/java/`, `lib/`, `pkg/`)
- **Greenfield single unit**: `src/`, `tests/`, `config/` in workspace root
- **Greenfield multi-unit (microservices)**: `{unit-name}/src/`, `{unit-name}/tests/`
- **Greenfield multi-unit (monolith)**: `src/{unit-name}/`, `tests/{unit-name}/`

### Brownfield File Modification Rules
- Check if file exists before generating
- If exists: Modify in-place (never create copies)
- If doesn't exist: Create new file
- Verify no duplicate files after generation

### Planning Phase Rules
- Create explicit, numbered steps
- Include story traceability
- Document unit context and dependencies
- Get explicit approval before generation

### Generation Phase Rules
- **NO HARDCODED LOGIC**: Only execute what's written in unit plan
- **FOLLOW PLAN EXACTLY**: Do not deviate from step sequence
- **UPDATE CHECKBOXES**: Mark [x] immediately after completing each step
- **STORY TRACEABILITY**: Mark unit stories [x] when functionality implemented
- **RESPECT DEPENDENCIES**: Only implement when dependencies satisfied

### Storybook-First UI Rule

Applies whenever `aidlc-docs/construction/{unit-name}/ui-design/component-inventory.md` exists.

**Before generating any UI component:**
- Open the component inventory and locate the component in the **New Components** table
- Confirm its `Status` column shows approval (not `⏳ Pending`)
- Read the corresponding story file (path is in the `Story File` column) — the story's `argTypes`, exported stories, and variants are the implementation spec

**During generation:**
- Implement props, variants, and states to **exactly match** the approved story
- Stub components (created during UI Design) must be replaced with real implementations — never alter the story file itself (`.stories.tsx` is a spec, not generated output)
- Use only the Design System tokens listed in the inventory's **Design Tokens** table
- Add `data-testid` attributes matching story export names (e.g., story `Disabled` → `data-testid="...-disabled"`)

**If a new UI component is discovered mid-generation:**
1. **STOP** current Code Generation step
2. Notify user: _"New component [Name] required — must go through UI Design and Storybook approval first"
3. Wait for user to run `aidlc-ui-design` for the new component
4. Resume Code Generation only after story is approved and inventory is updated

**Never:**
- Create a UI component not listed in the approved component inventory
- Implement variants or states not present in the story
- Modify any `.stories.tsx` file during Code Generation

### Automation Friendly Code Rules
When generating UI code, ensure elements are automation-friendly:
- Add `data-testid` attributes to interactive elements
- Use consistent naming: `{component}-{element-role}`
- Avoid dynamic or auto-generated IDs
- Keep `data-testid` values stable across code changes
