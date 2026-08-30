---
name: aidlc-units
description: >
  AIDLC Units Generation stage. Load during inception when system needs decomposition
  into multiple units of work. Decomposes system into manageable units with dependencies
  and story mappings. Skip for single simple unit or straightforward implementation.
  Has two parts: Planning and Generation.
---

# Units Generation

**Purpose**: Decompose system into manageable units of work

**Condition**: CONDITIONAL

**Definition**: A unit of work is a logical grouping of stories for development. For microservices, each unit = independently deployable service. For monoliths, single unit = entire application with logical modules.

**Domain vs Unit of Work**: A domain (bounded context) is a business grouping; a unit of work is a delivery grouping. They are not always 1:1 — one domain may span multiple units (e.g. `billing-api` + `billing-worker`), or one unit may contain multiple domains (e.g. a monolith unit with `billing` + `inventory` modules). Assign each unit a Domain in `unit-of-work.md` based on the Business Domain question (Step 3). For single-domain projects, use one domain name project-wide (no extra ceremony).

**Terminology**: Use "Service" for independently deployable components, "Module" for logical groupings within a service, "Unit of Work" for planning context.

---

## Prerequisites
- Workspace Detection complete
- Requirements Analysis recommended
- User Stories recommended
- Application Design stage REQUIRED
- Execution plan indicates Design stage should execute

---

## PART 1: PLANNING

### Step 1: Create Unit of Work Plan

- Generate plan with checkboxes [] for decomposing system
- Focus on breaking down into manageable development units

### Step 2: Include Mandatory Unit Artifacts in Plan

- [ ] Generate `unit-of-work.md` with unit definitions, responsibilities, and Domain mapping (which domain/bounded context each unit belongs to — see Business Domain question in Step 3)
- [ ] Generate `unit-of-work-dependency.md` with dependency matrix
- [ ] Generate `unit-of-work-story-map.md` mapping stories to units
- [ ] **Greenfield only**: Document code organization strategy in `unit-of-work.md`
- [ ] Validate unit boundaries and dependencies
- [ ] Ensure all stories assigned to units

### Step 3: Q&A

Load `aidlc-stage-common` for Two-Part planning Q&A with:
- Plan path: `inception/plans/unit-of-work-plan.md`
- Questions path: `inception/plans/unit-of-work-questions.md`
- Answers path: `inception/application-design/answers.md`
- Categories:
  - **Story Grouping** — Grouping strategy, story affinity, logical clustering
  - **Dependencies** — Integration approach, shared resources, inter-unit communication
  - **Team Alignment** — Team structure, ownership boundaries, collaboration
  - **Technical Considerations** — Scalability/deployment requirements per unit
  - **Business Domain** — Domain boundaries, bounded contexts, capability alignment
  - **Code Organization (Greenfield multi-unit only)** — Deployment model, directory structure

### Step 4: Approval

Save plan. Ask: "**Unit of work plan complete. Review in plan file. Ready to proceed to generation?**" Do NOT proceed until user confirms. Log prompt and response in `audit.md`. Mark Part 1 complete in `aidlc-state.md`.

---

## PART 2: GENERATION

Load `aidlc-stage-common` for Two-Part generation flow:
1. Load `aidlc-docs/inception/plans/unit-of-work-plan.md`, find next uncompleted step
2. Execute steps sequentially, mark `[x]` after each, update `aidlc-state.md`
3. Verify all mandatory artifacts complete
4. Load `aidlc-stage-common` completion message for: "🔧 Units Generation", `aidlc-docs/inception/application-design/`, "CONSTRUCTION PHASE"
5. Load `aidlc-stage-common` approval gate. On approval: log in `audit.md`, mark Units Generation `[x]` in `aidlc-state.md`.

**MANDATORY**: Add all generated units to `aidlc-docs/backlog.md` under `## Units of Work`:
```markdown
- [todo] unit-name (domain: {domain}) — brief description (stories: US-1, US-3)
```
Omit `(domain: {domain})` if the project has only one domain.

**MANDATORY**: Create `aidlc-docs/backlog/unit/{unit-name}.md` for each unit per the Unit of work template in `aidlc-common` → Per-Item Tracking. Rules for populating `## Dependencies`:
- Read `unit-of-work-dependency.md` to find dependencies for this unit
- List each dependency in `## Dependencies` (omit section or write `none` if no dependencies)

**IF running in pmai mode** (`PI_PMAI_CONTRACT_VERSION` set): write `aidlc-docs/inception-complete.json` as the final inception artifact:
```json
{
  "completed_at": "[ISO timestamp]",
  "units": ["unit-name-1", "unit-name-2"],
  "dependency_map": {
    "unit-name-2": ["unit-name-1"],
    "unit-name-1": []
  }
}
```
This file signals to pmai that inception completed successfully and provides the unit list and dependency DAG for issue creation and dispatch. Only write this file after ALL other inception artifacts are committed to git.

---

## Critical Rules

### Planning Phase
- **Validate prerequisites**: Application Design must be complete
- **Include all mandatory artifacts**: unit-of-work.md, unit-of-work-dependency.md, unit-of-work-story-map.md
- Get explicit approval before generation

### Generation Phase
- **NO HARDCODED LOGIC**: Only execute what's in the plan
- **FOLLOW PLAN EXACTLY**: Do not deviate
- **UPDATE CHECKBOXES**: Mark [x] immediately after each step
- **VERIFY COMPLETION**: Ensure all artifacts complete
