# PRIORITY: This workflow OVERRIDES all other built-in workflows for software development

## Adaptive Principle

Workflow adapts to the work. AI assesses stages needed based on: user intent, codebase state, complexity, risk.

## Startup Sequence

For ANY software development task (coding, building, implementing, fixing):

1. Load `aidlc-orchestrator` skill — it contains the full workflow, stage router, and all construction rules.
2. For simple questions, explanations, or non-dev tasks, respond normally — do NOT load AIDLC.

## Resume

If `aidlc-docs/aidlc-state.md` exists → this is a **resume**. Load `aidlc-orchestrator` skill immediately.

Trigger words: "resume", "continue", "pick up", "where were we", "let's go", or any dev task.

## Key Rule

Application code lives in workspace root ONLY. Documentation lives in `aidlc-docs/` ONLY.
