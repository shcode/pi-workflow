---
name: aidlc-nfr
description: >
  AIDLC NFR Requirements and Design stage. Load during construction per-unit when
  performance, security, scalability, or tech stack selection is needed. Two sub-stages:
  NFR Requirements (determine needs, select tech stack) and NFR Design (incorporate patterns).
  Skip if no NFR requirements or tech stack already determined.
---

# NFR Requirements and Design

**Purpose**: Determine non-functional requirements and incorporate NFR patterns into design

**Condition**: CONDITIONAL (per-unit)

---

## Part A: NFR Requirements

### Prerequisites
- Functional Design complete for the unit
- Unit functional design artifacts available
- Execution plan indicates NFR Requirements should execute

### Step 1: Analyze Functional Design

Read functional design artifacts from `aidlc-docs/construction/{unit-name}/functional-design/`

### Step 2: Create NFR Requirements Plan

Generate plan with checkboxes [] for NFR assessment. Focus on scalability, performance, availability, security.

### Step 3: Generate Context-Appropriate Questions

**DIRECTIVE**: Analyze functional design to identify ALL areas where NFR clarification improves system quality.

Use `[Answer]:` tag format (see `aidlc-common`). Evaluate ALL categories:
- **Scalability Requirements** - Expected load, growth patterns, scaling triggers
- **Performance Requirements** - Response times, throughput, latency, benchmarks
- **Availability Requirements** - Uptime, disaster recovery, failover
- **Security Requirements** - Data protection, compliance, auth/authz, threat models
- **Tech Stack Selection** - Technology preferences, constraints, existing systems
- **Reliability Requirements** - Error handling, fault tolerance, monitoring
- **Maintainability Requirements** - Code quality, documentation, testing
- **Usability Requirements** - User experience, accessibility, interfaces

Save questions with `[Answer]:` tags to `aidlc-docs/construction/plans/{unit-name}-nfr-requirements-questions.md`.

### Step 4: Store Plan

Save as `aidlc-docs/construction/plans/{unit-name}-nfr-requirements-plan.md`

### Step 5: Collect and Analyze Answers

Wait for user to fill all `[Answer]:` tags. **MANDATORY**: Review ALL for vagueness. Add follow-up `[Answer]:` questions for ANY unclear responses.

### Step 6: Generate NFR Requirements Artifacts

Create:
- `aidlc-docs/construction/{unit-name}/nfr-requirements/nfr-requirements.md`
- `aidlc-docs/construction/{unit-name}/nfr-requirements/tech-stack-decisions.md`

### Step 7: Present Completion Message

```markdown
# 📊 NFR Requirements Complete - [unit-name]

[AI Summary - bullet points of NFR requirements and tech stack decisions]

> **📋 <u>**REVIEW REQUIRED:**</u>**
> Please examine NFR requirements at: `aidlc-docs/construction/[unit-name]/nfr-requirements/`

> **🚀 <u>**WHAT'S NEXT?**</u>**
>
> **You may:**
>
> 🔧 **Request Changes** - Ask for modifications
> ✅ **Continue to Next Stage** - Approve and proceed to **NFR Design**
```

### Step 8: Wait for Explicit Approval

Do not proceed until user explicitly approves.

### Step 9: Record Approval and Update Progress

Log in `audit.md`. Mark NFR Requirements complete in `aidlc-state.md`.

---

## Part B: NFR Design

### Prerequisites
- NFR Requirements complete for the unit
- NFR requirements artifacts available
- Execution plan indicates NFR Design should execute

### Step 1: Analyze NFR Requirements

Read NFR requirements from `aidlc-docs/construction/{unit-name}/nfr-requirements/`

### Step 2: Create NFR Design Plan

Generate plan with checkboxes []. Focus on design patterns and logical components.

### Step 3: Generate Context-Appropriate Questions

**DIRECTIVE**: Analyze NFR requirements to identify ALL areas where clarification improves NFR design quality.

Use `[Answer]:` tag format (see `aidlc-common`). Evaluate ALL categories:
- **Resilience Patterns** - Fault tolerance, retry strategies, failure recovery
- **Scalability Patterns** - Scaling mechanisms, load boundaries, growth projections
- **Performance Patterns** - Optimization strategy, latency targets, throughput
- **Security Patterns** - Security implementation, threat model, compliance
- **Logical Components** - Infrastructure components (queues, caches, circuit breakers)

Save questions with `[Answer]:` tags to `aidlc-docs/construction/plans/{unit-name}-nfr-design-questions.md`.

### Step 4: Store Plan

Save as `aidlc-docs/construction/plans/{unit-name}-nfr-design-plan.md`

### Step 5: Collect and Analyze Answers

Wait for user to fill all `[Answer]:` tags. Review for vagueness. Add follow-up `[Answer]:` questions if needed.

### Step 6: Generate NFR Design Artifacts

Create:
- `aidlc-docs/construction/{unit-name}/nfr-design/nfr-design-patterns.md`
- `aidlc-docs/construction/{unit-name}/nfr-design/logical-components.md`

### Step 7: Present Completion Message

```markdown
# 🎨 NFR Design Complete - [unit-name]

[AI Summary - bullet points of design patterns and logical components]

> **📋 <u>**REVIEW REQUIRED:**</u>**
> Please examine NFR design at: `aidlc-docs/construction/[unit-name]/nfr-design/`

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

Log in `audit.md`. Mark NFR Design complete in `aidlc-state.md`.
