# Resiliency Baseline Rules

## Overview

These rules are cross-cutting constraints derived from established cloud reliability frameworks (AWS Well-Architected Reliability Pillar). They apply across all AIDLC phases to workloads on any cloud provider. Rules are organized across six pillars: Business Goals, Change Management & Automation, Integrated Observability, High Availability, Disaster Recovery, and Continuous Improvement.

**Enforcement**: At each applicable stage, verify compliance before presenting the stage completion message. Include a "Resiliency Compliance" section listing each rule as Compliant / Non-Compliant / N/A with brief rationale for N/A determinations.

### Blocking Finding Behavior

A **blocking resiliency finding** means:
1. List the finding under "Resiliency Findings" in the stage completion message with the RESILIENCY rule ID
2. Do NOT present the "Continue to Next Stage" option until all blocking findings are resolved
3. Log the finding in `aidlc-docs/audit.md` with rule ID, description, and stage context

Rules marked N/A are not blocking. If a rule is genuinely not applicable (e.g., RESILIENCY-07 when no stateful data exists), mark N/A — this is not a finding.

### User Decision Points

Architectural and process decisions belong to the user. The model MUST present the clarifying questions below and use the user's answers — never silently choose on the user's behalf.

| Decision | Rule |
|---|---|
| RTO/RPO targets and DR strategy | RESILIENCY-02 |
| Change management process | RESILIENCY-03 |
| CI/CD tooling and rollback mechanism | RESILIENCY-04 |
| Regional topology | RESILIENCY-08 |
| Resiliency testing approach | RESILIENCY-14 |
| Incident response process | RESILIENCY-15 |

Where an organization already has a process (change management, CI/CD, incident response, DR testing), reference and conform to it — do NOT reinvent it.

---

## PILLAR 1: BUSINESS GOALS

### RESILIENCY-01: Critical Workload Identification

**Rule**: Every project MUST identify and document its critical workloads and their business impact:
- Each deployable component classified by business criticality (Critical / High / Medium / Low)
- Business impact of unavailability documented for Critical and High components (revenue loss, user impact, regulatory consequences)
- Dependency maps showing upstream and downstream service relationships for critical components

**Verification**:
- Design docs include criticality classification per component
- Business impact documented for Critical/High components
- Dependency maps exist

---

### RESILIENCY-02: Availability and Recovery Targets

**Rule**: Every production workload MUST have defined availability and recovery targets:
- Target availability percentage (e.g. 99.9%, 99.99%)
- RTO defined for each critical workload
- RPO defined for each workload with persistent state
- Targets justified by business requirements — over-engineering and under-engineering are both findings

**Follow-up question (ask before finalizing Requirements)**:

```markdown
## Question: RTO/RPO Goals and Disaster Recovery Strategy

A) RPO/RTO: Hours — Backup & Restore. Lowest cost. Data backed up, no services deployed. Redeploy from IaC + restore on failure.
B) RPO/RTO: Tens of minutes — Pilot Light. Data live, services idle. Scaled up on failover.
C) RPO/RTO: Minutes — Warm Standby. Data live, services at reduced capacity. Scaled up during failover.
D) RPO/RTO: Near real-time — Active/Active. Highest cost. Services live in multiple regions simultaneously.
E) N/A — Single-region deployment acceptable, no cross-region DR needed.
X) Other (please describe after [Answer]: tag below)

[Answer]: 
```

**Verification**:
- Each critical workload has a documented availability SLA
- RTO and RPO defined and consistent with the user's answer above
- Targets justified by business requirements

---

## PILLAR 2: CHANGE MANAGEMENT & AUTOMATION

### RESILIENCY-03: Change Management Process

**Rule**: Every project MUST integrate with a change management process. Default assumption: the organization already has one — identify and conform to it.

**Clarifying question (ask during Requirements)**:

```markdown
## Question: Change Management Process

A) Use our existing organizational change management process — provide name/tool (e.g. ServiceNow, Jira Change, internal CAB)
B) No formal process exists — propose a lightweight change management process
C) N/A — this workload is exempt from formal change management (document rationale)
X) Other (describe after [Answer]: tag below)

[Answer]: 
```

**Verification**:
- Change management process identified by name, or explicitly proposed/exempted
- Production change artifacts (runbooks, deploy configs) reference the identified process

---

### RESILIENCY-04: Automated Deployment and Rollback

**Rule**: All production deployments ideally should be automated. The rollback approach MUST be explicitly chosen by the user — never inferred. Reuse the organization's existing CI/CD tooling where it exists.

**Clarifying questions (ask during Requirements or NFR Design)**:

