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
- [ ] Validate design completeness and consistency

### 4. Generate Context-Appropriate Questions

**DIRECTIVE**: Analyze requirements and stories to generate questions relevant to THIS specific design.

**CRITICAL**: Default to asking questions when ANY ambiguity exists. Overconfidence leads to poor designs.

Use pi-answer inline format with headers, option labels, and descriptions (see `aidlc-common`). Evaluate ALL categories:
- **Component Identification** - Boundaries, organization, grouping
- **Component Methods** - Method signatures, input/output, interface contracts
- **Service Layer Design** - Orchestration, boundaries, coordination patterns
- **Component Dependencies** - Communication patterns, dependency management, coupling
- **Design Patterns** - Architectural style, pattern choices, constraints

### 5. Store Application Design Plan

Save as `aidlc-docs/inception/plans/application-design-plan.md`

### 6. Prompt for `/answer`

After listing all questions, append the `/answer` hint. Tell user to run `/answer` to navigate.

### 7. Collect Answers

Wait for answers — via `/answer` or chat reply.

### 8. ANALYZE ANSWERS (MANDATORY)

Review for vague responses: "mix of", "somewhere between", "not sure", "depends"

### 9. MANDATORY Follow-up Questions

If ANY ambiguous answers, add follow-up questions. DO NOT proceed until resolved.

### 10. Generate Application Design Artifacts

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

### 11. Log Approval

Log approval prompt with timestamp in `audit.md`.

### 12. Present Completion Message

```markdown
# 🏗️ Application Design Complete

[AI Summary - bullet points of design artifacts]

> **📋 <u>**REVIEW REQUIRED:**</u>**
> Please examine application design at: `aidlc-docs/inception/application-design/`

> **🚀 <u>**WHAT'S NEXT?**</u>**
>
> **You may:**
>
> 🔧 **Request Changes** - Ask for modifications
> [IF Units Generation skipped:]
> 📝 **Add Units Generation** - Include Units Generation stage
> ✅ **Approve & Continue** - Approve and proceed to [Units Generation/CONSTRUCTION]
```

### 13. Wait for Explicit Approval

Do not proceed until user explicitly approves.

### 14. Record Approval Response

Log response with timestamp in `audit.md`.

### 15. Update Progress

Mark Application Design complete in `aidlc-state.md`.
