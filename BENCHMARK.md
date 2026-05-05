# AIDLC Workflow Benchmark

Comparison of `aidlc-workflows` (this repo) vs `aidlc-aws` (upstream reference implementation).

**Date**: 2026-05-06

---

## Total Lines

| | `aidlc-workflows` | `aidlc-aws` |
|---|---|---|
| **Total rule content** | 3,355 lines (16 skills) | 5,741 lines (21 files) |
| **Difference** | — | +71% more |

---

## Startup Cost (lines loaded before first stage begins)

| | Ours | aidlc-aws |
|---|---|---|
| Core router | orchestrator: 179 | core-workflow.md: 539 |
| Common rules | common: 470 | process-overview + session + content-validation + question-format + welcome: 1,244 |
| **Total startup** | **649 lines** | **1,244 lines** |
| **Reduction** | — | **Ours is 48% smaller** |

---

## Per-Stage Load (e.g. Requirements Analysis)

| | Ours | aidlc-aws |
|---|---|---|
| Stage file | 176 lines | 189 lines |
| Common overhead reloaded? | ❌ No (already in context) | ✅ Yes — 1,133 lines re-read per stage |
| **Effective per-stage** | **~176 lines** | **~1,322 lines** |

---

## Loading Model Comparison

| Feature | Ours | aidlc-aws |
|---|---|---|
| Progressive disclosure | ✅ Skills load on-demand | ⚠️ Partial — common files re-read every stage |
| Common rules loaded once | ✅ `aidlc-common` in context from start | ❌ Must re-read common files per-stage |
| Startup bloat | Low (649) | High (1,244) + common re-reads |
| State management | Bounded state.md (~35 lines) | Similar (aidlc-state.md) |
| Audit/progress reads | Write-only + targeted line-range pointers | No explicit write-only rule |
| Fast path (simple fixes) | ✅ Skip 9 stages | ❌ Not present |
| UI Design stage | ✅ Storybook-first | ❌ Not present |
| Parallel construction | ✅ Built-in | ❌ Not present |

---

## Effective Token Efficiency (full 12-stage workflow)

| Metric | Ours | aidlc-aws |
|---|---|---|
| Startup | 649 | 1,244 |
| 12 stages × per-stage overhead | 12 × ~0 (no re-reads) | 12 × 1,133 = 13,596 |
| Total stage files | ~3,355 | ~4,497 (excluding common) |
| **Estimated total lines loaded** | **~3,355** | **~19,337** |
| **Ratio** | **1×** | **~5.8×** |

---

## Summary Score

| Dimension | Ours | aidlc-aws | Winner |
|---|---|---|---|
| Total content size | 3,355 | 5,741 | ✅ Ours (-42%) |
| Startup cost | 649 | 1,244 | ✅ Ours (-48%) |
| Per-stage overhead | ~0 extra | ~1,133 extra | ✅ Ours (-100%) |
| Full workflow token load | ~3,355 | ~19,337 | ✅ Ours (-83%) |
| Feature coverage | 16 skills + fast path + UI design + parallel | 14 stages, no fast path | ✅ Ours |
| Resume efficiency | Write-only logs + targeted pointers | No explicit optimization | ✅ Ours |

**Overall: ~83% less token consumption** for a full workflow run, with more features (fast path, UI design, parallel construction, audit→progress line-range pointers).

---

## Workflow Feature Comparison

### Stage Coverage

| Stage | Ours | aidlc-aws | Notes |
|---|---|---|---|
| Workspace Detection | ✅ ALWAYS | ✅ ALWAYS | Equivalent |
| Reverse Engineering | ✅ Conditional | ✅ Conditional | Equivalent |
| Requirements Analysis | ✅ ALWAYS (adaptive) | ✅ ALWAYS (adaptive) | Equivalent |
| User Stories | ✅ Conditional | ✅ Conditional | Theirs has longer skip/execute criteria (50+ lines) |
| Workflow Planning | ✅ ALWAYS | ✅ ALWAYS | Equivalent |
| Application Design | ✅ Conditional | ✅ Conditional | Equivalent |
| Units Generation | ✅ Conditional | ✅ Conditional | Equivalent |
| Functional Design | ✅ Per-unit | ✅ Per-unit | Equivalent |
| NFR Requirements | ✅ Combined (per-unit) | ✅ Separate file (per-unit) | We merge NFR Req + Design into one skill (157 vs 194 lines) |
| NFR Design | ✅ Combined above | ✅ Separate file (per-unit) | — |
| **UI Design** | ✅ Per-unit (Storybook-first) | ❌ Not present | **Ours only** |
| Infrastructure Design | ✅ Per-unit | ✅ Per-unit | Equivalent |
| Code Generation | ✅ ALWAYS (per-unit) | ✅ ALWAYS (per-unit) | Equivalent |
| Build and Test | ✅ ALWAYS | ✅ ALWAYS | Ours executes commands + fix loop; theirs generates instructions only |
| Operations | 🟡 Placeholder | 🟡 Placeholder | Both placeholder |

