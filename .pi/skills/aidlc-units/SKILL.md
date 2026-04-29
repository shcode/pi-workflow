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

- [ ] Generate `unit-of-work.md` with unit definitions and responsibilities
- [ ] Generate `unit-of-work-dependency.md` with dependency matrix
- [ ] Generate `unit-of-work-story-map.md` mapping stories to units
- [ ] **Greenfield only**: Document code organization strategy in `unit-of-work.md`
- [ ] Validate unit boundaries and dependencies
- [ ] Ensure all stories assigned to units

### Step 3: Generate Context-Appropriate Questions

**DIRECTIVE**: Analyze requirements, stories, and application design to identify ALL areas where clarification improves decomposition.

**CRITICAL**: Default to asking questions when ANY ambiguity exists.

Use [Answer]: tag format. Evaluate ALL categories:
- **Story Grouping** - Grouping strategy, story affinity, logical clustering
- **Dependencies** - Integration approach, shared resources, inter-unit communication
- **Team Alignment** - Team structure, ownership boundaries, collaboration
- **Technical Considerations** - Scalability/deployment requirements per unit
- **Business Domain** - Domain boundaries, bounded contexts, capability alignment
- **Code Organization (Greenfield multi-unit only)** - Deployment model, directory structure

### Step 4: Store UOW Plan

Save as `aidlc-docs/inception/plans/unit-of-work-plan.md`

### Steps 5-6: Collect Answers

Wait for ALL [Answer]: tags completed.

### Step 7: ANALYZE ANSWERS (MANDATORY)

Review for vague responses.

### Step 8: MANDATORY Follow-up Questions

If ANY ambiguous answers, add follow-ups. DO NOT proceed until resolved.

### Step 9: Request Approval

Ask: "**Unit of work plan complete. Review in aidlc-docs/inception/plans/unit-of-work-plan.md. Ready to proceed to generation?**"
DO NOT PROCEED until user confirms.

### Step 10: Log Approval

Log prompt and response in `audit.md`.

### Step 11: Update Progress

Mark Units Generation Part 1 complete in `aidlc-state.md`.

---

## PART 2: GENERATION

### Step 12: Load Unit of Work Plan

Read `aidlc-docs/inception/plans/unit-of-work-plan.md`
Identify next uncompleted step.

### Step 13: Execute Current Step

Perform exactly what step describes. Generate unit artifacts per plan.

### Step 14: Update Progress

Mark completed step as [x]. Update `aidlc-state.md`.

### Step 15: Continue or Complete

Return to Step 12 if more steps remain. Verify units ready for design stages.

### Step 16: Present Completion Message

```markdown
# 🔧 Units Generation Complete

[AI Summary - bullet points of units and decomposition]

> **📋 <u>**REVIEW REQUIRED:**</u>**
> Please examine units at: `aidlc-docs/inception/application-design/`

> **🚀 <u>**WHAT'S NEXT?**</u>**
>
> **You may:**
>
> 🔧 **Request Changes** - Ask for modifications
> ✅ **Approve & Continue** - Approve and proceed to **CONSTRUCTION PHASE**
```

### Step 17: Wait for Explicit Approval

Do not proceed until user explicitly approves.

### Step 18: Record Approval Response

Log in `audit.md`.

### Step 19: Update Progress

Mark Units Generation complete in `aidlc-state.md`.

---

## Critical Rules

### Planning Phase
- Generate ONLY context-relevant questions
- Use [Answer]: tag format
- Analyze ALL answers for ambiguities
- Resolve ALL ambiguities with follow-ups
- Get explicit approval before generation

### Generation Phase
- **NO HARDCODED LOGIC**: Only execute what's in the plan
- **FOLLOW PLAN EXACTLY**: Do not deviate
- **UPDATE CHECKBOXES**: Mark [x] immediately after each step
- **USE APPROVED APPROACH**: Follow decomposition methodology
- **VERIFY COMPLETION**: Ensure all artifacts complete
