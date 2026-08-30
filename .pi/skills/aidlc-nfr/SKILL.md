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

### Step 2: Q&A

Load `aidlc-stage-common` for Question-Only with:
- Questions path: `construction/plans/{unit-name}-nfr-requirements-questions.md`
- Answers path: `construction/{unit-name}/nfr-requirements/answers.md`
- Categories:
  - **Scalability Requirements** — Expected load, growth patterns, scaling triggers
  - **Performance Requirements** — Response times, throughput, latency, benchmarks
  - **Availability Requirements** — Uptime, disaster recovery, failover
  - **Security Requirements** — Data protection, compliance, auth/authz, threat models
  - **Tech Stack Selection** — Technology preferences, constraints, existing systems
  - **Reliability Requirements** — Error handling, fault tolerance, monitoring
  - **Maintainability Requirements** — Code quality, documentation, testing
  - **Usability Requirements** — User experience, accessibility, interfaces

### Step 3: Generate NFR Requirements Artifacts

Create:
- `aidlc-docs/construction/{unit-name}/nfr-requirements/nfr-requirements.md`
- `aidlc-docs/construction/{unit-name}/nfr-requirements/tech-stack-decisions.md`

### Step 4: Present Completion

Load `aidlc-stage-common` completion message for: "📊 NFR Requirements", `aidlc-docs/construction/{unit-name}/nfr-requirements/`, "NFR Design"

### Step 5: Approval Gate

Load `aidlc-stage-common` approval gate. On approval: log in `audit.md`, mark NFR Requirements `[x]` in `backlog/unit/{unit-name}.md`.

---

## Part B: NFR Design

### Prerequisites
- NFR Requirements complete for the unit
- NFR requirements artifacts available
- Execution plan indicates NFR Design should execute

### Step 1: Analyze NFR Requirements

Read NFR requirements from `aidlc-docs/construction/{unit-name}/nfr-requirements/`

### Step 2: Q&A

Load `aidlc-stage-common` for Question-Only with:
- Questions path: `construction/plans/{unit-name}-nfr-design-questions.md`
- Answers path: `construction/{unit-name}/nfr-design/answers.md`
- Categories:
  - **Resilience Patterns** — Fault tolerance, retry strategies, failure recovery
  - **Scalability Patterns** — Scaling mechanisms, load boundaries, growth projections
  - **Performance Patterns** — Optimization strategy, latency targets, throughput
  - **Security Patterns** — Security implementation, threat model, compliance
  - **Logical Components** — Infrastructure components (queues, caches, circuit breakers)

### Step 3: Generate NFR Design Artifacts

Create:
- `aidlc-docs/construction/{unit-name}/nfr-design/nfr-design-patterns.md`
- `aidlc-docs/construction/{unit-name}/nfr-design/logical-components.md`

### Step 4: Present Completion

Load `aidlc-stage-common` completion message for: "🎨 NFR Design", `aidlc-docs/construction/{unit-name}/nfr-design/`, "[next-stage-name]"

### Step 5: Approval Gate

Load `aidlc-stage-common` approval gate. On approval: log in `audit.md`, mark NFR Design `[x]` in `backlog/unit/{unit-name}.md`.
