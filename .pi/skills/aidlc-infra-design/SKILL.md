---
name: aidlc-infra-design
description: >
  AIDLC Infrastructure Design stage. Load during construction per-unit when infrastructure
  services need mapping, deployment architecture required, or cloud resources need specification.
  Maps logical components to actual infrastructure choices. Skip if no infrastructure changes
  or infrastructure already defined.
---

# Infrastructure Design

**Purpose**: Map logical software components to actual infrastructure choices for deployment environments

**Condition**: CONDITIONAL (per-unit)

---

## Prerequisites
- Functional Design complete for the unit
- NFR Design recommended (provides logical components to map)
- Execution plan indicates Infrastructure Design should execute

---

## Steps to Execute

### Step 1: Analyze Design Artifacts

- Read functional design from `aidlc-docs/construction/{unit-name}/functional-design/`
- Read NFR design from `aidlc-docs/construction/{unit-name}/nfr-design/` (if exists)
- Identify logical components needing infrastructure

### Step 2: Create Infrastructure Design Plan

- Generate plan with checkboxes []. Focus on mapping to actual services (AWS, Azure, GCP, on-premise).

### Step 3: Generate Context-Appropriate Questions

**DIRECTIVE**: Analyze functional and NFR design to identify ALL areas where clarification improves infrastructure decisions.

Use `[Answer]:` tag format (see `aidlc-common`). Evaluate ALL categories:
- **Deployment Environment** - Cloud provider, environment setup, deployment targets
- **Compute Infrastructure** - Compute service choices, sizing, scaling
- **Storage Infrastructure** - Database selection, storage patterns, data lifecycle
- **Messaging Infrastructure** - Messaging/queuing, event-driven patterns, async processing
- **Networking Infrastructure** - Load balancing, API gateway, network topology
- **Monitoring Infrastructure** - Observability, alerting strategy, logging
- **Shared Infrastructure** - Sharing strategy, multi-tenancy, resource isolation

### Step 4: Store Plan

Save as `aidlc-docs/construction/plans/{unit-name}-infrastructure-design-plan.md`

### Step 5: Collect and Analyze Answers

Save questions with `[Answer]:` tags to `aidlc-docs/construction/plans/{unit-name}-infra-design-questions.md`. Wait for user to fill all `[Answer]:` tags. Review for vagueness. Add follow-up `[Answer]:` questions if needed.

### Step 6: Generate Infrastructure Design Artifacts

Create:
- `aidlc-docs/construction/{unit-name}/infrastructure-design/infrastructure-design.md`
- `aidlc-docs/construction/{unit-name}/infrastructure-design/deployment-architecture.md`
- If shared infrastructure: `aidlc-docs/construction/shared-infrastructure.md`

### Step 7: Present Completion Message

```markdown
# 🏢 Infrastructure Design Complete - [unit-name]

[AI Summary - bullet points of infrastructure services and deployment architecture]

> **📋 <u>**REVIEW REQUIRED:**</u>**
> Please examine infrastructure design at: `aidlc-docs/construction/[unit-name]/infrastructure-design/`

> **🚀 <u>**WHAT'S NEXT?**</u>**
>
> **You may:**
>
> 🔧 **Request Changes** - Ask for modifications
> ✅ **Continue to Next Stage** - Approve and proceed to **Code Generation**
```

### Step 8: Wait for Explicit Approval

Do not proceed until user explicitly approves.

### Step 9: Record Approval and Update Progress

Log in `audit.md`. Mark Infrastructure Design complete in `aidlc-state.md`.
