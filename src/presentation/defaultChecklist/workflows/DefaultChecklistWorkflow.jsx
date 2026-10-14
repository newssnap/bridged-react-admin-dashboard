import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  ArrowRight01Icon,
  CheckListIcon,
  CloudOffIcon,
  Delete02Icon,
  PencilEdit02Icon,
} from '@hugeicons/core-free-icons';
import { ConfirmPopover } from '@/components/confirm-popover';
import { DataTable } from '@/components/data-table';
import { useForm } from '@/components/form';
import {
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
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import useDebouncedInput from '../../../utils/controllers/useDebouncedInput';
import formatDate from '../../../utils/formatting/formateDate';
import { useDefaultChecklistHandler } from '../controllers/useDefaultChecklistHandler';
import ChecklistDrawer from '../components/ChecklistDrawer';
import TaskManagementDrawer from '../components/TaskManagementDrawer';
import TaskFormDrawer from '../components/TaskFormDrawer';
import { ChecklistTableSkeleton } from '../components/ChecklistSkeletons';
import { plural } from '../components/TaskRow';

const PAGE_SIZE = 15;

const DefaultChecklistWorkflow = () => {
  const {
    defaultChecklists,
    isLoading,
    error,
    refetch,
    isFetching,
    handleAddDefaultChecklist,
    isAddingDefaultChecklist,
    handleDeleteDefaultChecklist,
    deletingChecklistId,
    handleUpdateDefaultChecklist,
    isUpdatingDefaultChecklist,
    handleUploadImage,
    isUploadingImage,
    handleCreateTask,
    isCreatingTask,
    handleDeleteTask,
    deletingTaskId,
    handleUpdateTask,
    isUpdatingTask,
  } = useDefaultChecklistHandler();
  const [form] = useForm();
  const [taskForm] = useForm();
  const { inputQuery, debouncedValue, inputHandler } = useDebouncedInput('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // Task management states
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Task form drawer states
  const [isTaskFormDrawerOpen, setIsTaskFormDrawerOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleAddChecklist = () => {
    setIsEditing(false);
    setEditingRecord(null);
    form.resetFields();
    setIsDrawerOpen(true);
  };

  const handleEditChecklist = record => {
    setIsEditing(true);
    setEditingRecord(record);
    form.setFieldsValue({
      title: record.title,
    });
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setIsEditing(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleFormSubmit = async values => {
    try {
      if (isEditing) {
        handleUpdateDefaultChecklist(
          editingRecord._id,
          { title: values.title, tasks: values.tasks, isDefault: true },
          handleDrawerClose
        );
      } else {
        handleAddDefaultChecklist(
          { title: values.title, tasks: [], isDefault: true },
          handleDrawerClose
        );
      }
      refetch(); // Refresh the data
    } catch (error) {
      toast.error(isEditing ? "Couldn't rename the checklist" : "Couldn't add the checklist");
    }
  };

  const handleDeleteChecklist = id => handleDeleteDefaultChecklist(id, handleDrawerClose);

  // Task management handlers
  const handleOpenTaskDrawer = checklist => {
    setSelectedChecklist(checklist);
    setIsTaskDrawerOpen(true);
  };

  const handleCloseTaskDrawer = () => {
    setIsTaskDrawerOpen(false);
    setSelectedChecklist(null);
    setIsEditingTask(false);
    setEditingTask(null);
    taskForm.resetFields();
  };

  const handleAddTask = () => {
    setIsEditingTask(false);
    setEditingTask(null);
    setUploadedFiles([]);
    taskForm.resetFields();
    setIsTaskFormDrawerOpen(true);
  };

  const handleEditTask = task => {
    setIsEditingTask(true);
    setEditingTask(task);
    setUploadedFiles(task.attachments || []);
    taskForm.setFieldsValue({
      title: task.title,
      description: task.description,
    });
    setIsTaskFormDrawerOpen(true);
  };

  const handleCloseTaskFormDrawer = () => {
    setIsTaskFormDrawerOpen(false);
    setIsEditingTask(false);
    setEditingTask(null);
    setUploadedFiles([]);
    taskForm.resetFields();
  };

  const handleFileUpload = async file => {
    try {
      const uploadedFile = await handleUploadImage(file);
      if (uploadedFile) {
        setUploadedFiles(prev => [...prev, uploadedFile]);
        toast.success('Image uploaded');
      }
    } catch (error) {
      toast.error("Couldn't upload the image");
    }
  };

  const handleRemoveFile = fileToRemove => {
    setUploadedFiles(prev => prev.filter(file => file.url !== fileToRemove.url));
  };

  const handleDeleteTaskButton = taskId => {
    const updatedTasks = selectedChecklist.tasks.filter(task => task._id !== taskId);
    return handleDeleteTask(taskId, () => {
      // Update local state
      setSelectedChecklist({
        ...selectedChecklist,
        tasks: updatedTasks,
      });
    });
  };

  const handleTaskFormSubmit = async values => {
    try {
      let updatedTasks = [...selectedChecklist.tasks];

      if (isEditingTask) {
        // Update existing task
        updatedTasks = updatedTasks.map(task =>
          task._id === editingTask._id
            ? {
                ...task,
                title: values.title,
                description: values.description,
                attachments: uploadedFiles,
              }
            : task
        );
        await handleUpdateTask(
          editingTask._id,
          {
            checklistId: selectedChecklist._id,
            title: values.title,
            description: values.description,
            attachments: uploadedFiles,
          },
          () => {
            setSelectedChecklist({
              ...selectedChecklist,
              tasks: updatedTasks,
            });
            handleCloseTaskFormDrawer();
          }
        );
      } else {
        await handleCreateTask(
          {
            title: values.title,
            description: values.description,
            attachments: uploadedFiles,
            isDefault: selectedChecklist.isDefault,
            checklistId: selectedChecklist._id,
          },
          updatedTasks,
          () => {
            setSelectedChecklist({
              ...selectedChecklist,
              tasks: updatedTasks,
            });
            handleCloseTaskFormDrawer();
          }
        );
      }
    } catch (error) {
      console.log('error', error);
      toast.error(isEditingTask ? "Couldn't update the task" : "Couldn't add the task");
    }
  };

  const filteredChecklists = useMemo(() => {
    const term = debouncedValue.trim().toLowerCase();
    if (!term) return defaultChecklists;
    return defaultChecklists.filter(checklist =>
      (checklist.title || '').toLowerCase().includes(term)
    );
  }, [defaultChecklists, debouncedValue]);

  const searching = Boolean(debouncedValue.trim());
  const hasError = Boolean(error) && !isFetching;

  const columns = [
    {
      accessorKey: 'title',
      id: 'title',
      header: 'Checklist',
      meta: { ellipsis: true },
      cell: ({ row }) => {
        const checklist = row.original;
        return (
          <div className="flex max-w-full min-w-0 items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HugeiconsIcon icon={CheckListIcon} strokeWidth={2} className="size-4" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium text-foreground" title={checklist.title}>
                {checklist.title || 'Untitled checklist'}
              </span>
              {checklist.createdDate && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  Added {formatDate(checklist.createdDate)}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: 'tasks',
      header: 'Tasks',
      meta: { width: '180px' },
      cell: ({ row }) => {
        const count = row.original?.tasks?.length || 0;
        return (
          <button
            type="button"
            onClick={event => {
              event.stopPropagation();
              handleOpenTaskDrawer(row.original);
            }}
            className="inline-flex items-center gap-1 rounded-sm text-sm font-medium text-foreground tabular-nums outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {count ? (
              plural(count, 'task')
            ) : (
              <span className="text-muted-foreground">No tasks</span>
            )}
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3.5" />
          </button>
        );
      },
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      meta: { align: 'right', width: '96px' },
      cell: ({ row }) => {
        const record = row.original;
        const name = record.title || 'this checklist';
        const deleting = deletingChecklistId === record._id;
        return (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div className="inline-flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`Rename ${name}`}
                  onClick={() => handleEditChecklist(record)}
                >
                  <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rename</TooltipContent>
            </Tooltip>
            <Tooltip>
              <ConfirmPopover
                title="Delete this checklist?"
                description={`"${name}" will no longer be given to new accounts. This can't be undone.`}
                confirmText="Delete"
                confirmVariant="destructive"
                align="end"
                onConfirm={() => handleDeleteChecklist(record._id)}
              >
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${name}`}
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
        );
      },
    },
  ];

  const emptyState = (
    <Empty className="py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={CheckListIcon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>
          {searching
            ? `No checklists match "${debouncedValue.trim()}"`
            : 'No default checklists yet'}
        </EmptyTitle>
        <EmptyDescription>
          {searching
            ? 'Try another name.'
            : 'Add a checklist, then fill it with the tasks new accounts should complete.'}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {searching ? (
          <Button type="button" variant="outline" onClick={() => inputHandler('')}>
            Clear search
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={handleAddChecklist}>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
            Add checklist
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );

  const renderContent = () => {
    if (isLoading) return <ChecklistTableSkeleton />;
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
            <Button type="button" variant="outline" onClick={refetch}>
              Try again
            </Button>
          </EmptyContent>
        </Empty>
      );
    }
    return (
      <div className="min-w-0 animate-in fade-in-0 duration-300 ease-out-quad">
        <DataTable
          columns={columns}
          data={filteredChecklists}
          getRowId={(record, index) => record?._id || String(index)}
          onRowClick={record => handleOpenTaskDrawer(record)}
          loading={isFetching && !isLoading}
          emptyState={emptyState}
          pagination={filteredChecklists.length > PAGE_SIZE}
          initialState={{ pagination: { pageIndex: 0, pageSize: PAGE_SIZE } }}
          paginationProps={{ align: 'start', showSizeChanger: false }}
          minWidth={560}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Default checklist"
        description="The checklists and tasks every new account starts with."
        actions={
          <Button type="button" onClick={handleAddChecklist}>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
            Add checklist
          </Button>
        }
      />

      <div className="flex flex-col gap-6">
        <PageToolbar>
          <PageToolbarSpacer />
          {!isLoading && !hasError && (
            <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
              {plural(filteredChecklists.length, 'checklist')}
            </p>
          )}
          <ToolbarSearch
            value={inputQuery}
            onChange={inputHandler}
            placeholder="Search checklists"
          />
        </PageToolbar>

        {renderContent()}
      </div>

      <ChecklistDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        isEditing={isEditing}
        form={form}
        onSubmit={handleFormSubmit}
        isLoading={isAddingDefaultChecklist || isUpdatingDefaultChecklist}
      />

      <TaskManagementDrawer
        isOpen={isTaskDrawerOpen}
        onClose={handleCloseTaskDrawer}
        selectedChecklist={selectedChecklist}
        onAddTask={handleAddTask}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTaskButton}
        deletingTaskId={deletingTaskId}
      />

      <TaskFormDrawer
        isOpen={isTaskFormDrawerOpen}
        onClose={handleCloseTaskFormDrawer}
        isEditing={isEditingTask}
        form={taskForm}
        onSubmit={handleTaskFormSubmit}
        isLoading={isCreatingTask || isUpdatingTask}
        isUploadingImage={isUploadingImage}
        onFileUpload={handleFileUpload}
        uploadedFiles={uploadedFiles}
        onRemoveFile={handleRemoveFile}
        checklistTitle={selectedChecklist?.title}
      />
    </div>
  );
};

export default DefaultChecklistWorkflow;
