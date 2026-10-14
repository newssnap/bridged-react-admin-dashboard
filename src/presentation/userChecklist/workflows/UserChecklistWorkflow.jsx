import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  CheckListIcon,
  CloudOffIcon,
  DashboardSquare02Icon,
  Mail01Icon,
  TaskDone01Icon,
} from '@hugeicons/core-free-icons';
import { confirm } from '@/components/confirm-dialog';
import { useForm } from '@/components/form';
import {
  PageEmpty,
  PageHeader,
  PageToolbar,
  PageToolbarSpacer,
  ToolbarSearch,
} from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import useDebouncedInput from '../../../utils/controllers/useDebouncedInput';
import { useUserChecklistHandler } from '../controllers/useUserChecklistHandler';
import ChecklistDrawer from '../../defaultChecklist/components/ChecklistDrawer';
import TaskFormDrawer from '../../defaultChecklist/components/TaskFormDrawer';
import { ChecklistPanelSkeleton } from '../../defaultChecklist/components/ChecklistSkeletons';
import { plural } from '../../defaultChecklist/components/TaskRow';
import ChecklistPanel from '../components/ChecklistPanel';
import TaskDetailsDrawer from '../components/TaskDetailsDrawer';
import { nameOf } from '../components/PersonIdentity';

const NO_CHECKLISTS = [];

/** "Accounts / Checklist" above the title; Accounts links back. */
function ChecklistTrail() {
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13px]">
      <HugeiconsIcon
        icon={DashboardSquare02Icon}
        strokeWidth={2}
        className="size-3.5 shrink-0 text-muted-foreground"
      />
      <Link
        to="/"
        className="min-w-0 truncate rounded-sm font-medium text-muted-foreground transition-colors duration-150 ease-out-quad outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        Accounts
      </Link>
      <span aria-hidden className="text-muted-foreground/50">
        /
      </span>
      <span className="min-w-0 truncate font-medium text-muted-foreground">Checklist</span>
    </nav>
  );
}

function MetaItem({ icon, children }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <HugeiconsIcon icon={icon} strokeWidth={2} className="size-3.5 shrink-0" />
      <span className="truncate">{children}</span>
    </span>
  );
}

