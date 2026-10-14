---
name: bridged-ui
description: The Bridged admin dashboard UI standard (shared with the Bridged portal). Use whenever building, restyling, polishing or fixing anything visible in this repo — pages, cards, tables, toolbars, drawers/sheets, dialogs, forms, empty/loading states, toasts, charts, copy or motion — so the result matches the established shadcn + Tailwind design system instead of generic UI.
---

# Building UI in the Bridged admin dashboard

The admin went through the same shadcn and Tailwind revamp as the Bridged portal, and every screen follows one system. Your job is to make new work indistinguishable from it.

## Before writing code

1. Read `docs/design-system.md` in full. It is the standard, and this skill only orders the work. Also read `docs/product-rules.md` when the change touches team members, the Claude OAuth flow, URL tokens or custom work status.
2. Open the closest **reference implementation** from §14 of that doc and the files it imports. Copy its structure and classes; don't reinvent them.
   - For placement and interaction questions, use §15:
     - which tab or switch control to use;
     - tooltips and menus;
     - confirm or undo;
     - busy states, focus, z-index and spacing.
   - Check §16 so you don't copy a legacy pattern.
3. Check `src/components/` for an existing block before building one. The usual candidates:

   | Need | Use |
   | --- | --- |
   | Page title, actions, tabs | `PageHeader`, `PageTabs`, `PageHeaderEyebrow` (`@/components/page-header`) |
   | Toolbar | `PageToolbar`, `PageToolbarSpacer`, `ViewToggle`, `SegmentedControl`, `ToolbarSearch` |
   | Sections and stats | `PageSection`, `Panel`, `PanelEmpty`, `StatStrip`, `StatCell` |
   | Empty states | `PageEmpty`, kit `Empty` |
   | Cards | `Card` (`@/components/card`, not `ui/card`), `CardIconTile`, `CardStats`, `CardStat`, `ListCardSkeletonBody`, `LIST_CARD_CLASSES`, `DotBackdrop`, `AddTile` |
   | Tables | `DataTable`, `useRowSelection` |
   | Forms | `Form`, `FormField`, `useForm` (`@/components/form`), plus `NumberInput`, `PasswordInput`, `MultiSelect`, `TreeSelect`, `DatePicker`, `DateRangePicker`, `ColorPicker`, `FileUpload`, `CopyButton` |
   | Confirming actions | `confirm()`, `ConfirmDialog`, `ConfirmPopover` |
   | Status and counts | `Badge` (`@/components/badge`), `CountBadge` |
   | Motion | `IconSwap`, `HeightReveal`, `NumberValue`, `AnimatedNumber`, `stagger-in`, `reveal-in` |
   | Charts | `@/components/charts` |
   | Wizards | `Steps` (`@/components/steps`) |
   | Portal-only blocks (`OverviewSection`, `StepFooter`, `SectionCard`, `SettingRow`…) | Copy from the portal repo into the admin feature folder that needs it (design-system intro) |
   | Setting rows | `SettingRow`, `SettingGroup`, `AdvancedSettings`; `ChoiceCards` for described options |
   | Row and card actions | the `AgentActions` pattern: Edit + "More" `DropdownMenu modal={false}` |
   | Callouts, empty states in drawers | kit `Alert` (four tones, §8), kit `Empty` |
   | Search | `useDebouncedInput` (`src/utils/controllers/useDebouncedInput.js`) |

4. If the shadcn kit lacks a primitive, add it with `npx shadcn@latest add <name>`. Never use `--overwrite` on an existing file. Then align the new file with its siblings: radius scale, `ease-out-*` easings, Hugeicons.

## While writing

- Compose with Tailwind utilities at the call site, using tokens only (no hex). Brand surfaces use `bg-primary text-primary-foreground`.
- **Radius:**
  - fields (inputs, selects, comboboxes, date pickers, search) `rounded-sm`, from the kit;
  - surfaces `rounded-lg`;
  - nested pieces `rounded-md`;
  - dialogs `rounded-xl`;
  - pills `rounded-full`.
- **Icons:** `<HugeiconsIcon icon={XIcon} strokeWidth={2} />`. Inside buttons, add `data-icon="inline-start"`.
- **Toolbar order:** ViewToggle → quick switch → filters → spacer → count → search → actions. The Create action goes in the `PageHeader`.
- **Every data view has three states:** a skeleton shaped like the content, an empty state with an icon and next action, and an error state ("Couldn't load …" + Try again).
- **Status badges** follow the §5 table:
  - `success` for on;
  - `secondary` for off or finished;
  - `sky` for upcoming or in progress;
  - `warning` for needs attention;
  - `destructive` for broken.
  Never use `info` for a status.
- **Row actions:** up to two visible icon buttons; otherwise Edit + a "More" menu.
- **Drawers:** 400, 600 or 900px wide; one drawer for create and edit.
- **Copy:**
  - UK English and sentence case;
  - verbs on buttons;
  - confirm titles are questions;
  - toasts are past tense on success and "Couldn't …" on error, one per action;
  - dates via `formatDate`;
  - "—" for missing values;
  - correct plurals.
- **Motion:** animate transform and opacity with the token easings, and give anything that moves a reduced-motion fallback.
- In a design or polish task, **don't change logic**: props, data flow, API calls and Redux shape stay as they are.
- Use logical utilities (`ms-`, `pe-`, `start-`) for RTL safety.

## Before calling it done

1. Run `node .claude/skills/design-review/scripts/check-ui.js` and fix the real findings.
2. For non-trivial UI, ask the `ui-reviewer` subagent to review the change.
3. Verify in the running app with the `verify-ui` skill. Check:
   - light and dark;
   - 375px and desktop;
4. Run `yarn build`. It must pass.
5. In the summary, say what you checked and what you couldn't check, e.g. "couldn't log in, so I didn't see it live".
