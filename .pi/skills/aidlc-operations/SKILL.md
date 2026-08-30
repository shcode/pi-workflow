---
name: aidlc-operations
description: >
  AIDLC Operations stage. Load after Build and Test completes for all units. Establishes
  deployment pipeline, monitoring/alerting, incident response runbooks, and a production
  readiness gate. Adaptive depth like Requirements Analysis. Always executes — depth and
  which artifacts get generated scale with what already exists (brownfield-aware) and
  what the project actually needs.
---

# Operations

**Purpose**: Take a built-and-tested system to production readiness — deployment pipeline, observability, incident response, and a final go-live gate.

**Condition**: ALWAYS EXECUTE (adaptive depth), project-wide, after Build and Test completes.

**Scope boundary**: This stage generates pipeline definitions, config-as-code, and runbooks. It does **not** execute real deployments to live infrastructure or trigger production releases — those remain human-initiated actions using the generated pipeline.

---

## Prerequisites
- Build and Test complete (`aidlc-state.md` row 8 `[x]`)
- Infrastructure Design artifacts available for units that have them (`construction/{unit-name}/infrastructure-design/`)

---

## PART 1: REQUIREMENTS

### Step 1: Load Context

- Read `aidlc-docs/construction/build-and-test/build-and-test-summary.md`
- For each unit: read `construction/{unit-name}/infrastructure-design/deployment-architecture.md` (if exists)
- Read `GOAL.md` for project constraints
- Check `## Extensions` in `aidlc-state.md` — if `security-baseline` enabled, its rules apply to this stage too (SECURITY-02, SECURITY-10, SECURITY-14 are directly relevant)

### Step 2: Assess What Already Exists (brownfield-aware)

Scan workspace root for existing operational artifacts — do not propose regenerating what's already there:

| Category | Look for |
|---|---|
| CI/CD | `.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`, `buildspec.yml`, `.circleci/` |
| IaC / deploy | CDK/Terraform/CloudFormation apply scripts, `Dockerfile`, `docker-compose.yml`, Helm charts |
| Monitoring | Prometheus config, Grafana dashboards-as-code, Datadog/New Relic config, CloudWatch alarm definitions |
| Logging | Log shipper config (Fluentd, Vector), centralized log service setup |
| Runbooks | Existing `RUNBOOK.md`, `docs/incident-response.md`, on-call docs |

Record findings:
```markdown
## Existing Operational Artifacts
- **CI/CD**: [Found: path / Not found]
- **Deployment**: [Found: path / Not found]
- **Monitoring**: [Found: path / Not found]
- **Runbooks**: [Found: path / Not found]
```

**Greenfield or nothing found**: generate everything relevant to the project (Step 3+).
**Brownfield with existing artifacts**: only generate what's missing or ask whether to extend existing setup.

### Step 3: Q&A

Load `aidlc-stage-common` for Question-Only with:
- Plan path: `operations/operations-plan.md`
- Questions path: `operations/operations-questions.md`
- Answers path: `operations/operations-answers.md`
- Categories:
  - **Environments** — dev/staging/prod, promotion flow
  - **Release Strategy** — rolling, blue-green, canary; deployment frequency
  - **CI/CD Platform** — GitHub Actions, GitLab CI, Jenkins, CircleCI
  - **Monitoring & Observability** — stack preference, key metrics/SLOs
  - **Alerting** — thresholds, notification channels, on-call rotation
  - **Rollback Strategy** — automated vs manual, RTO/RPO targets
  - **Incident Response** — severity levels, escalation path, communication channels
  - **Compliance & Audit** — log retention, audit trail (cross-check security-baseline if enabled)

### Step 4: Log and Request Approval

Log approval prompt in `audit.md`. Present the operations plan, wait for explicit approval before generation.

---

## PART 2: GENERATION

### Step 8: Load Plan

Read `aidlc-docs/operations/operations-plan.md`, identify next uncompleted step.

### Step 9: Generate Deployment Pipeline

**Documentation**: `aidlc-docs/operations/deployment-pipeline.md`
- Environments and promotion flow
- Release strategy and rationale
- Pipeline stages (build → test → deploy) mapped to actual build-and-test commands from Step 1

**Config-as-code** (workspace root, never `aidlc-docs/`): generate the actual CI/CD pipeline file for the chosen platform (e.g. `.github/workflows/deploy.yml`). Pin tool/action versions — never `latest` tags (SECURITY-10 if security-baseline enabled). Reference environment secrets by name only — never hardcode credentials.

**Brownfield**: modify existing pipeline file in-place per Code Location Rules (`aidlc-construction-rules`) — never create `deploy_new.yml`.

