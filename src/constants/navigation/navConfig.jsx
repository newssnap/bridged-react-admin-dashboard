import {
  Building03Icon,
  CreditCardIcon,
  DashboardSquare02Icon,
  Home01Icon,
  Logout03Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';

/**
 * One source of truth for admin navigation: the sidebar, the breadcrumbs and the
 * command palette all read from here. Labels match page titles (sentence case).
 */
export const PRIMARY_NAV = [
  { key: '', path: '/', label: 'Home', icon: Home01Icon },
  { key: 'accounts', path: '/accounts', label: 'Accounts', icon: DashboardSquare02Icon },
  { key: 'teams', path: '/teams', label: 'Teams', icon: UserGroupIcon },
  { key: 'companies', path: '/companies', label: 'Companies', icon: Building03Icon },
  {
    key: 'billing',
    label: 'Billing and credits',
    icon: CreditCardIcon,
    children: [
      { key: 'teams/credits', path: '/teams/credits', label: 'Team credits' },
      { key: 'teams/custom-work', path: '/teams/custom-work', label: 'Custom work' },
    ],
  },
];

export const BOTTOM_NAV = [{ key: 'logout', label: 'Log out', icon: Logout03Icon }];

/** Pages not in the sidebar, for breadcrumbs. */
export const EXTRA_PAGES = [
  { path: '/defaultChecklist', label: 'Default checklist' },
  {
    path: '/userChecklist',
    label: 'User checklist',
    parent: { label: 'Accounts', path: '/accounts' },
  },
];

/** The nav key of a pathname: '/teams/credits' → 'teams/credits', '/' → ''. */
export const navKeyFromPath = pathname => {
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  const all = PRIMARY_NAV.flatMap(item => [item, ...(item.children || [])]);
  // Longest match wins so /teams/credits isn't read as /teams.
  const match = all
    .filter(item => item.path)
    .map(item => item.key)
    .filter(key => clean === key || (key && clean.startsWith(`${key}/`)))
    .sort((a, b) => b.length - a.length)[0];
  return match ?? clean;
};

/** Flat list of pages for the command palette. */
export const getNavigationCommands = () =>
  PRIMARY_NAV.flatMap(item =>
    item.children
      ? item.children.map(child => ({ ...child, icon: item.icon, group: item.label }))
      : [{ ...item, group: 'Pages' }]
  );

/** Breadcrumb trail for a pathname. */
export const getCrumbs = pathname => {
  const key = navKeyFromPath(pathname);
  for (const item of PRIMARY_NAV) {
    if (item.path && item.key === key) return [{ label: item.label, path: item.path }];
    const child = item.children?.find(c => c.key === key);
    if (child) {
      return [
        { label: item.label, path: item.children[0].path },
        { label: child.label, path: child.path },
      ];
    }
  }
  const extra = EXTRA_PAGES.find(p => pathname === p.path || pathname.startsWith(`${p.path}/`));
  if (extra)
    return [...(extra.parent ? [extra.parent] : []), { label: extra.label, path: pathname }];
  return [{ label: 'Page not found', path: pathname }];
};
