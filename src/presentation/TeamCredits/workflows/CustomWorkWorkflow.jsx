import React, { useMemo, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  ArrowRight01Icon,
  Briefcase01Icon,
  Coins01Icon,
  Loading03Icon,
  WorkHistoryIcon,
} from '@hugeicons/core-free-icons';
import { DataTable } from '@/components/data-table';
import {
  PageHeader,
  PageToolbar,
  PageToolbarSpacer,
  SegmentedControl,
  StatCell,
  StatStrip,
  ToolbarSearch,
} from '@/components/page-header';
import { Button } from '@/components/ui/button';
import useDebouncedInput from '../../../utils/controllers/useDebouncedInput';
import { useCustomWorkHandler } from '../controllers/useCustomWorkHandler';
import AddCustomWorkDrawer from '../components/AddCustomWorkDrawer';
import CustomWorkActions from '../components/CustomWorkActions';
import CustomWorkStatusBadge from '../components/CustomWorkStatusBadge';
import ListEmptyState from '../components/ListEmptyState';
import PreviewEditCustomWorkDrawer from '../components/PreviewEditCustomWorkDrawer';
import TableSkeleton from '../components/TableSkeleton';
import TeamIdentity from '../components/TeamIdentity';
import { CUSTOM_WORK_STATUS_FILTERS, getCategoryLabel } from '../constants/customWork';
import { formatDateRange, formatNumber, hasValue, plural } from '../utils/creditFormat';

const PAGE_SIZE = 15;

const statusKey = status => (typeof status === 'string' ? status.toLowerCase() : status);

