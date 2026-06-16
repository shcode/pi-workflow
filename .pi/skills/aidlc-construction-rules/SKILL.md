---
name: aidlc-construction-rules
description: >
  Construction-phase rules: design-first enforcement, mid-construction design changes,
  and sub-agent temp-file rules. Load once when entering CONSTRUCTION phase.
  Not needed during INCEPTION.
---

# AIDLC Construction Rules

Load this skill once when the first construction stage begins.

---

## Root Cause Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

Before touching any code to fix a failure:
1. Parse the error output — identify failing test name + file:line + error message
2. **Targeted read only**: read the failing section (`offset+limit` around error line)
3. Read relevant design document for context
4. **State root cause explicitly**: "Root cause: [explanation]"
5. Only after root cause stated:
   - **Implementation bug** → fix source file, re-run failing test
   - **Test bug** → fix test, re-run
   - **Design mismatch** → trigger Mid-Construction Design Change
6. After fix: run full test suite, show actual output
7. Discard raw code from context — retain one-line fix summary

**Escalate to user if**: 3 fix attempts exhausted, architectural change required, >3 unrelated failures, root cause cannot be determined.

---

## Verification Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

Before presenting ANY stage completion during construction:
1. Run the relevant verification command (tests, build, lint)
2. Show actual output — not a summary, not "it should pass"
3. Only claim done after evidence confirms it

This applies to every construction stage. No exceptions.

---

## Design-First Enforcement

**CRITICAL**: Before EVERY code change during construction, verify against design.

### Pre-change check:
1. Read the relevant design artifact for the current unit:
   - `functional-design/` — data models, schemas, business logic
   - `nfr-design/` — performance/security patterns
   - `infrastructure-design/` — service mappings, deployment
   - `components.md` / `services.md` — component boundaries, interfaces
2. Confirm intended code change matches design specification
3. Only proceed if design explicitly supports the change

### If design is ambiguous or missing detail:
- Do NOT guess or invent behavior
- Trigger Mid-Construction Design Change (below)
- Update design FIRST, then implement

### If code contradicts design:
- STOP immediately — do NOT proceed
- Trigger design change process
- Log discrepancy in `design-changes.md`

---

## Mid-Construction Design Changes

**Rule**: Design documents are living artifacts. Update design BEFORE continuing with code.

### When to trigger:
- Requirement gap discovered while coding
- Design inconsistency found during implementation
- New constraint invalidates prior design decision
- Scope change requested by user
- Design-First check fails

### Process:
1. **Pause** current coding work
2. **Identify** affected design document(s)
3. **Update** the design doc in `aidlc-docs/`
4. **Append** to `aidlc-docs/construction/design-changes.md`:
   ```markdown
   ## [ISO timestamp] — [Unit Name]
   **Change**: [what changed]
   **Reason**: [why]
   **Affected docs**: [list]
   **Impact**: [which units/stages affected]
   ```
5. **Log** in `audit.md`
6. **Continue** construction with updated design

**Never** code around a design flaw without updating the design document.

---

## Context Discard Rules

After a stage produces its output artifact, discard raw input content from context:
- After reverse engineering → discard raw source file content
- After design stage → discard previous stage's input artifacts
- After code generation step → discard raw code read for that step, retain one-line summary
- After fix → discard error output and raw code, retain root cause + fix summary
- After audit/progress write → discard the written content

Never discard: design docs referenced by current stage, `aidlc-state.md`, `backlog/{unit}.md`

---

## Code Location Rules

- **Application code**: Workspace root ONLY (never aidlc-docs/)
- **Documentation**: aidlc-docs/ ONLY (markdown summaries)
- Read workspace root from `aidlc-state.md` Project section

### Structure patterns:
| Project type | Pattern |
|---|---|
| Brownfield | Use existing structure |
| Greenfield single unit | `src/`, `tests/`, `config/` |
| Greenfield multi-unit (microservices) | `{unit-name}/src/`, `{unit-name}/tests/` |
| Greenfield multi-unit (monolith) | `src/{unit-name}/`, `tests/{unit-name}/` |

### Brownfield file rules:
- Check if file exists before generating
- If exists: modify in-place (never create copies like `_new`, `_modified`)
- If doesn't exist: create new file
- Verify no duplicate files after generation