### Unique to `aidlc-workflows` (ours)

| Feature | Lines | Impact |
|---|---|---|
| **Fast Path** | ~20 | Simple brownfield fixes skip 9 stages (Workspace → Code Gen → Build) |
| **UI Design (Storybook-first)** | 299 | Approval gate before code gen; stories = implementation spec |
| **Parallel Construction** | ~50 | Independent units run concurrently via sub-agents |
| **Audit→Progress line-range pointers** | ~25 | Targeted history lookup without reading full files |
| **Backlog tracking** | ~30 | Deferred features/tech debt surfaced during planning |
| **Design-first rule** | ~15 | Hard constraint: code must match design docs |
| **Mid-construction design changes** | ~20 | Formal process for design edits during construction |
| **Fix loop (Build & Test)** | ~40 | 3 auto-fix attempts before escalation |
| **Self-review (Code Gen)** | ~10 | Agent verifies own output against design before presenting |
| **Write-only logs with exceptions** | ~20 | audit.md + progress.md never read proactively; targeted reads only |

### Unique to `aidlc-aws`

| Feature | Lines | Impact |
|---|---|---|
| **Overconfidence Prevention** | 99 | Guardrails against hallucination/speculation |
| **ASCII Diagram Standards** | 116 | Validation rules for text-based diagrams |
| **Terminology Glossary** | 187 | Standardized vocabulary across stages |
| **Content Validation** | 78 | Mermaid syntax + special char escaping rules |
| **Error Handling & Recovery** | 373 | Severity levels, recovery procedures, escalation |
| **Mid-Workflow Changes** | 285 | Adding/removing/reordering stages mid-execution |
| **NFR split into 2 stages** | 194 | Separate Requirements vs Design files |

### Architectural Differences

| Aspect | Ours | aidlc-aws |
|---|---|---|
| **Loading model** | Progressive disclosure (pi skills) | File-read directives in core-workflow.md |
| **Common rules** | Single `aidlc-common` skill, loaded once | 6 common files (1,133 lines), re-read per stage |
| **State management** | Bounded state.md (~35 lines) + write-only logs | Similar state.md, no write-only enforcement |
| **Question format** | Inline in response + pi-answer TUI / chat fallback | File-based `*-questions.md` with `[Answer]:` tags |
| **Audit approach** | Append-only, never read (except rotation + explicit history) | Read-then-append (contradicts own rules) |
| **Stage transitions** | Orchestrator skill routes; explicit `/skill:` loading | Core-workflow.md instructs "Load all steps from..." |
| **Build & Test** | Executes commands, captures output, auto-fixes | Generates instruction documents only |
| **Resume** | `## Current Work` in state.md (3 fields, ~5 lines) | Re-read state.md + potentially audit.md |
| **Extensions** | Opt-in at requirements; enforced as hard constraints | Same mechanism |
| **Multi-agent** | pi, Claude, Copilot, Kiro via `--agent` flag | Multiple IDE paths (Cursor, Cline, Claude, Q, Kiro) |

### What We Deliberately Omit (and why)

| aidlc-aws feature | Why omitted | Our alternative |
|---|---|---|
| Overconfidence Prevention (99 lines) | LLM-level concern, not workflow-level | Rely on agent's built-in guardrails |
| ASCII Diagram Standards (116 lines) | Niche; Mermaid preferred | Use Mermaid for all diagrams |
| Terminology Glossary (187 lines) | Loaded every stage = 2,244 wasted lines/workflow | Terms are self-evident in context |
| Error Handling (373 lines) | Overly prescriptive for capable agents | Compact escalation rules in fix loop + common |
| Mid-Workflow Changes (285 lines) | Verbose for what's a simple re-routing decision | Orchestrator handles naturally; user just asks |
| Content Validation (78 lines) | Agent should validate by default | Implicit in code-gen self-review |

---

## Key Architectural Differences

### Why ours is more efficient

1. **Progressive disclosure via pi skills** — only the current stage's skill is loaded; common rules stay in context from startup without re-reads.
2. **Bounded state files** — `aidlc-state.md` (~35 lines) is the only file read for resume context. `audit.md` and `aidlc-progress.md` are write-only with a targeted exception (line-range pointers for explicit history requests).
3. **Fast path** — simple brownfield fixes (≤3 files, single clear change) skip 9 stages entirely.
4. **No common re-reads** — `aidlc-aws` loads 1,133 lines of common files (error-handling, depth-levels, overconfidence-prevention, terminology, ascii-diagrams, workflow-changes) at every stage transition. We load `aidlc-common` once.

### What aidlc-aws has that we don't

- `operations/operations.md` — deployment/CI/CD stage (we have a placeholder)
- `ascii-diagram-standards.md` — 116-line ASCII art validation rules
- `overconfidence-prevention.md` — 99-line guardrails against hallucination
- `terminology.md` — 187-line glossary

These are valid features but represent ~500 lines of content we deliberately omit or inline as compact rules within existing skills.