```markdown
## Question: CI/CD Tooling

A) Use our existing CI/CD pipeline — provide the tool (e.g. GitHub Actions, GitLab CI, Jenkins, CodePipeline)
B) No pipeline exists — propose a CI/CD pipeline appropriate to the chosen stack
X) Other (describe after [Answer]: tag below)

[Answer]: 

## Question: Rollback Mechanism

A) Redeploy previous IaC/artifact version (version-pinned rollback)
B) Blue/green swap back to the previous environment
C) Canary auto-rollback on health/metric regression
D) Database-aware rollback required (schema/data migration reversal) — flag for explicit design
E) Use our organization's existing rollback procedure — provide reference
X) Other (describe after [Answer]: tag below)

[Answer]: 

## Question: Deployment Style

A) Direct / in-place (lowest cost, highest blast radius — non-critical workloads only)
B) Rolling (gradual instance replacement)
C) Blue/green (zero-downtime cutover)
D) Canary (progressive traffic shift with automated rollback)
X) Other (describe after [Answer]: tag below)

[Answer]: 
```

**Verification**:
- CI/CD pipeline identified or proposed per user's answer
- Rollback mechanism explicitly selected by user and documented
- Deployment style matches workload criticality from RESILIENCY-01
- Database-aware rollback designed if selected

---

## PILLAR 3: INTEGRATED OBSERVABILITY

### RESILIENCY-05: Monitoring and Alerting

**Rule**: Every deployed workload MUST have monitoring across all three observability pillars:
- **Metrics**: Latency, error rate, throughput, saturation per component
- **Logs**: Structured logging routed to a centralized log service
- **Traces**: Distributed tracing for multi-service architectures
- **Dashboards**: Dashboard definition showing key health indicators

**Verification**:
- Metrics collection configured per component
- Structured logging routes to centralized service
- Distributed tracing configured for multi-service (N/A for single-service)
- Dashboard definition exists

---

### RESILIENCY-06: Health Checks

**Rule**: Every production component MUST implement health checks:
- **Shallow**: Basic health endpoint confirming process is running
- **Deep**: Critical services verify connectivity to downstream dependencies (DB, cache, external APIs)
- **LB integration**: Health checks integrated with load balancers or service discovery
- **Synthetic monitoring**: Public-facing endpoints should have canary monitoring

**Verification**:
- Health endpoint exposed per service
- Deep health checks implemented for critical services
- Health checks wired to load balancer or routing mechanism
- Synthetic monitoring configured for public endpoints (or N/A documented)

---

### RESILIENCY-07: Resiliency Monitoring

**Rule**: Resiliency posture MUST be actively monitored:
- Alarms configured for resiliency-degradation conditions (single-zone operation, replication lag, backup failures)
- Capacity and scaling metrics monitored to detect limits before outages
- Resiliency assessment tooling configured or documented as future improvement

**Verification**:
- Resiliency-specific alarms configured (distinct from operational alarms)
- Capacity/scaling metrics monitored
- Resiliency assessment tooling noted

---

## PILLAR 4: HIGH AVAILABILITY

### RESILIENCY-08: Multi-Zone and Multi-Region Deployment

**Rule**: Production workloads MUST have an explicitly chosen fault-isolation topology.

**Multi-zone baseline (required for production)**:
- Compute distributed across at least 2 availability zones (serverless: multi-zone by default)
- Data stores use multi-zone configurations
- Traffic distributed across zones via load balancer or DNS
- Architecture operates if one zone fails — no control plane dependency for zone failover

**Multi-region (user-driven — do not infer)**:

If RESILIENCY-02 answer was D (Active/Active) or C (Warm Standby cross-region), multi-region is implied — confirm with user. Otherwise ask:

```markdown
## Question: Regional Topology

A) Single-region, multi-zone — tolerates zone failure, not full region failure. Lower cost.
B) Multi-region active-passive — survives region failure with failover. Higher cost.
C) Multi-region active-active — survives region failure with no downtime. Highest cost.
X) Other (describe after [Answer]: tag below)

[Answer]: 
```

**Verification**:
- Compute across 2+ AZs (or inherently multi-zone serverless)
- Data stores use multi-zone config
- Load balancing distributes across zones
- Regional topology explicitly selected by user, consistent with RESILIENCY-02

---

### RESILIENCY-09: Auto-Scaling and Capacity Management

**Rule**: Production workloads MUST implement auto-scaling:
- Scaling triggers appropriate to the workload (CPU, memory, request count, custom metrics)
- Min/max capacity limits defined
- Scheduled scaling or pre-warming for predictable traffic patterns
- Serverless concurrency limits configured to prevent downstream overload
- Relevant cloud provider service quotas identified and documented; quota increases planned where needed

**Verification**:
- Auto-scaling configured (or serverless used)
- Min/max scaling limits defined
- Serverless concurrency limits set
- Service quotas identified and quota increase requests planned for at-risk limits

---

### RESILIENCY-10: Dependency Isolation and Circuit Breaking

**Rule**: Applications MUST prevent cascading failures from dependency outages:
- All external calls (HTTP, DB, cache) have explicit timeouts — no unbounded waits
- Circuit breaker patterns for critical external dependencies
- Bulkheads isolate dependency pools for critical workloads
- Graceful degradation defined for non-critical dependency failures

