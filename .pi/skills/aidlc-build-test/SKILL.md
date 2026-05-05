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

## Step 1: Analyze Testing Requirements

Determine appropriate testing strategy:
- **Unit tests**: Already generated per unit during code generation
- **Integration tests**: Test interactions between units/services
- **Performance tests**: Load, stress, scalability testing
- **End-to-end tests**: Complete user workflows
- **Contract tests**: API contract validation between services
- **Security tests**: Vulnerability scanning, penetration testing

---

## Step 2: Generate Build Instructions

Create `aidlc-docs/construction/build-and-test/build-instructions.md`:

Include sections: Prerequisites (tool, deps, env vars, system reqs), Build Steps (install deps, configure env, build all units, verify success), Troubleshooting.

---

## Step 3: Generate Unit Test Execution Instructions

Create `aidlc-docs/construction/build-and-test/unit-test-instructions.md`:

Include: run command, expected pass count, coverage target, report location, fix steps if failing.

---

## Step 4: Generate Integration Test Instructions

Create `aidlc-docs/construction/build-and-test/integration-test-instructions.md`:

Include: test scenarios (unit A → B interactions), environment setup, run command, expected results, cleanup.

---

## Step 5: Generate Performance Test Instructions (If Applicable)

Create `aidlc-docs/construction/build-and-test/performance-test-instructions.md`:

Include: performance requirements (response time, throughput, concurrency, error rate), test parameters (duration, ramp-up, virtual users), run commands (load + stress), results analysis.

---

## Step 6: Generate Additional Test Instructions (As Needed)

- **Contract Tests** (`contract-test-instructions.md`): API contract validation, consumer-driven contracts, schema validation
- **Security Tests** (`security-test-instructions.md`): Vulnerability scanning, dependency checks, auth testing
- **End-to-End Tests** (`e2e-test-instructions.md`): Full user workflows, cross-service scenarios, UI testing

---

## Step 7: Generate Test Summary

Create `aidlc-docs/construction/build-and-test/build-and-test-summary.md`:

| Section | Fields |
|---|---|
| Build Status | Tool, status, artifacts, time |
| Unit Tests | Total, passed, failed, coverage%, status |
| Integration Tests | Scenarios, passed, failed, status |
| Performance Tests | Response time, throughput, error rate (actual vs target) |
| Additional Tests | Contract/Security/E2E: Pass/Fail/N/A |
| Overall | Build pass?, All tests pass?, Ready for operations? |

---

## Step 8: Execute Build and Tests

**MANDATORY**: Actually run the build and test commands, don't just document them.

### 8.1 Run Build

Execute the build command from `build-instructions.md`. Capture stdout/stderr.

- **If build succeeds**: proceed to 8.2
- **If build fails**: log error, attempt fix (see Fix Loop below), re-run. Max 3 attempts.

### 8.2 Run Unit Tests

Execute unit test command. Capture output and coverage.

### 8.3 Run Integration Tests (if applicable)

Execute integration test command. Capture output.

### 8.4 Record Results

Update `build-and-test-summary.md` with actual results (not placeholders):
- Real pass/fail counts from test output
- Actual coverage percentage
- Real build time
- Actual error messages if any

---

## Step 8.5: Fix Loop (On Failure)

**Trigger**: Any test failure or build error in Step 8.

**Process** (max 3 iterations per failure):
1. Parse the error output — identify failing test name + error message
2. Read the failing test file and the source file it tests
3. Read relevant design document for context
4. Identify root cause (implementation bug vs test bug vs design mismatch)
5. **If implementation bug**: fix the source file, re-run failing test
6. **If test bug**: fix the test, re-run
7. **If design mismatch**: trigger Mid-Construction Design Change (from `aidlc-common`)
8. After fix, re-run the full test suite to check for regressions

**Escalate to user if**:
- 3 fix attempts exhausted without resolution
- Fix requires architectural change
- Multiple unrelated failures (>3 distinct errors)
- Unclear whether source or test is wrong

**On escalation**:
```markdown
⚠️ **Build/Test failures could not be auto-resolved:**

| # | Test/Error | Attempts | Last Error |
|---|---|---|---|
| 1 | `test_name` | 3 | `error message` |

**Options:**
- 🔧 Fix manually and re-run
- 🔄 Let me try a different approach
- ⏭️ Skip this test and continue
```

---

## Step 9: Update State Tracking

Update `aidlc-docs/aidlc-state.md`:
- Mark Build and Test stage as complete
- Update current status

---

## Step 10: Present Results to User

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
