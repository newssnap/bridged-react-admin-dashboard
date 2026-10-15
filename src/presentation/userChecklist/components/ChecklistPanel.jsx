import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Attachment01Icon,
  Calendar03Icon,
  Delete02Icon,
  MoreHorizontalIcon,
  PencilEdit02Icon,
  UserIcon,
} from '@hugeicons/core-free-icons';
import { Panel, PanelEmpty } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import formatDate from '../../../utils/formatting/formateDate';
import TaskRow, { plural } from '../../defaultChecklist/components/TaskRow';
import { TaskStatusBadge } from './TaskDetailsDrawer';

function TaskMeta({ task }) {
  const files = task?.attachments?.length || 0;
  return (
    <>
      <span className="inline-flex items-center gap-1 tabular-nums">
        <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-3.5" />
        {task?.dueDate ? `Due ${formatDate(task.dueDate)}` : 'No due date'}
      </span>
      {task?.userEmail && (
        <span className="inline-flex min-w-0 items-center gap-1">
          <HugeiconsIcon icon={UserIcon} strokeWidth={2} className="size-3.5 shrink-0" />
          <span className="truncate">{task.userEmail}</span>
        </span>
      )}
      {files > 0 && (
        <span className="inline-flex items-center gap-1 tabular-nums">
          <HugeiconsIcon icon={Attachment01Icon} strokeWidth={2} className="size-3.5" />
          {plural(files, 'image')}
        </span>
      )}
    </>
  );
}

/** One of the account's checklists: its progress, its tasks, and Add task / Rename / Delete. */
function ChecklistPanel({
  checklist,
  assigneeLabel,
  onAddTask,
  onRename,
  onDelete,
  onOpenTask,
  onEditTask,
  onDeleteTask,
  deletingTaskId,
}) {
  const tasks = checklist?.tasks || [];
  const done = tasks.filter(task => task?.isCompleted).length;
  const title = checklist?.title || 'Untitled checklist';
  const progress = tasks.length ? `${done} of ${tasks.length} done` : 'No tasks yet';

  return (
    <Panel
      title={title}
      description={assigneeLabel ? `${progress} · Assigned to ${assigneeLabel}` : progress}
      bodyClassName="pt-3 pb-0"
      aside={
        <div className="-me-1.5 flex shrink-0 items-center gap-1">
          <Button type="button" variant="outline" size="sm" onClick={() => onAddTask(checklist)}>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
            Add task
          </Button>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`More actions for ${title}`}
                className="text-muted-foreground hover:text-foreground aria-expanded:bg-muted"
              >
                <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onSelect={() => onRename(checklist)}>
                <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
                Rename checklist
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => onDelete(checklist)}>
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                Delete checklist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      {tasks.length === 0 ? (
        <PanelEmpty>No tasks in this checklist yet. Add the first one.</PanelEmpty>
      ) : (
        <ul aria-label={`Tasks in ${title}`} className="divide-y border-t">
          {tasks.map(task => (
            <TaskRow
              key={task._id}
              task={task}
              completed={task.isCompleted}
              badge={<TaskStatusBadge completed={task.isCompleted} />}
              meta={<TaskMeta task={task} />}
              onOpen={item => onOpenTask(item, checklist)}
              onEdit={item => onEditTask(item, checklist)}
              onDelete={item => onDeleteTask(item, checklist)}
              deleting={deletingTaskId === task._id}
            />
          ))}
        </ul>
      )}
    </Panel>
  );
}

export default ChecklistPanel;
