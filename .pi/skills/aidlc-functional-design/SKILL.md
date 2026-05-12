---
name: aidlc-functional-design
description: >
  AIDLC Functional Design stage. Load during construction per-unit when new data models,
  schemas, or complex business logic exist. Technology-agnostic business logic design.
  Skip for simple logic changes or no new business logic.
---

# Functional Design

**Purpose**: Detailed business logic design per unit

**Condition**: CONDITIONAL (per-unit)

**Focus**:
- Detailed business logic and algorithms
- Domain models with entities and relationships
- Detailed business rules, validation logic, constraints
- Technology-agnostic design (no infrastructure concerns)

---

## Prerequisites
- Units Generation complete
- Unit of work artifacts available
- Application Design recommended
- Execution plan indicates Functional Design should execute

---

## Steps to Execute

### Step 1: Analyze Unit Context

- Read unit definition from `aidlc-docs/inception/application-design/unit-of-work.md`
- Read assigned stories from `aidlc-docs/inception/application-design/unit-of-work-story-map.md`
- Understand unit responsibilities and boundaries

### Step 2: Create Functional Design Plan

- Generate plan with checkboxes [] for functional design
- Focus on business logic, domain models, business rules

### Step 3: Generate Context-Appropriate Questions

**DIRECTIVE**: Analyze unit definition and functional design artifacts to identify ALL areas where clarification improves design.

**CRITICAL**: Default to asking questions when ANY ambiguity exists.

Use `[Answer]:` tag format (see `aidlc-common`). Evaluate ALL categories:
- **Business Logic Modeling** - Core entities, workflows, data transformations
- **Domain Model** - Domain concepts, entity relationships, data structures
- **Business Rules** - Decision rules, validation logic, constraints, policies
- **Data Flow** - Inputs, outputs, transformations, persistence
- **Integration Points** - External system interactions, APIs, data exchange
- **Error Handling** - Error scenarios, validation failures, exceptions
- **Business Scenarios** - Edge cases, alternative flows, complex situations
- **Frontend Components** (if applicable) - UI structure, interactions, state management, form handling

### Step 4: Store Plan

Save as `aidlc-docs/construction/plans/{unit-name}-functional-design-plan.md`

### Step 5: Collect and Analyze Answers

Save questions with `[Answer]:` tags to `aidlc-docs/functional-design-questions.md`. STOP. Wait for user to fill all `[Answer]:` tags. Do NOT write answers yourself. **MANDATORY**: Review ALL responses for vagueness. Add follow-up `[Answer]:` questions for ANY unclear responses. Do not proceed until ALL ambiguities resolved.

### Step 6: Generate Functional Design Artifacts

Create:
- `aidlc-docs/construction/{unit-name}/functional-design/business-logic-model.md`
- `aidlc-docs/construction/{unit-name}/functional-design/business-rules.md`
- `aidlc-docs/construction/{unit-name}/functional-design/domain-entities.md`
- If unit includes frontend/UI:
  - `aidlc-docs/construction/{unit-name}/functional-design/frontend-components.md`
    - Component hierarchy and structure
    - Props and state definitions
    - User interaction flows
    - Form validation rules
    - API integration points

### Step 7: Present Completion Message

```markdown
# 🔧 Functional Design Complete - [unit-name]

[AI Summary - bullet points of business logic, entities, rules]

> **📋 <u>**REVIEW REQUIRED:**</u>**
> Please examine functional design at: `aidlc-docs/construction/[unit-name]/functional-design/`

> **🚀 <u>**WHAT'S NEXT?**</u>**
>
> **You may:**
>
> 🔧 **Request Changes** - Ask for modifications
> ✅ **Continue to Next Stage** - Approve and proceed to [next-stage-name]
```

### Step 8: Wait for Explicit Approval

Do not proceed until user explicitly approves.

### Step 9: Record Approval and Update Progress

Log approval in `audit.md`. Mark Functional Design complete in `aidlc-state.md`.
