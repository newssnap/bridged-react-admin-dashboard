import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Attachment01Icon, Task01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import TaskRow, { plural } from './TaskRow';

/** The tasks of one default checklist, with Add / Edit / Delete. */
const TaskManagementDrawer = ({
  isOpen,
  onClose,
  selectedChecklist,
  onAddTask,
  onEditTask,
  onDeleteTask,
  deletingTaskId,
}) => {
  const tasks = selectedChecklist?.tasks || [];

  return (
    <Sheet
      open={isOpen}
      onOpenChange={next => {
        if (!next) onClose();
      }}
    >
      <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[600px]">
        <SheetHeader className="border-b pe-14">
          <SheetTitle className="truncate text-[17px] font-semibold tracking-[-0.01em]">
            {selectedChecklist?.title || 'Checklist'}
          </SheetTitle>
          <SheetDescription>
            {tasks.length
              ? `${plural(tasks.length, 'task')} in this default checklist.`
              : 'This default checklist has no tasks yet.'}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto" data-flat="true">
          {tasks.length === 0 ? (
            <Empty className="px-6 py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={Task01Icon} strokeWidth={2} />
                </EmptyMedia>
                <EmptyTitle>No tasks yet</EmptyTitle>
                <EmptyDescription>Add the first task people should complete.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button type="button" variant="outline" onClick={onAddTask}>
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
                  Add task
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <ul aria-label="Tasks" className="divide-y border-b">
              {tasks.map(task => {
                const files = task?.attachments?.length || 0;
                return (
                  <TaskRow
                    key={task._id}
                    task={task}
                    meta={
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <HugeiconsIcon
                          icon={Attachment01Icon}
                          strokeWidth={2}
                          className="size-3.5"
                        />
                        {files ? plural(files, 'image') : 'No images'}
                      </span>
                    }
                    onEdit={onEditTask}
                    onDelete={item => onDeleteTask(item._id)}
                    deleting={deletingTaskId === task._id}
                  />
                );
              })}
            </ul>
          )}
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          {tasks.length > 0 && (
            <Button type="button" onClick={onAddTask}>
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
              Add task
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default TaskManagementDrawer;
