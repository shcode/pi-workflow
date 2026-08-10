---
name: aidlc-extensions
description: >
  AIDLC Extensions Manager. Load at workflow start to discover and handle opt-in extensions
  like security baseline or property-based testing. Scans extensions directory recursively,
  presents opt-in prompts during Requirements Analysis, and enforces enabled extension rules
  as hard constraints at each stage. Skips disabled extensions.
---

# Extensions Manager

**Purpose**: Discover, present, and enforce AIDLC extensions

**Condition**: Load at workflow start

---

## Discovery Process

### Step 1: Scan Extensions Directory

At workflow start, scan `.pi/skills/aidlc-extensions/` for `*.opt-in.md` files.

### Step 2: Load Opt-In Files

In each subdirectory, load ONLY `*.opt-in.md` files. These contain the extension's opt-in prompt.

**Loading rules**:
- Load ONLY lightweight opt-in files at workflow start
- Do NOT load full rule files at this stage
- Full rule files load on-demand after user opts in

### Step 3: Derive Full Rule File Names

The corresponding rules file is in the same directory, derived by convention:
- Strip `.opt-in.md` suffix
- Append `.md`
- Example: `.pi/skills/aidlc-extensions/security-baseline.opt-in.md` → `.pi/skills/aidlc-extensions/security-baseline.md`

---

## Opt-In Mechanism

### On Resume

When `aidlc-docs/aidlc-state.md` already exists (cold resume):
1. Skip the Discovery Process and opt-in prompts entirely
2. Read `## Extensions` table in `aidlc-state.md`
3. For each entry with `Enabled: Yes`: load its full rules file now (derive path by convention)
4. For each entry with `Enabled: No`: skip — do NOT load
5. Do NOT re-present opt-in questions to user

### During Requirements Analysis

Opt-in prompts from loaded `*.opt-in.md` files are presented to user as part of clarifying questions. Present each opt-in question in the same language as the user's conversation.

After receiving answers:
1. Record each extension's enablement status in `aidlc-docs/aidlc-state.md` under `## Extensions` (compact table):

```markdown
## Extensions
| Name | Enabled |
|------|---------|
| [Extension Name] | [Yes/No] |
```

2. **Deferred Rule Loading**:
   - **Opted IN**: Load full rules file now (derived by naming convention)
   - **Opted OUT**: Do NOT load full rules file - saves context

### Extensions Without Opt-In Files

Extensions without a matching `*.opt-in.md` file are ALWAYS enforced. Load their rule files immediately at workflow start.

---

## Enforcement Rules

### Conditional Enforcement

Before enforcing ANY extension at ANY stage:
1. Check its `Enabled` status in `aidlc-docs/aidlc-state.md` under `## Extensions`
2. Skip disabled extensions and log the skip in `audit.md`
3. Default to enforced if no configuration exists

### Hard Constraints

Extension rules are hard constraints, not optional guidance:
- At each stage, intelligently evaluate which extension rules are applicable
- Enforce only rules relevant to current stage's purpose, artifacts, and context
- Rules not applicable should be marked N/A in compliance summary
- **Non-compliance with any applicable enabled extension rule is BLOCKING**
- Do NOT present stage completion until resolved

### Compliance Summary

When presenting stage completion, include extension rule compliance summary:
```markdown
## Extension Compliance
| Extension Rule | Status | Rationale |
|---|---|---|
| [Rule Name] | [Compliant/Non-compliant/N/A] | [Brief rationale] |
```

---

## Known Extensions

### Security Baseline
- **Opt-in file**: `.pi/skills/aidlc-extensions/security-baseline.opt-in.md`
- **Full rules**: `.pi/skills/aidlc-extensions/security-baseline.md`
- **When to enforce**: All stages producing code or infrastructure artifacts

### Property-Based Testing
- **Opt-in file**: `.pi/skills/aidlc-extensions/property-based-testing.opt-in.md`
- **Full rules**: `.pi/skills/aidlc-extensions/property-based-testing.md`
- **When to enforce**: Code Generation stage, especially for business logic and data transformations

---

## Audit Logging

**MANDATORY**: Log all extension-related actions:
- Extensions discovered during scan
- Opt-in prompts presented to user
- User's enablement decisions
- Extension rules loaded
- Extensions skipped (with reason)
- Compliance findings per stage
