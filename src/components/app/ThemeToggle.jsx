import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { IconSwap } from '@/components/icon-swap';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getClickOrigin, useThemeToggle } from '@/hooks/use-theme-transition';

/**
 * Sun / moon in the panel header. Runs the same theme toggle as the command palette;
 * from a pointer the new theme grows as a circle from the click (View Transitions).
 */
export default function ThemeToggle() {
  const { isDarkTheme, toggle } = useThemeToggle();
  const label = isDarkTheme ? 'Light mode' : 'Dark mode';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          onClick={event => toggle(getClickOrigin(event))}
          className="text-muted-foreground hover:text-foreground"
        >
          <IconSwap swapKey={isDarkTheme ? 'dark' : 'light'}>
            <HugeiconsIcon icon={isDarkTheme ? Moon02Icon : Sun03Icon} strokeWidth={2} />
          </IconSwap>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}
