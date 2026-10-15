import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Delete02Icon,
  PencilEdit02Icon,
  Task01Icon,
  TaskDone01Icon,
} from '@hugeicons/core-free-icons';
import { ConfirmPopover } from '@/components/confirm-popover';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export const plural = (count, word) => `${count} ${count === 1 ? word : `${word}s`}`;

/**
 * One task in a checklist: an icon tile, the title (opens the task when `onOpen` is given),
 * a one-line description, a quiet meta line, an optional status badge, then Edit and Delete.
 */
function TaskRow({ task, completed = false, meta, badge, onOpen, onEdit, onDelete, deleting }) {
  const title = task?.title || 'Untitled task';

  return (
    <li className="group/task flex items-start gap-3 px-5 py-3.5 transition-colors duration-150 ease-out-quad hover:bg-muted/40">
      <span
        className={cn(
          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md',
          completed ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
        )}
      >
        <HugeiconsIcon
          icon={completed ? TaskDone01Icon : Task01Icon}
          strokeWidth={2}
          className="size-4"
        />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          {onOpen ? (
            <button
              type="button"
              onClick={() => onOpen(task)}
              className="min-w-0 truncate rounded-sm text-start text-sm font-medium text-foreground underline-offset-4 outline-none hover:text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {title}
            </button>
          ) : (
            <span className="min-w-0 truncate text-sm font-medium text-foreground">{title}</span>
          )}
          {badge}
        </div>
        {task?.description && (
          <p className="line-clamp-1 text-[13px] text-muted-foreground">{task.description}</p>
        )}
        {meta && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {meta}
          </div>
        )}
      </div>

      <div className="-me-1.5 inline-flex shrink-0 items-center gap-0.5 opacity-70 transition-opacity duration-150 ease-out-quad group-focus-within/task:opacity-100 group-hover/task:opacity-100">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Edit ${title}`}
              className="text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(task)}
            >
              <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>
        <Tooltip>
          <ConfirmPopover
            title="Delete this task?"
            description={`"${title}" will be removed from the checklist. This can't be undone.`}
            confirmText="Delete"
            confirmVariant="destructive"
            align="end"
            onConfirm={() => onDelete(task)}
          >
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${title}`}
                disabled={deleting}
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/15"
              >
                {deleting ? <Spinner /> : <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />}
              </Button>
            </TooltipTrigger>
          </ConfirmPopover>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </div>
    </li>
  );
}

export default TaskRow;