function CustomWorkWorkflow() {
  const { inputQuery, debouncedValue, inputHandler } = useDebouncedInput('');
  const [status, setStatus] = useState('all');
  const {
    tableData,
    allTableData,
    isLoading,
    error,
    refetch,
    handleEdit,
    handlePreview,
    handleDelete,
    isAddDrawerOpen,
    teamsForSelect,
    isSubmitting,
    handleOpenAddDrawer,
    handleCloseAddDrawer,
    handleSubmitAddForm,
    isPreviewEditDrawerOpen,
    previewEditMode,
    selectedRecord,
    teamsForEditSelect,
    isEditSubmitting,
    handleClosePreviewEditDrawer,
    handleSubmitEditForm,
    isDeleting,
  } = useCustomWorkHandler(debouncedValue);

  const visibleData = useMemo(
    () =>
      status === 'all' ? tableData : tableData.filter(row => statusKey(row.status) === status),
    [tableData, status]
  );

  const stats = useMemo(
    () => ({
      entries: allTableData.length,
      creditsUsed: allTableData.reduce((sum, row) => sum + (Number(row.creditsUsed) || 0), 0),
      inExecution: allTableData.filter(row => statusKey(row.status) === 'pending').length,
    }),
    [allTableData]
  );

  const searching = Boolean(debouncedValue.trim());
  const filtered = searching || status !== 'all';
  const isError = Boolean(error) && !allTableData.length;
  const showSkeleton = isLoading && !allTableData.length;
  // First run: the empty state carries the add action, so the header doesn't repeat it.
  const isFirstRun = !showSkeleton && !isError && !allTableData.length;

  const clearFilters = () => {
    inputHandler('');
    setStatus('all');
  };

  const columns = [
    {
      accessorKey: 'workProject',
      id: 'work',
      header: 'Work or project',
      meta: { minWidth: 220 },
      cell: ({ row }) => {
        const record = row.original;
        const title = hasValue(record.workProject) ? record.workProject : 'Untitled work';
        return (
          <div className="flex max-w-full min-w-0 flex-col">
            <span className="truncate font-medium text-foreground" title={title}>
              {title}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {hasValue(record.category) ? getCategoryLabel(record.category) : 'No category'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'teamName',
      id: 'team',
      header: 'Team',
      meta: { minWidth: 200 },
      cell: ({ row }) => (
        <TeamIdentity teamName={row.original.teamName} companyName={row.original.companyName} />
      ),
    },
    {
      accessorKey: 'creditsUsed',
      id: 'creditsUsed',
      header: 'Credits used',
      meta: { align: 'right', width: 130 },
      cell: ({ getValue }) => (
        <span className="font-medium tabular-nums">{formatNumber(Number(getValue()) || 0)}</span>
      ),
    },
    {
      accessorKey: 'status',
      id: 'status',
      header: 'Status',
      meta: { width: 140 },
      cell: ({ getValue }) => <CustomWorkStatusBadge status={getValue()} />,
    },
    {
      id: 'dates',
      header: 'Dates',
      meta: { width: 200 },
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground tabular-nums">
          {formatDateRange(row.original.startDate, row.original.endDate)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      meta: { align: 'right', width: 120, pin: 'end' },
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <CustomWorkActions
            record={row.original}
            onEdit={handleEdit}
            onPreview={handlePreview}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
          {/* The row opens the entry's details; the chevron says so. */}
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            strokeWidth={2}
            aria-hidden
            className="size-4 text-muted-foreground"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Custom work"
        description="Work done for teams outside the product, and the credits it used."
        actions={
          !isFirstRun && (
            <Button type="button" onClick={handleOpenAddDrawer} disabled={showSkeleton}>
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
              Add custom work
            </Button>
          )
        }
      />

      {!isError && (
        <StatStrip>
          <StatCell
            label="Entries"
            icon={<HugeiconsIcon icon={Briefcase01Icon} strokeWidth={2} />}
            value={stats.entries}
            loading={showSkeleton}
          />
          <StatCell
            label="Credits used"
            icon={<HugeiconsIcon icon={Coins01Icon} strokeWidth={2} />}
            value={stats.creditsUsed}
            hint="Across all custom work"
            loading={showSkeleton}
          />
          <StatCell
            label="In execution"
            icon={<HugeiconsIcon icon={Loading03Icon} strokeWidth={2} />}
            value={stats.inExecution}
            hint="Work still under way"
            loading={showSkeleton}
          />
        </StatStrip>
      )}

      <PageToolbar>
        <SegmentedControl
          options={CUSTOM_WORK_STATUS_FILTERS}
          value={status}
          onValueChange={setStatus}
          label="Status"
          layoutId="custom-work-status"
        />
        <PageToolbarSpacer />
        {!showSkeleton && !isError && (
          <p className="shrink-0 text-sm text-muted-foreground tabular-nums" aria-live="polite">
            {plural(visibleData.length, 'entry', 'entries')}
          </p>
        )}
        <ToolbarSearch
          value={inputQuery}
          onChange={inputHandler}
          placeholder="Search teams, work or categories"
        />
      </PageToolbar>

      {showSkeleton ? (
        <TableSkeleton columns={5} />
      ) : visibleData.length === 0 ? (
        <ListEmptyState
          icon={WorkHistoryIcon}
          isError={isError}
          onRetry={refetch}
          errorTitle="Couldn't load custom work"
          filtered={filtered}
          filteredTitle={
            searching
              ? `No custom work matches “${debouncedValue.trim()}”`
              : 'No custom work matches this status'
          }
          filteredDescription={
            searching ? 'Try another team, title or category.' : 'Pick another status.'
          }
          onClearFilters={clearFilters}
          emptyTitle="No custom work yet"
          emptyDescription="Log work done for a team to keep track of the credits it used."
          actionLabel="Add custom work"
          onAction={handleOpenAddDrawer}
        />
      ) : (
        <DataTable
          key={`${status}:${debouncedValue}`}
          columns={columns}
          data={visibleData}
          loading={isLoading}
          getRowId={(record, index) => String(record.key ?? index)}
          onRowClick={record => handlePreview(record)}
          pagination={visibleData.length > PAGE_SIZE}
          initialState={{ pagination: { pageIndex: 0, pageSize: PAGE_SIZE } }}
          paginationProps={{ align: 'start', showSizeChanger: false }}
          minWidth={900}
        />
      )}

      <AddCustomWorkDrawer
        open={isAddDrawerOpen}
        onClose={handleCloseAddDrawer}
        teamsData={teamsForSelect}
        onSubmit={handleSubmitAddForm}
        isSubmitting={isSubmitting}
      />

      <PreviewEditCustomWorkDrawer
        open={isPreviewEditDrawerOpen}
        onClose={handleClosePreviewEditDrawer}
        mode={previewEditMode}
        initialRecord={selectedRecord}
        teamsData={teamsForEditSelect}
        onSubmit={handleSubmitEditForm}
        isSubmitting={isEditSubmitting}
        onEdit={handleEdit}
        onPreview={handlePreview}
      />
    </div>
  );
}

export default CustomWorkWorkflow;
