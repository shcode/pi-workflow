---
name: aidlc-app-design
description: >
  AIDLC Application Design stage. Load during inception when new components, services,
  or business rules need design. High-level component identification and service layer design.
  Skip for changes within existing component boundaries or pure implementation changes.
---

# Application Design

**Purpose**: High-level component identification and service layer design

**Condition**: CONDITIONAL

**Note**: Detailed business logic design happens later in Functional Design (per-unit, CONSTRUCTION phase)

---

## Prerequisites
- Workspace Detection complete
- Requirements Analysis recommended
- User Stories recommended
- Execution plan indicates Application Design should execute

---

## Step-by-Step Execution

### 1. Analyze Context

- Read `aidlc-docs/inception/requirements/requirements.md`
- Read `aidlc-docs/inception/user-stories/stories.md`
- Identify key business capabilities and functional areas
- Determine design scope and complexity

### 2. Create Application Design Plan

- Generate plan with checkboxes [] for application design
- Focus on components, responsibilities, methods, business rules, and services

### 3. Include Mandatory Design Artifacts in Plan

- [ ] Generate `components.md` with component definitions and high-level responsibilities
- [ ] Generate `component-methods.md` with method signatures (business rules detailed later in Functional Design)
- [ ] Generate `services.md` with service definitions and orchestration patterns
- [ ] Generate `component-dependency.md` with dependency relationships and communication patterns
- [ ] Generate `application-design.md` that consolidates all above into a single reference document
- [ ] Validate design completeness and consistency

### 4. Q&A

Load `aidlc-stage-common` for Standard Q&A with:
- Plan path: `inception/plans/application-design-plan.md`
- Questions path: `inception/plans/application-design-questions.md`
- Answers path: `inception/application-design/answers.md`
- Categories:
  - **Component Identification** — Boundaries, organization, grouping
  - **Component Methods** — Method signatures, input/output, interface contracts
  - **Service Layer Design** — Orchestration, boundaries, coordination patterns
  - **Component Dependencies** — Communication patterns, dependency management, coupling
  - **Design Patterns** — Architectural style, pattern choices, constraints

### 5. Generate Application Design Artifacts

Create:
- `aidlc-docs/inception/application-design/components.md`
  - Component name and purpose
  - Component responsibilities
  - Component interfaces
- `aidlc-docs/inception/application-design/component-methods.md`
  - Method signatures for each component
  - High-level purpose of each method
  - Input/output types
  - Note: Detailed business rules in Functional Design (CONSTRUCTION)
- `aidlc-docs/inception/application-design/services.md`
  - Service definitions
  - Service responsibilities
  - Service interactions and orchestration
- `aidlc-docs/inception/application-design/component-dependency.md`
  - Dependency matrix
  - Communication patterns
  - Data flow diagrams
- `aidlc-docs/inception/application-design/application-design.md`
  - Consolidated single document

### 6. Present Completion

Load `aidlc-stage-common` completion message for: "🏗️ Application Design", `aidlc-docs/inception/application-design/`, "[Units Generation/CONSTRUCTION]"

> [IF Units Generation skipped: add "📝 **Add Units Generation**" option]

### 7. Approval Gate

Load `aidlc-stage-common` approval gate. On approval: log in `audit.md`, mark Application Design `[x]` in `aidlc-state.md`, update `## Current Work`.
