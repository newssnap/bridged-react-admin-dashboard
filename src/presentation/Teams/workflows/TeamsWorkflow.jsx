import React, { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  AlertCircleIcon,
  PencilEdit02Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import useDebouncedInput from '../../../utils/controllers/useDebouncedInput';
import { useTeamsHandler } from '../controllers/useTeamsHandler';
import AddTeamDrawer from '../components/AddTeamDrawer';
import EditTeamDrawer from '../components/EditTeamDrawer';
import TeamsToolbar from '../components/TeamsToolbar';
import { formatCount } from '../components/TeamParts';

const LIST_PAGE_SIZE = 15;
const FILTERS_STORAGE_KEY = 'adminTeamsFilters';

const readStoredFilters = () => {
  try {
    const stored = JSON.parse(window.localStorage.getItem(FILTERS_STORAGE_KEY) || '{}');
    return {
      company: typeof stored.company === 'string' ? stored.company : '',
      domain: typeof stored.domain === 'string' ? stored.domain : '',
    };
  } catch {
    return { company: '', domain: '' };
  }
};

const textOrDash = value =>
  value && value !== '—' ? (
    <span className="truncate">{value}</span>
  ) : (
    <span className="text-muted-foreground">—</span>
  );

function TeamsTableSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-lg ring-1 ring-foreground/10"
      aria-busy="true"
      aria-label="Loading teams"
    >
      <div className="flex h-11 items-center gap-6 bg-muted/60 px-4">
        {['w-[28%]', 'w-[18%]', 'w-[22%]', 'w-[8%]', 'w-[8%]', 'w-[10%]'].map((width, index) => (
          <Skeleton key={index} className={`h-3 rounded-md ${width}`} />
        ))}
      </div>
      {Array.from({ length: 8 }).map((_, row) => (
        <div key={row} className="flex items-center gap-6 border-t px-4 py-3">
          <div className="flex w-[40%] items-center gap-3">
            <Skeleton className="size-8 shrink-0 rounded-lg" />
            <Skeleton className="h-3.5 w-2/3 rounded-md" />
          </div>
          <Skeleton className="h-3.5 w-[24%] rounded-md" />
          <Skeleton className="h-3.5 w-[28%] rounded-md" />
          <Skeleton className="h-3.5 w-[12%] rounded-md" />
        </div>
      ))}
    </div>
  );
}

