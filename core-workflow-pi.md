# AIDLC Workflow Active

This project uses the **AI-Driven Development Life Cycle** (AIDLC).

## Rules

- For ANY software development task (coding, building, implementing, fixing), load `/skill:aidlc-orchestrator` first.
- For simple questions, explanations, or non-dev tasks, respond normally — do NOT load AIDLC.
- If `aidlc-docs/aidlc-state.md` exists, this is a **resume** — read it and present the Welcome Back prompt immediately, regardless of what the user says.
- Trigger words for resume: "resume", "continue", "pick up", "where were we", "let's go", or any dev task.
- Application code lives in workspace root ONLY. Documentation lives in `aidlc-docs/` ONLY.
