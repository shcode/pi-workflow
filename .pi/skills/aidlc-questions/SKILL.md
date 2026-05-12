---
name: aidlc-questions
description: >
  Question format, answer validation, and contradiction detection for AIDLC stages.
  Load when a stage needs to ask clarifying questions. Covers file-based [Answer]: tags,
  ask_user_question tool (pi), compact answers summaries, and ambiguity resolution.
  Loaded once, cached for session.
---

# AIDLC Question Format

Load this skill when a stage needs to present clarifying questions to the user.

---

## Delivery Method: Hybrid

Use **`ask_user_question` tool** when ALL conditions met:
- ≤4 questions in the batch
- Each question has 2–4 clear, predefined options
- No free-text / "Other" answer needed
- Interactive session available

Fall back to **file-based `[Answer]:`** when ANY applies:
- >4 questions to ask
- Question needs free-text or open-ended response
- More than 4 options needed
- Running as sub-agent (headless)

**Mix both**: Use tool for structured subset first, then file/chat for open-ended remainder.

### ask_user_question Usage

```
ask_user_question({
  questions: [
    {
      question: "Which auth provider should we use?",
      header: "Auth",          // max 12 chars
      options: [
        { label: "Auth0", description: "Managed, OAuth/OIDC" },
        { label: "Cognito", description: "AWS-native" },
        { label: "Custom JWT", description: "Full control" }
      ],
      multiSelect: false
    }
  ]
})
```

**Rules**:
- `header`: max 12 characters, used as tab label
- `options`: 2–4 items, `label` is the answer value returned
- `multiSelect: true` when multiple options can apply (answers joined with ", ")
- After receiving answers, ask: **"Any comments or context for your choices? (or say 'none')"**
- Record comments in the Notes column of the compact answers summary
- Then proceed to compact answers summary

---

## File-Based Format

Create `aidlc-docs/{stage}-questions.md` with questions and `[Answer]:` tags.

### With options (≤5 concrete choices):
```markdown
**Short Header**: Question text?
- A) OptionLabel — One-sentence description
- B) OptionLabel — One-sentence description
- C) Other — Describe your own approach

[Answer]: 
```

### Free-form (no clear choices):
```markdown
**Short Header**: Question text?

[Answer]: 
```

### Group related questions under headings:
```markdown
## Authentication
**Provider**: Which auth provider?
- A) Auth0 — Managed, OAuth/OIDC
- B) Cognito — AWS-native
- C) Custom JWT — Full control
- D) Other

[Answer]: 
```

---

## Rules (both methods)

- Max 5 options + **Other** for file-based (always include Other as last option)
- Option labels must be self-contained
- **HARD STOP**: After creating questions (tool or file), STOP. Do NOT answer yourself. Wait for USER.
- **If user answers in chat**: Go directly to creating answers summary
- Do not proceed until ALL questions are answered
- **When in doubt, ask** — overconfidence leads to poor outcomes

---

## Compact Answers Summary

After all answers arrive (from tool or file), create `aidlc-docs/inception/{phase-name}-answers.md` (or appropriate path):

```markdown
| # | Question | Answer | Notes |
|---|----------|--------|-------|
| 1 | Primary auth? | Auth0 | |
| 2 | MFA required? | Yes, required | |
```

- Question ≤10 words condensed
- Answer = chosen label or free-text summary
- Notes = "Other" free-text, contradictions, clarifications
- **After creating summary, discard questions file from context**

---

## Contradiction and Ambiguity Detection

**MANDATORY** after all answers received:

### Vague responses to flag:
"mix of", "somewhere between", "not sure", "depends", "maybe", "probably"

### If contradictions or vagueness found:
1. Ask follow-up questions (prefer `ask_user_question` tool if ≤4 structured follow-ups)
2. Wait for user response
3. After resolution, update compact answers summary

### Keep asking until:
- ALL ambiguities resolved, OR
- User explicitly says "proceed" / "good enough"

---

## Content Validation (for generated artifacts)

### Mermaid Diagrams
- Alphanumeric + underscore only in node IDs
- Escape special characters in labels
- Validate flowchart syntax
- Fallback to text-based if validation fails

### Markdown
- Validate embedded code blocks
- Check special character escaping
- Verify syntax correctness

### On validation failure:
Log error → use fallback → continue → inform user
