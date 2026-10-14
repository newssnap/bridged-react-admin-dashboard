import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Comment01Icon, PencilEdit02Icon } from '@hugeicons/core-free-icons';
import { Badge } from '@/components/badge';
import { Button } from '@/components/ui/button';
import {
  Empty,
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
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import formatDate, { formatDateAndTime } from '../../../utils/formatting/formateDate';
import PersonIdentity, { nameOf } from './PersonIdentity';

export function TaskStatusBadge({ completed }) {
  return completed ? (
    <Badge variant="secondary">Completed</Badge>
  ) : (
    <Badge variant="warning">Pending</Badge>
  );
}

function DetailRow({ label, children }) {
  return (
    <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center sm:gap-4">
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm">{children}</dd>
    </div>
  );
}

function CommentsSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-4">
      {[0, 1].map(item => (
        <div key={item} className="flex items-start gap-3">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-32 rounded-md" />
            <Skeleton className="h-3.5 w-3/4 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Read a task (assignee, due date, description, images) and its comment thread. */
function TaskDetailsDrawer({
  open,
  onClose,
  task,
  comments,
  isLoadingComments,
  newComment,
  onNewCommentChange,
  onAddComment,
  isAddingComment,
  onEdit,
}) {
  const attachments = task?.attachments || [];
  const commentList = comments || [];
  const canComment = Boolean(newComment?.trim()) && !isAddingComment;

  return (
    <Sheet
      open={open}
      onOpenChange={next => {
        if (!next) onClose();
      }}
    >
      <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[600px]">
        <SheetHeader className="border-b pe-14">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <SheetTitle className="min-w-0 truncate text-[17px] font-semibold tracking-[-0.01em]">
              {task?.title || 'Task'}
            </SheetTitle>
            {task && <TaskStatusBadge completed={task.isCompleted} />}
          </div>
          <SheetDescription>
            {task?.createdDate ? `Added ${formatDate(task.createdDate)}` : 'Task details'}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto" data-flat="true">
          {task && (
            <>
              <section aria-label="Details" className="border-b px-6 py-2">
                <dl className="divide-y divide-border/60">
                  <DetailRow label="Assignee">
                    {task.userEmail || nameOf(task) ? (
                      <PersonIdentity
                        size="sm"
                        photo={task.userAvatar}
                        name={nameOf(task)}
                        email={task.userEmail}
                      />
                    ) : (
                      '—'
                    )}
                  </DetailRow>
                  <DetailRow label="Due date">
                    <span className="tabular-nums">
                      {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                    </span>
                  </DetailRow>
                  <DetailRow label="Images">
                    {attachments.length ? (
                      <div className="flex flex-wrap gap-2">
                        {attachments.map((file, index) => (
                          <a
                            key={file?.url || index}
                            href={file?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={file?.fileName || 'Open image'}
                            className="block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                          >
                            <img
                              src={file?.url}
                              alt={file?.fileName || ''}
                              className="size-14 rounded-md bg-muted object-cover ring-1 ring-foreground/10"
                            />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </DetailRow>
                </dl>
              </section>

              <section aria-labelledby="task-description" className="border-b px-6 py-5">
                <h3 id="task-description" className="mb-2 text-sm font-semibold">
                  Description
                </h3>
                {task.description ? (
                  <p className="text-sm leading-relaxed break-words whitespace-pre-wrap text-foreground/90">
                    {task.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">No description added.</p>
                )}
              </section>

              <section aria-labelledby="task-comments" className="px-6 py-5">
                <h3 id="task-comments" className="mb-4 text-sm font-semibold">
                  Comments
                  {!isLoadingComments && commentList.length > 0 && (
                    <span className="ms-1.5 font-normal text-muted-foreground tabular-nums">
                      {commentList.length}
                    </span>
                  )}
                </h3>
                {isLoadingComments ? (
                  <CommentsSkeleton />
                ) : commentList.length === 0 ? (
                  <Empty className="rounded-lg border border-dashed bg-muted/30 py-8">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <HugeiconsIcon icon={Comment01Icon} strokeWidth={2} />
                      </EmptyMedia>
                      <EmptyTitle>No comments yet</EmptyTitle>
                      <EmptyDescription>Add the first comment below.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <ul className="flex flex-col gap-4">
                    {commentList.map((comment, index) => (
                      <li key={comment._id || index} className="flex flex-col gap-1.5">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <PersonIdentity
                            size="sm"
                            photo={comment.userAvatar}
                            name={comment.userFullName}
                            className="min-w-0"
                          />
                          {comment.isAdmin && <Badge variant="outline">Admin</Badge>}
                          {comment.createdDate && (
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {formatDateAndTime(comment.createdDate)}
                            </span>
                          )}
                        </div>
                        <p className="ms-10 rounded-md bg-muted/50 px-3 py-2 text-sm leading-relaxed break-words whitespace-pre-wrap">
                          {comment.comment}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>

        <SheetFooter className="gap-3 border-t px-6 py-4">
          <Textarea
            aria-label="Add a comment"
            placeholder="Add a comment"
            value={newComment}
            onChange={event => onNewCommentChange(event.target.value)}
            className="max-h-40 min-h-20"
          />
          <div className="flex flex-row justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onEdit(task)}>
              <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} data-icon="inline-start" />
              Edit task
            </Button>
            <Button type="button" onClick={onAddComment} disabled={!canComment}>
              {isAddingComment && <Spinner data-icon="inline-start" />}
              {isAddingComment ? 'Commenting…' : 'Comment'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default TaskDetailsDrawer;
