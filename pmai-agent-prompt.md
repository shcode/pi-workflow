# Agent Prompt: AIDLC Integration for pmai

## Your Task

You are implementing the AIDLC workflow integration for `pmai` — a Go project
management web application. You will add 5 features that connect pmai to the
AIDLC skill pack running on pi (an AI coding agent).

Read the two reference documents before writing any code:

1. `aidlc-pmai-integration-prompt.md` — full feature spec with exact method
   signatures, behaviours, constraints, and file map
2. `pmai-pi-interactive-contract.md` — the pi ↔ pmai JSON event contract for
   interactive Q&A sessions (questions/answers event schema, session state
   machine, process lifecycle)

Both files are in the same directory as this prompt.

---

## Codebase Location

```
/home/shcode/project/pmai/
```

Key files to read before starting:

| File | Why |
|---|---|
| `internal/agent/models.go` | All agent domain types — AgentSession, AgentConfig, HarnessTaskRequest, etc. |
| `internal/agent/service.go` | Business logic layer — patterns to follow for all new methods |
| `internal/agent/harness_subprocess.go` | Pi subprocess management — stdin/stdout JSONL handling |
| `internal/agent/gitsource.go` | Git worktree lifecycle — `ensureBaseClone`, `createWorktree`, `removeWorktree` |
| `internal/agent/steering.go` | Task brief writing — `writeTaskBrief`, `steeringPrompt` |
| `internal/api/handler/agent.go` | REST handler patterns — `response.JSON`, `handleAgentError`, etc. |
| `internal/issue/models.go` | Issue domain types |

---

## Build Order

Implement in this order — each feature unblocks the next:

### Step 1 — Feature 4: AIDLC context injection (`steering.go`)
Smallest change. Add `AIDLCMode` and `AIDLCContext` to `HarnessTaskRequest`.
Modify `writeTaskBrief` to append `AIDLCContext` after `## Context` when
`AIDLCMode != ""`. Set `PI_PMAI_CONTRACT_VERSION=1` in subprocess env when
`AIDLCMode != ""`.

### Step 2 — Feature 5: Worktree branch naming (`gitsource.go`)
Add `createWorktreeBranch(basePath, newBranch, sessionID string)` using
`git worktree add -b {branch}`. Add optional `BranchName` to `HarnessConfig`.
Fall back to existing `createWorktree` when `BranchName` is empty.

### Step 3 — Feature 2: Issue metadata + backlog sync
- Add `AIDLCUnitName`, `AIDLCDomain` to `internal/issue/models.go` + migration
- Add `aidlc_unit_dependencies` JSONB to workspaces + migration
- Implement `SyncBacklogToIssues` in `service.go`
- Add `POST /workspaces/{workspaceID}/agent/sync-backlog` handler

### Step 4 — Feature 3: Dependency dispatcher
- Implement `DispatchReadyUnits` in `service.go`
- Add helper `aidlcConstructionContext`
- Add `POST /workspaces/{workspaceID}/agent/dispatch` handler

### Step 5 — Feature 1: Interactive session type
This is the largest feature. Read `pmai-pi-interactive-contract.md` carefully.
- Add `StatusWaitingForInput`, `SessionType`, `PendingQuestions`,
  `QuestionsStage`, `QuestionsRound` to `models.go` + migration
- Add stdin pipe support to `harness_subprocess.go`
- Add `questions` event parsing in `parseEvent`
- Add `SubmitAnswers` method to `SubprocessHarnessClient`
- Implement `GetSessionQuestions`, `SubmitSessionAnswers` in `service.go`
- Add `GET /agent/sessions/{sessionID}/questions` handler
- Add `POST /agent/sessions/{sessionID}/answers` handler
- Update `HasActiveSession` to treat `waiting_for_input` as active
- Update `statusTransitions` map for new state

---

## Hard Constraints

- **Follow existing patterns exactly**: `response.JSON`, `response.Error`,
  `handleAgentError`, `middleware.GetUserID`, `chi.URLParam` in handlers.
  `s.audit(...)` for all mutating operations. `s.repo.*` for persistence.
- **Role checks**: `DispatchReadyUnits` requires developer or above (same as
  `DelegateTask`). `SyncBacklogToIssues` requires manager or above.
- **CNC-01**: `DispatchReadyUnits` must skip issues with active sessions.
  `waiting_for_input` counts as active.
- **Idempotency**: `SyncBacklogToIssues` safe to call multiple times — skip
  existing units, never duplicate issues. On re-sync, update description if
  changed, mark removed units with label `"aidlc-removed"` (never delete).
- **Lenient parsing**: `backlog.md` parser skips malformed lines with a warning,
  never errors out the whole sync.
- **Timeout**: `waiting_for_input` counts against the 15-min TIME-01 clock.
  Pi process stays alive during `waiting_for_input` — do NOT kill it.
- **Migrations**: All new DB columns need migrations following the project's
  existing migration convention.
- **No breaking changes**: All new fields optional, all new behavior gated on
  `AIDLCMode != ""` or `SessionType == "interactive"`. Existing sessions,
  handlers, and tests must continue to work.

---

## Tests to Write

Follow `service_test.go` and `integration_agent_test.go` patterns. Cover:

| Test | What to verify |
|---|---|
| `SyncBacklogToIssues` happy path | Issues created from backlog.md |
| `SyncBacklogToIssues` idempotency | Second call skips existing units |
| `SyncBacklogToIssues` re-sync | Updated description applied, removed unit gets label |
| `DispatchReadyUnits` happy path | Unblocked units dispatched |
| `DispatchReadyUnits` blocked unit | Unit with unfinished dependency skipped |
| `DispatchReadyUnits` active session | Unit with active session skipped |
| Interactive session questions event | Session transitions to `waiting_for_input` |
| `SubmitSessionAnswers` happy path | Answers written to stdin, session resumes |
| `SubmitSessionAnswers` wrong state | 422 when not `waiting_for_input` |
| `HasActiveSession` with `waiting_for_input` | Returns true |

---

## Definition of Done

- All 5 features implemented and passing tests
- No existing tests broken
- Migrations created for all new DB columns
- `handleAgentError` covers any new error strings introduced
- `statusTransitions` map updated for `waiting_for_input`
