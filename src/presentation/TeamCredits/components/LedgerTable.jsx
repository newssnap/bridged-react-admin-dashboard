import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Invoice01Icon, PencilEdit02Icon } from '@hugeicons/core-free-icons';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatDateAndTime } from '../../../utils/formatting/formateDate';
import { formatNumber, orDash } from '../utils/creditFormat';

const PAGE_SIZE = 10;

/** "+500" in green for assigned credits, "−200" in red for deducted ones. */
function LedgerChange({ amount, purchaseType }) {
  const isDeduct = purchaseType === 'deduct';
  return (
    <span
      className={cn('font-medium tabular-nums', isDeduct ? 'text-destructive' : 'text-success')}
    >
      {isDeduct ? '−' : '+'}
      {formatNumber(Number(amount) || 0)}
    </span>
  );
}

/** A team's credit ledger. Pass `onEdit` to show an edit button per entry. */
function LedgerTable({ history, loading, onEdit }) {
  const columns = [
    {
      accessorKey: 'purchaseDate',
      id: 'date',
      header: 'Date',
      meta: { minWidth: 150 },
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap tabular-nums">{formatDateAndTime(getValue())}</span>
      ),
    },
    {
      accessorKey: 'amount',
      id: 'change',
      header: 'Change',
      meta: { align: 'right', width: 110 },
      cell: ({ row }) => (
        <LedgerChange amount={row.original?.amount} purchaseType={row.original?.purchaseType} />
      ),
    },
    {
      accessorKey: 'reason',
      id: 'reason',
      header: 'Reason',
      meta: { ellipsis: true },
      cell: ({ getValue }) => orDash(getValue()),
    },
    {
      accessorKey: 'notes',
      id: 'notes',
      header: 'Notes',
      meta: { ellipsis: true },
      cell: ({ getValue }) => orDash(getValue()),
    },
  ];

  if (onEdit) {
    columns.push({
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      meta: { align: 'right', width: 64 },
      cell: ({ row }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Edit the entry from ${formatDateAndTime(row.original?.purchaseDate)}`}
              className="text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(row.original)}
            >
              <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit entry</TooltipContent>
        </Tooltip>
      ),
    });
  }

  const rows = history ?? [];

  return (
    <DataTable
      size="sm"
      columns={columns}
      data={rows}
      loading={loading}
      getRowId={(record, index) => String(record?.creditPurchaseId ?? index)}
      pagination={rows.length > PAGE_SIZE}
      initialState={{ pagination: { pageIndex: 0, pageSize: PAGE_SIZE } }}
      paginationProps={{ align: 'start', showSizeChanger: false }}
      minWidth={560}
      emptyState={
        <Empty className="py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Invoice01Icon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>No ledger entries yet</EmptyTitle>
            <EmptyDescription>
              Credits assigned or deducted for this team show up here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      }
    />
  );
}

export default LedgerTable;
