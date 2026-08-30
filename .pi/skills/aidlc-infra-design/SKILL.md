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

### Step 3: Q&A

Load `aidlc-stage-common` for Standard Q&A with:
- Plan path: `construction/plans/{unit-name}-infrastructure-design-plan.md`
- Questions path: `construction/plans/{unit-name}-infra-design-questions.md`
- Answers path: `construction/{unit-name}/infrastructure-design/answers.md`
- Categories:
  - **Deployment Environment** — Cloud provider, environment setup, deployment targets
  - **Compute Infrastructure** — Compute service choices, sizing, scaling
  - **Storage Infrastructure** — Database selection, storage patterns, data lifecycle
  - **Messaging Infrastructure** — Messaging/queuing, event-driven patterns, async processing
  - **Networking Infrastructure** — Load balancing, API gateway, network topology
  - **Monitoring Infrastructure** — Observability, alerting strategy, logging
  - **Shared Infrastructure** — Sharing strategy, multi-tenancy, resource isolation

### Step 4: Generate Infrastructure Design Artifacts

Create:
- `aidlc-docs/construction/{unit-name}/infrastructure-design/infrastructure-design.md`
- `aidlc-docs/construction/{unit-name}/infrastructure-design/deployment-architecture.md`
- If shared infrastructure: `aidlc-docs/construction/shared-infrastructure.md`

### Step 5: Present Completion

Load `aidlc-stage-common` completion message for: "🏢 Infrastructure Design", `aidlc-docs/construction/{unit-name}/infrastructure-design/`, "Code Generation"

### Step 6: Approval Gate

Load `aidlc-stage-common` approval gate. On approval: log in `audit.md`, mark Infrastructure Design `[x]` in `backlog/{unit-name}.md`.
