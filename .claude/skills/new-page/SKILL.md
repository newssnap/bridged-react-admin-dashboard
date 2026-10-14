---
name: new-page
description: Scaffold a new page or feature area in the Bridged admin dashboard end to end — route, nav entry, pages/ entry, presentation workflow, components, controller hook, RTK Query endpoint, skeleton and empty state — following the repo's folder convention and design system. Use when asked to add a page, screen, section or feature area.
---

# Adding a page to the Bridged admin dashboard

Read `docs/architecture.md` (routing, data layer) and `docs/design-system.md` (page anatomy) first. Then work through the steps in order, matching the closest existing feature.

## 0. Decide

- **Feature folder:** an existing `src/presentation/<feature>/` or a new one.
- **Route path:** follow the existing style, e.g. `/teams`, `/teams/credits`, `/userChecklist/:id`.
- **Page type:** list (grid and/or table), detail with tabs, editor with steps, or settings. Then pick the matching reference in design-system §14.

If any of these is unclear and changes the result, ask the user. Otherwise go with the closest existing feature.

## 1. Data: `src/services/api.js`

- Add the endpoint in the matching `// ---------- Section ----------` block. Use the existing `tagTypes`, or add one.
- Use `providesTags` / `invalidatesTags` so lists refresh after mutations.
- Export the generated hook in the export block at the bottom of the file.

## 2. Controller: `presentation/<feature>/controllers/useXxxHandler.js`

```js
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useGetThingsMutation, useDeleteThingMutation } from '@/services/api';

const userError = (res, fallback) => res?.error?.data?.errorObject?.userErrorText || fallback;

export default function useThingsHandler() {
  const [_FETCH_THINGS, { isLoading }] = useGetThingsMutation();
  const [_DELETE_THING] = useDeleteThingMutation();
  const [things, setThings] = useState([]);
  const [error, setError] = useState(false);

  const fetchThings = async () => {
    setError(false);
    const res = await _FETCH_THINGS({});
    if (res?.error || res?.data?.success === false) return setError(true);
    setThings(res.data?.data ?? []);
  };

  const deleteThing = async id => {
    const res = await _DELETE_THING({ id });
    if (res?.error || res?.data?.success === false) {
      return toast.error(userError(res, "Couldn't delete the thing"));
    }
    toast.success('Thing deleted');
    fetchThings();
  };

  useEffect(() => {
    fetchThings();
  }, []);

  return { things, isLoading, error, fetchThings, deleteThing };
}
```

If the feature already uses `builder.query` hooks (`useGetXQuery`), use those instead. Match what is there.

## 3. UI: `presentation/<feature>/`

- `workflows/XxxWorkflow.jsx` lays out the page:
  - `<div className="flex flex-col gap-8">`;
  - then `PageHeader` (title, description, the single primary action);
  - then `PageToolbar`;
  - then the content in one of its states: skeleton, empty, error or content;
  - then pagination (only if more than one page);
  - then the sheets.
- `components/` holds cards, tables and drawers, built from `src/components` blocks. Copy the reference files.
- `skeletons/XxxSkeleton.jsx` copies the content's grid and card shell.
- Empty state: `PageEmpty` for list pages and sections, kit `Empty` in drawers.
- Error state: the kit `Empty` with "Couldn't load <things>", "Check your connection and try again." and an outline "Try again" button that refetches (design-system §10).
- Overview/report pages are built from `OverviewSection` blocks; wizards from `Steps`, `SectionCard` and `StepFooter`; settings from `Panel`, `SettingRow` and `SettingGroup` (design-system §3).
- Static options and initial form state go in `src/constants/<feature>/`.

## 4. Page entry and route

- `src/pages/Xxx.jsx`:

  ```jsx
  import XxxWorkflow from '@/presentation/<feature>/workflows/XxxWorkflow';

  export default function Xxx() {
    return <XxxWorkflow />;
  }
  ```

- `src/routes/AppRouter.jsx`:
  - add `const LazyXxx = lazy(() => import('../pages/Xxx'));`;
  - add a route object `{ path, component: LazyXxx, isProtected: true }` next to its siblings.

## 5. Navigation

- `src/constants/navigation/navConfig.jsx`: add the item to `PRIMARY_NAV` (sidebar + ⌘K palette) or to `EXTRA_PAGES` (pages outside the sidebar, for the breadcrumb). Use a Hugeicons icon and a sentence-case label that matches the page title.
- The breadcrumb comes from `navConfig`. Check it reads correctly.

## 6. Verify

1. `node .claude/skills/design-review/scripts/check-ui.js`
2. Ask the `ui-reviewer` subagent to review.
3. Use the `verify-ui` skill to check:
   - the route loads from the sidebar and from a direct URL;
   - loading, empty and content states;
   - light and dark;
   - 375px.
4. `yarn build`
