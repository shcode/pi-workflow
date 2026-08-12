# Feature: AIDLC Workflow Integration for pmai

## Context

`pmai` is a project management tool written in Go (chi router, PostgreSQL). It
already has a working agent delegation pipeline:

- `internal/agent/service.go` — `DelegateTask`, `ApproveSession`, `RejectSession`,
  `RetrySession`, session lifecycle
- `internal/agent/harness_subprocess.go` — spawns `pi` as a subprocess, drains
  JSONL event stream, captures diff/summary/log
- `internal/agent/gitsource.go` — `ensureBaseClone`, `createWorktree`,
  `removeWorktree` (already implemented, per-session isolation works)
- `internal/agent/steering.go` — `writeTaskBrief`, `steeringPrompt`,
  `appendProgress` (writes `task.md` + `progress.md` to agent-docs dir outside
  worktree)
- `internal/api/handler/agent.go` — REST handlers wired to the service

## Architecture Decision

**Inception does NOT run through pmai.** Inception requires interactive Q&A —
requirements questions, extension opt-ins, stage approval gates. These need a
live conversation that pmai's fire-and-forget session model cannot support
without a new interactive session type (see Feature 1 below).

**pmai's role starts after inception**: the developer runs inception interactively
with pi directly, then syncs the resulting backlog to pmai issues, then pmai
dispatches construction units in parallel.

The two phases:
- **Inception**: Developer + pi interactive session (outside pmai)
- **Construction**: pmai delegates each unit to pi in an isolated worktree

Exception: once Feature 1 (Interactive Session Type) is built, inception CAN
run inside pmai as an interactive session.

---

## What to Build

### Feature 1: Interactive Session Type (Q&A support)

This is the foundational feature that enables inception inside pmai and richer
construction sessions. See `pmai-pi-interactive-contract.md` for the full
pi ↔ pmai JSON event contract.

#### 1.1 New session fields

Add to `AgentSession` and `agent_sessions` table:

```go
SessionType      string  `json:"session_type"`       // "standard" | "interactive"
PendingQuestions []byte  `json:"-"`                  // JSONB — stored questions while waiting
QuestionsStage   *string `json:"questions_stage,omitempty"`
QuestionsRound   *int    `json:"questions_round,omitempty"`
```

New status constant:
```go
StatusWaitingForInput = "waiting_for_input"
```

Add to `statusTransitions`:
```go
StatusRunning:          {StatusCompleted: true, StatusFailed: true, StatusWaitingForInput: true},
StatusWaitingForInput:  {StatusRunning: true, StatusFailed: true},
```

#### 1.2 Harness stdin pipe

Modify `SubprocessHarnessClient` and `subprocessSession` to keep stdin pipe open
for interactive sessions:

```go
type subprocessSession struct {
    // ... existing fields ...
    stdinPipe io.WriteCloser // non-nil for interactive sessions
}
```

In `SubmitTask`: if `cfg.SessionType == "interactive"`, call `cmd.StdinPipe()`
and store the pipe on the session. Otherwise stdin is closed (existing behaviour).

#### 1.3 Parse `questions` event in `parseEvent`

Add handler for `type == "questions"`:

```go
case "questions":
    // Store questions JSON in session, transition status to waiting_for_input
    sess.mu.Lock()
    sess.pendingQuestions = line // raw JSON line
    sess.state = StatusWaitingForInput
    sess.mu.Unlock()
    // Persist to DB via callback or channel
```

Expose a `SubmitAnswers(ref string, answersJSON string) error` method on
`SubprocessHarnessClient` that writes the answers JSON line to the session's
stdin pipe and transitions status back to `running`.

#### 1.4 New REST endpoints

```
GET  /agent/sessions/{sessionID}/questions
     → Returns pending questions JSON for UI rendering
     → 404 if session not in waiting_for_input state

POST /agent/sessions/{sessionID}/answers
     → Body: {"answers": [{"id": "q1", "selected": ["A"]}, ...]}
     → Feeds answers to pi stdin, transitions session → running
     → 422 if session not in waiting_for_input state
     → 422 if required questions unanswered
```

