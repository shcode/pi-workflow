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

### Step 3: Q&A

Load `aidlc-stage-common` for Two-Part planning Q&A with:
- Plan path: `inception/plans/story-generation-plan.md`
- Questions path: `inception/plans/story-generation-questions.md`
- Answers path: `inception/user-stories/answers.md`
- Categories:
  - **User Personas** — User types, roles, characteristics, motivations
  - **Story Granularity** — Detail level, story size, breakdown approach
  - **Story Format** — Format preferences, template usage, documentation standards
  - **Breakdown Approach** — Organization method, prioritization, grouping
  - **Acceptance Criteria** — Detail level, format, testing approach
  - **User Journeys** — Workflows, interaction patterns, experience flows
  - **Business Context** — Goals, success metrics, stakeholder needs
  - **Technical Constraints** — Limitations, integration requirements, boundaries

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

### Step 6: Approval

Save plan. Present to user, wait for explicit approval before generation. Log approval prompt + response in `audit.md`.

---

## PART 2: GENERATION

Load `aidlc-stage-common` for Two-Part generation flow:
1. Load `aidlc-docs/inception/plans/story-generation-plan.md`, find next uncompleted step
2. Execute steps sequentially, mark `[x]` after each, update `aidlc-state.md`
3. Verify all mandatory artifacts generated (stories.md, personas.md)
4. Load `aidlc-stage-common` completion message for: "📚 User Stories", `aidlc-docs/inception/user-stories/`, "Workflow Planning"
5. Load `aidlc-stage-common` approval gate. On approval: log in `audit.md`, mark User Stories `[x]` in `aidlc-state.md`.

---

## Critical Rules

### Planning Phase
- **Validate need first** — create assessment doc before planning
- **Present story options** — offer 5 approaches with trade-offs
- Get explicit user approval before generation

### Generation Phase
- **NO HARDCODED LOGIC**: Only execute what's written in the plan
- **FOLLOW PLAN EXACTLY**: Do not deviate from step sequence
- **UPDATE CHECKBOXES**: Mark [x] immediately after completing each step
- **USE APPROVED METHODOLOGY**: Follow story approach from Planning
- **VERIFY COMPLETION**: Ensure all artifacts complete before proceeding
