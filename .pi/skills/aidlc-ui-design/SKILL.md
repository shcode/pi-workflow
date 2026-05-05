---
name: aidlc-ui-design
description: >
  AIDLC UI Design stage. Load during construction per-unit when new UI components are needed.
  Creates Storybook stories for Design System components. All new UI components MUST be
  created in Storybook first and explicitly approved before proceeding to code generation.
  Skip if no new UI components required.
---

# UI Design

**Purpose**: Specify and approve all new UI components via Storybook stories before any implementation code is written.

**Condition**: CONDITIONAL (per-unit)

**Focus**:
- Component API design (props, variants, states)
- Storybook story creation (Component Story Format v3)
- Design System token compliance
- Accessibility requirements
- Hard approval gate before Code Generation

---

## Skip Conditions

Skip this stage entirely if:
- Unit has no UI/frontend components
- All needed components already exist in the Design System or codebase
- Unit is backend-only (API, database, infrastructure, CLI)

When skipping: log skip reason in `audit.md`, proceed directly to Code Generation.

---

## Prerequisites

- Functional Design complete (if applicable) — read `frontend-components.md`
- Application Design complete — component boundaries understood
- Tech stack confirmed (React/Vue/Svelte/etc. + Design System library)

---

## Steps to Execute

### Step 1: Identify UI Components

Read from:
- `aidlc-docs/construction/{unit-name}/functional-design/frontend-components.md` (if exists)
- `aidlc-docs/inception/application-design/` — component boundaries and responsibilities

Produce a list of:
- **New components** — need stories (target of this stage)
- **Reused components** — already exist, no stories needed, note the source

### Step 2: Create UI Design Plan

Generate plan with checkboxes [] listing each component to create a story for.

### Step 3: Generate Context-Appropriate Questions

**DIRECTIVE**: Clarify all ambiguities before creating any stories.

Use [Answer]: tag format. Evaluate ALL categories:
- **Design System** — Which library? (MUI, Ant Design, Shadcn, Radix, Tailwind, custom)
- **Component Scope** — Which components are truly new vs reuse/extend of existing?
- **Visual Variants** — Sizes, colors, themes (e.g., primary/secondary/destructive)
- **Interaction States** — Hover, focus, active, loading, disabled, error, success, empty
- **Responsive Behavior** — Breakpoints, mobile vs desktop layout differences
- **Accessibility** — ARIA roles, keyboard navigation, screen reader requirements
- **Design Tokens** — Token namespace, existing palette, any missing tokens to define
- **Story Depth** — Atomic/component-only stories, or include page/feature-level stories?

### Step 4: Store Plan

Save as `aidlc-docs/construction/plans/{unit-name}-ui-design-plan.md`

### Step 5: Collect and Analyze Answers

Wait for ALL [Answer]: tags. Add follow-up questions for any unclear responses. Do not proceed until ALL ambiguities resolved.

### Step 6: Create Storybook Stories

**HARD RULE**: Stories are written BEFORE any component implementation code exists.
If the component file does not exist yet, create a stub (`export function ComponentName() { return null; }`) so the story can import it — the stub will be replaced during Code Generation.

#### Story file path convention

```
src/stories/{ComponentName}.stories.tsx   # React + TypeScript (adjust for stack)
```

#### CSF3 story template

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from '../components/ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Design System/{Category}/{ComponentName}',
  component: ComponentName,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'One-line description of component purpose and when to use it.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'destructive'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Component size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables all interactions',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default — most common real-world usage
export const Default: Story = {
  args: {
    // minimal required props
  },
};

// Visual variants
export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Destructive: Story = { args: { variant: 'destructive' } };

// Interaction states
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { isLoading: true } };

