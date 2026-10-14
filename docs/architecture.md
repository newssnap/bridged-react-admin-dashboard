# Architecture

How the Bridged admin dashboard is put together. Read this before adding a page, an API call or a piece of global state. For how things should **look**, see [design-system.md](design-system.md).

The admin is an internal tool for the Bridged team. It manages accounts (users, their agents and playbooks), teams, companies, team credits and custom work. It talks to the same gateway as the portal.

## Stack

| Concern | Choice |
| --- | --- |
| Build | Create React App 5 via **craco 7** (`craco.config.js`), `@/` → `src/` |
| UI runtime | **React 19.2**, JSX only (no TypeScript) |
| Styling | **Tailwind CSS 4** via PostCSS, one stylesheet: `src/styles/globals.css` |
| Components | **shadcn/ui** (`radix-luma` style, Radix + Base UI), kit in `src/components/ui/`, shared with the portal |
| Icons | **Hugeicons** (`@hugeicons/react` + `@hugeicons/core-free-icons`) |
| Motion | `motion` (`motion/react`), CSS keyframes in `globals.css` |
| State | **Redux Toolkit** slices + **RTK Query** (`src/services/api.js`) |
| Routing | `react-router-dom` 6, `BrowserRouter`, all pages lazy-loaded |
| Tables | TanStack Table v9 via `src/components/data-table.jsx` |
| Forms | `@rc-component/form` engine + shadcn `Field` components (`src/components/form.jsx`) |
| Toasts | `sonner` |
| Exports | `xlsx` |
| Package manager | **Yarn 4** (Berry, `nodeLinker: node-modules`) |

antd, `@ant-design/icons` and `@ant-design/charts` were removed in the v3 revamp. Don't bring them back.

## Boot sequence

1. `src/index.js` imports `styles/globals.css` and renders `Redux Provider > App`.
2. `src/App.js` runs `useAuthHandler` (reads `localStorage.accessToken`, decodes it into `state.auth`), restores the theme, and renders `<MotionConfig reducedMotion="user"><TooltipProvider><AppRouter/></TooltipProvider><Toaster/></MotionConfig>`.
3. `src/routes/AppRouter.jsx` is the **only** routes file.

## Routing

| Path | Page | Feature folder |
| --- | --- | --- |
| `/login` | Login | `presentation/authentication/login` |
| `/` | Accounts | `presentation/dashboard` |
| `/teams` | Teams | `presentation/Teams` |
| `/companies` | Companies | `presentation/companies` |
| `/teams/credits` | Team credits | `presentation/TeamCredits` |
| `/teams/custom-work` | Custom work | `presentation/TeamCredits` |
| `/defaultChecklist` | Default checklist (not in the sidebar) | `presentation/defaultChecklist` |
| `/userChecklist/:id` | A user's checklist | `presentation/userChecklist` |
| `*` | Not found | `pages/NotFound.jsx` |

- Each route is `{ path, component, isProtected }` in `AppRouter.jsx`; pages are `React.lazy(() => import('../pages/...'))` named `LazyXxx`, wrapped in `<ProtectedRoute><Suspense fallback={Spinner}>`.
- `ProtectedRoute` sends unauthenticated users to `/login` (keeping a Claude OAuth redirect, see product rules) and wraps protected pages in `layouts/AuthPageLayout.jsx`: sidebar, app header with breadcrumbs and theme toggle, `<main>` with the page gutter, and the ⌘K command palette.

### Adding a route

1. Page entry in `src/pages/Xxx.jsx` that renders one workflow.
2. `const LazyXxx = lazy(() => import('../pages/Xxx'))` + a route object in `AppRouter.jsx`.
3. Nav entry in `src/constants/navigation/navConfig.jsx` (`PRIMARY_NAV`, or `EXTRA_PAGES` for pages outside the sidebar so the breadcrumb reads right). The command palette picks up `PRIMARY_NAV` automatically.

## Folder convention

```
src/
  pages/Xxx.jsx                          thin route entry → renders <XxxWorkflow/>
  presentation/<feature>/
    workflow(s)/XxxWorkflow.jsx          page orchestration: header, toolbar, sections
    components/Xxx.jsx                   UI pieces (PascalCase)
    controller(s)/useXxxHandler.js       hooks: data fetching, mutations, handlers
    skeleton(s)/XxxSkeleton.jsx          loading states shaped like the content
    utils/                               when the feature needs them
  components/ui/                         shadcn kit (shared with the portal; do not restyle here)
  components/*.jsx, app/, data-table/, form/   Bridged app components (page-header, data-table…)
  constants/navigation/navConfig.jsx     sidebar, breadcrumbs, command palette
  constants/playbooks.js                 playbook definitions (icons are Hugeicons data)
  layouts/                               AuthPageLayout, GlobalSidebar, sidebar/, AuthenticationLayout
  redux/slices/                          app (theme, palette), auth, companies
  services/api.js                        every API endpoint (RTK Query)
  utils/controllers/                     auth, logout, OAuth redirect, debounced input
  utils/formatting/                      formatDate / formatDateAndTime / formateTime
  hooks/                                 use-breakpoint, use-mobile, use-theme-transition
  lib/                                   cn(), color, combobox, pagination helpers
```

Folder names are inconsistent across features (`workflow`/`workflows`, `controller`/`controllers`). **Match whatever the feature you are editing already uses**; use the plural forms for a new feature.

## Data layer

- **One RTK Query API**: `bridgedApi` in `src/services/api.js`. Generated hooks are exported at the bottom of the file.
- Auth: `prepareHeaders` adds `Authorization: Bearer <localStorage.accessToken>`; failed refreshes call `logoutHandler()`.
- Many reads are **mutations** triggered from controllers. Keep that pattern when extending a feature.
- **Naming:** destructure RTK Query triggers as SCREAMING_SNAKE with a leading underscore: `const [_FETCH_TEAMS, { isLoading }] = useGetTeamsMutation();`
- Errors: show the server's `userErrorText` when present (`response?.error?.data?.errorObject?.userErrorText`); treat `success: false` as an error, never as success.

## Configuration and environments

- `src/config/Config.js` picks the API by hostname. On localhost it defaults to the staging API; override with `?env=dev|staging|production`.
- Deploys (GitHub Actions): `staging` → stage, `main` → prod. There is no lint/test step in CI: `yarn build` is the gate.

## Theme

`state.app.isDarkTheme`, persisted in `localStorage.isDarkTheme`. The toggle (`components/app/ThemeToggle.jsx` → `hooks/use-theme-transition.js`, `applyTheme`) sets `dark`/`light` on `<html>` and `<body>`. The command palette can switch it too. Tailwind: `@custom-variant dark (&:is(.dark *))`. Every UI change must work in both themes.

## Verification

- `yarn build`: the real check (CRA ESLint runs during the build). Make sure no warnings are in files you touched. Don't set `CI=true`.
- `yarn start` (or `admin-dev` in `.claude/launch.json`): dev server. Check light and dark and a phone width.
- `yarn test` runs the CRA placeholder and `utils/controllers/oauthRedirect.test.js`.
- Prettier runs on commit (husky + lint-staged) and on every Claude edit (`.claude/hooks/format-file.js`).
