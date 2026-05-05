---
name: aidlc-workflow-plan
description: >
  AIDLC Workflow Planning stage. Load during inception after requirements analysis
  to determine which phases/stages to execute and at what depth. Creates execution
  plan with Mermaid visualization. Always executes. User must approve plan before proceeding.
---

# Workflow Planning

**Purpose**: Determine which phases to execute and create comprehensive execution plan

**Condition**: ALWAYS EXECUTE

---

## Step 1: Load All Prior Context

### 1.1 Load Reverse Engineering Artifacts (if brownfield)
- architecture.md, component-inventory.md, technology-stack.md, dependencies.md

### 1.2 Load Requirements Analysis
- requirements.md, requirement-verification-answers.md (compact answers summary)

### 1.3 Load User Stories (if executed)
- stories.md, personas.md

## Step 2: Detailed Scope and Impact Analysis

### 2.1 Transformation Scope Detection (Brownfield Only)

Analyze:
- Single component change vs architectural transformation
- Infrastructure changes vs application changes
- Deployment model changes

Identify related components:
- Infrastructure code needing updates
- CDK stacks requiring changes
- API Gateway configurations
- Load balancer requirements
- Networking changes
- Monitoring/logging adaptations

### 2.2 Change Impact Assessment

Evaluate impact areas:
1. User-facing changes
2. Structural changes
3. Data model changes
4. API changes
5. NFR impact

### 2.3 Component Relationship Mapping (Brownfield Only)

Create dependency graph showing:
- Primary Component
- Infrastructure Components
- Shared Components
- Dependent Components
- Supporting Components

### 2.4 Risk Assessment

Evaluate risk level: Low, Medium, High, Critical

## Step 3: Phase Determination

### 3.1 User Stories
Already executed OR skip if:
- Internal refactoring
- Bug fix with clear reproduction
- Technical debt reduction
- Infrastructure changes

### 3.2 Application Design
**Execute IF**:
- New components or services needed
- Component methods and business rules need definition
- Service layer design required

**Skip IF**:
- Changes within existing component boundaries
- No new components or methods
- Pure implementation changes

### 3.3 Units Generation
**Execute IF**:
- New data models or schemas
- API changes or new endpoints
- Complex algorithms or business logic
- Multiple packages require changes

**Skip IF**:
- Simple logic changes
- UI-only changes
- Configuration updates

### 3.4 NFR Implementation
**Execute IF**:
- Performance requirements
- Security considerations
- Scalability concerns

**Skip IF**:
- Existing NFR setup sufficient
- Simple changes with no NFR impact

### 3.5 UI Design
**Execute IF**:
- New UI components needed (not in existing Design System)
- Frontend unit with user-facing interfaces
- Design System needs new entries

**Skip IF**:
- No UI/frontend in this project
- All components already exist in Design System or codebase
- Backend-only units

### 3.6 Infrastructure Design
**Execute IF**:
- New cloud resources or services needed
- Deployment architecture changes
- Networking, CDN, or storage changes

**Skip IF**:
- Infrastructure already defined and unchanged
- Local-only or serverless-by-default projects
- No deployment changes needed

## Step 4: Note Adaptive Detail

For each stage that will execute: all defined artifacts created, detail level adapts to complexity.

## Step 5: Multi-Module Coordination Analysis (Brownfield Only)

### 5.1 Analyze Module Dependencies
- Build system dependencies
- Build-time vs runtime dependencies
- API contracts and shared interfaces

### 5.2 Determine Update Strategy
- Update sequence (which modules first)
- Parallelization opportunities
- Coordination requirements
- Testing strategy
- Rollback strategy

### 5.3 Document Coordination Plan
```markdown
## Module Update Strategy
- **Update Approach**: [Sequential/Parallel/Hybrid]
- **Critical Path**: [Modules that block others]
- **Coordination Points**: [Shared APIs, infrastructure, data contracts]
- **Testing Checkpoints**: [When to validate integration]
```

## Step 6: Generate Workflow Visualization

Create Mermaid flowchart showing:
- All phases in sequence
- EXECUTE or SKIP decision for each conditional phase
- Proper styling for each phase state

