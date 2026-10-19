---
name: verify-ui
description: Run the Bridged admin dashboard locally and verify a UI change in the browser — light and dark theme, desktop and 375px phone width, loading/empty/error states — with screenshots as proof. Use after any visible change, or when asked to run, preview, screenshot or check the admin.
---

# Verifying UI in the running admin

## Start the dev server

- **Claude Code desktop:** use `preview_start` with the `admin-dev` configuration in `.claude/launch.json`. It runs `yarn start` with the browser disabled.
- **Elsewhere:** run `BROWSER=none PORT=3000 yarn start` in the background and wait for "Compiled".

Compile errors and ESLint warnings show up in the server log. Treat new warnings in files you touched as bugs.

## Signing in

All pages except `/login` need a session.

- If the browser has no session, `/login` appears. **Ask the user to sign in in the browser pane**, or to paste a staging URL with `?accessToken=`. Never type real credentials yourself.
- Locally the API defaults to **staging**. `?env=dev` switches to dev.
- If no session is possible, say plainly that the change was not verified live. You can still check `/login` and the 404 page, and fall back to `yarn build`.

## The check matrix

| Axis | How |
| --- | --- |
| Theme | Toggle in the app header, or ⌘K → "Switch to dark mode". Or run `localStorage.setItem('isDarkTheme', 'true')` and reload; `'false'` for light. |
| Width | Desktop, then 375×812 (`resize_window` preset `mobile`). Look for horizontal scroll, wrapping toolbars and truncated titles. Reset to desktop afterwards. |
| States | Loading (throttle the network or reload), empty (search for nonsense), error (if reachable), and the populated view. |
| Sidebar | Expanded, collapsed rail, and the phone sheet. |

## Evidence

- Read the console for errors after each navigation.
- Prefer `read_page` / `get_page_text` to confirm text and structure. Take screenshots for visual changes and share them as proof.
- Report exactly which cells of the matrix you covered and which you couldn't.
