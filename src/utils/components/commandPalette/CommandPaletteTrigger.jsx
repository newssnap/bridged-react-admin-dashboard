import React from 'react';
import { Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useDispatch } from 'react-redux';
import { Kbd } from '@/components/ui/kbd';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { setCommandPaletteOpen } from '../../../redux/slices/appSlice';

function getModKeyLabel() {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  return isMac ? '⌘' : 'Ctrl';
}

const triggerClassName =
  'group/command-trigger flex min-h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg border border-transparent bg-foreground/[0.045] ps-3 pe-2 text-[13px] font-medium dark:bg-foreground/[0.06] text-muted-foreground transition-[background-color,border-color,box-shadow,color] duration-150 ease-out-quad outline-none hover:border-border hover:bg-background hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30';
const iconClassName =
  'size-3.5 shrink-0 text-muted-foreground group-hover/command-trigger:text-foreground';

function CommandPaletteTrigger({ collapsed = false }) {
  const dispatch = useDispatch();
  const modKeyLabel = getModKeyLabel();
  const shortcutLabel = `${modKeyLabel}K`;

  const handleOpen = () => {
    dispatch(setCommandPaletteOpen(true));
  };

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(triggerClassName, 'mx-auto min-h-10 w-10 justify-center p-0')}
            onClick={handleOpen}
            aria-label={`Open command centre, ${shortcutLabel}`}
          >
            <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className={iconClassName} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{`Command centre (${shortcutLabel})`}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <button
      type="button"
      className={triggerClassName}
      onClick={handleOpen}
      aria-label={`Open command centre, ${shortcutLabel}`}
    >
      <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className={iconClassName} />
      <span className="flex-1 truncate text-start animate-in fade-in-0 duration-300 ease-out-quad">
        Search or jump to…
      </span>
      <Kbd className="border bg-background text-[11px] animate-in fade-in-0 duration-300 ease-out-quad dark:bg-muted">
        {shortcutLabel}
      </Kbd>
    </button>
  );
}

export default CommandPaletteTrigger;
