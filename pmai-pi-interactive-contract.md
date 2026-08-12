# pmai ↔ pi Interactive Session Contract

## Overview

This document defines the JSON event contract between pi (agent) and pmai (orchestrator)
for interactive sessions. It extends the existing JSONL event stream with two new event
types that enable pmai to surface questions to the user mid-session and feed answers back
to pi.

---

## Existing Event Stream (unchanged)

pi emits JSONL to stdout. pmai's poller reads and parses each line. Existing event types:

| Type | When emitted | pmai action |
|---|---|---|
| `agent_start` | pi process starts | Update session status → running |
| `tool_execution_end` | edit/write tool completes | Capture diff + file changes |
| `message_end` | assistant message completes | Capture output summary |

---

## New Event Types

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
        {"label": "B", "text": "OAuth2 / OIDC"},
        {"label": "C", "text": "API Key"},
        {"label": "D", "text": "Session-based (cookies)"}
      ],
      "multi_select": false,
      "required": true
    },
    {
      "id": "q2",
      "text": "Is this a greenfield or brownfield project?",
      "options": [
        {"label": "A", "text": "Greenfield — starting from scratch"},
        {"label": "B", "text": "Brownfield — existing codebase"}
      ],
      "multi_select": false,
      "required": true
    },
    {
      "id": "q3",
      "text": "Which extensions should be enabled?",
      "options": [
        {"label": "A", "text": "Security Baseline"},
        {"label": "B", "text": "Resiliency Baseline"},
        {"label": "C", "text": "Property-Based Testing"}
      ],
      "multi_select": true,
      "required": false
    }
  ]
}
```

**Fields**:

| Field | Type | Description |
|---|---|---|
| `type` | string | Always `"questions"` |
| `stage` | string | AIDLC stage that generated the questions (e.g. `"requirements"`, `"nfr"`, `"extensions"`) |
| `round` | int | Question round within the stage (1 = initial, 2+ = follow-up) |
| `questions[].id` | string | Stable identifier for the question within this stage+round |
| `questions[].text` | string | Full question text |
| `questions[].options` | array | Selectable options. Empty array = free-text answer |
| `questions[].multi_select` | bool | Whether multiple options can be selected |
| `questions[].required` | bool | Whether an answer is required before pi can continue |

**pmai behavior on receiving `questions`**:
1. Pause session — do NOT kill pi process, keep it alive waiting on stdin
2. Store questions in DB linked to session ID
3. Set session status → `waiting_for_input`
4. Notify user (in-app notification or UI state change)
5. Render interactive form in session detail view

---

### 2. `answers` (pmai → pi, via stdin)

After user submits answers in pmai UI, pmai writes a single JSON line to pi's stdin:

```json
{
  "type": "answers",
  "stage": "requirements",
  "round": 1,
  "answers": [
    {"id": "q1", "selected": ["B"], "free_text": null},
    {"id": "q2", "selected": ["A"], "free_text": null},
    {"id": "q3", "selected": ["A", "B"], "free_text": null}
  ]
}
```

**Fields**:

| Field | Type | Description |
|---|---|---|
| `type` | string | Always `"answers"` |
| `stage` | string | Must match the `stage` from the corresponding `questions` event |
| `round` | int | Must match the `round` from the corresponding `questions` event |
| `answers[].id` | string | Must match a `questions[].id` from the same stage+round |
| `answers[].selected` | array\<string\> | Selected option labels (e.g. `["A"]`, `["A","C"]`). Empty for free-text only |
| `answers[].free_text` | string\|null | Free-text answer when options don't apply or user selects "Other" |

**pi behavior on receiving `answers`**:
1. Parse the JSON line from stdin
2. Validate all required questions have answers
3. Continue execution using answers — no file writing needed
4. Emit next `questions` event if follow-up questions needed, or continue to next stage

---

## Session State Machine (extended)

```
pending
  └─→ running
        ├─→ waiting_for_input  (questions event emitted)
        │     └─→ running      (answers received via stdin)
        ├─→ completed
        └─→ failed
```

`waiting_for_input` is a sub-state of `running` — the pi process is still alive.
Timeout (TIME-01, 15 min) continues counting during `waiting_for_input`.
If timeout fires while waiting: session → `failed`, pi process killed.

**Implication**: pmai should notify user immediately when session enters
`waiting_for_input`. Long-idle interactive sessions will time out.

---

## pi Process Lifecycle in Interactive Mode

```
pmai spawns pi subprocess
  └─→ pi emits JSONL events to stdout
        ├─→ {"type": "questions", ...}   pi blocks reading stdin
        │         ↓
        │   pmai writes {"type": "answers", ...} to pi stdin
        │         ↓
        │   pi continues, may emit more questions
        ├─→ {"type": "message_end", ...}  final summary
        └─→ pi exits (stdout EOF)
```

pi must read stdin non-blocking during normal execution and blocking only when
explicitly waiting for answers (after emitting a `questions` event).

---

## pmai Implementation Notes

### New DB columns (sessions table)

| Column | Type | Purpose |
|---|---|---|
| `session_type` | string | `"standard"` \| `"interactive"` |
| `pending_questions` | JSONB | Stored questions while `waiting_for_input` |
| `questions_stage` | string | Stage that emitted the pending questions |
| `questions_round` | int | Round number of pending questions |

### New REST endpoints

| Endpoint | Purpose |
|---|---|
| `GET /agent/sessions/{id}/questions` | Fetch pending questions for UI rendering |
| `POST /agent/sessions/{id}/answers` | Submit user answers → feeds to pi stdin |

### Harness changes (`harness_subprocess.go`)

- Keep stdin pipe open for interactive sessions (`cmd.StdinPipe()`)
- On `questions` event: store pipe reference, update session status
- On `POST /answers`: write JSON line to stored stdin pipe, resume status
- Timeout behavior unchanged — clock keeps running during `waiting_for_input`

---

## pi Skills Implementation Notes

See `aidlc-questions` skill for the question emission rules. In pmai interactive mode:
- Use `{"type": "questions", ...}` stdout emission instead of file-based `[Answer]:` tags
- Block on stdin after emitting questions
- Parse `{"type": "answers", ...}` from stdin to get user responses
- Fall back to file-based format if not in pmai interactive mode (standalone pi usage unaffected)

---

## Versioning

This contract is versioned via a `PI_PMAI_CONTRACT_VERSION` environment variable
set by pmai when spawning pi. Pi checks this to determine which interactive features
are supported. Current version: `1`.

If the env var is absent, pi assumes standalone mode — file-based Q&A only.
