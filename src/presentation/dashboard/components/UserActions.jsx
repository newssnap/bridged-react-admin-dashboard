import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ComputerIcon,
  FileExportIcon,
  MoreHorizontalIcon,
  PauseIcon,
  PencilEdit02Icon,
  PlayIcon,
  PuzzleIcon,
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { confirm } from '@/components/confirm-dialog';
import { realName } from './AccountParts';

/**
 * Row actions for a user: Edit as a button, everything else in one "More" menu (sign in as
 * the user, export a report, then activate / deactivate after a separator). While a menu
 * action is getting a token for this row, its trigger shows a spinner. Clicks never reach the
 * row underneath (it opens the edit drawer).
 */
function UserActions({
  record,
  busy = false,
  onEdit,
  onExportReport,
  onLoginPortal,
  onLoginPlugin,
  onUpdateStatus,
}) {
  const name = realName(record?.fullname) || record?.email || 'this user';
  const isInactive = record?.status === 'inactive';

  const askStatusChange = () =>
    confirm({
      title: isInactive ? 'Activate this user?' : 'Deactivate this user?',
      description: isInactive
        ? `${name} can sign in again.`
        : `${name} can't sign in until you activate them again.`,
      confirmText: isInactive ? 'Activate' : 'Deactivate',
      variant: isInactive ? 'default' : 'destructive',
      icon: (
        <HugeiconsIcon
          icon={isInactive ? PlayIcon : PauseIcon}
          strokeWidth={2}
          className={isInactive ? undefined : 'text-destructive'}
        />
      ),
      // Errors are reported by the handler; close the dialog either way.
      onConfirm: () => onUpdateStatus(record).catch(() => {}),
    });

  return (
    <div className="inline-flex items-center gap-0.5" onClick={event => event.stopPropagation()}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${name}`}
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(record)}
          >
            <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit</TooltipContent>
      </Tooltip>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`More actions for ${name}`}
            disabled={busy}
            className="text-muted-foreground hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground"
          >
            {busy ? <Spinner /> : <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onSelect={() => onLoginPortal(record)}>
            <HugeiconsIcon icon={ComputerIcon} strokeWidth={2} />
            Sign in to portal
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onLoginPlugin(record)}>
            <HugeiconsIcon icon={PuzzleIcon} strokeWidth={2} />
            Sign in to plugin
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onExportReport(record)}>
            <HugeiconsIcon icon={FileExportIcon} strokeWidth={2} />
            Export report
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {isInactive ? (
            <DropdownMenuItem onSelect={askStatusChange}>
              <HugeiconsIcon icon={PlayIcon} strokeWidth={2} />
              Activate
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem variant="destructive" onSelect={askStatusChange}>
              <HugeiconsIcon icon={PauseIcon} strokeWidth={2} />
              Deactivate
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default UserActions;
