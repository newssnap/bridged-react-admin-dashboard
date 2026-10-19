# CLAUDE.md

@AGENTS.md

## Claude Code setup in this repo

Everything below is committed, so every teammate and every Claude-based agent gets the same behaviour. It mirrors the Bridged portal (`bridged-dashboard`) so the two repos are worked on the same way.

### Skills (`.claude/skills/`)

| Skill | Use it when |
| --- | --- |
| `bridged-ui` | Building, restyling or fixing **any** visible UI. Loads the design system workflow. |
| `new-page` | Adding a page, route or feature area end to end. |
| `refine-page` | Polishing an existing page or flow: audit, fix without changing logic, verify, commit as `REFINE:`. |
| `design-review` | Auditing UI against the standard. Bundles `scripts/check-ui.js`. |
| `verify-ui` | Running the app and checking a change in the browser: themes and phone width. |
| `accessibility` | Accessibility audits (WCAG 2.2). Linked from `.agents/skills/`. |
| `vercel-react-best-practices` | React performance patterns. Linked from `.agents/skills/`. Ignore its Next.js and server-only rules; this is a CRA SPA. |

### Subagents (`.claude/agents/`)

- `ui-reviewer`: a read-only reviewer that checks a diff against `docs/design-system.md` and returns verified findings with file:line and a fix. Use it after UI work and before committing.

### Hooks (`.claude/settings.json`)

- **`guard-git.js`** (PreToolUse, Bash) blocks:
  - pushes to `main`, `staging` or `pre_prod`;
  - force pushes;
  - deleting remote branches;
  - `reset --hard`, `clean -f`, `branch -D`, `checkout .`.
  If one of these is really needed, ask the user to run it.
- **`format-file.js`** (PostToolUse, Edit/Write) runs Prettier on edited `src/` files.

### MCP (`.mcp.json`)

- `shadcn`: search and view shadcn registry items and get the right `add` command. You still review what a component brings in before adding it (see AGENTS.md §7).

### Dev server

`.claude/launch.json` → `admin-dev` (use `preview_start` in the desktop app).

## Working style for this repo

- **For UI work, invoke the `bridged-ui` skill first.** Don't start from general shadcn knowledge. This kit and its app components are customised, and the reference pages show the exact classes.
- **When a request is ambiguous about scope** ("polish this page"), stay inside the named page or component. List anything else you noticed rather than fixing it.
- **Ask before every `git push`**, each time. The hook blocks the protected branches.
- **Report verification honestly.** Say what you saw running, what you only built, and what you couldn't check, for example "no login session".
- **Keep docs in sync.** When a change sets a new admin-wide convention (a new shared component, token or copy rule), update `docs/design-system.md` in the same change, and `AGENTS.md` if it is a non-negotiable.
- **Keep the kit in step with the portal.** A fix to `src/components/**` that belongs to both products should be made in both repos.

## Using this repo from the Claude Agent SDK or an orchestrator

1. Run with this repo as its working directory and load project settings (`settingSources: ['project']` in the Agent SDK). That loads this file, `AGENTS.md`, the skills, the `ui-reviewer` subagent and the hooks.
2. Treat `AGENTS.md` → `docs/design-system.md` → `docs/architecture.md` → `docs/product-rules.md` as the contract for any work here.
3. Hand off with the AGENTS.md definition of done: `check-ui.js` clean on the changed files, `ui-reviewer` verdict, `yarn build` passing.
