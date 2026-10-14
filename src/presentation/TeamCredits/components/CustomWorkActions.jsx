import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Delete02Icon,
  MoreHorizontalIcon,
  PencilEdit02Icon,
  ViewIcon,
} from '@hugeicons/core-free-icons';
import { confirm } from '@/components/confirm-dialog';
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
import { hasValue } from '../utils/creditFormat';

/**
 * Row actions for a custom work entry: Edit as a button, View details and Delete in the
 * "More" menu. Clicks never reach the row (which opens the details).
 */
function CustomWorkActions({ record, onEdit, onPreview, onDelete, isDeleting }) {
  const name = hasValue(record?.workProject) ? record.workProject : 'this entry';

  const askDelete = () =>
    confirm({
      title: 'Delete this custom work?',
      description: `“${name}” is removed from the team's custom work. This can't be undone.`,
      confirmText: 'Delete',
      variant: 'destructive',
      icon: <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="text-destructive" />,
      onConfirm: () => onDelete(record),
    });

  return (
    <div className="flex items-center justify-end gap-0.5" onClick={e => e.stopPropagation()}>
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
            className="text-muted-foreground hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground"
          >
            {isDeleting ? <Spinner /> : <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onSelect={() => onPreview(record)}>
            <HugeiconsIcon icon={ViewIcon} strokeWidth={2} />
            View details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" disabled={isDeleting} onSelect={askDelete}>
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default CustomWorkActions;