Add to `AgentHandler`:
```go
func (h *AgentHandler) GetSessionQuestions(w http.ResponseWriter, r *http.Request)
func (h *AgentHandler) SubmitSessionAnswers(w http.ResponseWriter, r *http.Request)
```

Add to `Service`:
```go
func (s *Service) GetSessionQuestions(ctx context.Context, sessionID string) (*SessionQuestions, error)
func (s *Service) SubmitSessionAnswers(ctx context.Context, sessionID, userID string, answers []QuestionAnswer) error
```

#### 1.5 Timeout behaviour

`waiting_for_input` counts against the 15-minute TIME-01 timeout. The timer
keeps running — pi process is still alive, just blocking on stdin. pmai must
notify the user immediately when a session enters `waiting_for_input`.

Add a `NotifyWaitingForInput(sessionID string)` hook to the poller so the web
layer can push a notification (websocket, SSE, or polling — your choice).

---

### Feature 2: Backlog Sync — `agent.Service.SyncBacklogToIssues`

Called after developer completes inception interactively and syncs the resulting
`backlog.md` to pmai issues.

```go
func (s *Service) SyncBacklogToIssues(ctx context.Context, workspaceID string) error
```

REST endpoint: `POST /workspaces/{workspaceID}/agent/sync-backlog`
Role: manager or above.

Behaviour:
1. Read `{reposRoot}/{workspaceID}/_base/aidlc-docs/backlog.md`
2. Parse each line matching:
   `- [todo] {unit-name} (domain: {domain}) — {description} (stories: {ids})`
   Also handle lines without domain tag (single-domain projects):
   `- [todo] {unit-name} — {description} (stories: {ids})`
3. For each parsed unit:
   - Check if issue already exists with `aidlc_unit_name = unit-name` in this
     workspace — skip if exists (idempotent)
   - If not: call `s.issueSvc.CreateIssue(ctx, ...)` with:
     - `Title`: unit-name
     - `Description`: description + stories line
     - `AIDLCUnitName`: unit-name
     - `AIDLCDomain`: domain (nil if single-domain)
     - `Labels`: `["aidlc-unit"]` + domain label if present
4. Read `aidlc-docs/unit-of-work-dependency.md`, store dependency map in
   `aidlc_unit_dependencies` JSONB column on the workspace row
5. On re-sync (units already exist): update description if changed, create new
   units, mark removed units with label `"aidlc-removed"` (never delete issues)

Issue metadata fields — add to `internal/issue/models.go` `Issue` struct and
`issues` table:

```go
AIDLCUnitName   *string `json:"aidlc_unit_name,omitempty"`
AIDLCDomain     *string `json:"aidlc_domain,omitempty"`
```

---

### Feature 3: Dependency Dispatcher — `agent.Service.DispatchReadyUnits`

```go
func (s *Service) DispatchReadyUnits(ctx context.Context, workspaceID, actorID string) (dispatched []string, err error)
```

REST endpoint: `POST /workspaces/{workspaceID}/agent/dispatch`
Role: developer or above.

Behaviour:
1. Load all issues in workspace with `aidlc_unit_name IS NOT NULL` and no
   `"aidlc-removed"` label
2. Build status map: `unit-name → issue.Status`
3. Read dependency map from `aidlc_unit_dependencies` on workspace row
4. For each unit where:
   - Issue status is NOT `done`, `in_progress`, or `review`
   - All dependency unit issues have status `done`
   - No active agent session exists for this issue (`HasActiveSession` check)
   → Call `s.DelegateTask(ctx, issue.ID, actorID, aidlcConstructionContext(issue))`
5. Return list of dispatched unit names
6. Log dispatch decisions via `s.audit(...)`

Helper:
```go
func aidlcConstructionContext(issue *issue.Issue) string
```
Returns the extra context injected into `task.md` for construction runs:
```
AIDLC Mode: construction
Unit: {aidlc_unit_name}
Domain: {aidlc_domain}
Inception docs: ../../_base/aidlc-docs/
Unit backlog: ../../_base/aidlc-docs/backlog/{aidlc_unit_name}.md
Load skill aidlc-orchestrator (construction phase only — skip inception stages).
```

---

### Feature 4: AIDLC context injection in `steering.go`

