# pmai ↔ pi Interactive Session Contract

## Overview

This document defines the JSON event contract between pi (agent) and pmai (orchestrator)
for interactive sessions. It extends the existing JSONL event stream with two new event
types that enable pmai to surface questions to the user mid-session and feed answers back
to pi.

**Contract version: 2** — sessions are now **persisted and resumed** (exit + resume model).
A session no longer blocks on stdin while waiting for answers; instead pi ends the turn and
exits (persisting the session to disk), and pmai resumes it via `pi --session <id>` when the
user submits answers. This makes sessions survive a pmai backend restart.

---

## Existing Event Stream (unchanged)

pi emits JSONL to stdout. pmai's poller reads and parses each line. Existing event types:

| Type | When emitted | pmai action |
|---|---|---|
| `agent_start` | pi process starts | Update session status → running |
| `session` | session created (contains `id`) | Capture pi session id for resume |
| `tool_execution_end` | edit/write tool completes | Capture diff + file changes |
| `message_end` | assistant message completes | Capture output summary |

---

## Event Types

### 1. `questions`

Emitted when pi needs user input to continue. Session enters `waiting_for_input` state.

```json
{
  "type": "questions",
  "stage": "requirements",
  "round": 1,
  "questions": [
    {
      "id": "q1",
      "text": "What is the primary authentication method?",
      "options": [
        {"label": "A", "text": "JWT tokens"},
        {"label": "B", "text": "OAuth2 / OIDC"}
      ],
      "multi_select": false,
      "required": true
    }
  ]
}
```

**pmai behavior on receiving `questions`**:
1. Store questions in DB linked to session ID
2. Set session status → `waiting_for_input`
3. **Close the stdin pipe** — pi ends the turn (`terminate`), receives EOF on stdin, exits gracefully, and **persists the session** to `--session-dir`
4. Render the interactive form in the session viewer

### 2. `answers` (via resume, not stdin)

After the user submits answers, pmai **resumes** the persisted session instead of writing to
a live stdin pipe:

```bash
pi --session <pi-session-id> --session-dir <worktree>/.pmai/sessions \
   --provider <p> --model <m> -p "<resume prompt>"
```

Where the **resume prompt** is the answers formatted as a user message:

```text
Here are the answers to your pending questions — continue from where you left off:

[q1 label]: Selected option text (or free text)
[q2 label]: ...
```

pi resumes the session with the answers as a new user turn and continues execution.

---

## Session State Machine

```
pending
  └─→ running ──(questions event)──▶ waiting_for_input   [pi EXITED, session persisted]
        │                                └─→ running      [pi resumed via --session]
        ├─→ completed
        └─→ failed
```

`waiting_for_input` is now a **paused** state: the pi process has exited, the session is on
disk, and no runtime budget is consumed. pmai resumes it on answer (or on backend restart).

---

## pi Process Lifecycle (interactive)

> **Requires `--mode rpc`** and a persistent `--session-dir`.

```
pmai spawns pi (rpc mode, --session-dir <worktree>/.pmai/sessions)
  └─→ pi emits {"type":"session","id":...}         (pmai captures session id)
  └─→ pi emits {"type":"questions", ...}           (pmai → waiting_for_input)
  └─→ pi ends turn (terminate), pmai closes stdin → pi exits, session flushed to disk
  └─→ [user answers] pmai spawns pi --session <id> -p "<answers>"
  └─→ pi resumes, continues, may emit more questions
  └─→ {"type":"agent_settled"} or {"type":"agent_end"}  → pmai marks completed/failed
```

---

## pmai Implementation Notes

### DB columns (sessions table)

| Column | Type | Purpose |
|---|---|---|
| `session_type` | string | `"standard"` \| `"interactive"` |
| `pending_questions` | JSONB | Stored questions while `waiting_for_input` |
| `questions_stage` | string | Stage that emitted the pending questions |
| `questions_round` | int | Round number of pending questions |
| `pi_session_id` | string (nullable) | pi session id captured from the `session` event — used to resume |
| `pi_session_dir` | string (nullable) | absolute `--session-dir` path for the session (worktree-scoped) |

### REST endpoints

| Endpoint | Purpose |
|---|---|
| `GET /agent/sessions/{id}/questions` | Fetch pending questions for UI rendering |
| `POST /agent/sessions/{id}/answers` | Submit answers → **resume** the persisted session |

### Harness changes (`harness_subprocess.go`)

- Run `pi --mode rpc --session-dir <worktree>/.pmai/sessions ...` (drop `--no-session`).
- Capture the pi session id from the `session` event.
- On `questions`: set `waiting_for_input`, **close stdin** so pi exits and persists; keep the
  session in `waiting_for_input` (not `completed`).
- On resume: spawn `pi --session <id> --session-dir <dir> ... -p "<resume prompt>"` and drain
  stdout with the same event loop.
- On startup reconciliation: re-attach (`pi --session <id>`) instead of marking `failed`.

---

## Versioning

`PI_PMAI_CONTRACT_VERSION` env var, set by pmai when spawning pi. **Current version: 2.**

- v1: blocking stdin Q&A (deprecated).
- v2: persisted session + exit/resume (this document).

If the env var is absent, pi assumes standalone mode — file-based/TUI Q&A only (manual
workflow, unaffected).
