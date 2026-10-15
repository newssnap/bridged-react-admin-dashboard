# Bridged admin dashboard: agent guide

This guide is for any coding agent working in this repo: Claude Code, the Claude Agent SDK, Codex, Cursor, or an orchestrator that builds the admin as one part of a larger system. Read it before your first change.

The **Bridged admin dashboard** is the internal tool the Bridged team uses to run the platform: accounts (users, their agents and playbooks), teams, companies, team credits and custom work. It shares its design system with the Bridged portal (`bridged-dashboard`).

## Read next

| When you are… | Read |
| --- | --- |
| Building or changing anything visible | [docs/design-system.md](docs/design-system.md): mandatory |
| Adding a page, route, endpoint or state | [docs/architecture.md](docs/architecture.md) |
| Touching team members, the Claude OAuth flow, URL tokens or custom work status | [docs/product-rules.md](docs/product-rules.md) |
| Doing anything else | this file |

## Commands

```bash
yarn install        # Yarn 4 (Berry), node-modules linker
yarn start          # dev server (craco start)
yarn build          # production build: the real check; CRA ESLint runs here
yarn format         # Prettier over src/
node .claude/skills/design-review/scripts/check-ui.js   # UI rule checks on uncommitted changes
```

The local dev server talks to the **staging** API by default; add `?env=dev|production` to switch.

## Stack

React 19 · JSX (no TypeScript) · CRA 5 + craco (`@/` → `src/`) · Tailwind CSS 4 · shadcn/ui (`radix-luma`, Radix + Base UI) · Hugeicons · motion · Redux Toolkit + RTK Query · react-router 6 · TanStack Table · `@rc-component/form` + shadcn Field · sonner.

## Non-negotiables

1. **Design system first.** All UI uses the shadcn kit (`src/components/ui`), the Bridged app components (`src/components`) and the tokens in `src/styles/globals.css`, composed with Tailwind utilities.
   - No antd (removed in v3), no new CSS files, no hex colours, no other icon set, no new UI libraries.
   - Copy the reference pages listed in docs/design-system.md §14.
   - Take references from this admin and the Bridged portal only, never from other products.
2. **Brand-token safe.** Use `bg-primary`, `text-primary`, `bg-primary/10` and `text-primary-foreground`. Never hard-code the purple, and never use `text-white` on brand surfaces.
3. **Light and dark, desktop and phone.** Every UI change must work in all of them.
4. **Copy rules.**
   - UK English (colour, centre, organise) and sentence case.
   - Day-first dates via `formatDate` ("9 Oct 2026"); "—" for missing values.
   - Success toasts in past tense ("Team created"); error toasts as "Couldn't …"; one toast per action.
5. **UI tasks change UI only.** In a design or polish task, keep props, data flow, API calls, Redux shape, routes and dependencies unchanged. Report any logic bug you find as a separate change.
6. **Follow the existing structure.**
   - `src/pages/X.jsx` → `src/presentation/<feature>/{workflow(s),components,controller(s),skeleton(s)}`.
   - Every endpoint goes in `src/services/api.js`.
   - RTK Query triggers are named `_FETCH_X` / `_CREATE_X`.
   - Inside a feature, match the folder names it already uses.
7. **Leave the kit's tuning alone.** `src/components/ui/*` is shared with the portal and customised. Never `npx shadcn add --overwrite` an existing component. Add new kit components with `npx shadcn@latest add <name>`. Prefer porting a change from the portal's kit over diverging from it.
8. **No new dependencies** without asking: the shadcn kit plus `src/components` almost always covers the need.

## Git and deployment

- Branches deploy on push:
  - `staging` → stage
  - `main` → production
- **Never push to `main` or `staging`.** Never force-push. Ask before every push to any branch.
- Commit subjects: `REFINE: <Area> — <what changed>` (polish), `FEATURE: …`, `FIX: …`. The body is a bulleted list of user-visible outcomes.
- Prettier runs on commit (husky + lint-staged). Use `.prettierrc`: single quotes, 2 spaces, 100 columns, `arrowParens: avoid`.

## Definition of done for UI work

- [ ] Uses existing components and patterns. Nothing is hand-built that `src/components` already provides.
- [ ] Loading skeletons, empty states and error states exist and match the layout.
- [ ] Works in light and dark mode and at 375px.
- [ ] Copy follows §13 of the design system.
- [ ] `node .claude/skills/design-review/scripts/check-ui.js` shows no new findings.
- [ ] `yarn build` passes.
- [ ] No unrelated logic changes.