const UserChecklistWorkflow = () => {
  const { id } = useParams();
  const {
    userChecklist,
    teamMembers,
    taskComments,
    isLoadingUserChecklist,
    isUserChecklistError,
    isFetchingUserChecklist,
    refetchUserChecklist,
    isLoadingTeamMembers,
    isLoadingTaskComments,
    isUpdatingUserChecklist,
    isAddingDefaultChecklist,
    isCreatingTask,
    isUpdatingTask,
    isUploadingImage,
    isAddingTaskComment,
    handleAddDefaultChecklist,
    handleUpdateUserChecklist,
    handleDeleteUserChecklist,
    handleUploadImage,
    handleCreateTask,
    handleUpdateTask,
    handleGetTaskComments,
    clearTaskComments,
    handleAddTaskComment,
    handleDeleteTask,
  } = useUserChecklistHandler(id);
  const { inputQuery, debouncedValue, inputHandler } = useDebouncedInput('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [isTaskFormDrawerOpen, setIsTaskFormDrawerOpen] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskAttachments, setTaskAttachments] = useState([]);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [form] = useForm();
  const [taskForm] = useForm();
  const [isTaskInfoDrawerOpen, setIsTaskInfoDrawerOpen] = useState(false);
  const [selectedTaskInfo, setSelectedTaskInfo] = useState(null);
  const [newComment, setNewComment] = useState('');

  const checklists = userChecklist?.data || NO_CHECKLISTS;
  const members = teamMembers?.data;

  // The account this page is about: the team member with this id.
  const user = useMemo(() => (members || []).find(member => member?._id === id), [members, id]);
  const userName = nameOf(user);
  const userEmail = user?.email;

  const memberOptions = useMemo(
    () =>
      (members || [])
        .map(member => ({ label: member.email, value: member._id }))
        .sort((a, b) => (a.label ?? '').toLowerCase().localeCompare((b.label ?? '').toLowerCase())),
    [members]
  );

  const totals = useMemo(() => {
    const tasks = checklists.flatMap(checklist => checklist?.tasks || []);
    return { total: tasks.length, done: tasks.filter(task => task?.isCompleted).length };
  }, [checklists]);

  // Checklist drawer
  const handleDrawerOpen = () => {
    setIsEditing(false);
    setEditingRecord(null);
    form.resetFields();
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleFormSubmit = async values => {
    try {
      if (isEditing) {
        handleUpdateUserChecklist(
          editingRecord._id,
          { title: values.title, isDefault: false, assignedUser: id },
          handleDrawerClose
        );
      } else {
        handleAddDefaultChecklist(
          { title: values.title, tasks: [], isDefault: false, assignedUser: id },
          handleDrawerClose
        );
      }
    } catch (error) {
      toast.error(isEditing ? "Couldn't rename the checklist" : "Couldn't add the checklist");
    }
  };

  const handleEditChecklist = record => {
    setIsEditing(true);
    setEditingRecord(record);
    form.setFieldsValue({
      title: record.title,
    });
    setIsDrawerOpen(true);
  };

  const handleDeleteChecklist = record => {
    const tasks = record?.tasks?.length || 0;
    confirm({
      title: 'Delete this checklist?',
      description: `"${record?.title || 'This checklist'}"${
        tasks ? ` and its ${plural(tasks, 'task')}` : ''
      } will be removed from this account. This can't be undone.`,
      confirmText: 'Delete',
      variant: 'destructive',
      onConfirm: () => handleDeleteUserChecklist(record._id, handleDrawerClose),
    });
  };

  // Task form drawer
  const handleTaskFormDrawerOpen = (checklist, task = null) => {
    setSelectedChecklist(checklist);
    if (task) {
      setIsEditingTask(true);
      setEditingTask(task);
      setTaskAttachments(task.attachments || []);
      taskForm.setFieldsValue({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate ? dayjs(task.dueDate) : null,
        assignedUser: task.userEmail,
        isCompleted: task.isCompleted,
      });
    } else {
      setIsEditingTask(false);
      setEditingTask(null);
      setTaskAttachments([]);
      taskForm.resetFields();
    }
    setIsTaskFormDrawerOpen(true);
  };

  const handleTaskFormDrawerClose = () => {
    setIsTaskFormDrawerOpen(false);
    setIsEditingTask(false);
    setEditingTask(null);
    setTaskAttachments([]);
    taskForm.resetFields();
  };

  const handleTaskFormSubmit = async values => {
    try {
      const taskData = {
        title: values.title,
        description: values.description,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
        checklistId: selectedChecklist._id,
        assignedUser: values.assignedUser,
        attachments: taskAttachments,
        isCompleted: values.isCompleted || false,
      };
      let updatedTasks = [...selectedChecklist.tasks];
      if (isEditingTask) {
        updatedTasks = updatedTasks.map(task =>
          task._id === editingTask._id
            ? {
                ...task,
                title: values.title,
                description: values.description,
                attachments: taskAttachments,
                isCompleted: values.isCompleted || false,
              }
            : task
        );
        await handleUpdateTask(
          editingTask._id,
          {
            checklistId: selectedChecklist._id,
            title: values.title,
            description: values.description,
            attachments: taskAttachments,
            isCompleted: values.isCompleted || false,
          },
          () => {
            setSelectedChecklist({
              ...selectedChecklist,
              tasks: updatedTasks,
            });
            handleTaskFormDrawerClose();
          }
        );
      } else {
        await handleCreateTask(taskData, updatedTasks, () => {
          setSelectedChecklist({
            ...selectedChecklist,
            tasks: updatedTasks,
          });
          handleTaskFormDrawerClose();
        });
      }
    } catch (error) {
      toast.error(isEditingTask ? "Couldn't update the task" : "Couldn't add the task");
    }
  };

  const handleFileUpload = async file => {
    try {
      const uploadedFile = await handleUploadImage(file);
      if (uploadedFile) {
        setTaskAttachments(prev => [...prev, uploadedFile]);
        toast.success('Image uploaded');
      }
    } catch (error) {
      toast.error("Couldn't upload the image");
    }
  };

  const handleRemoveAttachment = file => {
    const newAttachments = taskAttachments.filter(attachment => attachment.url !== file.url);
    setTaskAttachments(newAttachments);
  };

  const handleDeleteTaskButton = async (task, checklist) => {
    const updatedTasks = (checklist?.tasks || []).filter(item => item._id !== task._id);
    setDeletingTaskId(task._id);
    try {
      await handleDeleteTask(task._id, () => {
        // Update local state after successful deletion
        setSelectedChecklist({
          ...checklist,
          tasks: updatedTasks,
        });
      });
    } finally {
      setDeletingTaskId(null);
    }
  };

  // Task details drawer
  const handleTaskInfoDrawerOpen = (task, checklist) => {
    setSelectedChecklist(checklist);
    setSelectedTaskInfo(task);
    setIsTaskInfoDrawerOpen(true);
    // Call API to get task comments
    handleGetTaskComments(task._id);
  };

  const handleTaskInfoDrawerClose = () => {
    setIsTaskInfoDrawerOpen(false);
    setSelectedTaskInfo(null);
    setNewComment('');
    clearTaskComments();
  };

  const handleEditFromDetails = task => {
    const checklist = selectedChecklist;
    handleTaskInfoDrawerClose();
    handleTaskFormDrawerOpen(checklist, task);
  };

  const handleAddComment = async () => {
    if (newComment.trim() && selectedTaskInfo) {
      try {
        await handleAddTaskComment(selectedTaskInfo._id, newComment.trim(), () => {
          setNewComment('');
          // Refresh comments by calling the API again
          handleGetTaskComments(selectedTaskInfo._id);
        });
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  const filteredChecklists = useMemo(() => {
    const term = debouncedValue.trim().toLowerCase();
    if (!term) return checklists;
    return checklists.filter(checklist => (checklist.title || '').toLowerCase().includes(term));
  }, [checklists, debouncedValue]);

  const hasError = isUserChecklistError && !isFetchingUserChecklist;
  const isLoadingIdentity = isLoadingTeamMembers;
  const percent = totals.total ? Math.round((totals.done / totals.total) * 100) : 0;
  // The first-run empty state carries the add action; the header holds it otherwise.
  const showCreateButton = isLoadingUserChecklist || hasError || checklists.length > 0;

  const assigneeLabelFor = checklist => {
    if (!checklist?.assignedUser || checklist.assignedUser === id) return null;
    return members?.find(member => member._id === checklist.assignedUser)?.email || null;
  };

  const renderContent = () => {
    if (isLoadingUserChecklist) {
      return (
        <div className="flex flex-col gap-6">
          <ChecklistPanelSkeleton rows={3} />
          <ChecklistPanelSkeleton rows={2} />
        </div>
      );
    }
    if (hasError) {
      return (
        <Empty className="rounded-lg border border-dashed bg-muted/30 py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={CloudOffIcon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>Couldn't load checklists</EmptyTitle>
            <EmptyDescription>Check your connection and try again.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" variant="outline" onClick={refetchUserChecklist}>
              Try again
            </Button>
          </EmptyContent>
        </Empty>
      );
    }
    if (checklists.length === 0) {
      return (
        <PageEmpty
          icon={CheckListIcon}
          title="No checklists yet"
          description="Add a checklist to give this account tasks to work through."
        >
          <Button type="button" onClick={handleDrawerOpen}>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
            Add checklist
          </Button>
        </PageEmpty>
      );
    }
    if (filteredChecklists.length === 0) {
      return (
        <PageEmpty
          icon={CheckListIcon}
          title={`No checklists match “${debouncedValue.trim()}”`}
          description="Try another name."
        >
          <Button type="button" variant="outline" onClick={() => inputHandler('')}>
            Clear search
          </Button>
        </PageEmpty>
      );
    }
    return (
      <div className="flex flex-col gap-6 animate-in fade-in-0 duration-300 ease-out-quad">
        {filteredChecklists.map(checklist => (
          <ChecklistPanel
            key={checklist._id}
            checklist={checklist}
            assigneeLabel={assigneeLabelFor(checklist)}
            onAddTask={item => handleTaskFormDrawerOpen(item)}
            onRename={handleEditChecklist}
            onDelete={handleDeleteChecklist}
            onOpenTask={handleTaskInfoDrawerOpen}
            onEditTask={(task, item) => handleTaskFormDrawerOpen(item, task)}
            onDeleteTask={handleDeleteTaskButton}
            deletingTaskId={deletingTaskId}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow={<ChecklistTrail />}
        title={
          isLoadingIdentity ? (
            <Skeleton className="h-8 w-56 md:h-9" />
          ) : (
            userName || userEmail || 'User checklist'
          )
        }
        actions={
          showCreateButton && (
            <Button type="button" onClick={handleDrawerOpen} disabled={isLoadingUserChecklist}>
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
              Add checklist
            </Button>
          )
        }
      >
        {isLoadingIdentity || isLoadingUserChecklist ? (
          <div className="mt-1 flex items-center gap-3">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-4 w-28" />
          </div>
        ) : (
          <div className="mt-1 flex flex-col gap-3">
            <div
              className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13.5px] text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              {userName && userEmail && <MetaItem icon={Mail01Icon}>{userEmail}</MetaItem>}
              {!hasError && (
                <>
                  <MetaItem icon={CheckListIcon}>{plural(checklists.length, 'checklist')}</MetaItem>
                  <MetaItem icon={TaskDone01Icon}>
                    {totals.total ? (
                      <span className="tabular-nums">
                        <span className="font-medium text-foreground">
                          {totals.done} of {plural(totals.total, 'task')}
                        </span>{' '}
                        done
                      </span>
                    ) : (
                      'No tasks yet'
                    )}
                  </MetaItem>
                </>
              )}
            </div>
            {!hasError && totals.total > 0 && (
              <Progress
                value={percent}
                aria-label={`${percent}% of tasks done`}
                className="h-1.5 max-w-sm"
              />
            )}
          </div>
        )}
      </PageHeader>

      {!hasError && !isLoadingUserChecklist && checklists.length > 0 && (
        <PageToolbar>
          <PageToolbarSpacer />
          <p className="shrink-0 text-sm text-muted-foreground tabular-nums" aria-live="polite">
            {plural(filteredChecklists.length, 'checklist')}
          </p>
          <ToolbarSearch
            value={inputQuery}
            onChange={inputHandler}
            placeholder="Search checklists"
          />
        </PageToolbar>
      )}

      {renderContent()}

      <ChecklistDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        isEditing={isEditing}
        form={form}
        onSubmit={handleFormSubmit}
        isLoading={isUpdatingUserChecklist || isAddingDefaultChecklist}
        description={
          isEditing ? 'Give this checklist a clearer name.' : 'Name the checklist for this account.'
        }
      />

      <TaskFormDrawer
        isOpen={isTaskFormDrawerOpen}
        onClose={handleTaskFormDrawerClose}
        isEditing={isEditingTask}
        form={taskForm}
        onSubmit={handleTaskFormSubmit}
        isLoading={isCreatingTask || isUpdatingTask}
        isUploadingImage={isUploadingImage}
        onFileUpload={handleFileUpload}
        uploadedFiles={taskAttachments}
        onRemoveFile={handleRemoveAttachment}
        withAssignment
        descriptionRequired
        memberOptions={memberOptions}
        checklistTitle={selectedChecklist?.title}
      />

      <TaskDetailsDrawer
        open={isTaskInfoDrawerOpen}
        onClose={handleTaskInfoDrawerClose}
        task={selectedTaskInfo}
        comments={taskComments?.data}
        isLoadingComments={isLoadingTaskComments}
        newComment={newComment}
        onNewCommentChange={setNewComment}
        onAddComment={handleAddComment}
        isAddingComment={isAddingTaskComment}
        onEdit={handleEditFromDetails}
      />
    </div>
  );
};

export default UserChecklistWorkflow;
