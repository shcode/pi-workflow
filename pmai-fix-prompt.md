# Fix Prompt: AIDLC Integration Issues in pmai

## Context

The AIDLC integration was reviewed against the contract in
`pmai-pi-interactive-contract.md` and `aidlc-pmai-integration-prompt.md`.
All tests pass. Three issues were found that need fixing.

---

## Issue 1 — `PI_PMAI_CONTRACT_VERSION` env var not injected (Functional Blocker)

**File**: `internal/agent/harness_subprocess.go`

**Problem**: `runAndDrain` builds `cmd.Env` without `PI_PMAI_CONTRACT_VERSION`. Without
this env var, the pi extension `pmai-qna.ts` (installed in the workspace repo under
`.pi/extensions/`) never activates. The questionnaire tool falls back to TUI mode
which fails in json mode, so interactive Q&A never works.

**Background**: The pi side is handled by a new extension `pmai-qna.ts` that:
1. Detects `PI_PMAI_CONTRACT_VERSION` via `process.env`
2. Intercepts `questionnaire` tool calls in json mode
3. Emits `{"type":"questions",...}` JSONL to stdout
4. Blocks reading `{"type":"answers",...}` from stdin

The only pmai-side change needed is injecting the env var.

**Current code** (lines ~128-133):
```go
cmd.Env = append(os.Environ(),
    envVar+"="+cfg.LLMAPIKeyDecrypted,
    // CUST-01: per-workspace skill/extension customization.
    "PI_CODING_AGENT_DIR="+agentHomeDir(cfg.ReposRoot, cfg.WorkspaceID),
)
```

**Fix**: Add `PI_PMAI_CONTRACT_VERSION=1` when `cfg.AIDLCMode != ""`:

```go
env := append(os.Environ(),
    envVar+"="+cfg.LLMAPIKeyDecrypted,
    // CUST-01: per-workspace skill/extension customization.
    "PI_CODING_AGENT_DIR="+agentHomeDir(cfg.ReposRoot, cfg.WorkspaceID),
)
if cfg.AIDLCMode != "" {
    env = append(env, "PI_PMAI_CONTRACT_VERSION=1")
}
cmd.Env = env
```

`cfg.AIDLCMode` is already available in `HarnessConfig`. Pass it through
`SubmitTask` → `runAndDrain` as needed — either add it to the `runAndDrain`
signature or access it from `cfg` directly (whichever matches the current
signature).

**Add a test** in `harness_subprocess_test.go` verifying that when
`cfg.AIDLCMode = "construction"`, the spawned process receives
`PI_PMAI_CONTRACT_VERSION=1` in its environment. Use the existing stub/mock
pattern in that file.

---

## Issue 2 — `inceptionTaskBrief` duplicates what `AGENTS.md` already provides (Design Gap)

**File**: `internal/agent/service.go`

**Problem**: The workspace repo already has `AGENTS.md` (installed by
`install.sh`) which tells pi to load `aidlc-orchestrator` and run AIDLC. The
current `inceptionTaskBrief` constant re-embeds the same routing instructions
inside `task.md`. This is redundant and fragile — if the skill routing changes,
both `AGENTS.md` and `inceptionTaskBrief` need updating.

`install.sh` also runs before pmai spawns pi — it copies all 19 skills and
`AGENTS.md` into the workspace. Pi reads `AGENTS.md` automatically on startup.
So the inception session does not need to tell pi what AIDLC is or how to run
it — that's already handled.

**Fix**: Simplify `inceptionTaskBrief` to only provide the mode signal — no
AIDLC instructions needed:

```go
const inceptionTaskBrief = `## AIDLC Mode
inception
`
```

That's all pi needs. `AGENTS.md` handles the rest.

For construction, `aidlcConstructionContext` correctly provides runtime-specific
values (unit name, paths) that can't come from static files — no change needed
there.

**No new tests needed** — existing inception tests remain valid. Verify
`go test ./internal/agent/...` still passes.

---

## Issue 3 — `SyncBacklogToIssues` re-sync behavior missing (Functional Gap)

**File**: `internal/agent/service.go`

**Problem**: When called a second time after a re-inception run, the current
implementation skips all existing units (`if existing != nil { continue }`).
It never updates changed descriptions, never marks removed units.

The spec requires:
- Update description if changed (unit exists but description differs)
- Mark removed units with label `"aidlc-removed"` (units in DB but not in
  current `backlog.md`) — never delete issues

**Fix**: Replace the idempotency block in `SyncBacklogToIssues` with a
three-way sync:

```go
// 1. Collect all units from current backlog.md into a map
parsed := map[string]parsedUnit{} // unit-name → {domain, desc}
for _, line := range lines {
    unit, domain, desc, ok := parseBacklogLine(line)
    if !ok { continue }
    parsed[unit] = parsedUnit{domain: domain, desc: desc}
}

// 2. Load all existing AIDLC issues for this workspace
existing, err := s.issueSvc.ListAIDLCIssues(ctx, workspaceID)
if err != nil { return fmt.Errorf("list aidlc issues: %w", err) }
existingMap := map[string]*issue.Issue{}
for _, iss := range existing { existingMap[*iss.AIDLCUnitName] = iss }

// 3. Create new, update changed
for unitName, p := range parsed {
    if iss, ok := existingMap[unitName]; !ok {
        // New unit — create
        input := issue.CreateIssueInput{...}
        s.issueSvc.CreateIssue(ctx, workspaceID, actorID, input)
    } else if iss.Description != p.desc {
        // Changed description — update
        s.issueSvc.UpdateIssue(ctx, iss.ID, actorID, issue.UpdateIssueInput{
            Description: &p.desc,
        })
    }
}

// 4. Mark removed units
for unitName, iss := range existingMap {
    if _, stillPresent := parsed[unitName]; !stillPresent {
        s.issueSvc.AddLabel(ctx, iss.ID, "aidlc-removed")
    }
}
```

You will need:
- `ListAIDLCIssues(ctx, workspaceID) ([]*issue.Issue, error)` on `issue.Service`
  — returns all issues where `aidlc_unit_name IS NOT NULL` for the workspace
- `AddLabel(ctx, issueID, label string) error` on `issue.Service` — adds a
  label to an issue if not already present (check existing `LabelIssue` or
  similar methods first before adding new ones)

Follow the existing `issue.Service` patterns for both methods.

**Add tests** covering:
- Re-sync updates description when changed
- Re-sync marks removed unit with `"aidlc-removed"` label
- Re-sync does not duplicate existing unchanged units

---

## Constraints

- Follow all existing patterns: `s.audit(...)`, `s.repo.*`, `response.JSON`,
  `handleAgentError`
- No breaking changes to existing tests
- All tests must pass after the fix: `go test ./internal/...`
