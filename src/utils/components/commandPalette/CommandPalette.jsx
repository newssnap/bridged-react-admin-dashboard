import React, { useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, Moon02Icon, Search01Icon, Sun03Icon } from '@hugeicons/core-free-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Kbd } from '@/components/ui/kbd';
import { setCommandPaletteOpen } from '../../../redux/slices/appSlice';
import { getNavigationCommands } from '../../../constants/navigation/navConfig';
import { applyTheme } from '../../../hooks/use-theme-transition';

const isMac = () =>
  typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

/** ⌘K anywhere: jump to an admin page or switch the theme. */
function CommandPalette() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector(state => state.app.isCommandPaletteOpen);
  const isDarkTheme = useSelector(state => state.app.isDarkTheme);

  useEffect(() => {
    const handleKeyDown = event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        dispatch(setCommandPaletteOpen(!isOpen));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, isOpen]);

  const close = () => dispatch(setCommandPaletteOpen(false));
  const run = action => {
    close();
    action();
  };

  const groups = getNavigationCommands().reduce((acc, item) => {
    (acc[item.group] ||= []).push(item);
    return acc;
  }, {});

  const itemClassName = 'gap-3 rounded-md! px-2 py-1.5';
  const tile = icon => (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors duration-150 ease-out-quad group-data-selected/command-item:bg-primary/10 group-data-selected/command-item:text-primary">
      <HugeiconsIcon icon={icon} strokeWidth={2} className="size-[15px]" />
    </span>
  );
  const enterHint = (
    <CommandShortcut className="opacity-0 transition-opacity duration-150 ease-out-quad group-data-selected/command-item:opacity-100">
      <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
    </CommandShortcut>
  );

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={next => !next && close()}
      title="Command palette"
      description="Search pages and actions."
      className="top-[max(1rem,calc(50%-16rem))] gap-0 rounded-xl! sm:max-w-[560px]"
    >
      <Command loop className="rounded-none p-1.5 pb-0">
        <CommandInput
          autoFocus
          placeholder="Search pages and actions…"
          className="h-10 text-[14px]"
        />
        <CommandList className="max-h-[min(420px,60vh)] pt-1">
          <CommandEmpty className="flex flex-col items-center gap-2 px-6 py-10">
            <span className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="size-5" />
            </span>
            <span className="text-sm font-medium text-foreground">No results</span>
            <span className="text-[13px] text-muted-foreground">
              Try a page, like Teams or Companies.
            </span>
          </CommandEmpty>
          {Object.entries(groups).map(([group, items], index) => (
            <React.Fragment key={group}>
              {index > 0 && <CommandSeparator />}
              <CommandGroup heading={group}>
                {items.map(item => (
                  <CommandItem
                    key={item.path}
                    value={`${item.label} ${group}`}
                    onSelect={() => run(() => navigate(item.path))}
                    className={itemClassName}
                  >
                    {tile(item.icon)}
                    <span className="min-w-0 truncate">{item.label}</span>
                    {enterHint}
                  </CommandItem>
                ))}
              </CommandGroup>
            </React.Fragment>
          ))}
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem
              value="Switch theme dark light mode"
              onSelect={() => run(() => applyTheme(dispatch, !isDarkTheme))}
              className={itemClassName}
            >
              {tile(isDarkTheme ? Sun03Icon : Moon02Icon)}
              <span className="min-w-0 truncate">
                {isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
              </span>
              {enterHint}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
      <div className="flex items-center gap-4 border-t bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground select-none">
        <span className="flex items-center gap-1.5">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          Move
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>↵</Kbd>
          Open
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>esc</Kbd>
          Close
        </span>
        <span className="ms-auto flex items-center gap-1.5">
          <Kbd>{isMac() ? '⌘' : 'Ctrl'} K</Kbd>
          Anywhere
        </span>
      </div>
    </CommandDialog>
  );
}

export default CommandPalette;
