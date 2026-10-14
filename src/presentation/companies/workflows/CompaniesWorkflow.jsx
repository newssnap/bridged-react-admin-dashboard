import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Building03Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import useDebouncedInput from '@/utils/controllers/useDebouncedInput';
import CompaniesTopbar from '../components/CompaniesTopbar';
import CompaniesEmptyState from '../components/CompaniesEmptyState';
import CompaniesTable from '../components/CompaniesTable';
import CompaniesTableSkeleton from '../components/CompaniesTableSkeleton';
import CompanyFormDrawer from '../components/CompanyFormDrawer';
import ManageUsersDrawer from '../components/ManageUsersDrawer';
import useCompaniesHandler from '../controllers/useCompaniesHandler';
import useCompaniesTableHandler from '../controllers/useCompaniesTableHandler';

const CompaniesWorkflow = () => {
  const { inputQuery, debouncedValue, inputHandler } = useDebouncedInput('');

  const {
    drawerState,
    submitting,
    isUpdatingCompany,
    openCreateDrawer,
    openEditDrawer,
    closeDrawer,
    handleSubmitCompany,
    deleteCompany,
    manageUsersDrawer,
    setManageUsersDrawer,
  } = useCompaniesHandler();

  const {
    companies,
    total,
    page,
    limit,
    handlePageChange,
    isLoading,
    isInitialLoading,
    isError,
    refetch,
  } = useCompaniesTableHandler(debouncedValue);

  const searching = Boolean(debouncedValue.trim());

  const openManageUsers = company =>
    setManageUsersDrawer({ open: true, companyId: company?.id, companyName: company?.name });

  // First run (no companies at all): the empty state carries "Add company", so the header
  // doesn't show a second one (same as Domains).
  const isFirstRunEmpty = !isLoading && !isError && !searching && companies.length === 0;

  let content;
  if (isError && !isLoading) {
    content = (
      <Empty className="min-h-[500px] border border-dashed bg-muted/30 py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={Building03Icon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>Couldn't load companies</EmptyTitle>
          <EmptyDescription>Check your connection and try again.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button type="button" variant="outline" onClick={refetch}>
            Try again
          </Button>
        </EmptyContent>
      </Empty>
    );
  } else if (isInitialLoading) {
    content = <CompaniesTableSkeleton />;
  } else if (!isLoading && companies.length === 0) {
    content = <CompaniesEmptyState searchQuery={debouncedValue} onAddCompany={openCreateDrawer} />;
  } else {
    content = (
      <CompaniesTable
        companies={companies}
        total={total}
        page={page}
        limit={limit}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        onEdit={openEditDrawer}
        onDelete={deleteCompany}
        onManageUsers={openManageUsers}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <CompaniesTopbar
        searchQuery={inputQuery}
        onSearchChange={inputHandler}
        onAddCompany={openCreateDrawer}
        showCreateButton={!isFirstRunEmpty}
        count={isInitialLoading || isError ? undefined : total}
      />

      {content}

      <CompanyFormDrawer
        open={drawerState?.open}
        mode={drawerState?.mode}
        initialValues={drawerState?.record}
        onClose={closeDrawer}
        onSubmit={handleSubmitCompany}
        confirmLoading={submitting || isUpdatingCompany}
      />

      <ManageUsersDrawer
        open={manageUsersDrawer?.open}
        setManageUsersDrawer={setManageUsersDrawer}
        companyId={manageUsersDrawer?.companyId}
        companyName={manageUsersDrawer?.companyName}
      />
    </div>
  );
};

export default CompaniesWorkflow;
