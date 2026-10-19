---
name: refine-page
description: Run the Bridged "REFINE" pass on an existing page or flow — audit it against the design system, list every UI/UX/copy/state/placement issue, fix them without changing logic, verify live and commit as "REFINE: <Area> — …". Use when asked to polish, refine, clean up, make consistent, or "do the final touch-up" on a page, section, drawer or flow.
---

# Refining an existing page

This is the workflow behind the `REFINE:` commits that produced the current dashboard. The goal is a page that is indistinguishable from the reference pages, with its logic untouched.

## 1. Load the standard

- Invoke `bridged-ui`, or read `docs/design-system.md` plus `docs/product-rules.md`.
- Open the matching reference implementation from design-system §14.

## 2. Map the page

Read the page's workflow, its components and its controller. Note these, without changing them:

- props, callbacks, API calls;
- Redux reads and writes;
- routes it links to.

That is the contract you must keep.

## 3. Audit

1. Run `node .claude/skills/design-review/scripts/check-ui.js <feature folder>`.
2. Go through the page against each topic below and write down every issue:

| Area | What to look for |
| --- | --- |
| Anatomy | `PageHeader` first? One primary action in the header? Toolbar in the standard order? Sections separated with `gap-8`? |
| Reuse | Hand-built search, toggles, cards, tables, empty states or confirms that `src/components` already provides |
| Surfaces | Radius scale, flat cards, tokens only, white-label-safe brand surfaces, nested cards inside drawers |
| States | Skeleton shaped like the content, a designed empty state (first run, search, filtered), an error with retry, no flash of default content |
| Copy | UK English, sentence case, verb buttons, question confirms, toast wording, "—", plurals, day-first dates, no mention of removed features |
| Dead ends | Links to missing routes, no-op hovers, buttons for removed features, redundant back buttons or title bands |
| Motion | Token easings, stagger on grids, `IconSwap`/`HeightReveal` where state changes, reduced motion |
| Mobile | 375px: wrapping toolbar, full-width search, no page-level horizontal scroll |
| Product rules | Anything in `docs/product-rules.md` that applies |

3. If the list is long, or a fix changes the page's layout in a visible way (moves actions, swaps a table for cards), show the list to the user and confirm before editing.

## 4. Fix

- **UI only.** Keep the contract from step 2.
- Fix a real logic bug only if it blocks the UI, and list it separately under "Fixes:".
- Prefer moving a page onto the shared blocks over restyling custom markup in place.
- Edit only inside the page's own feature folder.
  - Change shared `src/components/*` only when the fix belongs to every page. Say so when you do.
  - Don't touch `src/components/ui/*`.

## 5. Verify

1. Re-run `check-ui.js` on the files you touched.
2. Ask the `ui-reviewer` subagent to review the change.
3. Run the `verify-ui` matrix: light and dark, desktop and 375px, and loading, empty and content states.
4. Run `yarn build`.

## 6. Commit (only when the user asks)

```
REFINE: <Area> — <the visible outcome in a few words>

- <user-visible change>
- <user-visible change>
Fixes:
- <logic fix, if any>
```

Ask before every push. Never push to `main` or `staging`.
