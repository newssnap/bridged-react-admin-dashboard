import { useSelector } from 'react-redux';
import { Toaster as Sonner } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Alert02Icon,
  MultiplicationSignCircleIcon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
const Toaster = ({ ...props }) => {
  // The dashboard's theme lives in Redux (app.isDarkTheme), not next-themes.
  const isDarkTheme = useSelector(state => state.app.isDarkTheme);
  const theme = isDarkTheme ? 'dark' : 'light';
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      // Top right, clear of the 56px sticky headers (h-14) on every page.
      position="top-right"
      offset={{ top: 72, right: 24 }}
      mobileOffset={{ top: 64, right: 16, left: 16 }}
      icons={{
        success: <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4" />,
        info: <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="size-4" />,
        warning: <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-4" />,
        error: (
          <HugeiconsIcon icon={MultiplicationSignCircleIcon} strokeWidth={2} className="size-4" />
        ),
        loading: (
          <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />
        ),
      }}
      style={{
        '--normal-bg': 'var(--popover)',
        '--normal-text': 'var(--popover-foreground)',
        '--normal-border': 'var(--border)',
        '--border-radius': 'var(--radius)',
      }}
      toastOptions={{
        classNames: {
          toast: 'cn-toast',
        },
      }}
      {...props}
    />
  );
};
export { Toaster };