Add `AIDLCMode` and `AIDLCContext` to `HarnessTaskRequest`:

```go
type HarnessTaskRequest struct {
    IssueNumber      int
    IssueTitle       string
    IssueDescription string
    Context          string
    Attempt          int
    AIDLCMode        string // "inception" | "construction" | "" (plain)
    AIDLCContext     string // pre-built by aidlcConstructionContext()
}
```

Modify `writeTaskBrief` to append `req.AIDLCContext` verbatim after the
`## Context` block when `req.AIDLCMode != ""`.

Also set `PI_PMAI_CONTRACT_VERSION=1` in the subprocess environment when
`AIDLCMode != ""` — pi uses this to activate interactive Q&A mode.

---

### Feature 5: Worktree branch naming for construction runs

Add `createWorktreeBranch` to `gitsource.go`:

```go
func createWorktreeBranch(basePath, newBranch, sessionID string) (worktreePath string, err error)
```

Uses `git worktree add -b {newBranch} {worktreePath} origin/{baseBranch}`.
Branch name convention: `feat/aidlc-{unit-name}`.

Add optional `BranchName` to `HarnessConfig`. If set, use
`createWorktreeBranch`; otherwise fall back to existing `createWorktree`
(detached HEAD). No breaking changes.

---

## Build Order

Build in this order — each feature is a prerequisite for the next:

1. **Feature 4** (AIDLC context injection) — smallest, unblocks construction runs
2. **Feature 5** (worktree branch naming) — needed for PRs to work correctly
3. **Feature 2** (backlog sync) + **Feature 3** (dispatcher) — parallel, no dependency between them
4. **Feature 1** (interactive session type) — largest, enables inception inside pmai

---

## Constraints

- Follow all existing patterns: `response.JSON`, `response.Error`,
  `handleAgentError`, `middleware.GetUserID`, `chi.URLParam` in handlers;
  `s.audit(...)` for all mutating operations; `s.repo.*` for persistence.
- CNC-01 still applies — `DispatchReadyUnits` skips issues with active sessions.
- `SyncBacklogToIssues` must be idempotent — safe to call multiple times.
- `backlog.md` parsing must be lenient — skip malformed lines, log warning, never
  error-out the whole sync.
- All new DB columns require migrations following the project's existing convention.
- `waiting_for_input` status must be handled in all existing status-checking code
  (e.g. `HasActiveSession` should treat it as active).
- Write tests following `service_test.go` and `integration_agent_test.go` patterns.

## File Map

| New/modified file | Purpose |
|---|---|
| `internal/issue/models.go` | Add `AIDLCUnitName`, `AIDLCDomain` fields |
| `internal/agent/models.go` | Add `AIDLCMode`, `AIDLCContext` to `HarnessTaskRequest`; `BranchName` to `HarnessConfig`; `StatusWaitingForInput`; `SessionType`, `PendingQuestions` to `AgentSession` |
| `internal/agent/service.go` | Add `SyncBacklogToIssues`, `DispatchReadyUnits`, `aidlcConstructionContext`, `GetSessionQuestions`, `SubmitSessionAnswers` |
| `internal/agent/harness_subprocess.go` | Add stdin pipe support, `questions` event parsing, `SubmitAnswers` method |
| `internal/agent/steering.go` | Append AIDLC context block, set `PI_PMAI_CONTRACT_VERSION` env var |
| `internal/agent/gitsource.go` | Add `createWorktreeBranch` |
| `internal/api/handler/agent.go` | Add `SyncBacklogToIssues`, `DispatchReadyUnits`, `GetSessionQuestions`, `SubmitSessionAnswers` handlers |
| `internal/agent/service_test.go` | Unit tests for new service methods |
| `internal/agent/integration_agent_test.go` | Integration tests |
| `db/migrations/NNNN_aidlc_fields.sql` | `aidlc_unit_name`, `aidlc_domain` on `issues`; `aidlc_unit_dependencies` on `workspaces`; `session_type`, `pending_questions`, `questions_stage`, `questions_round` on `agent_sessions` |

## Reference

See `pmai-pi-interactive-contract.md` for the full pi ↔ pmai JSON event
contract (questions/answers event schema, session state machine, pi process
lifecycle in interactive mode).
