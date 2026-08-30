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

**Skip if**: No UI/frontend components, all needed components already exist, backend-only unit. Log skip reason in `audit.md`.

---

## Mode: Greenfield vs Brownfield

Check `aidlc-state.md` Project section for brownfield flag before Step 1.

| | Greenfield | Brownfield |
|---|---|---|
| Component source | New — designed this stage | Existing in codebase |
| Story purpose | Spec for Code Generation | Living docs + visual regression baseline |
| Stub needed? | Yes — wireframe stub first | No — import real implementation |
| Variants | Design freely | Only document what exists |

---

## Steps

### Step 1: Identify UI Components

Read: `aidlc-docs/construction/{unit-name}/functional-design/frontend-components.md` (if exists), `aidlc-docs/inception/application-design/` component boundaries.

**Brownfield only**: Also read `aidlc-docs/inception/reverse-engineering/component-inventory.md`. Scan source `.tsx/.jsx/.vue/.svelte` files to find existing components.

Produce: list of **new components** (target of this stage) and **reused components** (already have stories, no action needed).

### Step 2: Create UI Design Plan + Questions

Generate plan listing each component to story. Load `aidlc-questions` skill if not cached.

Clarify all ambiguities:
- **Design System** — which library? (MUI, Ant Design, Shadcn, Radix, Tailwind, custom)
- **Component Scope** — truly new vs reuse/extend existing?
- **Variants** — sizes, colors, themes
- **States** — hover, focus, active, loading, disabled, error, success, empty
- **Responsive** — breakpoints, mobile vs desktop
- **Accessibility** — ARIA roles, keyboard nav, screen reader
- **Design Tokens** — namespace, palette, missing tokens
- **Story Depth** — atomic only, or page/feature-level too?

Save plan to `aidlc-docs/construction/plans/{unit-name}-ui-design-plan.md`. Save questions with `[Answer]:` tags to `{unit-name}-ui-design-questions.md`. **STOP — wait for user answers. Do NOT write answers yourself.**

### Step 3: Establish Design Direction

Document in the UI design plan before creating stories:

```markdown
## Design Direction
- **Tone**: [e.g., brutally minimal, luxury/refined, playful, editorial]
- **Differentiation**: [One key visual idea that makes this UI memorable]
- **Typography**: [Display font + body font. NEVER: Inter, Roboto, Arial, Space Grotesk, system-ui]
- **Color**: [Dominant + accent. Cohesive palette via CSS variables]
- **Motion**: [Key animation moments — load, transitions, hover]
- **Spatial**: [Layout approach — asymmetry, generous whitespace, controlled density]
```

**Never**: purple/blue gradients on white, cookie-cutter card layouts, generic hero sections, timid evenly-distributed palettes.

### Step 4: Create Storybook Stories

**Greenfield hard rule**: Stories written BEFORE any component implementation exists. Create wireframe stub at `aidlc-docs/storybook/stubs/{ComponentName}.tsx`:

```tsx
export function ComponentName(props: Record<string, any>) {
  return (
    <div style={{ border: '2px dashed #888', borderRadius: 8, padding: 16, fontFamily: 'monospace', fontSize: 12 }}>
      <strong>ComponentName</strong>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  );
}
```

**Brownfield**: Import real implementation directly — no stubs.

#### Story file: `aidlc-docs/storybook/{ComponentName}.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './stubs/ComponentName'; // greenfield
// import { ComponentName } from '<actual-path>'; // brownfield

const meta: Meta<typeof ComponentName> = {
  title: 'Design System/{Category}/{ComponentName}',
  component: ComponentName,
  parameters: { layout: 'centered', docs: { description: { component: '...' } } },
  argTypes: { /* one entry per prop: control type + options + description w/ token ref */ },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { /* minimal required props */ } };
