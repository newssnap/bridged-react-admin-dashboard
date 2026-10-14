import * as React from 'react';
import { flushSync } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setIsDarkTheme } from '../redux/slices/appSlice';

/** Switches the theme and remembers it (read back on load in App.js). */
export const applyTheme = (dispatch, isDark) => {
  dispatch(setIsDarkTheme(isDark));
  localStorage.setItem('isDarkTheme', String(isDark));
  document.body.className = isDark ? 'dark' : 'light';
  document.documentElement.className = isDark ? 'dark' : 'light';
};

const REVEAL_DURATION = 600;
const REVEAL_EASING = 'cubic-bezier(0.645, 0.045, 0.355, 1)';

/** Pointer position of a click, or null when it came from the keyboard. */
export const getClickOrigin = event =>
  event.detail === 0 ? null : { x: event.clientX, y: event.clientY };

/**
 * The app's theme toggle (same action as the command palette). From a pointer the
 * new theme grows as a circle from the click (View Transitions); keyboard, reduced
 * motion and browsers without View Transitions switch instantly.
 */
export function useThemeToggle() {
  const dispatch = useDispatch();
  const isDarkTheme = useSelector(state => state.app.isDarkTheme);

  const toggle = React.useCallback(
    origin => {
      const run = () => applyTheme(dispatch, !isDarkTheme);
      const animate =
        origin &&
        typeof document.startViewTransition === 'function' &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!animate) {
        run();
        return;
      }
      const transition = document.startViewTransition(() => flushSync(run));
      transition.ready
        .then(() => {
          const radius = Math.hypot(
            Math.max(origin.x, window.innerWidth - origin.x),
            Math.max(origin.y, window.innerHeight - origin.y)
          );
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${origin.x}px ${origin.y}px)`,
                `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
              ],
            },
            {
              duration: REVEAL_DURATION,
              easing: REVEAL_EASING,
              pseudoElement: '::view-transition-new(root)',
            }
          );
        })
        .catch(() => {});
    },
    [dispatch, isDarkTheme]
  );

  return { isDarkTheme, toggle };
}