### Step 10: Generate Monitoring and Alerting

**Documentation**: `aidlc-docs/operations/monitoring-and-alerting.md`
- Key metrics and SLOs per unit (derived from NFR requirements if available)
- Dashboard structure
- Alert rules and thresholds
- Notification channels and escalation

**Config-as-code** (workspace root, if platform supports it): dashboard/alert definitions as code where the chosen stack supports it (e.g. Grafana JSON, CloudWatch alarm CDK/Terraform snippet). Skip if the platform is console-configured only — document manual setup steps instead.

### Step 11: Generate Runbook

Create `aidlc-docs/operations/runbook.md`:
- Incident severity levels and response SLAs
- Step-by-step rollback procedure (reference the release strategy from Step 9)
- Escalation contacts (placeholders — user fills in real names/channels)
- Common failure scenarios and first response steps (derived from build-and-test known issues, if any)

### Step 12: Production Readiness Checklist

Create `aidlc-docs/operations/production-readiness-checklist.md`:

```markdown
# Production Readiness Checklist

| # | Item | Status | Notes |
|---|---|---|---|
| 1 | Build and Test passing | [Pass/Fail] | |
| 2 | Deployment pipeline defined and dry-run tested | [ ] | |
| 3 | Monitoring dashboards configured | [ ] | |
| 4 | Alerting configured with escalation path | [ ] | |
| 5 | Rollback procedure documented and tested | [ ] | |
| 6 | Security baseline compliant (if enabled) | [Compliant/N/A] | |
| 7 | Secrets managed via secrets manager (no hardcoded credentials) | [ ] | |
| 8 | Log retention configured per compliance requirement | [ ] | |
| 9 | On-call/escalation contacts assigned | [ ] | |
| 10 | Runbook reviewed by team | [ ] | |
```

Mark items `N/A` where not applicable (e.g. no compliance requirement). Any unresolved item is a **blocking finding** — do not present final approval until resolved or explicitly deferred by user.

### Step 13: Extension Compliance Check

If `security-baseline` enabled: verify SECURITY-02 (access logging), SECURITY-10 (CI/CD integrity — pinned versions), SECURITY-14 (alerting/monitoring, log retention ≥90 days) against generated artifacts. Include compliance summary in completion message (format from `aidlc-extensions`).

### Step 14: Update Progress

Mark completed step `[x]` in `operations-plan.md`. Append to `aidlc-progress.md`.

### Step 15: Continue or Complete

If more steps remain, return to Step 8. If all artifacts generated, proceed to Step 16.

### Step 16: Present Completion Message

```markdown
# 🚀 Operations Complete

[AI Summary — bullet points of pipeline, monitoring, runbook, and readiness status]

## Production Readiness Checklist
[Table from Step 12, with current status]

[IF security-baseline enabled]
## Extension Compliance
[Table from Step 13]

> **📋 <u>**REVIEW REQUIRED:**</u>**
> Please examine operations artifacts at: `aidlc-docs/operations/`
> Pipeline config at: `[actual-workspace-path]`

> **🚀 <u>**WHAT'S NEXT?**</u>**
>
> **You may:**
>
> 🔧 **Request Changes** - Ask for modifications to any operations artifact
> ✅ **Approve & Continue** - Mark production-ready, complete the AIDLC lifecycle
```

### Step 17: Approval Gate

Load `aidlc-stage-common` approval gate. This is the final gate of the AIDLC lifecycle — no silent completion. On approval:
1. Log in `audit.md`
2. In `aidlc-state.md`: mark row 9 `[x]`, update `## Current Work` (Phase = OPERATIONS, Stage = Complete), set `## Next` to "AIDLC lifecycle complete. Re-run for new features via backlog."
3. Append final summary entry to `aidlc-progress.md`

---

## Critical Rules

- **No live deployment execution**: generate pipeline/config artifacts only; actual deploys are human-initiated
- **Destructive Command Guardrails** (same as `aidlc-build-test`): never run production-targeting commands, destructive infra commands, or data-destroying operations without explicit user confirmation
- **Brownfield-aware**: never regenerate existing CI/CD, monitoring, or runbook artifacts wholesale — extend or modify in-place per Code Location Rules
- **No hardcoded secrets**: reference secrets managers / environment variable names only, never literal credential values
- **Pin versions**: CI/CD config must pin tool and action versions — no `latest` tags
- **Design-first**: pipeline stages must match the deployment architecture from Infrastructure Design; if no Infrastructure Design exists for a unit, ask before inventing deployment topology
