# Resiliency Baseline — Opt-In

**Extension**: Resiliency Baseline

## Opt-In Prompt

The following question is automatically included in the Requirements Analysis clarifying questions when this extension is loaded:

```markdown
## Question: Resiliency Extension
Should the resiliency baseline be applied to this project?

**What this extension is.** Enabling it applies directional, design-time best practices for building resilient systems, derived from established cloud reliability frameworks (AWS Well-Architected Reliability Pillar and resilience-review guidance). It steers requirements, design, and code toward fault tolerance, high availability, observability, and recoverability — covering 15 practice areas across business goals, change management, observability, high availability, disaster recovery, and continuous improvement.

**What this extension is NOT.** It does not make your workload production-ready, nor certify any availability, RTO, or RPO target. It is a starting point that scaffolds good resiliency decisions early — not a substitute for a formal architecture review of the built system.

A) Yes — apply the resiliency baseline as directional best practices and design-time guidance (recommended for business-critical workloads)
B) No — skip the resiliency baseline (suitable for PoCs, prototypes, and experimental projects where rapid iteration matters more than reliability)
X) Other (please describe after [Answer]: tag below)

[Answer]: 
```