**Styling rules**:
- Completed/Always execute: `fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff`
- Conditional EXECUTE: `fill:#FFA726,stroke:#E65100,stroke-width:3px,stroke-dasharray: 5 5,color:#000`
- Conditional SKIP: `fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray: 5 5,color:#000`
- Start/End: `fill:#CE93D8,stroke:#6A1B9A,stroke-width:3px,color:#000`

## Step 7: Create Execution Plan Document

Create `aidlc-docs/inception/plans/execution-plan.md`:

```markdown
# Execution Plan

## Detailed Analysis Summary
[Transformation scope, change impact, component relationships, risk assessment]

## Workflow Visualization
[Mermaid flowchart]

## Phases to Execute

### 🔵 INCEPTION PHASE
- [x] Workspace Detection (COMPLETED)
- [x] Reverse Engineering (COMPLETED/SKIPPED)
- [x] Requirements Analysis (COMPLETED)
- [x] User Stories (COMPLETED/SKIPPED)
- [x] Execution Plan (IN PROGRESS)
- [ ] Application Design - [EXECUTE/SKIP]
  - **Rationale**: [Why]
- [ ] Units Generation - [EXECUTE/SKIP]
  - **Rationale**: [Why]

### 🟢 CONSTRUCTION PHASE
- [ ] Functional Design - [EXECUTE/SKIP]
- [ ] NFR Requirements & Design - [EXECUTE/SKIP]
- [ ] UI Design - [EXECUTE/SKIP]
- [ ] Infrastructure Design - [EXECUTE/SKIP]
- [ ] Code Generation - EXECUTE (ALWAYS)
- [ ] Build and Test - EXECUTE (ALWAYS)

### 🟡 OPERATIONS PHASE
- [ ] Operations - PLACEHOLDER

## Package Change Sequence (Brownfield Only)
[If applicable, list package update sequence]

## Estimated Timeline
- **Total Phases**: [Number]
- **Estimated Duration**: [Time estimate]

## Success Criteria
- **Primary Goal**: [Main objective]
- **Key Deliverables**: [List]
- **Quality Gates**: [List]
```

## Step 8: Initialize State Tracking

Update `aidlc-docs/aidlc-state.md` with execution plan summary.

## Step 9: Present Plan to User

```markdown
# 📋 Workflow Planning Complete

I've created a comprehensive execution plan based on:
- Your request: [Summary]
- Existing system: [Summary if brownfield]
- Requirements: [Summary if executed]
- User stories: [Summary if executed]

**Detailed Analysis**:
- Risk level: [Level]
- Impact: [Summary]
- Components affected: [List]

**Recommended Execution Plan**:

I recommend executing [X] stages:
🔵 INCEPTION PHASE:
1. [Stage] - Rationale: [Why]
...
🟢 CONSTRUCTION PHASE:
1. [Stage] - Rationale: [Why]
...

I recommend skipping [Y] stages:
[Same format with rationale for skipping]

[IF brownfield with multiple packages]
**Recommended Package Update Sequence**:
1. [Package] - [Reason]
...

**Estimated Timeline**: [Duration]

> **📋 <u>**REVIEW REQUIRED:**</u>**
> Please examine execution plan at: `aidlc-docs/inception/plans/execution-plan.md`

> **🚀 <u>**WHAT'S NEXT?**</u>**
>
> **You may:**
>
> 🔧 **Request Changes** - Ask for modifications
> [IF stages skipped:]
> 📝 **Add Skipped Stages** - Include stages marked as SKIP
> ✅ **Approve & Continue** - Approve and proceed to [Next Stage]
```

## Step 10: Handle User Response

- **If approved**: Proceed to next stage in execution plan
- **If changes requested**: Update plan and re-confirm
- **If user wants to force include/exclude stages**: Update plan accordingly

## Step 11: Log Interaction

Log in `audit.md`:
```markdown
## Workflow Planning - Approval
**Timestamp**: [ISO timestamp]
**AI Prompt**: "Ready to proceed with this plan?"
**User Response**: "[User's COMPLETE RAW response]"
**Status**: [Approved/Changes Requested]
**Context**: Workflow plan with [X] stages to execute

---
```
