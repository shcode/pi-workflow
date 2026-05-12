---
name: aidlc-parallel
description: >
  Parallel construction batch execution. Load only when multiple independent units
  are detected (no inter-dependencies in unit-of-work-dependency.md).
  Orchestrates sub-agents for concurrent unit construction.
---

# Parallel Construction Batch

**Condition**: Multiple units with no inter-dependencies (check `unit-of-work-dependency.md`).

**Pre-check**: Read `aidlc-docs/inception/application-design/unit-of-work-dependency.md`. If dependency matrix shows independent groups, parallel execution is eligible.

---

## Execution

- Parent identifies independent group from dependency matrix
- Launches sub-agents (1 per unit), each writes to `.parallel/{unit-name}/`
- Sub-agents load: `aidlc-common` + `aidlc-construction-rules` + per-unit stage skills
- Sub-agents read: ALL inception artifacts + unit-specific prior outputs
- Sub-agents NEVER write to `aidlc-state.md`
- Parent merges `.parallel/{unit}/` → `construction/{unit}/` after all complete
- Single approval prompt for the batch

## Merge Rule

After all sub-agents complete:
1. Move `aidlc-docs/construction/.parallel/{unit}/*` → `aidlc-docs/construction/{unit}/*`
2. Delete `.parallel/{unit}/`
3. Update `backlog/{unit}.md` for each completed unit
4. Present unified summary for single user approval

## Failure Handling

- **Sub-agent fails**: Retry once with fresh context. If still failing, mark unit `FAILED`.
- **Partial completion**: Merge successful units immediately. Present failed units separately.
- **Timeout**: Terminate sub-agent, mark unit `TIMEOUT`.
- **Escalation** (≥2 units fail): Pause and present all errors to user:
  - Fix individually (targeted sub-agent per failed unit)
  - Skip failed units and continue
  - Abort batch and retry sequentially
