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

### Step 3: Q&A

Load `aidlc-stage-common` for Standard Q&A with:
- Plan path: `construction/plans/{unit-name}-functional-design-plan.md`
- Questions path: `construction/plans/{unit-name}-functional-design-questions.md`
- Answers path: `construction/{unit-name}/functional-design/answers.md`
- Categories:
  - **Business Logic Modeling** — Core entities, workflows, data transformations
  - **Domain Model** — Domain concepts, entity relationships, data structures
  - **Business Rules** — Decision rules, validation logic, constraints, policies
  - **Data Flow** — Inputs, outputs, transformations, persistence
  - **Integration Points** — External system interactions, APIs, data exchange
  - **Error Handling** — Error scenarios, validation failures, exceptions
  - **Business Scenarios** — Edge cases, alternative flows, complex situations
  - **Frontend Components** (if applicable) — UI structure, interactions, state management, form handling

### Step 4: Generate Functional Design Artifacts

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

### Step 5: Present Completion

Load `aidlc-stage-common` completion message for: "🔧 Functional Design", `aidlc-docs/construction/{unit-name}/functional-design/`, "[next-stage-name]"

### Step 6: Approval Gate

Load `aidlc-stage-common` approval gate. On approval: log in `audit.md`, mark Functional Design `[x]` in `backlog/{unit-name}.md`.