// Edge cases
export const LongContent: Story = {
  args: { children: 'This is a very long label that tests overflow behavior' },
};
```

#### Required story coverage

Every component story MUST include:
- `Default` — most common usage with realistic content
- One story per visual `variant`
- `Disabled` state (if component can be disabled)
- `Loading` state (if component has async behavior)
- `Error` state (if component shows validation errors)
- `Empty` state (if component can be empty/no data)
- `LongContent` or edge-case story where overflow/truncation may occur

#### Design token compliance

- Use design system token references only — no hardcoded hex colors, px values, or magic numbers
- Every `argTypes` entry must reference the token name in its `description`
- Flag any design gaps (missing tokens, inconsistent spacing) in the component inventory doc

### Step 7: Create Component Inventory Document

Save `aidlc-docs/construction/{unit-name}/ui-design/component-inventory.md`:

```markdown
# UI Component Inventory — {unit-name}

## New Components (stories required)

| Component | Story File | Variants | Status |
|---|---|---|---|
| ComponentName | src/stories/ComponentName.stories.tsx | default, primary, disabled, loading | ⏳ Pending |

## Reused Components (no stories needed)

| Component | Source | Notes |
|---|---|---|
| Button | @design-system/core | Use existing `variant="primary"` |

## Design Tokens

| Token | Usage | Defined? |
|---|---|---|
| colors.primary.500 | Button background | ✓ |
| spacing.component.gap | Internal padding | ✓ |

## Design Gaps (missing tokens or patterns)

- [ ] List any tokens that don't exist yet and need to be added to the design system
```

### Step 8: Launch Storybook

**Purpose**: Give the user a live view of all created stories before approval is requested.

#### 8a. Detect package manager

Check project root for lock files in this order:

| Lock file | Run command |
|---|---|
| `pnpm-lock.yaml` | `pnpm storybook` |
| `yarn.lock` | `yarn storybook` |
| `package-lock.json` | `npm run storybook` |
| none found | `npx storybook dev -p 6006` |

#### 8b. Check if Storybook is configured

Look for either:
- `"storybook"` key in `package.json` → `scripts`
- `.storybook/` directory in project root

**If NOT configured** — initialise first:
```bash
npx storybook@latest init --yes
```
Wait for init to complete before proceeding.

#### 8c. Start Storybook server

Run the appropriate start command (from 8a). Storybook defaults to **http://localhost:6006**.

> **Note**: First run may take 30–60 seconds to compile.

### Step 9: Present Completion Message

```markdown
# 🎨 UI Design Complete — [unit-name]

**New component stories created:**
- `src/stories/ComponentA.stories.tsx` — N stories (default, primary, secondary, disabled, loading)
- `src/stories/ComponentB.stories.tsx` — N stories

**Reused without changes:** ComponentC (existing design system)

**Component inventory:** `aidlc-docs/construction/[unit-name]/ui-design/component-inventory.md`

> **📋 <u>**REVIEW REQUIRED:**</u>**
> Storybook is running at **http://localhost:6006**
> 1. Open the URL in your browser
> 2. Review all component variants and states
> 3. Verify Design System token usage
> 4. Check accessibility annotations

> **🚀 <u>**WHAT'S NEXT?**</u>**
>
> **You may:**
>
> 🔧 **Request Changes** — Modify component API, add/remove variants, adjust tokens
> ✅ **Approve and Continue** — Proceed to Code Generation (stories become the implementation spec)
```

### Step 10: Wait for Explicit Approval

**HARD RULE**: Do NOT write any component implementation code until user explicitly approves stories.

Approval means the user has opened Storybook, reviewed all components in the browser, and confirmed the API, variants, and states are correct.

### Step 11: Record Approval and Update Progress

Log approval in `audit.md`. Mark UI Design complete in `aidlc-state.md`.

---

## Design-First Enforcement During Code Generation

Pass to `aidlc-code-gen`:
- Component inventory: `aidlc-docs/construction/{unit-name}/ui-design/component-inventory.md`
- Story files: `src/stories/*.stories.tsx`

`aidlc-code-gen` MUST:
- Implement components to match approved story specs exactly (same props, variants, states)
- Replace stubs with real implementations — never alter the story file
- Never create a new UI component without a corresponding approved story

If a **new component is discovered** during Code Generation:
1. **Pause** Code Generation
2. Return to UI Design — create story for the new component
3. Get explicit approval
4. Resume Code Generation