function TeamsWorkflow() {
  const { inputQuery, debouncedValue, inputHandler } = useDebouncedInput('');
  const [selectedCompany, setSelectedCompany] = useState(() => readStoredFilters().company);
  const [selectedDomain, setSelectedDomain] = useState(() => readStoredFilters().domain);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        FILTERS_STORAGE_KEY,
        JSON.stringify({ company: selectedCompany, domain: selectedDomain })
      );
    } catch {
      // Storage can be unavailable (private mode); the filters still work for this visit.
    }
  }, [selectedCompany, selectedDomain]);

  const {
    tableData,
    isLoading,
    isInitialLoading,
    isError,
    refetchTeams,
    companyOptions,
    domainOptions,
    isDomainsLoading,
    editTeamDrawerOpen,
    selectedTeamForEdit,
    openEditDrawer,
    editTeamForm,
    editTeamCompanyOptions,
    handleEditFinish,
    handleEditClose,
    handleEditAfterOpenChange,
    editMemberTableData,
    isLoadingEditMembers,
    isEditSubmitting,
    isLoadingEditCompanies,
    editCompanySearchText,
    handleEditCompanySearch,
    createEditCompany,
    isCreatingEditCompany,
    handleEditMemberMenuClick,
    handleEditMemberStatus,
    handleEditDeleteMember,
    editDeletingMemberId,
    editMemberTokenUserId,
    editMemberTokenType,
    addMembersDrawerOpen,
    openAddMembersDrawer,
    closeAddMembersDrawer,
    addMembersForm,
    addMembersUserOptions,
    isAddMembersUsersLoading,
    handleAddMembersFinish,
    handleAddMembersAfterOpenChange,
    isAddMembersSubmitting,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    addTeamCompanyOptions,
    userOptions,
    isUsersLoading,
    isLoadingAddCompanies,
    onCompanyChange,
    addCompanySearchText,
    handleAddCompanySearch,
    createAddCompany,
    isCreatingAddCompany,
    handleSubmit,
    isSubmitting,
    manageCreditsDrawerOpen,
    manageCreditsTeamData,
    creditsHistoryData,
    isLoadingCreditsHistory,
    openManageCreditsDrawer,
    closeManageCreditsDrawer,
    handleManageCreditsSubmit,
    isCreditsSubmitting,
    handleEditCreditsHistorySubmit,
    isEditingHistorySubmitting,
    customWorkEditDrawerOpen,
    selectedCustomWorkEntry,
    teamsDataForCustomWorkDrawer,
    openCustomWorkDrawer,
    closeCustomWorkEditDrawer,
    handleCustomWorkSubmit,
    isCustomWorkSubmitting,
    form,
  } = useTeamsHandler(debouncedValue, selectedCompany, selectedDomain);

  const searching = !!debouncedValue?.trim();
  const filtering = !!selectedCompany || !!selectedDomain;

  const clearAll = () => {
    inputHandler('');
    setSelectedCompany('');
    setSelectedDomain('');
  };

  const columns = [
    {
      accessorKey: 'teamName',
      id: 'teamName',
      header: 'Team',
      meta: { ellipsis: true, width: '28%', minWidth: '200px' },
      cell: ({ row }) => {
        const team = row.original;
        return (
          <div className="flex max-w-full min-w-0 items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} className="size-4" />
            </span>
            <span className="truncate font-medium">
              {team.teamName && team.teamName !== '—' ? team.teamName : 'Untitled team'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'companyName',
      id: 'companyName',
      header: 'Company',
      meta: { ellipsis: true },
      cell: ({ getValue }) => textOrDash(getValue()),
    },
    {
      accessorKey: 'ownerEmail',
      id: 'ownerEmail',
      header: 'Owner',
      meta: { ellipsis: true },
      cell: ({ getValue }) => textOrDash(getValue()),
    },
    {
      accessorKey: 'memberCount',
      id: 'memberCount',
      header: 'Members',
      meta: { align: 'right', width: '96px' },
      cell: ({ getValue }) => <span className="tabular-nums">{formatCount(getValue() ?? 0)}</span>,
    },
    {
      accessorKey: 'creditBalance',
      id: 'creditBalance',
      header: 'Credits',
      meta: { align: 'right', width: '110px' },
      cell: ({ getValue }) => <span className="tabular-nums">{formatCount(getValue() ?? 0)}</span>,
    },
    {
      accessorKey: 'customWork',
      id: 'customWork',
      header: 'Custom work',
      meta: { align: 'right', width: '120px' },
      cell: ({ getValue }) => <span className="tabular-nums">{formatCount(getValue() ?? 0)}</span>,
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      meta: { align: 'right', width: '64px' },
      cell: ({ row }) => {
        const team = row.original;
        return (
          <div className="inline-flex items-center" onClick={event => event.stopPropagation()}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Edit ${team.teamName}`}
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => openEditDrawer(team)}
                >
                  <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const emptyState = isError ? (
    <Empty className="py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>Couldn't load teams</EmptyTitle>
        <EmptyDescription>Check your connection and try again.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" variant="outline" onClick={() => refetchTeams()}>
          Try again
        </Button>
      </EmptyContent>
    </Empty>
  ) : (
    <Empty className="py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>
          {searching
            ? `No teams match “${debouncedValue.trim()}”`
            : filtering
              ? 'No teams match these filters'
              : 'No teams yet'}
        </EmptyTitle>
        <EmptyDescription>
          {searching || filtering
            ? 'Try another search or reset the filters.'
            : 'Create a team to give a company its own workspace, owner and credits.'}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {searching || filtering ? (
          <Button type="button" variant="outline" onClick={clearAll}>
            Clear search and filters
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={openDrawer}>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
            Create team
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Teams"
        description="Every customer team: its company, owner, members, credits and branding."
        actions={
          <Button type="button" onClick={openDrawer}>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
            Create team
          </Button>
        }
      />

      <div className="flex flex-col gap-6">
        <TeamsToolbar
          query={inputQuery}
          onQueryChange={inputHandler}
          count={isInitialLoading || isError ? undefined : tableData.length}
          company={selectedCompany}
          onCompanyChange={setSelectedCompany}
          companyOptions={companyOptions}
          domain={selectedDomain}
          onDomainChange={setSelectedDomain}
          domainOptions={domainOptions}
          isDomainsLoading={isDomainsLoading}
        />

        {isInitialLoading ? (
          <TeamsTableSkeleton />
        ) : (
          <div className="min-w-0 animate-page-in">
            <DataTable
              key={`${selectedCompany}|${selectedDomain}|${debouncedValue}`}
              loading={isLoading}
              columns={columns}
              data={isError ? [] : tableData}
              getRowId={(record, index) => String(record?.key ?? index)}
              onRowClick={record => openEditDrawer(record)}
              getRowClassName={record => (record?.companyId === '' ? 'bg-muted/40' : undefined)}
              pagination={tableData.length > LIST_PAGE_SIZE}
              initialState={{ pagination: { pageIndex: 0, pageSize: LIST_PAGE_SIZE } }}
              paginationProps={{ align: 'start', showSizeChanger: false }}
              minWidth={860}
              emptyState={emptyState}
            />
          </div>
        )}
      </div>

      <AddTeamDrawer
        open={isDrawerOpen}
        onClose={closeDrawer}
        companyOptions={addTeamCompanyOptions}
        isLoadingCompanies={isLoadingAddCompanies}
        companySearchText={addCompanySearchText}
        onCompanySearch={handleAddCompanySearch}
        onCreateCompany={createAddCompany}
        isCreatingCompany={isCreatingAddCompany}
        userOptions={userOptions}
        isUsersLoading={isUsersLoading}
        onCompanyChange={onCompanyChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <EditTeamDrawer
        open={editTeamDrawerOpen}
        team={selectedTeamForEdit}
        onCompanyChange={onCompanyChange}
        form={editTeamForm}
        companyOptions={editTeamCompanyOptions}
        isLoadingCompanies={isLoadingEditCompanies}
        companySearchText={editCompanySearchText}
        onCompanySearch={handleEditCompanySearch}
        onCreateCompany={createEditCompany}
        isCreatingCompany={isCreatingEditCompany}
        handleFinish={handleEditFinish}
        handleClose={handleEditClose}
        handleAfterOpenChange={handleEditAfterOpenChange}
        memberTableData={editMemberTableData}
        isLoadingMembers={isLoadingEditMembers}
        isSubmitting={isEditSubmitting}
        onMemberLogin={handleEditMemberMenuClick}
        onMemberStatusChange={handleEditMemberStatus}
        onRemoveMember={handleEditDeleteMember}
        deletingMemberId={editDeletingMemberId}
        memberTokenUserId={editMemberTokenUserId}
        memberTokenType={editMemberTokenType}
        addMembersDrawerOpen={addMembersDrawerOpen}
        openAddMembersDrawer={openAddMembersDrawer}
        closeAddMembersDrawer={closeAddMembersDrawer}
        addMembersForm={addMembersForm}
        addMembersUserOptions={addMembersUserOptions}
        isAddMembersUsersLoading={isAddMembersUsersLoading}
        handleAddMembersFinish={handleAddMembersFinish}
        handleAddMembersAfterOpenChange={handleAddMembersAfterOpenChange}
        isAddMembersSubmitting={isAddMembersSubmitting}
        manageCreditsDrawerOpen={manageCreditsDrawerOpen}
        openManageCreditsDrawer={openManageCreditsDrawer}
        closeManageCreditsDrawer={closeManageCreditsDrawer}
        manageCreditsTeamData={manageCreditsTeamData}
        creditsHistoryData={creditsHistoryData}
        isLoadingCreditsHistory={isLoadingCreditsHistory}
        handleManageCreditsSubmit={handleManageCreditsSubmit}
        isCreditsSubmitting={isCreditsSubmitting}
        handleEditCreditsHistorySubmit={handleEditCreditsHistorySubmit}
        isEditingHistorySubmitting={isEditingHistorySubmitting}
        creditsForm={form}
        customWorkEditDrawerOpen={customWorkEditDrawerOpen}
        openCustomWorkDrawer={openCustomWorkDrawer}
        closeCustomWorkEditDrawer={closeCustomWorkEditDrawer}
        selectedCustomWorkEntry={selectedCustomWorkEntry}
        teamsDataForCustomWorkDrawer={teamsDataForCustomWorkDrawer}
        handleCustomWorkSubmit={handleCustomWorkSubmit}
        isCustomWorkSubmitting={isCustomWorkSubmitting}
      />
    </div>
  );
}

export default TeamsWorkflow;
