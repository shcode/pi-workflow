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
