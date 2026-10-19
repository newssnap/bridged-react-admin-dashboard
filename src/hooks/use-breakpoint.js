import * as React from 'react';

/**
 * Which screen breakpoints currently match: `{ xs, sm, md, lg, xl, xxl, xxxl }`.
 * Returns `{}` on the first render and the real values from a layout effect, so callers
 * that size data (page sizes, columns) behave exactly as they did before.
 * Thresholds are the dashboard's historical ones (they feed logic, not styling):
 * xs < 576, sm >= 576, md >= 768, lg >= 992, xl >= 1200, xxl >= 1600, xxxl >= 1920.
 */
const QUERIES = {
  xs: '(max-width: 575px)',
  sm: '(min-width: 576px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 992px)',
  xl: '(min-width: 1200px)',
  xxl: '(min-width: 1600px)',
  xxxl: '(min-width: 1920px)',
};

const readScreens = () =>
  Object.fromEntries(
    Object.entries(QUERIES).map(([screen, query]) => [screen, window.matchMedia(query).matches])
  );

export function useBreakpoint() {
  const [screens, setScreens] = React.useState({});

  React.useLayoutEffect(() => {
    const lists = Object.values(QUERIES).map(query => window.matchMedia(query));
    const update = () => setScreens(readScreens());
    update();
    lists.forEach(list => list.addEventListener('change', update));
    return () => lists.forEach(list => list.removeEventListener('change', update));
  }, []);

  return screens;
}
