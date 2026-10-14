import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Building03Icon, Delete02Icon, PencilEdit02Icon } from '@hugeicons/core-free-icons';
import { DataTable } from '@/components/data-table';
import { ConfirmPopover } from '@/components/confirm-popover';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import formatDate from '@/utils/formatting/formateDate';

const numberFormat = new Intl.NumberFormat('en-GB');

/**
 * Two row actions (§6): visible ghost icon buttons. Manage users stays hidden, as it was
 * before the revamp: saving it can drop members on pages that were never loaded.
 */
function CompanyActions({ company, onEdit, onDelete }) {
  const name = company?.name || 'this company';

  return (
    <div className="inline-flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            aria-label={`Edit ${name}`}
            onClick={() => onEdit(company)}
          >
            <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit company</TooltipContent>
      </Tooltip>
      <Tooltip>
        <ConfirmPopover
          title="Delete this company?"
          description={`${name} will be deleted. This can't be undone.`}
          confirmText="Delete"
          confirmVariant="destructive"
          align="end"
          onConfirm={() => onDelete(company)}
        >
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/15"
              aria-label={`Delete ${name}`}
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
            </Button>
          </TooltipTrigger>
        </ConfirmPopover>
        <TooltipContent>Delete company</TooltipContent>
      </Tooltip>
    </div>
  );
}

const CompaniesTable = ({
  companies,
  total,
  page,
  limit,
  onPageChange,
  isLoading,
  onEdit,
  onDelete,
  emptyState,
}) => {
  const columns = [
    {
      accessorKey: 'name',
      id: 'name',
      header: 'Company',
      meta: { ellipsis: true },
      cell: ({ row }) => {
        const company = row.original;
        return (
          <div className="flex max-w-full min-w-0 items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HugeiconsIcon icon={Building03Icon} strokeWidth={2} className="size-4" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium text-foreground" title={company?.name}>
                {company?.name || '—'}
              </span>
              {company?.createdAt && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  Added {formatDate(company.createdAt)}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'accounts_count',
      id: 'accounts_count',
      header: 'Accounts',
      meta: { width: '160px' },
      cell: ({ getValue }) => {
        const count = getValue();
        if (count === null || count === undefined) {
          return <span className="text-muted-foreground">—</span>;
        }
        return (
          <span className="font-medium text-foreground tabular-nums">
            {numberFormat.format(count)} {count === 1 ? 'account' : 'accounts'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      meta: { align: 'right', width: '96px' },
      cell: ({ row }) => (
        <CompanyActions
          company={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
  ];

  return (
    <div className="min-w-0">
      <DataTable
        loading={isLoading}
        columns={columns}
        data={companies}
        getRowId={(record, index) => (record?.id ? String(record.id) : String(index))}
        // Server-side pages: the pager only shows when there is more than one.
        manualPagination
        rowCount={total}
        pagination={total > limit}
        state={{ pagination: { pageIndex: page - 1, pageSize: limit } }}
        onPaginationChange={next => onPageChange(next.pageIndex + 1)}
        paginationProps={{ align: 'start', showSizeChanger: false }}
        emptyState={emptyState}
        minWidth={520}
      />
    </div>
  );
};

export default CompaniesTable;
