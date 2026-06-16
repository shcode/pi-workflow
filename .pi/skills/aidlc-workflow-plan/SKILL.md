---
name: aidlc-workflow-plan
description: >
  AIDLC Workflow Planning stage. Load during inception after requirements analysis
  to determine which phases/stages to execute and at what depth. Creates execution
  plan with Mermaid visualization. Always executes. User must approve plan before proceeding.
---

# Workflow Planning

**Purpose**: Determine which phases to execute and create a comprehensive execution plan.

**Condition**: ALWAYS EXECUTE

---

## Step 1: Load Prior Context

- Reverse engineering artifacts (if brownfield): `architecture.md`, `component-inventory.md`, `technology-stack.md`, `dependencies.md`
- Requirements: `requirements.md`, `requirement-verification-answers.md`
- User stories (if executed): `stories.md`, `personas.md`

---

## Step 2: Scope and Impact Analysis

### Transformation Scope (Brownfield)
- Single component change vs architectural transformation
- Infrastructure vs application changes
- Related components, CDK stacks, API configs, networking, monitoring affected

### Change Impact
Evaluate: user-facing, structural, data model, API, NFR impact.

### Risk Assessment
Rate: Low / Medium / High / Critical

### Module Coordination (Brownfield with multiple packages)
- Build system + runtime dependencies
- Update sequence (which modules first), parallelization opportunities
- API contracts, shared interfaces, rollback strategy

---

## Step 3: Phase Determination

| Stage | Execute if | Skip if |
|---|---|---|
| User Stories | User-facing features, multiple personas | Internal refactoring, bug fix, infra-only |
| Application Design | New components/services, new business rules | Changes within existing boundaries, pure impl |
| Units Generation | New data models, API changes, complex logic, multi-package | Simple logic changes, UI-only, config updates |
| NFR | Performance, security, scalability requirements | Existing NFR sufficient, simple changes |
| UI Design | New UI components not in Design System | No UI/frontend, all components exist |
| Infrastructure Design | New cloud resources, deployment/networking changes | Infrastructure unchanged, no deployment changes |

---

## Step 4: Generate Workflow Visualization

Create Mermaid flowchart showing all stages with EXECUTE/SKIP decisions.

**Styling**:
- Always execute: `fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff`
- Conditional EXECUTE: `fill:#FFA726,stroke:#E65100,stroke-width:3px,stroke-dasharray:5 5,color:#000`
- Conditional SKIP: `fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray:5 5,color:#000`
- Start/End: `fill:#CE93D8,stroke:#6A1B9A,stroke-width:3px,color:#000`

---

## Step 5: Create Execution Plan Document

Save `aidlc-docs/inception/plans/execution-plan.md`:

```markdown
# Execution Plan

## Analysis Summary
- **Scope**: [transformation scope]
- **Risk**: [Low/Medium/High/Critical]
- **Impact**: [key impact areas]
- **Components affected**: [list]

## Workflow Visualization
[Mermaid flowchart]

## Stages to Execute

### 🔵 INCEPTION
- [x] Workspace Detection (COMPLETED)
- [x] Reverse Engineering (COMPLETED/SKIPPED)
- [x] Requirements Analysis (COMPLETED)
- [x] User Stories (COMPLETED/SKIPPED)
- [x] Workflow Planning (IN PROGRESS)
- [ ] Application Design — EXECUTE/SKIP — Rationale: [why]
- [ ] Units Generation — EXECUTE/SKIP — Rationale: [why]

### 🟢 CONSTRUCTION
- [ ] Functional Design — EXECUTE/SKIP
- [ ] NFR Requirements & Design — EXECUTE/SKIP
- [ ] UI Design — EXECUTE/SKIP
- [ ] Infrastructure Design — EXECUTE/SKIP
- [ ] Code Generation — EXECUTE (ALWAYS)
- [ ] Build and Test — EXECUTE (ALWAYS)

## Package Update Sequence (Brownfield multi-package only)
[Package → reason]

## Success Criteria
- **Goal**: [main objective]
- **Deliverables**: [list]
- **Quality Gates**: [list]
```

---

## Step 6: Update State Tracking

Update `aidlc-docs/aidlc-state.md` with execution plan summary.

---

## Step 7: Present Plan to User

```markdown
# 📋 Workflow Planning Complete

**Recommended plan**: [X] stages to execute, [Y] to skip.

**Risk**: [level] | **Impact**: [summary] | **Components**: [list]

[Mermaid visualization]

**Stages:**
- ✅ EXECUTE: [list with one-line rationale each]
- ⏭️ SKIP: [list with one-line rationale each]

[IF brownfield multi-package]
**Package update sequence**: [list]

> **📋 REVIEW REQUIRED:** `aidlc-docs/inception/plans/execution-plan.md`

> **🚀 WHAT'S NEXT?**
> 🔧 **Request Changes** — modify stages or rationale
> 📝 **Add Skipped Stages** — include any skipped stage
> ✅ **Approve & Continue** — proceed to [Next Stage]
```

---

## Step 8: Handle Approval

- **Approved** → create GOAL.md (Step 8.1), proceed to next stage
- **Changes requested** → update plan, re-present
- **Force include/exclude** → update plan accordingly

### Step 8.1: Create GOAL.md

After approval, create `GOAL.md` in **workspace root**:

```markdown
# Project Goal

## Summary
[1-3 sentences: what we're building/changing and why]

## Key Requirements
- [One line per requirement]

## Constraints
- [Tech stack, architecture, business constraints]

## Success Criteria
- [How we know it's done]
```

**Rules**: Written ONCE after approval. Updated only if user explicitly changes direction. Always included in `aidlc-state.md` `## Resume` Load table. Agents read on every session resume.

---

## Step 9: Log Interaction

```markdown
## Workflow Planning - Approval
**Timestamp**: [ISO timestamp]
**Decision**: Plan approved — [X] stages to execute
**Detail**: progress.md:[START]-[END]
---
```
