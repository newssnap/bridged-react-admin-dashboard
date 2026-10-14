import React, { useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Alert02Icon,
  Coins01Icon,
  UserGroupIcon,
  Wallet01Icon,
} from '@hugeicons/core-free-icons';
import { Badge } from '@/components/badge';
import { DataTable } from '@/components/data-table';
import {
  PageHeader,
  PageToolbar,
  PageToolbarSpacer,
  StatCell,
  StatStrip,
  ToolbarSearch,
} from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import useDebouncedInput from '../../../utils/controllers/useDebouncedInput';
import formatDate from '../../../utils/formatting/formateDate';
import { useTeamCreditsHandler } from '../controllers/useTeamCreditsHandler';
import AddTeamCreditsDrawer from '../components/AddTeamCreditsDrawer';
import ListEmptyState from '../components/ListEmptyState';
import ManageCreditsDrawer from '../components/ManageCreditsDrawer';
import TableSkeleton from '../components/TableSkeleton';
import TeamIdentity from '../components/TeamIdentity';
import { formatNumber, hasValue, plural } from '../utils/creditFormat';

const PAGE_SIZE = 15;

function TeamCreditsWorkflow() {
  const { inputQuery, debouncedValue, inputHandler } = useDebouncedInput('');
  const {
    tableData,
    allTableData,
    isLoading,
    error,
    refetch,
    isDrawerOpen,
    selectedTeamData,
    historyData,
    isLoadingHistory,
    isSubmitting,
    isEditingHistorySubmitting,
    handleOpenDrawer,
    handleCloseDrawer,
    handleSubmitForm,
    handleEditCreditsHistorySubmit,
    isAddDrawerOpen,
    selectedTeamIdForAdd,
    selectedTeamDataForAdd,
    addHistoryData,
    isLoadingAddHistory,
    handleOpenAddDrawer,
    handleCloseAddDrawer,
    handleTeamSelectForAdd,
    handleSubmitAddForm,
    form,
  } = useTeamCreditsHandler(debouncedValue);

  const searching = Boolean(debouncedValue.trim());
  const isError = Boolean(error) && !allTableData.length;
  const showSkeleton = isLoading && !allTableData.length;

  const stats = useMemo(() => {
    const totalBalance = allTableData.reduce(
      (sum, team) => sum + (Number(team.creditBalance) || 0),
      0
    );
    const outOfCredits = allTableData.filter(team => (Number(team.creditBalance) || 0) <= 0);
    return { teams: allTableData.length, totalBalance, outOfCredits: outOfCredits.length };
  }, [allTableData]);

  const columns = [
    {
      accessorKey: 'teamName',
      id: 'team',
      header: 'Team',
      meta: { minWidth: 240 },
      cell: ({ row }) => (
        <TeamIdentity teamName={row.original.teamName} companyName={row.original.companyName} />
      ),
    },
    {
      accessorKey: 'creditBalance',
      id: 'creditBalance',
      header: 'Credit balance',
      meta: { align: 'right', width: 200 },
      cell: ({ getValue }) => {
        const balance = Number(getValue()) || 0;
        return (
          <span className="inline-flex items-center justify-end gap-2">
            {balance <= 0 && <Badge variant="destructive">No credits left</Badge>}
            <span
              className={cn(
                'font-medium tabular-nums',
                balance < 0 ? 'text-destructive' : 'text-foreground'
              )}
            >
              {formatNumber(balance)}
            </span>
          </span>
        );
      },
    },
    {
      accessorKey: 'lastUpdated',
      id: 'lastUpdated',
      header: 'Last updated',
      meta: { width: 160 },
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap text-muted-foreground tabular-nums">
          {formatDate(getValue())}
        </span>
      ),
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      meta: { align: 'right', width: 64 },
      cell: ({ row }) => {
        const record = row.original;
        const name = hasValue(record.teamName) ? record.teamName : 'this team';
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Manage credits for ${name}`}
                className="text-muted-foreground hover:text-foreground"
                onClick={event => {
                  event.stopPropagation();
                  handleOpenDrawer(record.teamId);
                }}
              >
                <HugeiconsIcon icon={Coins01Icon} strokeWidth={2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Manage credits</TooltipContent>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Team credits"
        description="Each team's credit balance, and the ledger of credits assigned or deducted."
        actions={
          <Button type="button" onClick={handleOpenAddDrawer} disabled={showSkeleton}>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
            Add credits
          </Button>
        }
      />

      {!isError && (
        <StatStrip>
          <StatCell
            label="Teams with credits"
            icon={<HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />}
            value={stats.teams}
            loading={showSkeleton}
          />
          <StatCell
            label="Total balance"
            icon={<HugeiconsIcon icon={Wallet01Icon} strokeWidth={2} />}
            value={stats.totalBalance}
            hint="Credits left across all teams"
            loading={showSkeleton}
          />
          <StatCell
            label="Out of credits"
            icon={<HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />}
            value={stats.outOfCredits}
            hint="Teams with a balance of 0 or less"
            loading={showSkeleton}
          />
        </StatStrip>
      )}

      <div className="flex flex-col gap-4">
        <PageToolbar>
          <PageToolbarSpacer />
          {!showSkeleton && !isError && (
            <p className="shrink-0 text-sm text-muted-foreground tabular-nums" aria-live="polite">
              {plural(tableData.length, 'team')}
            </p>
          )}
          <ToolbarSearch value={inputQuery} onChange={inputHandler} placeholder="Search teams" />
        </PageToolbar>

        {showSkeleton ? (
          <TableSkeleton columns={3} />
        ) : tableData.length === 0 ? (
          <ListEmptyState
            icon={Coins01Icon}
            isError={isError}
            onRetry={refetch}
            errorTitle="Couldn't load team credits"
            filtered={searching}
            filteredTitle={`No teams match “${debouncedValue.trim()}”`}
            filteredDescription="Try another team name."
            onClearFilters={() => inputHandler('')}
            emptyTitle="No team credits yet"
            emptyDescription="Add credits to a team to switch on its credit usage and reports."
            actionLabel="Add credits"
            onAction={handleOpenAddDrawer}
          />
        ) : (
          <DataTable
            key={debouncedValue}
            columns={columns}
            data={tableData}
            loading={isLoading}
            getRowId={(record, index) => String(record.teamId ?? index)}
            onRowClick={record => handleOpenDrawer(record.teamId)}
            pagination={tableData.length > PAGE_SIZE}
            initialState={{ pagination: { pageIndex: 0, pageSize: PAGE_SIZE } }}
            paginationProps={{ align: 'start', showSizeChanger: false }}
            minWidth={640}
          />
        )}
      </div>

      <ManageCreditsDrawer
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        teamData={selectedTeamData}
        historyData={historyData}
        isLoadingHistory={isLoadingHistory}
        onSubmit={handleSubmitForm}
        isSubmitting={isSubmitting}
        onEditHistorySubmit={handleEditCreditsHistorySubmit}
        isEditingHistorySubmitting={isEditingHistorySubmitting}
        form={form}
      />

      <AddTeamCreditsDrawer
        open={isAddDrawerOpen}
        onClose={handleCloseAddDrawer}
        teamsData={allTableData}
        selectedTeamId={selectedTeamIdForAdd}
        selectedTeamData={selectedTeamDataForAdd}
        historyData={addHistoryData}
        isLoadingHistory={isLoadingAddHistory}
        onSubmit={handleSubmitAddForm}
        isSubmitting={isSubmitting}
        onTeamSelect={handleTeamSelectForAdd}
      />
    </div>
  );
}

export default TeamCreditsWorkflow;
