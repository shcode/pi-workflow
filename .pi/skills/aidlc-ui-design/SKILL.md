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

### Step 8: Show Storybook Start Instructions

Detect the package manager by checking project root for lock files in this order:

| Lock file | Command to start Storybook |
|---|---|
| `pnpm-lock.yaml` | `pnpm storybook` |
| `yarn.lock` | `yarn storybook` |
| `package-lock.json` | `npm run storybook` |
| none found | `npx storybook dev -p 6006` |

Also check whether Storybook is configured (look for `"storybook"` in `package.json` scripts or a `.storybook/` directory). If NOT configured, show the init command first:

```bash
npx storybook@latest init
```

Present the appropriate command(s) to the user clearly so they can start Storybook themselves.

### Step 9: Present Review Message

```markdown
# 🎨 UI Design Complete — [unit-name]

**Stories created:**
- `src/stories/ComponentA.stories.tsx` — N stories (default, primary, secondary, disabled, loading)
- `src/stories/ComponentB.stories.tsx` — N stories

**Reused without changes:** ComponentC

**Component inventory:** `aidlc-docs/construction/[unit-name]/ui-design/component-inventory.md`

> **💻 Start Storybook:**
> ```bash
> [detected-command]
> ```
> Then open **http://localhost:6006** in your browser.

> **🔍 Review checklist:**
> - [ ] All component variants render correctly
> - [ ] All interaction states (disabled, loading, error, empty) look right
> - [ ] Design System tokens are applied consistently
> - [ ] Accessibility annotations are present

> ✏️ **You can edit the story files directly** while Storybook is running — it will hot-reload.
> When you are done reviewing and editing, reply **"done"** and the agent will re-validate
> the stories before proceeding.
```

### Step 10: Wait for User to Finish Reviewing

Do NOT proceed until the user explicitly says they are done (e.g. "done", "looks good", "approved", "continue").

The user may edit story files directly during this window. That is expected and encouraged.

### Step 11: Re-validate Stories

After the user signals they are done, re-read all story files listed in the component inventory.

For each component in the **New Components** table:
- Re-read the story file at the path listed in `Story File` column
- Confirm the file still exists
- Confirm `Default` story export is present
- Confirm all variants listed in the `Variants` column have a corresponding story export
- Note any additions or removals the user made during editing
- Update the `component-inventory.md` **Variants** and **Status** columns to reflect the final state

Present a concise re-validation summary:

```markdown
## 🔄 Re-validation Summary

| Component | Stories Found | Changes Detected | Status |
|---|---|---|---|
| ComponentA | Default, Primary, Disabled | + Error variant added | ✅ Ready |
| ComponentB | Default, Secondary | No changes | ✅ Ready |
```

If any story file is missing or a listed variant has no export, flag it as **⚠ Needs Fix** and ask the user to resolve before continuing.

### Step 12: Final Approval Gate

```markdown
> **🚀 <u>**READY TO PROCEED?**</u>**
>
> All stories validated. You may:
>
> 🔧 **Request More Changes** — continue editing stories, reply "done" again when ready
> ✅ **Approve and Continue** — stories are locked as the implementation spec for Code Generation
```

### Step 13: Record Approval and Update Progress

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
