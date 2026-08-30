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

## Required Reading Rule

See `aidlc-common` → Required Reading Rule (Construction) for the full context-loading sequence. Summary: read `backlog/{item}.md` first, load inception foundation + dependency artifacts by convention, then load the current stage's skill for stage-specific context.

**Never start coding, never read application code, never run build commands** until context is loaded. No exceptions.

---

## Root Cause Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

Before touching any code to fix a failure:
1. Parse the error output — identify failing test name + file:line + error message
2. **Targeted read only**: read the failing section (`offset+limit` around error line)
3. Classify and act per Design-First Enforcement (below)
4. **State root cause explicitly**: "Root cause: [explanation]"
5. After fix: run test suite, show actual output
6. Discard raw code from context — retain one-line fix summary

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

**CRITICAL**: All code changes must align with design documents. This applies to bug fixes, feature work, refactoring — any code modification during construction.

**Design docs** (per unit):
- `functional-design/` — data models, schemas, business logic
- `nfr-design/` — performance/security patterns
- `infrastructure-design/` — service mappings, deployment
- `components.md` / `services.md` — component boundaries, interfaces

### Classification (before every code change):

**Implementation bug** (code wrong, design correct):
- Trivial (typo, null check, wrong variable, config value, off-by-one) → fix first, verify against design doc after
- Complex (multi-file, structural, unclear boundaries) → read design doc first, then fix

**Design gap** (design missing or doesn't support what's needed):
→ read design doc first, trigger Mid-Construction Design Change before coding

**If a fix changes behavior** → update the relevant design doc to match.

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
- **New dependency discovered** — current unit needs artifacts from another unit

### Process:
1. **Pause** current coding work
2. **Identify** affected design document(s)
3. **Update** the design doc in `aidlc-docs/`
4. **If a new dependency was discovered**:
   - Update `unit-of-work-dependency.md` — add the new dependency for this unit
   - Update current unit's `backlog/{unit}.md` `## Dependencies` — add the new dep
   - Read the newly added dependency artifacts before continuing
5. **Append** to `aidlc-docs/construction/design-changes.md`:
   ```markdown
   ## [ISO timestamp] — [Unit Name]
   **Change**: [what changed]
   **Reason**: [why]
   **Affected docs**: [list]
   **Impact**: [which units/stages affected]
   ```
6. **Log** in `audit.md`
7. **Continue** construction with updated design

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

### pmai Delegated Run Paths

When running in **pmai construction mode** (task.md contains `AIDLC Mode: construction`):

| Resource | Path |
|---|---|
| Inception docs (read-only) | Path from `Inception docs:` field in task.md (e.g. `../../_base/aidlc-docs/`) |
| Unit backlog | Path from `Unit backlog:` field in task.md |
| Application code | Working directory root (current worktree) |
| Unit aidlc-docs | `aidlc-docs/` relative to working directory |
| design-changes.md | `aidlc-docs/construction/design-changes.md` relative to working directory |

**NEVER write to the inception docs path** — it is shared across all units and read-only.

**NEVER write to `aidlc-state.md`** during construction — it lives in `_base` and is owned by inception and project-wide phases only. Construction agents update only `aidlc-docs/backlog/{unit}.md` in their own worktree.

**`aidlc-progress.md` and `audit.md` are worktree-local** — each construction agent writes to its own copies. They are not shared with other parallel units.

### pmai Commit Rule

The worktree is **removed by pmai immediately after pi exits** (before PR review). Any file not committed to git is lost.

**MANDATORY**: Before completing the construction run, commit all design artifacts:
```
git add aidlc-docs/backlog/{unit}.md \
        aidlc-docs/construction/{unit}/functional-design/ \
        aidlc-docs/construction/{unit}/nfr-design/ \
        aidlc-docs/construction/{unit}/infrastructure-design/ \
        aidlc-docs/construction/design-changes.md
git commit -m "aidlc({unit-name}): construction artifacts"
```

**NEVER commit** `aidlc-progress.md` or `audit.md` — these are operational session logs. They belong in pmai's Postgres records, not in git. If a `.gitignore` does not already exclude them, add entries:
```
aidlc-docs/aidlc-progress.md
aidlc-docs/audit.md
```

**`design-changes.md` is the only narrative artifact that goes into git.** It captures what changed and why — durable, reviewer-visible, lives with the code permanently. All other decision history lives in pmai's session records (`output_summary`, `output_log`, retry lineage).

### pmai Completion Rule

When running in any pmai delegated mode (inception or construction), on stage completion:
- Append a short summary (3–5 lines max) to the `progress.md` path shown in `task.md`
- Format:
  ```markdown
  ## Attempt {N} — {stage}
  {What was done, what artifacts were created, any blockers or decisions made}
  ```
- This is **mandatory** — pmai reads `progress.md` to populate the session output and retry context

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
