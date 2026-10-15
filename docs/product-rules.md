# Product rules

Decisions about how specific admin features behave that can't be read off the code, or that the code would let you break by accident. Any UI touching these areas must follow them. Add a rule here whenever the team settles one.

## Team owner comes first

- In every list of a team's members (Teams drawers, member pickers), the **team owner is always the first row**, whatever the sort.
- Keep the existing ordering handler in `presentation/Teams/` when changing these lists.

## Connect to Claude (OAuth)

- When the admin is opened with a valid Claude OAuth authorize URL (`?oauth_redirect=…`, parsed by `utils/controllers/oauthRedirect.js`), the **sidebar and app header are hidden**. The user only sees the approval flow.
- Login keeps that redirect: after signing in, the user lands on `/accounts?oauth_redirect=…`. Older links to `/?oauth_redirect=…` are sent on to `/accounts` by the Home page.
- On success, the Accounts page shows the full-screen "Authentication done · Redirecting you back to Claude…" overlay before leaving.
- Only a real authorize URL with every required parameter counts (`getValidOAuthRedirectFromSearch`). Don't loosen that check.

## Tokens from the URL

- `?accessToken=…` on Home (`/`) or Accounts (`/accounts`) signs the admin in with that token and strips it from the URL (`utils/controllers/useAccessTokenFromUrl.js`). Keep the strip-and-reload behaviour so tokens never stay in the address bar or history.

## Custom work status

- The status sent when saving custom work comes from `presentation/TeamCredits/utils/resolveCustomWorkStatusForSubmit.js`. Any new custom work form must go through it.

## Design references

- The reference for every design decision is the Bridged portal's revamp and this admin's own refined pages (see `design-system.md` §14). Don't bring in layouts, components or styling from other products.
