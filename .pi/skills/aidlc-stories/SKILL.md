---
name: aidlc-stories
description: >
  AIDLC User Stories stage. Load during inception when user-facing features exist,
  multiple personas involved, or complex business requirements need acceptance criteria.
  Skip for pure internal refactoring, simple bug fixes, or infrastructure-only changes.
  Has two parts: Planning (questions + approval) and Generation (execute approved plan).
---

# User Stories

**Purpose**: Convert requirements into user-centered stories with acceptance criteria

**Condition**: CONDITIONAL

---

## Intelligent Assessment

### ALWAYS Execute IF
- New user-facing features or functionality
- Changes affecting user workflows or interactions
- Multiple user types or personas involved
- Complex business requirements with acceptance criteria needs
- Cross-functional team collaboration required
- Customer-facing API or service changes
- New product capabilities or enhancements

### LIKELY Execute IF (Assess Complexity)\- Modifications to existing user-facing features
- Backend changes that indirectly affect user experience
- Integration work impacting user workflows
- Performance improvements with user-visible benefits
- Security enhancements affecting user interactions
- Data model changes affecting user data or reports

### SKIP ONLY IF
- Pure internal refactoring with zero user impact
- Simple bug fixes with clear, isolated scope
- Infrastructure changes with no user-facing effects
- Technical debt cleanup with no functional changes
- Developer tooling or build process improvements
- Documentation-only updates

### Default Decision Rule
**When in doubt, include user stories AND ask clarifying questions.**

---

## PART 1: PLANNING

### Step 1: Validate Need (MANDATORY)

Create `aidlc-docs/inception/plans/user-stories-assessment.md`:
```markdown
# User Stories Assessment

## Request Analysis
- **Original Request**: [Brief summary]
- **User Impact**: [Direct/Indirect/None]
- **Complexity Level**: [Simple/Medium/Complex]
- **Stakeholders**: [List involved parties]

## Assessment Criteria Met
- [ ] High Priority: [List applicable criteria]
- [ ] Medium Priority: [List applicable criteria with justification]
- [ ] Benefits: [Expected value]

## Decision
**Execute User Stories**: [Yes/No]
**Reasoning**: [Detailed justification]
```

### Step 2: Create Story Plan

- Assume role of product owner
- Generate comprehensive plan with checkbox [] for each step
- Focus on methodology and approach

### Step 3: Generate Context-Appropriate Questions

**DIRECTIVE**: Analyze requirements and context to identify ALL areas where clarification improves story quality.

**CRITICAL**: Default to asking questions when ANY ambiguity exists. Better to ask too many than create incomplete stories.

Use pi-answer inline format with headers, option labels, and descriptions (see `aidlc-common`). Evaluate ALL categories:
- **User Personas** - User types, roles, characteristics, motivations
- **Story Granularity** - Detail level, story size, breakdown approach
- **Story Format** - Format preferences, template usage, documentation standards
- **Breakdown Approach** - Organization method, prioritization, grouping
- **Acceptance Criteria** - Detail level, format, testing approach
- **User Journeys** - Workflows, interaction patterns, experience flows
- **Business Context** - Goals, success metrics, stakeholder needs
- **Technical Constraints** - Limitations, integration requirements, boundaries

### Step 4: Include Mandatory Artifacts in Plan

- [ ] Generate `stories.md` with user stories following INVEST criteria
- [ ] Generate `personas.md` with user archetypes and characteristics
- [ ] Ensure stories are Independent, Negotiable, Valuable, Estimable, Small, Testable
- [ ] Include acceptance criteria for each story
- [ ] Map personas to relevant user stories

### Step 5: Present Story Options

Include different approaches:
- **User Journey-Based**: Stories follow user workflows
- **Feature-Based**: Stories organized around system features
- **Persona-Based**: Stories grouped by user types
- **Domain-Based**: Stories organized around business domains
- **Epic-Based**: Hierarchical epics with sub-stories

Explain trade-offs and benefits of each.

### Step 6: Store Story Plan

Save as `aidlc-docs/inception/plans/story-generation-plan.md`

### Steps 7-8: Collect Answers

Wait for answers — via `/answer` or chat reply. Do not proceed until ALL submitted.

### Step 9: ANALYZE ANSWERS (MANDATORY)

Review for vague responses: "mix of", "somewhere between", "not sure", "depends"

### Step 10: MANDATORY Follow-up Questions

If ANY ambiguous answers, create clarification questions. DO NOT proceed until resolved.

### Steps 11-14: Approval

- Avoid implementation details in planning
- Log approval prompt in `audit.md`
- Wait for explicit approval of plan
- Record approval response

---

## PART 2: GENERATION

### Step 15: Load Story Generation Plan

Read `aidlc-docs/inception/plans/story-generation-plan.md`
Identify next uncompleted step.

### Step 16: Execute Current Step

Perform exactly what the step describes. Generate story artifacts per plan.

### Step 17: Update Progress

Mark completed step as [x]. Update `aidlc-state.md`.

### Step 18: Continue or Complete

Return to Step 15 if more steps remain. Verify all mandatory artifacts generated.

### Step 19-22: Approval of Generated Stories

Log approval prompt. Present completion message:

```markdown
# 📚 User Stories Complete

[AI Summary - bullet points of personas and stories]

> **📋 <u>**REVIEW REQUIRED:**</u>**
> Please examine user stories and personas at:
> `aidlc-docs/inception/user-stories/stories.md`
> `aidlc-docs/inception/user-stories/personas.md`

> **🚀 <u>**WHAT'S NEXT?**</u>**
>
> **You may:**
>
> 🔧 **Request Changes** - Ask for modifications
> ✅ **Approve & Continue** - Approve and proceed to **Workflow Planning**
```

Wait for explicit approval. Record response.

---

## Critical Rules

### Planning Phase
- Generate ONLY context-relevant questions
- Use pi-answer inline format (see `aidlc-common`)
- Analyze ALL answers for ambiguities before proceeding
- Resolve ALL ambiguities with follow-up questions
- Get explicit user approval before generation

### Generation Phase
- **NO HARDCODED LOGIC**: Only execute what's written in the plan
- **FOLLOW PLAN EXACTLY**: Do not deviate from step sequence
- **UPDATE CHECKBOXES**: Mark [x] immediately after completing each step
- **USE APPROVED METHODOLOGY**: Follow story approach from Planning
- **VERIFY COMPLETION**: Ensure all artifacts complete before proceeding