**Verification**:
- Explicit timeouts on all external calls
- Circuit breakers implemented for critical dependencies (or N/A documented)
- Graceful degradation behavior documented
- Connection pools and resource limits configured

---

## PILLAR 5: DISASTER RECOVERY

### RESILIENCY-11: DR Strategy Selection

**Rule**: Every production workload with persistent state MUST have a documented DR strategy consistent with its RTO/RPO targets from RESILIENCY-02:
- Backup & Restore / Pilot Light / Warm Standby / Hot Standby / Active/Active
- Cost justified by business impact of downtime
- Failover and failback procedures documented

**Verification**:
- DR strategy selected and documented per workload
- Strategy consistent with RESILIENCY-02 targets
- Failover and failback procedures documented

---

### RESILIENCY-12: Data Backup and Replication

**Rule**: All persistent data MUST be backed up and/or replicated per the defined RPO:
- Automated backups via managed backup service or scheduled job
- Cross-region replication for critical data (where DR strategy requires it)
- Backup integrity validated periodically via test restores
- Retention periods defined and compliant with business/regulatory requirements
- Backups encrypted at rest

**Verification**:
- Automated backup configured for all persistent data stores
- Cross-region replication configured (or N/A documented with justification)
- Retention policies defined
- Backup encryption enabled
- Backup validation process documented

---

### RESILIENCY-13: Failover and Recovery Procedures

**Rule**: Every DR strategy MUST have documented and tested failover procedures:
- Step-by-step failover and failback runbooks
- Automated failover where possible (DNS health-check routing, managed DB global replication)
- Stakeholder communication plan for DR events
- Post-failover validation steps documented

**Verification**:
- Failover and failback runbooks exist
- Automated failover mechanisms configured where applicable
- Communication plan defined
- Post-failover validation steps documented

---

## PILLAR 6: CONTINUOUS IMPROVEMENT

### RESILIENCY-14: Chaos Engineering and DR Testing

**Rule**: Resiliency mechanisms MUST have a defined testing approach. Where the organization already has DR testing or chaos engineering practices, reference them.

**Clarifying question (ask during NFR Design)**:

```markdown
## Question: Resiliency Testing Approach

A) Use our existing DR testing / chaos engineering practice — provide the reference
B) No practice exists — propose a DR testing schedule and chaos experiment plan
C) Defer to Operations phase — capture test scenarios now, execute during Operations
X) Other (describe after [Answer]: tag below)

[Answer]: 
```

**Verification**:
- Resiliency testing approach identified (existing, proposed, or deferred per user's answer)
- DR test scenarios documented for the selected DR strategy (RESILIENCY-11)
- Test result tracking mechanism identified

---

### RESILIENCY-15: Incident Response and Correction of Errors

**Rule**: Every project MUST integrate with an incident response process. Default: the organization already has one — reference it.

**Clarifying question (ask during Requirements or NFR Design)**:

```markdown
## Question: Incident Response Process

A) Use our existing incident response process — provide reference (e.g. PagerDuty runbooks, internal on-call process)
B) No formal process exists — propose a lightweight incident response and Correction of Errors process
X) Other (describe after [Answer]: tag below)

[Answer]: 
```

**Verification**:
- Incident response process identified by name or proposed per user's answer
- COE/post-mortem mechanism identified
- Alerting from RESILIENCY-05 routes into the identified process
- Corrective action tracking mechanism identified

---

## Enforcement Integration

These rules are cross-cutting constraints applying to every AIDLC stage. At each stage:
- Evaluate applicable RESILIENCY rule verification criteria against artifacts produced
- Include a "Resiliency Compliance" section in the stage completion summary (Compliant / Non-Compliant / N/A per rule)
- Non-compliant rules are blocking findings — do not present stage completion until resolved
- N/A determinations must include a brief rationale

---

## Appendix: Reliability Pillar Mapping

| RESILIENCY Rule | Concept |
|---|---|
| RESILIENCY-01 | Understand workload business impact |
| RESILIENCY-02 | Define availability and recovery objectives |
| RESILIENCY-03 | Control changes to workloads |
| RESILIENCY-04 | Automate deployments and rollback |
| RESILIENCY-05 | Monitor workload resources (metrics, logs, traces) |
| RESILIENCY-06 | Health checks — prevent routing to unhealthy instances |
| RESILIENCY-07 | Monitor resiliency posture |
| RESILIENCY-08 | Fault isolation — multi-zone and multi-region |
| RESILIENCY-09 | Horizontal scaling and capacity management |
| RESILIENCY-10 | Prevent cascading failures — circuit breaking |
| RESILIENCY-11 | DR strategy aligned to RTO/RPO |
| RESILIENCY-12 | Automated data backup and replication |
| RESILIENCY-13 | Documented failover and recovery procedures |
| RESILIENCY-14 | Chaos engineering and DR testing |
| RESILIENCY-15 | Incident response and learning from failures |
