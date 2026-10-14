# Bridged admin dashboard design system

This is the UI standard for the Bridged **admin** dashboard. The admin shares one design system with the Bridged portal (`bridged-dashboard`, the shadcn and Tailwind revamp on `design-improvements`): the same tokens (`src/styles/globals.css`), the same tuned shadcn kit (`src/components/ui/`) and the same app components (`src/components/`). Every admin screen must look and behave as if it shipped with that revamp.

**The rule behind all the others: copy the dashboard, not the internet.** Match the tokens, the app components and the reference pages in [§14](#14-reference-implementations). Don't bring in patterns from other products, templates or design systems.

Architecture and data flow are covered in [architecture.md](architecture.md). Admin-only behaviour rules are in [product-rules.md](product-rules.md).

### What differs in the admin

- **No white-label.** The admin always uses the default Bridged brand (`--primary-Color: #753fd0`). Still use `bg-primary`, `text-primary`, `text-primary-foreground` and never a hex value, so the kit keeps working if that changes.
- **No platforms.** There is no media/events split and no `productCopy.js`; ignore `?platform=events` checks.
- **No team permissions, credits banners or locked states.** Every admin sees every page.
- **Portal-only building blocks** mentioned below (`OverviewSection`, `StepFooter`, `SectionCard`, `ScreenEditorParts`, `DashboardEmptyState`, `LivePreview`, charts pages) live in the portal's `presentation/` folders, not in `src/components/`. If an admin page needs one, copy it into the admin feature folder that uses it, keeping its classes, rather than importing across repos. Where a section below names a portal file as the reference, the same file is in the portal repo.
- **Navigation** comes from `src/constants/navigation/navConfig.jsx` (sidebar, breadcrumbs and the ⌘K palette all read it).

---

## 1. Stack and layering

| Layer | Where | Rule |
| --- | --- | --- |
| Tokens | `src/styles/globals.css` | The only global stylesheet. Colours, radius, fonts, easings, keyframes and `@utility` helpers live here. |
| Kit | `src/components/ui/*` | shadcn (`radix-luma` style, Radix + Base UI), tuned for Bridged: pill buttons, filled inputs, inverted translucent menus, motion easings. A change here restyles every screen. Only make it deliberately, for a portal-wide reason. Never `npx shadcn add --overwrite` an existing file, because it wipes the tuning. |
| App components | `src/components/*.jsx`, `components/app/`, `components/charts/`, `components/data-table/`, `components/form/` | Bridged building blocks such as `PageHeader`, list-card parts, `DataTable`, `Form`, `ConfirmDialog` and charts. Put Bridged-specific styling here. |
| Features | `src/presentation/<feature>/…` | Compose the two layers above with Tailwind utilities at the call site. |

Hard rules:

- **shadcn + Tailwind only.** No antd (fully removed), no CSS modules, SCSS or styled-components, and no new `.css` files. The exception is a third-party stylesheet a library requires, such as `@mdxeditor/editor/style.css`.
- **Compose real shadcn parts** at the call site: `Dialog` > `DialogContent` > `DialogHeader`…, `Sheet`, `Select` > `SelectTrigger` > `SelectContent`, `Field`. Don't write antd-style wrapper APIs such as `<Modal visible footer>`.
- **Icons are Hugeicons only.** See [§9](#9-icons).
- **JSX, not TypeScript.** Use `@/` imports for new code (`@/components/ui/button`).
- `cn()` comes from `@/lib/utils`.
- **Adding a shadcn component** that isn't in `src/components/ui/` yet: run `npx shadcn@latest add <name>`. Then check that it matches its siblings: radius scale, `ease-out-quad`/`ease-out-expo` easings, Hugeicons rather than lucide. The `shadcn` MCP server in `.mcp.json` can search and show registry items.

## 2. Tokens

### Colour

Use semantic tokens only: `bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`, `ring-ring`, `bg-primary`, `text-primary`, `bg-destructive`, `text-success`, `text-warning`, `text-info`. Every token has light and dark values.

- **The brand colour is white-label.** `--primary` follows the team's `--primary-Color`; the default is `#753fd0`. Never hard-code the purple or any hex value.
  - Brand tint: `bg-primary/10 text-primary`.
  - Text on a brand surface: always `text-primary-foreground`, which is contrast-picked per brand. Never `text-white`.
- **Neutrals are greys.** Base colour is `neutral`.
- **Status colours**: `success`, `warning`, `destructive` and `sky` (neutral info), as tokens and on `Badge`.
  - On `Badge`, `info` is the **brand tint** (`bg-primary/10 text-primary`), not a status. Neutral or in-progress states must not use it, because on some brands it reads as a warning. Use `sky` for those.
  - The full mapping is in [§5 Status badges](#status-badges).
- **Charts** use the brand ramp `--chart-1…5`, derived from `--primary`. Never use a fixed palette.

### Radius

`--radius: 1rem` (16px). The scale: `sm` 0.6× (~10px), `md` 0.8× (~13px), `lg` 1× (16px), `xl` 1.4× (~22px).

| Use | Class |
| --- | --- |
| Fields: inputs, textareas, input groups (search, password, number), select and combobox triggers, date pickers, tree selects, colour-picker triggers, OTP slots | `rounded-sm` (set in the kit; don't override it) |
| Surfaces: cards, panels, tables, menus, popovers, alerts, empty and upload boxes | `rounded-lg` |
| Nested pieces: icon tiles, inner panels, menu items, rows, tooltips, stat strips | `rounded-md` |
| Dialogs, command palette, app inset, auth panels | `rounded-xl` |
| Pills: buttons (`rounded-4xl` in the kit), badges, tabs, segmented controls, chips | `rounded-full` |

Don't use `rounded-2xl`, `rounded-3xl` or arbitrary `rounded-[Npx]` on app surfaces. A skeleton uses the radius of the thing it stands in for.

### Type

- **Font**: Satoshi, self-hosted variable font, used for every family. Mono is the system stack.
- **Page title**: `text-2xl md:text-3xl font-bold tracking-tight`. Comes from `PageHeader`; don't restyle it.
- **Section title**: `text-base font-semibold` (`PageSection`).
- **Card title**: `text-[15px] font-semibold tracking-[-0.01em] truncate`.
- **Body**: `text-sm`. Dense UI: `text-[13px]` / `text-[13.5px]`.
- **Captions and eyebrows**: `text-xs font-medium text-muted-foreground`. Filter labels: `text-[12.5px]`.
- Numbers use `tabular-nums`.

### Spacing, surfaces and shadows

- **Page gutter**: `--page-gutter`, 24px, or 32px from `md`. It is set on `<main>` in `layouts/AuthPageLayout.jsx`. Full-bleed blocks use `-mx-(--page-gutter)`.
- **Page sections** stack with `flex flex-col gap-8`. Card grids use `gap-5`, event grids `gap-8`, toolbars `gap-2.5`.
- **Cards are flat**: `ring-1 ring-foreground/10`, no shadow (`src/components/card.jsx`). Hover lift is `shadow-sm ring-foreground/15`.
  - Inside `overflow-hidden` columns use a real `border` instead of a ring.
- **Lines**: dividers are `border-b` / `border-t`; card footers use `border-border/60`. Empty and add slots use `border-dashed` on `bg-muted/30`. Stat wells use `bg-muted/40`.
- **Shadows**:
  - `shadow-pill` for the active nav pill, segmented option and primary button;
  - `shadow-float` for floating panels;
  - nothing else.
- **RTL**: the kit is RTL-ready. Use logical utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`), not `ml-`/`mr-`/`left-`/`right-`.

## 3. Page anatomy

Every authenticated page renders inside `AuthPageLayout`: sidebar, sticky 56px translucent `AppHeader` with breadcrumbs, and `<main>` with the page gutter. Pages then follow this skeleton:

```jsx
<div className="flex flex-col gap-8">
  <PageHeader
    title="Agents"
    description="One line on what this page is for."
    actions={
      <Button onClick={onCreate}>
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
        Create agent
      </Button>
    }
  />
  <PageToolbar>
    <ViewToggle value={view} onValueChange={setView} />
    <SegmentedControl options={statusOptions} value={status} onValueChange={setStatus} label="Status" />
    {/* other filters */}
    <PageToolbarSpacer />
    <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">{countLabel}</p>
    <ToolbarSearch value={query} onChange={setQuery} placeholder="Search agents" />
  </PageToolbar>

  {isLoading ? <XSkeleton /> : items.length === 0 ? <XEmptyState /> : view === 'list' ? <XTable /> : <XGrid />}
  {/* Pagination only when there is more than one page */}
</div>
```

### PageHeader (`@/components/page-header`)

- The **first block** of every page. It runs full-bleed under the gutter and ends in a hairline.
- Props: `title`, `description` (one quiet line), `actions`, `tabs`, `eyebrow`, `children` (meta under the title).
- `actions` go on the right, with **at most one primary button**. The page's main create action ("Create agent", "Add domain", "Add sponsor") lives here, never in the toolbar.
  - Exception: a page that hides its header because it is embedded may show the action in its toolbar.
- Page-level actions such as Refresh, Download report and Save/Discard also live in the header.
- `tabs={<PageTabs tabs={[{ value, label, count }]} … />}` sit on the header's bottom edge. Tabs show counts where useful.
- `eyebrow` (or `PageHeaderEyebrow` context) shows a parent trail such as "Event / Workflow" above the title.
  - Each part links back.
  - This replaces back arrows and round back buttons.
- **Detail pages** (a single event, agent, sponsor):
  - The title shows a `Skeleton` while loading.
  - Meta (status badge, dates, place) goes in `children`.
  - The main action is an **outline** button ("Edit event"), not primary: the page is for reading.
  - `PageTabs` switch **routes** (`navigate`), each set with its own `layoutId`.
  - Reference: `presentation/events/components/EventDetailLayout.jsx`.
- **Exception**: the main dashboard (`/`) has no PageHeader. Its "Agent performance" band is the h1.

### Overview and report pages

Analytics-style pages (agent overview, A/B tests, sponsors overview, credit usage) are built from **`OverviewSection`** (`presentation/agents/overview/components/shared/OverviewSection.jsx`, used in 46 files). Use it for any chart, table or report block that has a title and controls; don't hand-build card headers.

```jsx
<OverviewSection
  title="Conversations"
  description="How many visitors talked to the agent."
  controls={<><OverviewSelect … /><DateFilter size="small" … /></>}
  actions={<OverviewDownload items={…} />}
>
  {loading ? <Skeleton className="h-[250px] rounded-md" /> : empty ? <OverviewEmpty title="No activity in this period" /> : <Line … height={250} />}
</OverviewSection>
```

- **Header** (reference: `presentation/agents/overview/components/TopBar.jsx`):
  - The status badge sits inside the title: `<span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">{title}<Badge…/></span>`.
  - Meta goes in `children`: type · host · "Created 9 Oct 2026 by X", plus a mono ID with a copy button (`AgentOverviewMeta`).
  - **Actions, in this order**:
    1. contextual outline buttons (Live preview, A/B comparison);
    2. outline **Edit**;
    3. an outline `size="icon"` "More actions" menu (`align="end" className="w-56"`).
  - **Menu order**: state toggle (Pause/Resume) → separator → utilities (Activity log, Download, Refresh) → separator → destructive Delete.
  - While a menu action runs, the trigger's icon becomes a `Spinner`.
- **Under the header**: a row with "Key metrics for" + `DateFilter size="small"` on the left and `RefreshOverview` ("Updated 5 minutes ago" + ghost Refresh) on the right, then the `StatStrip`.
- **Section shape**: a flat card with a header (`border-b px-5 py-4`): title, a 13px description, then `controls` (metric `OverviewSelect`, `DateFilter size="small"`), then `actions` last (`OverviewDownload`). The body is `p-5`; `flush` makes it edge to edge, for tables.
- **Order on the page**: header, then a `StatStrip` straight under it, then the section grid `grid grid-cols-1 gap-6 lg:grid-cols-2`. A wide section spans both columns.
- **Charts**: 250px tall, with a matching `Skeleton` while loading and `OverviewEmpty` when empty.
- `StatStrip` stacks on phones and becomes equal columns from `sm`; `flush` drops the card for a strip between hairlines.
- **Which container?**
  - `OverviewSection`: data blocks with controls.
  - `Panel`: plain titled blocks on dashboards and settings.
  - `PageSection`: an untitled-surface group of content on a normal page.

### Editor pages and wizards

Use these for "New X" / "Edit X" in create and edit flows (agents, screens, engines).

- **Header**:
  - the editor's top bar (`headerComponent` in the route, e.g. `AgentTopBar`) shows the title "New X" / "Edit X" with no back arrow;
  - then `Steps size="sm"` (`@/components/steps`, `lg:w-[420px]`);
  - then the actions: outline **Save as draft** in create mode, or **Cancel** + **Save changes** in edit mode;
  - on phones the stepper collapses to "Step 2 of 4 · Title";
  - don't add a title band the breadcrumb already covers.
- **Body**: form sections are **`SectionCard`** + **`SectionHeader`** (`presentation/agents/create/reusable/components/`): a 17px title and quiet line, fields straight on the page, consecutive sections split by a hairline. No cards around sections.
- **Live preview**: use `ScreenEditorGrid`, `ScreenStepBody`, `ScreenPreviewPanel` and `ScreenStepFooter` (`presentation/screens/create/reusable/components/ScreenEditorParts.jsx`).
  - The form is on the left; the preview is an `<aside aria-label="Live preview">` on the right (`lg:grid-cols-2 gap-x-10`), sticky on large screens, `rounded-lg bg-muted/60 p-4 ring-1`, titled "Live preview · Updates as you edit".
  - On phones the preview drops below the form.
  - Sticky offsets are hard-coded to the header height (`lg:top-[232px] xl:top-[180px]`). Reuse the component rather than writing new offsets.
- **Footer**: Previous / Next / Publish sit in the sticky `StepFooter` (`presentation/agents/create/reusable/components/StepFooter.jsx`, `sticky bottom-0 z-10 bg-background/85 backdrop-blur-xl`, full-bleed with `-mx-(--page-gutter)`).
- **Drafts**: saved explicitly with "Save as draft". There is no autosave.
  - Disable "Save as draft" until there is something to save, and give the reason ("Pick a goal first").
- **Validation**:
  - "Next" stays disabled until the current step is complete.
  - Clicking a later step in the stepper lands on the first unfinished step instead.
  - Rules that can't be shown on a field raise an imperative `toast.warning` ("Add a user guideline to every included question").
  - Reference: `handleStepChange` in `presentation/agents/create/reusable/components/AgentTopBar.jsx`.
- **Publish step**: scheduling (`ActivationScheduleConfig`) plus a warning `Alert` for anything that needs attention before going live, then "Publish and run".

### Other building blocks in `page-header.jsx`

- `PageSection({ title, description, action })`: a titled block within a page.
- `Panel({ title, count, description, more, aside })` / `PanelEmpty`: a bordered panel with a header row.
- `StatStrip` / `StatCell({ label, icon, value, hint, loading })`: numbers divided by hairlines. Values count up.
- `SegmentedControl({ options, value, onValueChange, label, iconOnly })`: a sliding-pill switch for small choice sets.
- `PageEmpty({ icon, title, description, children })`: the empty state for a page section.

### Settings

**Settings pages** (Profile, Security, Team, Integrations):

- `grid grid-cols-1 gap-6 xl:grid-cols-12`: the main column is `xl:col-span-7` and the side column `xl:col-span-5`. Below `xl` it is one column.
- Content is stacked `Panel`s, each holding a group of form fields.
- Reference: `presentation/setting/profile/components/ProfileForm.jsx`.

**Setting rows** (toggles and options inside editors, drawers and settings panels). Use the components in `presentation/agents/create/reusable/components/`:

- **`SettingRow`**: icon, title and a quiet hint on the left; the control (`Switch`, `Select`, "Configure…") on the right.
  - `panel` shows nested options under the row while it is on.
  - `inline` keeps the control on the right at every width.
- **`SettingGroup`** (+ `SettingGroupLabel`): one card holding related rows, split by hairlines. Inside a `data-flat="true"` container (drawer bodies, side panels) it drops the card and runs edge to edge.
- **`AdvancedSettings`** (`…/visualization/components/AdvancedSettings.jsx`): the last child of a `SettingGroup`. It folds the less-used rows behind an "Advanced settings" line. The main setting always comes first.

**Unsaved changes** (reference: `presentation/setting/profile/components/ProfileActions.jsx`):

- The header shows a muted "Unsaved changes" label (`hidden sm:inline`, fades in), then outline **Discard** and primary **Save changes**.
- Both buttons are disabled until something changes.
- While saving, the primary button shows a `Spinner` and reads "Saving…". Discard restores the saved values.
- There is no navigate-away guard in the app. Don't add one to a single page.

**Destructive settings** (reset, delete workspace, disconnect):

- They go in a last `Panel` titled "Danger zone", below everything else.
- One outline button with destructive text per action ("Reset settings").
- Confirm with `confirm({ variant: 'destructive', … })`, ending the description with "This can't be undone." when it is irreversible.
- Never put a destructive action in the header.

### Phones

- The sidebar becomes a sheet and the breadcrumb shows only the current crumb.
- Toolbars wrap, and `ToolbarSearch` goes full width (`w-full sm:w-64`).
- No horizontal page scroll at 375px. Tables scroll inside their own container (`minWidth`).

## 4. Toolbar

`PageToolbar` (`flex flex-wrap items-center gap-2.5`) has one fixed order on every page:

1. `ViewToggle`: list / cards, with values `'list' | 'kanban'`.
2. Quick switch: a `SegmentedControl`, e.g. All / Active / Paused. Labels may carry counts.
3. Other filters. Several filters go in a single outline **Filters** button that opens a Popover with a `CountBadge` showing how many filters are active. Keep the popover body mounted with `useKeepMounted`.
4. `PageToolbarSpacer`.
5. Result count: `text-sm text-muted-foreground tabular-nums`, `aria-live="polite"`.
6. `ToolbarSearch`.
7. Toolbar actions, e.g. Download.

Don't hand-build search fields, view toggles or segmented switches.

**Search and filter behaviour**:

- Debounce search with `useDebouncedInput` (`src/utils/controllers/useDebouncedInput.js`, 300ms). Bind `inputQuery` to `ToolbarSearch` and filter or fetch on `debouncedValue`.
- Reset to page 1 when the search or a filter changes.
- **Filters popover**: an outline "Filters" button with `FilterHorizontalIcon` and a `CountBadge` of active filters. When any filter is active, a ghost "Reset" sits beside it. The popover body is a `sm:grid-cols-3 gap-x-5 gap-y-4` grid, `max-w-[640px]`, with `text-[12.5px] font-medium text-muted-foreground` labels. It works in one of two modes:
  - **Instant**, for client-side lists: each `Combobox` applies on change, each list starts with an "All …" option, and the last cell is an outline "Reset filters" (`presentation/agents/dashboard/agents/components/TopBar.jsx`).
  - **Apply**, for server-side lists: a draft is seeded when the popover opens, with a Reset / Apply footer (`presentation/leads/components/TopBar.jsx`).
- **Page sizes**:
  - card grids: `useDashboardCardPageSize()` (`src/constants/app/cardGridCols.js`), 9 at `xl`, 6 below, with columns from `DASHBOARD_CARD_GRID_COLS`;
  - list tables: 15;
  - tables inside overview sections: 10 (5 for compact top-N lists);
  - large result tables: 25.
- **The view choice and filters persist in `localStorage`**, under a feature key (e.g. `agentViewType`, `AGENT_FILTERS_STORAGE_KEY`). They are not kept in the URL. The default view is `'list'`.
- The `ViewToggle` values are `'list' | 'kanban'`, even though `'kanban'` renders the card grid. It's a legacy name; keep it.

**Date filter**: always the outline pill with calendar and chevron icons. Presets read "Past 7 days", "Past month", "All time". The range picker is one panel: presets on the left, a two-month calendar on the right (one month on phones), an Apply / Reset footer, and future dates disabled.

Reference: `presentation/agents/dashboard/agents/components/TopBar.jsx`.

## 5. Cards and grids

### List cards

Use these for agents, collections, screens and engines.

- **Parts**: `src/components/card-parts.jsx`, `dot-backdrop.jsx`, `card.jsx`.
- **Grid**: `stagger-in grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3`. Key it by page so the stagger replays.

```jsx
<Card className={cn(LIST_CARD_CLASSES, LIST_CARD_INTERACTIVE_CLASSES, 'group/card')} role="link" tabIndex={0}
      onClick={open} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && open()}>
  <DotBackdrop className="h-16 opacity-60" />
  <CardContent className="flex h-full flex-col gap-4 p-5">
    <div className="flex items-start justify-between">
      <CardIconTile icon={AiBrain01Icon} />
      <Badge variant="success">Active</Badge>
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted-foreground">Agent type</p>
      <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em]">{name}</h3>
    </div>
    <CardStats>
      <CardStat label="Visitors">{visitors}</CardStat>
      <CardStat label="Conversions">{conversions}</CardStat>
    </CardStats>
    <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
      {/* Calendar03Icon + formatDate(date) · actions DropdownMenu (modal={false}) */}
    </div>
  </CardContent>
</Card>
```

- The status sits top right. The type eyebrow goes above the title, never over an image.
- **Actions**: Edit plus **one** actions menu (Pause, Duplicate, Add to folder, Delete).
- **Loading**: `ListCardSkeletonBody` inside the same card shell.
- **The last slot of a grid** can be an `AddTile` (dashed "+ Add …"). Buttons stay pills, so never stretch a Button into a tile.

### Picker / selection cards

- Same surface as list cards, plus `selectCardClasses({ selectable, selected, blocked })`, `SELECT_CARD_BACKDROP` and `CardSelectCheck`.
- **Selected state**: brand ring and tint, `DotBackdrop active`.
- **Blocked items**: mute the icon, hide the check, and keep the reason visible.
- The whole card is clickable and reachable by keyboard.
- No `overflow-hidden` on picker cards.

### Screen and event cards

- **Screen thumbnails**: `ScreenThumbnail` uses the `aspect-screen` ratio (1024 / 745) with a top-anchored crop. With no screenshot it shows a typed icon placeholder.
- **Event cards** are photo-led:
  - the photo zooms on hover, with no card lift;
  - a frosted status chip pulses while the event is live;
  - a "Create event" tile closes the grid.
  - Reference: `presentation/events/`.

### Status badges

Use `Badge` from `@/components/badge`. One meaning, one tone, everywhere:

| State | Variant | Examples |
| --- | --- | --- |
| On, healthy, done well | `success` | Active, Live, Ready, Approved, Published, Connected |
| Off or finished, nothing wrong | `secondary` | Paused, Draft, Completed, Disabled, Ended |
| Upcoming or in progress | `sky` | Upcoming, Scheduled, Indexing, Processing (add a spinning `Loading03Icon` with `motion-reduce:animate-none` while it runs) |
| Needs attention | `warning` | Pending, Fallback, High usage, Expiring |
| Broken | `destructive` | Failed, Rejected, Error, Credits nearly exhausted |
| Labels, not states | `outline` | System default, a type or category tag |

- `info` (the brand tint) is for highlighting *the brand's own* things, such as a "Recommended" or "New" tag. It is never a status.
- A record with no state shows "—", not an empty badge.
- `badgeVariantFromColor` maps the legacy colour names some APIs return.
- References: `presentation/events/components/EventMeta.jsx`, `presentation/agents/dashboard/agents/components/AgentStatusBadge.jsx`.

### Card actions, grid pagination

- A card shows **Edit** plus **one** "More" menu. The same component serves table rows, so both stay in sync (`presentation/agents/dashboard/agents/components/AgentActions.jsx`).
- Grids paginate with the kit `Pagination` and `getPaginationItems(page, totalPages, { siblings: 1 })` from `@/lib/pagination`, `className="justify-start"`.
  - Render the pager only when `total > pageSize`.
  - Reference: `presentation/events/workflows/EventsWorkflow.jsx`.

## 6. Tables

Always use `DataTable` from `@/components/data-table` (TanStack Table v9). Never a raw `<table>`.

- **Look**: `rounded-lg` ring container, a 44px muted header band, header text 13px medium, body 14px, soft muted row hover, a brand-coloured sort arrow, and rows that stagger in.
- **Columns**: `meta: { width, minWidth, align, ellipsis, pin, filter }`. Truncated cells get a Tooltip with the full text.
- **Row actions** (`meta: { align: 'right' }`):
  - **Two actions or fewer**: visible ghost `icon-sm` buttons, each in a Tooltip, column `width: '96px'`. Delete goes through `ConfirmPopover confirmVariant="destructive"`. Reference: `presentation/website/domains/components/AllDomains.jsx`.
  - **More than two**: an Edit icon button plus a "More" `DropdownMenu modal={false}`:
    - ghost `icon-sm`, `MoreHorizontalIcon`, `aria-label="More actions for {name}"`;
    - content `align="end" className="w-52"`;
    - destructive items last, after a separator, `variant="destructive"`;
    - items that change state go through `confirm()`;
    - locked items are disabled with a one-line reason;
    - wrap the cell in `onClick={e => e.stopPropagation()}` so the row's own click doesn't fire.
    - Reference: `presentation/agents/dashboard/agents/components/AgentActions.jsx`.
- **Bulk selection**: `useRowSelection` adds the checkbox column.
  - While rows are selected, the toolbar crossfades (`AnimatePresence mode="popLayout"`) into a selection bar: "{n} selected", outline `sm` actions, and a destructive-text outline Delete in a `ConfirmPopover` ("Delete 3 items?").
  - Use one verb throughout: Delete *or* Remove, not both.
  - Reference: `presentation/screens/create/collections-v2/components/ContextMaterials.jsx`.
- **Inline editing**: none in the app. Edit in the row's drawer.
- **First column**: often a `size-8 rounded-lg bg-primary/10 text-primary` icon tile plus the name, with an `text-xs` "Added 9 Oct 2026" line below.
- **Paging**:
  - 15 per page in list views, `paginationProps={{ align: 'start', showSizeChanger: false }}`;
  - **hide the pager when everything fits**;
  - set `minWidth` so phones scroll the table, not the page.
- **Empty values**: an em dash "—". Hide a column when no row has data for it.
- **Default empty text**: "Nothing here yet". Pass `emptyState` for a designed empty state.
- **Row labels are human**: "Anonymous visitor", not a dash. Pluralise correctly: "1 item", "5 items".
- Reference: `presentation/website/domains/components/AllDomains.jsx`.

## 7. Forms and inputs

- **Engine**: `@rc-component/form` through `@/components/form`, which exports `Form`, `FormField`, `FormList`, `useForm` and `useWatch`. It renders shadcn `Field` parts and wires labels, descriptions, errors and ARIA. Don't add react-hook-form or Formik.

```jsx
const [form] = useForm();
<Form form={form} onFinish={onSubmit}>
  <FieldGroup>
    <FormField label="Folder name" name="name" rules={[{ required: true, message: 'Enter a folder name' }]} bind="input">
      {control => <Input {...control} placeholder="e.g. Spring campaign" />}
    </FormField>
  </FieldGroup>
</Form>
```

- Bindings are detected from the child (`Input`, `Textarea`, `Select`, `Switch`, `Checkbox`, `RadioGroup`, `ToggleGroup`, `Slider`, `NumberInput`, …). Set `bind="…"` when they aren't.
- **Inputs are filled**: `bg-input/50`, no visible border, `rounded-sm` (~10px), `h-9`. `InputGroupInput` stays transparent inside its group. A hand-built field-like trigger uses the same `rounded-sm`, never `rounded-lg`.
- **Selects** open item-aligned. Don't set `position="popper"` on `SelectContent`.
- **Choice controls**:
  - a small set uses `SegmentedControl` or `ToggleGroup`;
  - a large set, or one with disabled options, uses `Select` or `Combobox`;
  - multiple values use `MultiSelect`;
  - a tree uses `TreeSelect`.
- **Comboboxes inside a Sheet or Dialog** portal into it. Escape closes only the list (`keepOpenForCombobox`).
- **Other inputs**: `NumberInput`, `PasswordInput`, `DatePicker` / `DateRangePicker`, `ColorPicker`, `FileUpload`, `CopyButton`, all in `src/components/`.
- **Validation copy** uses the field's own label and says what to fix ("Enter a folder name"). On submit, focus the first invalid field.
- **Required markers**: avoid them where every field is required, as on the login form.

## 8. Overlays

| Need | Use |
| --- | --- |
| A form or detail side panel | `Sheet` (`side="right"`). This is the default overlay (74 files). |
| A short focused task | `Dialog`, `rounded-xl` |
| Confirming an action from a menu or page | `confirm({...})` or `<ConfirmDialog>` (`@/components/confirm-dialog`) |
| Confirming an inline row action | `<ConfirmPopover>` (`@/components/confirm-popover`) |
| Hover detail | `HoverCard` / `Tooltip` |
| Quick navigation | the command palette (already global) |

**Sheet shell** (reference: `presentation/agents/dashboard/agents/components/AddFolderDrawer.jsx`):

```jsx
<SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[400px]">
  <SheetHeader className="border-b pe-14">…title, description…</SheetHeader>
  <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-6">…body…</div>
  <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-4">
    <Button variant="outline" onClick={close}>Cancel</Button>
    <Button onClick={() => form.submit()} disabled={loading}>{loading && <Spinner />}Create folder</Button>
  </SheetFooter>
</SheetContent>
```

- **Widths**: set with `data-[side=right]:w-full data-[side=right]:sm:max-w-[…]`. For new work use one of three sizes:
  - `400px`: one or two fields (rename, add folder);
  - `600px`: a standard create/edit form (the most common);
  - `900px`: tables, previews or two-column content inside the drawer.
  Existing drawers vary; don't change their widths in a refine unless asked.
- **Sheet titles**: `text-[17px] font-semibold tracking-[-0.01em]`, with an optional `SheetDescription`.
- **Focus on open**: a sheet with a single field may `autoFocus` it (focus, never select). Edit sheets with several fields pass `onOpenAutoFocus={e => e.preventDefault()}` so nothing is pre-selected.
- **One drawer for create and edit**:
  - switch the title ("Add webhook" / "Edit webhook") and the button ("Add webhook" / "Save changes") on an `isEditing` flag;
  - the button always names the thing, never a bare "Create";
  - Delete is not in the edit drawer; it lives in the row or card menu.
- **Leaving a dirty drawer**: Cancel opens a `ConfirmPopover`, e.g. "Discard changes?", with "Discard" and "Keep editing".
- **Inside drawers and side panels**, sections are flat and edge to edge, divided by hairlines. Don't nest cards. Mark the body `data-flat="true"` so `SettingGroup`s go flat.
- **Confirm dialogs**:
  - layout is left-aligned: a tinted `size-10 rounded-xl` icon tile, the title, then a muted description;
  - `max-w-[420px]`;
  - a destructive confirm button is **solid**; the overlay doesn't close the dialog;
  - if `onConfirm` returns a promise, the button shows a spinner until it settles.
- **Confirm copy**:
  - the title is a question: "Delete this agent?";
  - the description says what will happen: "Its conversations stay in reports.";
  - the button is a verb: "Delete", "Duplicate", "Remove";
  - a non-destructive confirm uses the default variant: "Log out?".
- **Kept-mounted overlays** must not close when you click inside their own nested popups.
- **Never** use `window.confirm`, `alert` or `prompt`.

### Banners and callouts

- **Global banners** (account-wide notices: credits running low, a pending invite, a maintenance notice):
  - They render in the banner slot of `layouts/AuthPageLayout.jsx`, above the app header, inside `HeightReveal`. State is `state.app.notificationBanner`.
  - Build them as a compact full-width `Alert`-style strip, tinted by tone:
    - warning: `bg-warning/10`, `text-warning` icon;
    - destructive: `bg-destructive/10`;
    - neutral: `bg-muted`.
  - Content: one line of text, an optional link-style action ("View usage"), and a ghost `icon-xs` dismiss button with `aria-label="Dismiss"`.
  - Keep the dismissal in `localStorage` per notice, so it doesn't come back on every load.
  - Credit thresholds: 75% or more = warning ("High usage"); 90% or more = destructive ("Credits nearly exhausted"). See `presentation/setting/creditUsage/components/AccountSummary.jsx`.
  - Legacy banners: `NotificationBanner.jsx` (brand-filled) and `PendingTeamInvitesBar.jsx` (inline styles) predate this rule. Don't copy them.
- **In-page callouts** use the kit `Alert` with one of four tones. Don't hand-build tinted `div`s with `bg-amber-500/10`; about 95 legacy ones exist, so move them to `Alert` when you refine their page.

  | Tone | Classes |
  | --- | --- |
  | Warning | `<Alert className="rounded-lg border-transparent bg-warning/10 text-[13px] *:[svg]:text-warning">` |
  | Error | `<Alert variant="destructive" className="border-destructive/20 bg-destructive/5">` |
  | Brand note (tips, "new") | `<Alert className="rounded-lg border-transparent bg-primary/[0.07] *:[svg]:text-primary">` |
  | Neutral info | `<Alert className="rounded-lg border-0 bg-muted/70 *:[svg]:text-muted-foreground">` |

  - A callout gives a medium-weight title, then one muted line.
  - **Progress banners** (indexing, syncing) use the tone map `progress | warning | idle | done` with a result-led headline (`presentation/screens/create/collections-v2/components/IndexingStatusBanner.jsx`).

### Locked, permission and plan states

- **Whole features the team can't use are hidden, not shown locked.** Routes and nav are filtered by `accessibleSection`, `lockedPortalSection` and `hasCreditAccess`. Don't build upgrade pages.
- **Trial-locked options inside a feature**:
  - keep the option visible with a `size-3.5 text-muted-foreground` `SquareLock02Icon` beside its label;
  - a Tooltip on the lock reads "Locked during your trial. Talk to us to change it.";
  - clicking the option opens the "Talk to us" scheduling form: `dispatch(setIsSchedulingFormOpen(true))`;
  - reference: `presentation/agents/create/components/design/components/visualization/components/Elements.jsx`;
  - never leave the click handler empty.
- **Options blocked by the current state** (not by the plan): disabled, `opacity-60 cursor-not-allowed`, with a visible one-line reason ("Pick a goal first"), e.g. `disabledReason` in `ChoiceCards`. Use text, not a tooltip alone.
- **Unreleased options**: disabled, with a `Badge variant="secondary"` reading "Coming soon" beside the title (`presentation/screens/create/collections-v2/components/add-context/SelectContextType.jsx`).
- **Locked dashboard content**: blur the content (`blur-[6px] opacity-85 pointer-events-none`) and centre a `Card max-w-[440px] shadow-lg` that explains it, with one action (`presentation/dashboard/workflows/DashboardWorkflow.jsx`).
- **Tooltips on disabled controls**: wrap the control in `<span tabIndex={0}>`, because disabled elements don't fire hover events.

## 9. Icons

```jsx
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';

<HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
```

- Free set only (`@hugeicons/core-free-icons`). Find names at hugeicons.com.
- `strokeWidth={2}` is the standard. `CardIconTile` uses 1.75 at 18px.
- **Sizes**: inside buttons the kit sizes icons automatically. Elsewhere use `size-4`, or `size-3.5` / `size-5`.
- Inside a Button, mark icons `data-icon="inline-start" | "inline-end"` so spacing is right.
- **Icon-only buttons** need an `aria-label` and usually a Tooltip.
- The legacy name-based `Icon.jsx` was removed from the admin in v3. Hugeicons only.

## 10. Feedback: toasts, loading, empty and error states

### Toasts (`import { toast } from 'sonner'`)

The toaster is mounted once in `App.js` (top right, 1.5s, at most 3 visible).

- **Success**: a short past-tense statement, e.g. "Agent deleted", "Changes saved", "Domain added".
- **Error**: `"Couldn't <verb> the <thing>"`, e.g. "Couldn't create the folder". Prefer the server's `userErrorText` when present: `response?.error?.data?.errorObject?.userErrorText`.
- **Warning**: imperative, e.g. "Pick a domain first".
- **One toast per action.** No "Deleting…" or "Uploading…" info toasts. Show progress on the button (Spinner) or inline.
- **Never an empty toast. Never a fake success.** Treat `success: false` as an error, and show no upload-success toast for a failed upload.

### Loading

- **Skeletons match the layout they stand in for**: the same grid, card shell and radius. Examples: `ListCardSkeletonBody`, `presentation/events/skeletons/EventsSkeletons.jsx`.
- **Show skeletons until data settles.** Never flash default or placeholder content first.
- A loading → content swap fades in.
- For buttons, render `<Spinner />` inside and set `disabled`.

### Empty states

- **Every list and section has one**, designed with an icon tile, a title, one line of help and the next action ("Add event").
- **List pages** use `DashboardEmptyState` (`presentation/screens/dashboards/reusable/components/DashboardEmptyState.jsx`). It switches copy between three cases:
  - nothing yet;
  - no search results: `No agents match "{query}"`;
  - nothing matches the filters.
- **Sections** use `PageEmpty`.
- **First-run states guide setup**: they say what to do first and offer the single next step.

### Error and not-found states

- A failed load replaces the content with the kit `Empty`:
  - `EmptyMedia variant="icon"`;
  - title "Couldn't load <things>";
  - description "Check your connection and try again.";
  - an outline **Try again** button that refetches.
  - Reference: `presentation/Sponsors/workflows/SponsorsWorkflow.jsx`.
- Every list and detail page needs this state, even where the current reference pages lack it.
- Missing records read like "Engine not found", with a link back, never "Invalid Id".
- **Progress and status are result-led**: "4 of 5 indexed · 1 failed", with the single next step as the primary action.

### No dead ends

- No links to routes that don't exist.
- No hover affordances that do nothing.
- No buttons for removed features.
- Disabled options say "Coming soon" or explain why they are locked.

## 11. Motion

`App.js` wraps everything in `<MotionConfig reducedMotion="user">`. Every CSS keyframe in `globals.css` also has a fade-only fallback under `prefers-reduced-motion`.

**Easings** (Tailwind `ease-*`):

- `ease-out-quad`: hover and state changes, `duration-150`.
- `ease-out-expo`: entrances, 200–500ms.
- `ease-drawer`: sheets.
- `ease-height`: height reveals.

**Springs** are `{ type: 'spring', duration: 0.25–0.35, bounce: 0 }`. The only bouncy one is the nav pill, at 0.12.

**Ready-made pieces**:

- `stagger-in` utility on card grids: 40ms steps, first 12 children.
- `reveal-in` for content a switch reveals.
- `animate-page-in`, `animate-pop`.
- `IconSwap` (`@/components/icon-swap`) for icon state changes such as copy → check and the theme toggle.
- `HeightReveal` (`@/components/height-reveal`) for app banners and blocks that appear or disappear in the flow.
- Toolbar → selection bar is a crossfade: `AnimatePresence mode="popLayout"` (opacity, y ±4px, 2px blur, spring 0.25), not a height reveal.
- `NumberValue` / `AnimatedNumber countUp` (`@/components/animated-number`) for numbers.
- DataTable rows stagger 25ms each, for the first 8 rows.

**Rules**:

- Animate `transform` and `opacity`, not layout properties. Height only through `HeightReveal`.
- Press feedback is the kit's `active:scale-[0.97]`.
- Chart tooltips don't dim sibling series and don't spring or blur.
- With `useReducedMotion()`, set `transition={{ duration: 0 }}` on layout-animated pills and underlines.

## 12. Charts

- Use the wrappers in `@/components/charts`: `Line`, `Area`, `Column`, `Bar`, `Pie`, `Funnel` and `WordCloud`. They are built on Recharts with a config shape that matches the old charts.
- **Colours**: the brand ramp (`RAMP` in `charts/_utils.js`). Animation: `chartAnimation` from `ui/chart` (600ms expo).
- **Plain hover**: a tooltip, with no dimming of other series.
- Highcharts is only for the analytics world map. Don't add new Highcharts charts.

## 13. Copy and language

- **UK English** in all visible text, including `aria-label`s, placeholders and toasts: colour, centre, grey, behaviour, organise, personalise, cancelled, licence (noun). Code identifiers, stored values and API fields keep their existing spelling.
- **Sentence case** everywhere: titles, buttons, nav, tabs, menu groups, options, statuses. Nav labels match page titles and breadcrumbs.
- **Buttons** are verbs that name the thing: "Create agent", "Save changes", "Save as draft", "Publish and run", "Add sponsor". Cancel is always offered beside a primary action in drawers, dialogs and editors.
- **Dates** are day-first, via `formatDate` / `formatDateAndTime` (`src/utils/formatting/formateDate.js`):
  - "9 Oct 2026" and "3 Oct 2026, 14:20";
  - ranges: "3 – 13 Oct 2026";
  - exports: "13 October 2026, 14:05:09".
  Never use month-first formats.
- **Numbers**:
  - format with `Intl.NumberFormat('en-GB')` or `toLocaleString('en-GB')`, never a bare `toLocaleString()`;
  - percentages carry one decimal at most;
  - missing values are "—", never `0`.
- **Durations**:
  - `formateTime(seconds)` (`src/utils/formatting/formateTime.js`) gives "01m 05s" or "02h 10m 00s"; zero is "0s" and missing is "—";
  - media playback time is "4:49" (`formatDuration` in `presentation/setting/videos/components/VideoParts.jsx`).
- **Relative times**:
  - only for freshness labels: "Updated 5 minutes ago", with the exact `D MMM YYYY, HH:mm` in a Tooltip on a focusable span (`presentation/agents/overview/components/RefreshOverview.jsx`);
  - everything else uses absolute dates.
- **Plurals**: "1 agent", "3 agents". Never "agent(s)". There is no shared helper yet; use a local `plural(count, word)` as `IndexingStatusBanner.jsx` does.
- **Ellipsis**: in progress labels ("Saving…", "Uploading…") use the single character "…", not three dots.
- **Platform wording** (Workflow vs Playbook, event-specific copy) comes from `src/constants/copy/productCopy.js`.
- **Tone**: plain and specific. Say what happens, or what to fix. Don't mention features that were removed, such as domain verification states.

## 14. Reference implementations

Copy from these. **Admin pages first** (in this repo); for patterns the admin doesn't have yet, use the portal's reference files (`bridged-dashboard`, same paths under `src/presentation/`).

### In the admin

| Pattern | File |
| --- | --- |
| Table page with filters popover, row actions, add/edit sheet | `src/presentation/dashboard/workflows/DashboardWorkflow.jsx` + `components/{AccountsToolbar,AccountsTable,UserActions,UserDrawer}.jsx` |
| Simple table page (two row actions, ConfirmPopover delete) | `src/presentation/companies/workflows/CompaniesWorkflow.jsx` + `components/{CompaniesTopbar,CompaniesTable,CompanyFormDrawer}.jsx` |
| Large edit sheet: flat sections, setting rows, members table | `src/presentation/Teams/components/{EditTeamDrawer,SettingParts,TeamParts,TeamMembersTable}.jsx` |
| Stat strip + quick status filter + read-then-edit sheet | `src/presentation/TeamCredits/workflows/CustomWorkWorkflow.jsx` + `components/PreviewEditCustomWorkDrawer.jsx` |
| Balance, usage thresholds and ledger | `src/presentation/TeamCredits/components/{ManageCreditsDrawer,CreditBalanceSummary,LedgerTable}.jsx` |
| Detail page with eyebrow, result-led progress, panels of rows | `src/presentation/userChecklist/workflows/UserChecklistWorkflow.jsx` + `components/ChecklistPanel.jsx` |
| Picker cards (multi-select) | `src/presentation/dashboard/components/PlaybookSelectionList.jsx` |
| App shell, sidebar, ⌘K palette | `src/layouts/AuthPageLayout.jsx`, `src/layouts/GlobalSidebar.jsx`, `src/utils/components/commandPalette/CommandPalette.jsx` |
| Login | `src/presentation/authentication/login/workflow/LoginWorkflow.jsx` |

### In the portal (`bridged-dashboard`)

| Pattern | File |
| --- | --- |
| List page (grid + list + toolbar + drawers) | `src/presentation/agents/dashboard/agents/workflows/AgentDashboardWorkflow.jsx` |
| Toolbar with filters popover | `src/presentation/agents/dashboard/agents/components/TopBar.jsx` |
| Table with row chevron and actions | `src/presentation/agents/dashboard/agents/components/AgentList.jsx` |
| List card | `src/presentation/agents/dashboard/agents/components/AgentCard.jsx` |
| Sheet form | `src/presentation/agents/dashboard/agents/components/AddFolderDrawer.jsx` |
| Table page | `src/presentation/website/domains/components/TopBar.jsx` + `AllDomains.jsx` |
| Detail page with header tabs and meta | `src/presentation/events/components/EventDetailLayout.jsx` |
| Overview / report page | `src/presentation/agents/overview/components/TopBar.jsx` + `shared/OverviewSection.jsx` |
| Wizard header, stepper, draft | `src/presentation/agents/create/reusable/components/AgentTopBar.jsx` |
| Wizard sections and setting rows | `src/presentation/agents/create/reusable/components/{SectionCard,SectionHeader,SettingRow,SettingGroup}.jsx` |
| Settings page with unsaved changes | `src/presentation/setting/profile/components/{ProfileForm,ProfileActions}.jsx` |
| Row/card actions menu | `src/presentation/agents/dashboard/agents/components/AgentActions.jsx` |
| Bulk selection bar | `src/presentation/screens/create/collections-v2/components/ContextMaterials.jsx` |
| Error state with retry | `src/presentation/Sponsors/workflows/SponsorsWorkflow.jsx` |
| Person row | `src/presentation/setting/team/components/TeamParts.jsx` |
| Credit usage and thresholds | `src/presentation/setting/creditUsage/components/AccountSummary.jsx` |
| All page blocks in one place | `/theme` in the portal's development build (`src/presentation/theme/blocks/patterns.jsx`) |

## 15. Interaction details

### Tabs and switches: which one

| Control | Use for | Notes |
| --- | --- | --- |
| `PageTabs` | Page-level views, only in `PageHeader tabs` | Each tab is a route or a large panel. Mount panels lazily, then keep them mounted with `hidden` (`presentation/setting/integrations/workflows/IntegrationsWorkflow.jsx`). |
| `ui/tabs` | Mode switches inside editors and drawers that swap a whole panel | `TabsList className="w-full sm:w-fit"`, `TabsTrigger className="sm:min-w-28"`, often in a `border-b p-3` header |
| `SegmentedControl` | Toolbar quick filters and the view switch | Not for form values |
| `ToggleGroup` | A small value choice inside a form row (AND/OR, Website/Agent), or the desktop/mobile preview switch | `variant="outline"` |
| Radio choice cards | Choosing between options that need a description or icon | `ChoiceCards` (`presentation/agents/create/reusable/components/ChoiceCards.jsx`) |

Tab state stays local. It is not in the URL, unless the tabs are routes.

### Choice cards

- `rounded-lg bg-card p-3.5 ring-1 ring-foreground/10`.
- Selected: `bg-primary/[0.05] ring-2 ring-primary`, with an icon tile `size-10 rounded-md bg-primary/10 text-primary`.
- Disabled: `opacity-60 cursor-not-allowed`, with the reason as text.
- Focus: `has-focus-visible:ring-2`.

### Tooltips

- **Setup**: one global `TooltipProvider` (`App.js`), opening without delay. The default side is top; truncated titles use `side="top" align="start"`.
- **Required on**:
  - every icon-only button;
  - truncated text (full value);
  - locks;
  - the exact time behind a relative time.
- **Disabled controls** don't fire hover. Wrap them: `<span className="inline-flex" tabIndex={disabled ? 0 : undefined}>`.
- Tooltips hold short labels and reasons, never actions or long help. Use a `HoverCard` (`openDelay={150} closeDelay={100}`, `max-w-72`) for richer previews, such as a list of labels.

### Menus and icon buttons

| Where | Trigger |
| --- | --- |
| Page header "More" | outline `size="icon"`, content `align="end" w-56` |
| Card or row "More" | ghost `icon-sm` `MoreHorizontalIcon`, `text-muted-foreground hover:text-foreground aria-expanded:bg-muted`, content `align="end" w-52` |

- **Every trigger** has an `aria-label` that names the record ("More actions for Spring campaign").
- **Inside menus**:
  - every item has a Hugeicon;
  - sub-menus (`DropdownMenuSub`) for pickers ("Add to folder");
  - destructive items last, after a separator;
  - a disabled item explains itself with a `text-xs text-muted-foreground` sub-line.
- **Quiet destructive icon button** (row delete): `variant="ghost" size="icon-sm" className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/15"`.

### People

- **Person row**: `Avatar size-9` with `AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary"` initials, then the name over a `text-xs text-muted-foreground` email. A missing name falls back to the email. Reference: `MemberIdentity` in `presentation/setting/team/components/TeamParts.jsx`.
- **Overflowing chips**: show the first few, then a `Badge variant="outline" tabIndex={0}` reading "+N", with the rest in a Tooltip or HoverCard.

### Busy, undo and optimistic updates

- **Busy region** (saving inside a drawer, refetching a table):
  - the container gets `relative` and `aria-busy`;
  - the content dims with `pointer-events-none opacity-50 select-none transition-opacity`;
  - a centred `Spinner size-5` overlay sits at `absolute inset-0 z-10`;
  - `DataTable`'s `loading` prop does this for tables.
- **Spinners**:
  - in a button, `<Spinner data-icon="inline-start" />` plus the "…ing…" label;
  - in an icon button, the spinner replaces the icon;
  - in a menu trigger, it replaces `MoreHorizontal` while an action runs.
- **Confirm or undo?**
  - Confirm first (`confirm()` / `ConfirmPopover`) for anything that affects live visitors or can't be rebuilt: agents, domains, events, members.
  - Undo instead of confirming only for small items inside an editor that the user can see being removed, such as one guideline or one row: `toast('Deleted "X"', { duration: 8000, action: { label: 'Undo', onClick } })` (`presentation/AILabs/create/components/KAIntentGuidelineSection.jsx`).
- **Optimistic updates** are fine for toggles and small edits: RTK `updateQueryData`, or update the local state and revert on error with a "Couldn't …" toast. After a state change, the badge updates at the same moment as the toast ("Agent paused").

### Focus and keyboard

- **Focus rings**:
  - surfaces and cards: `outline-none focus-visible:ring-3 focus-visible:ring-ring/30`;
  - inline links and focusable spans: `rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50`.
- **Clickable cards**: `role="link"` (or `button`), `tabIndex={0}`, and Enter/Space handlers.
- **Inline title edit** (editor titles only): Enter saves (unless `isComposing`), Escape cancels, blur saves, plus an `aria-label`. Reference: `presentation/screens/create/reusable/components/CreateCollectionTopBarV2.jsx`.
- **Section landmarks**: sections are `aria-labelledby` their heading. Live counts and progress use `aria-live="polite"` or `role="status"`.

### Layering and sticky elements

| z-index | What |
| --- | --- |
| `z-10` | In-content stickies: `StepFooter`, editor header band, pinned table cells, busy overlays |
| `z-20` | `AppHeader` (`sticky top-0 h-14`), sticky table headers |
| `z-30` | Pinned header cells |
| `z-50` | Kit overlays (dialogs, sheets, popovers, menus, toasts) |

- Sticky bars are translucent, `bg-background/85 backdrop-blur-xl`, with a hairline on the content side.
- Editor header bands stick under the app bar with `sticky top-14`.
- Don't invent new z-index values.

### Spacing

| Where | Spacing |
| --- | --- |
| Between page sections | `gap-8` |
| Inside a section, and section grids | `gap-6` |
| Card grids | `gap-5` |
| Card body | `p-5` (list cards: `p-5 gap-4`) |
| Section card header | `px-5 py-4` |
| Sheet header | the kit default (`p-6`) with `border-b pe-14`; don't add padding |
| Sheet footer | `px-6 py-4` |
| Sheet body | `px-6 pt-4 pb-6` |
| Settings card | `p-5 sm:p-6 gap-5` |
| `SettingRow` | `px-4 py-3.5` |
| Choice cards | `p-3.5 gap-3.5` |
| Toolbar | `gap-2.5` |
| `StepFooter` | `py-3 gap-3` |

### Empty states inside drawers and settings

Use the kit `Empty` (`Empty` > `EmptyHeader` > `EmptyMedia variant="icon"` / `EmptyTitle` / `EmptyDescription`, then the action). It is used in 56 files.

| Where | Use |
| --- | --- |
| Pages | `DashboardEmptyState` |
| Page sections | `PageEmpty` |
| Overview sections | `OverviewEmpty` |
| Drawers and settings panels | `Empty` |

### Live previews

- Agent and screen previews render the real widget in the sandboxed `LivePreview` iframe (`utils/components/livePreview/`).
- **Desktop** frame `aspect-screen`; **mobile** frame `375/560`, capped at 320px.
- `LoadingSkeleton` shows until the frame loads.
- Below the frame: a desktop/mobile `ToggleGroup` and a Refresh icon button.
- Don't build new iframes; reuse `LivePreview`.

## 16. Legacy: don't copy these

The admin's v3 revamp removed antd, the name-based `Icon.jsx`, the old theme file and all unrouted pages, so the admin carries little legacy UI. Patterns to avoid if you meet them (in old branches, or when porting from elsewhere):

| Legacy | Use instead |
| --- | --- |
| antd components, `notification`, `Modal.confirm`, `Form.useForm` | The kit, `toast` (sonner), `confirm()`, `useForm` from `@/components/form` |
| Hand-made `bg-amber-500/10` callouts | The `Alert` tones in §8 |
| "Failed to …", "Error while …", "Something went wrong", "… successfully" toasts | "Couldn't …" and past-tense success (§10) |
| "Deleting…" info toasts | A button Spinner and one result toast |
| `'--'` for missing values | "—" |
| Status maps duplicated per feature | The §5 status table; share one map within a feature (e.g. `TeamCredits/constants/customWork.js`) |
| Local `initials()` and `plural()` copies | Fine for now. If you add a third use in one feature, lift it into `src/lib/`. |

## 17. Process rules for UI work

- **A design or UI task changes UI only.** Keep props, data flow, callbacks, API calls, Redux shape, routes and dependencies as they are.
  - If a real logic bug is found, fix it as a separate, clearly named change and say so.
  - Feature work may of course change logic.
- **Check every change in:**
  - light **and** dark;
  - desktop **and** 375px;
  - media **and** events (`?platform=events`) when the page is shared;
  - a non-default brand colour, if you touched brand surfaces.
- **Run** `node .claude/skills/design-review/scripts/check-ui.js` (or ask the `ui-reviewer` subagent) before committing.
- **Commit subjects** read `REFINE: <Area> — <what changed>` for polish, `FEATURE:` for features and `FIX:` for fixes. The body is a bulleted list of user-visible outcomes.