// One export per variant/state
```

**Required coverage**: `Default`, one story per visual variant, `Disabled`/`Loading`/`Error`/`Empty` (if supported), `LongContent` edge case. **Brownfield only**: also `AllVariants` kitchen-sink.

**Design tokens only** — no hardcoded hex/px/magic numbers. `argTypes` descriptions reference token names.

### Step 5: Create Component Inventory

Save `aidlc-docs/construction/{unit-name}/ui-design/component-inventory.md`:

```markdown
# UI Component Inventory — {unit-name}

## New Components

| Component | Story File | Variants | Status |
|---|---|---|---|
| ComponentName | aidlc-docs/storybook/ComponentName.stories.tsx | default, primary, disabled, loading | ⏳ Pending |

## Reused Components

| Component | Source | Notes |
|---|---|---|
| Button | @design-system/core | Use existing `variant="primary"` |

## Design Tokens

| Token | Usage | Defined? |
|---|---|---|
| colors.primary.500 | Button background | ✓ |

## Design Gaps
- [ ] Any tokens that don't exist yet
```

### Step 6: Verify Storybook Preview

`.storybook/` config lives in the **frontend package directory** (where `package.json` with framework deps is). Stories live in `aidlc-docs/storybook/`.

1. Locate frontend package dir (has React/Vue/Svelte in deps)
2. If no `.storybook/`: `cd <frontend-package-dir> && npx storybook@latest init`
3. Ensure `<frontend-package-dir>/.storybook/main.ts` stories path points to `aidlc-docs/storybook/**/*.stories.@(ts|tsx)`
4. Confirm all stub files exist at `aidlc-docs/storybook/stubs/{ComponentName}.tsx`
5. Smoke test: `cd <frontend-package-dir> && npx storybook build --test` — fix any import errors before proceeding

### Step 7: Present for Review

```markdown
# 🎨 UI Design Complete — [unit-name]

**Stories created:**
- `aidlc-docs/storybook/ComponentA.stories.tsx` — N stories (default, primary, disabled, loading)

**Reused without changes:** ComponentC

**Component inventory:** `aidlc-docs/construction/[unit-name]/ui-design/component-inventory.md`

> **💻 Start Storybook:**
> ```bash
> cd <frontend-package-dir> && npx storybook dev -p 6006
> ```

> **🔍 Review checklist:**
> - [ ] All variants render correctly
> - [ ] All interaction states look right
> - [ ] Design System tokens applied consistently
> - [ ] Accessibility annotations present

> ✏️ Edit story files directly while Storybook is running — it hot-reloads. Reply **"done"** when finished.
```

### Step 8: Re-validate After User Review

After user signals done: re-read all story files in the component inventory. For each component:
- Confirm file exists, `Default` export present, all listed variants have exports
- Note any additions/removals user made

```markdown
## 🔄 Re-validation Summary
| Component | Stories Found | Changes | Status |
|---|---|---|---|
| ComponentA | Default, Primary, Disabled | + Error added | ✅ Ready |
```

Flag missing variants as **⚠ Needs Fix** — resolve before continuing.

### Step 9: Final Approval Gate

```markdown
> ✅ **Approve and Continue** — stories locked as implementation spec for Code Generation
> 🔧 **Request More Changes** — edit stories, reply "done" again when ready
```

### Step 10: Record Approval

Log in `audit.md`. Mark UI Design `[x]` in `backlog/unit/{unit-name}.md`.

---

## Handoff to Code Generation

Pass to `aidlc-code-gen`:
- Component inventory: `aidlc-docs/construction/{unit-name}/ui-design/component-inventory.md`
- Story files: `aidlc-docs/storybook/*.stories.tsx`

`aidlc-code-gen` rules:
- Implement to match approved story specs exactly (same props, variants, states)
- Replace stubs with real implementations — never alter `.stories.tsx` files
- Never create a UI component not in the approved inventory
- If new component discovered mid-generation: **STOP**, run UI Design for it, resume after approval
