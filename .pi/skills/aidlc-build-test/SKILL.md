---
name: aidlc-build-test
description: >
  AIDLC Build and Test stage. Load during construction after all units complete to generate
  build instructions, unit test execution instructions, integration tests, performance tests,
  and additional tests as needed. Always executes after all units complete.
---

# Build and Test

**Purpose**: Build all units and execute comprehensive testing strategy

**Condition**: ALWAYS EXECUTE (after all units complete)

---

## Prerequisites
- Code Generation complete for all units
- All code artifacts generated
- Project ready for build and testing

---

## Step 0: Load Context

- [ ] Read `aidlc-docs/backlog.md` — all units should be `[done]`
- [ ] For each `[done]` unit: read `backlog/{unit}.md` and all artifacts under `construction/{unit}/` (functional-design, nfr-design, ui-design, infra-design, code)
- [ ] Read `aidlc-docs/inception/application-design/unit-of-work.md` (unit list and responsibilities)
- [ ] Read `aidlc-docs/inception/application-design/unit-of-work-dependency.md` (integration points)
- [ ] Read `GOAL.md` for project constraints

---

## Step 1: Analyze Testing Requirements

Determine appropriate testing strategy:
- **Unit tests**: Already generated per unit during code generation
- **Integration tests**: Test interactions between units/services
- **Performance tests**: Load, stress, scalability testing
- **End-to-end tests**: Complete user workflows
- **Contract tests**: API contract validation between services
- **Security tests**: Vulnerability scanning, penetration testing

---

## Step 2: Execute Build and Tests

**MANDATORY**: Run the build and test commands before generating any documentation.

### Destructive Command Guardrails

**NEVER run without explicit user confirmation:**
- Commands targeting production (`--env=prod`, `--stage=production`, production connection strings)
- `docker-compose down -v` (destroys volumes/data)
- `DROP DATABASE`, `DROP TABLE`, `DELETE FROM` without WHERE clause
- `rm -rf` on data directories or volumes
- Any command that destroys persistent state (databases, caches, message queues)

**Before running destructive test infrastructure commands**: confirm target is local/test, show command + effect, wait for explicit approval.

### 2.1 Run Build

Execute build command. Capture stdout/stderr.
- **If build succeeds**: proceed to 2.2
- **If build fails**: invoke Fix Loop (Step 2.5). Max 3 attempts.

### 2.2 Run Unit Tests

Execute unit test command. Capture output and coverage.

### 2.3 Run Integration Tests (if applicable)

Execute integration test command. Capture output.

### 2.4 Record Raw Results

Capture actual: pass/fail counts, coverage %, build time, error messages. These become the source of truth for all documentation in Steps 3–7.

---

## Step 2.5: Fix Loop (On Failure)

**Trigger**: Any test failure or build error in Step 2.

**Root Cause Iron Law**: See `aidlc-construction-rules` (already loaded). State root cause before touching any code.

**Process** (max 3 iterations per failure):
1. Apply Root Cause Iron Law from `aidlc-construction-rules`
2. Fix the identified issue
3. Re-run full test suite — show actual output before claiming fixed

**Escalate to user if**: 3 fix attempts exhausted, architectural change required, >3 unrelated failures.

```markdown
⚠️ **Build/Test failures could not be auto-resolved:**

| # | Test/Error | Root Cause | Attempts |
|---|---|---|---|
| 1 | `test_name` | [root cause] | 3 |

**Options:**
- 🔧 Fix manually and re-run
- 🔄 Let me try a different approach
- ⏭️ Skip this test and continue
```

---

## Step 3: Generate Build Instructions

Create `aidlc-docs/construction/build-and-test/build-instructions.md` based on actual build run:

Include: Prerequisites (tools, deps, env vars), Build Steps (install deps, configure env, build all units), actual output from Step 2.1, Troubleshooting.

---

## Step 4: Generate Unit Test Execution Instructions

Create `aidlc-docs/construction/build-and-test/unit-test-instructions.md` based on actual test run:

Include: run command, actual pass count + coverage from Step 2.2, coverage target, report location, fix steps if failing.

---

## Step 5: Generate Integration Test Instructions

Create `aidlc-docs/construction/build-and-test/integration-test-instructions.md`:

Include: test scenarios (unit A → B interactions), environment setup, run command, actual results from Step 2.3, cleanup.

---

## Step 6: Generate Performance Test Instructions (If Applicable)

Create `aidlc-docs/construction/build-and-test/performance-test-instructions.md`:

Include: performance requirements (response time, throughput, concurrency, error rate), test parameters, run commands, results analysis.

---

## Step 7: Generate Additional Test Instructions (As Needed)

- **Contract Tests** (`contract-test-instructions.md`): API contract validation, consumer-driven contracts, schema validation
- **Security Tests** (`security-test-instructions.md`): Vulnerability scanning, dependency checks, auth testing
- **End-to-End Tests** (`e2e-test-instructions.md`): Full user workflows, cross-service scenarios, UI testing

---

## Step 8: Generate Test Summary

Create `aidlc-docs/construction/build-and-test/build-and-test-summary.md` using **actual results from Step 2**:

| Section | Fields |
|---|---|
| Build Status | Tool, status, artifacts, time |
| Unit Tests | Total, passed, failed, coverage%, status |
| Integration Tests | Scenarios, passed, failed, status |
| Performance Tests | Response time, throughput, error rate (actual vs target) |
| Additional Tests | Contract/Security/E2E: Pass/Fail/N/A |
| Overall | Build pass?, All tests pass?, Ready for operations? |

---

## Step 9: Update State Tracking

Update `aidlc-docs/aidlc-state.md`:
- Mark Build and Test stage as complete
- Update current status

---

## Step 10: Present Results to User

**Verification Iron Law** (from `aidlc-construction-rules`): Run full test suite one final time and include actual output before presenting. Never claim passing without fresh evidence.

```markdown
# 🔨 Build and Test Complete

[AI Summary - bullet points of build status and test results by category]

> **📋 <u>**REVIEW REQUIRED:**</u>**
> Please examine build and test summary at:
> `aidlc-docs/construction/build-and-test/build-and-test-summary.md`

> **🚀 <u>**WHAT'S NEXT?**</u>**
>
> **You may:**
>
> 🔧 **Request Changes** - Ask for modifications to build/test instructions
> ✅ **Approve & Continue** - Approve and proceed to **Operations**
```

---

## Step 11: Log Interaction

**MANDATORY**: Log in `audit.md`:

```markdown
## Build and Test Stage
**Timestamp**: [ISO timestamp]
**Build Status**: [Success/Failed]
**Test Status**: [Pass/Fail]
**Files Generated**:
- build-instructions.md
- unit-test-instructions.md
- integration-test-instructions.md
- performance-test-instructions.md
- build-and-test-summary.md

---
```
