import React, { useRef } from 'react';
import dayjs from 'dayjs';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Link01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { DataTable } from '@/components/data-table';
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
import { Spinner } from '@/components/ui/spinner';
import formatDate from '../../../utils/formatting/formateDate';
import { UserIdentity, UserRoleBadge, UserStatusBadge } from './AccountParts';
import UserActions from './UserActions';

const loginTime = record => (record?.last_login_at ? dayjs(record.last_login_at).valueOf() : 0);

/** Loading stand-in: the table frame with a header band and person rows. */
function AccountsTableSkeleton({ rows = 6 }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading users"
      className="overflow-hidden rounded-lg ring-1 ring-foreground/10"
    >
      <div className="h-11 border-b bg-muted" />
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-6 border-b px-5 py-3 last:border-b-0">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-32 max-w-full" />
              <Skeleton className="h-3 w-48 max-w-full" />
            </div>
          </div>
          <Skeleton className="hidden h-5 w-16 rounded-full sm:block" />
          <Skeleton className="hidden h-5 w-20 rounded-full md:block" />
          <Skeleton className="hidden h-3.5 w-24 lg:block" />
          <Skeleton className="h-7 w-14 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function AccountsEmptyState({
  isError,
  query,
  hasFilters,
  onRetry,
  onClearSearch,
  onResetFilters,
  onAddUser,
}) {
  const searching = Boolean(query);
  let title = 'No users yet';
  let description = 'Add a user to give them a login to the dashboard.';
  if (isError) {
    title = "Couldn't load users";
    description = 'Check your connection and try again.';
  } else if (searching) {
    title = `No users match “${query}”`;
    description = 'Try another email address.';
  } else if (hasFilters) {
    title = 'No users match these filters';
    description = 'Pick another company or team, or reset the filters.';
  }

  let action = null;
  if (isError) {
    action = (
      <Button type="button" variant="outline" onClick={onRetry}>
        Try again
      </Button>
    );
  } else if (searching) {
    action = (
      <Button type="button" variant="outline" onClick={onClearSearch}>
        Clear search
      </Button>
    );
  } else if (hasFilters) {
    action = (
      <Button type="button" variant="outline" onClick={onResetFilters}>
        Reset filters
      </Button>
    );
  } else if (onAddUser) {
    action = (
      <Button type="button" variant="outline" onClick={onAddUser}>
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
        Add user
      </Button>
    );
  }

  return (
    <Empty className="py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}

/**
 * The users table. Pages come from the server (`page` is 1-based); while the next page loads
 * the current rows stay on screen, dimmed. In Claude connect mode (`isConnectMode`) it shows
 * who the user is plus a Connect button per row.
 */
function AccountsTable({
  users,
  total,
  page,
  limit,
  onPageChange,
  isLoading,
  isError,
  onRetry,
  query,
  hasFilters,
  onClearSearch,
  onResetFilters,
  onAddUser,
  onRowClick,
  isConnectMode,
  onConnect,
  connectingUserId,
  isRowBusy,
  actions,
}) {
  // Keep the last page on screen while the next one loads.
  const lastUsersRef = useRef([]);
  if (!isLoading) lastUsersRef.current = isError ? [] : users;
  const rows = lastUsersRef.current;

  if (isLoading && rows.length === 0) return <AccountsTableSkeleton />;

  const hasCompany = rows.some(record => record?.company?.name);
  const hasTeam = rows.some(record => record?.teamTitle);

  const userColumn = {
    id: 'user',
    header: 'User',
    meta: { minWidth: 240 },
    cell: ({ row }) => (
      <UserIdentity
        photo={row.original?.picture}
        name={row.original?.fullname}
        email={row.original?.email}
      />
    ),
  };
  const teamColumn = {
    id: 'team',
    header: 'Team',
    meta: { ellipsis: true },
    cell: ({ row }) => row.original?.teamTitle || <span className="text-muted-foreground">—</span>,
  };

  const columns = isConnectMode
    ? [
        userColumn,
        teamColumn,
        {
          id: 'actions',
          header: <span className="sr-only">Actions</span>,
          meta: { align: 'right', width: '128px' },
          cell: ({ row }) => {
            const record = row.original;
            const isConnecting = connectingUserId === record?._id;
            return (
              <Button
                type="button"
                size="sm"
                disabled={Boolean(connectingUserId) && !isConnecting}
                onClick={event => {
                  event.stopPropagation();
                  if (!isConnecting) onConnect(record);
                }}
              >
                {isConnecting ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <HugeiconsIcon icon={Link01Icon} strokeWidth={2} data-icon="inline-start" />
                )}
                {isConnecting ? 'Connecting…' : 'Connect'}
              </Button>
            );
          },
        },
      ]
    : [
        userColumn,
        {
          id: 'status',
          header: 'Status',
          meta: { width: '112px' },
          cell: ({ row }) => <UserStatusBadge status={row.original?.status} />,
        },
        {
          id: 'role',
          header: 'Role',
          meta: { width: '128px' },
          cell: ({ row }) => <UserRoleBadge record={row.original} />,
        },
        hasCompany && {
          id: 'company',
          header: 'Company',
          meta: { ellipsis: true },
          cell: ({ row }) =>
            row.original?.company?.name || <span className="text-muted-foreground">—</span>,
        },
        hasTeam && teamColumn,
        {
          id: 'lastLogin',
          accessorFn: loginTime,
          header: 'Last login',
          enableSorting: true,
          sortDescFirst: true,
          meta: { width: '136px' },
          cell: ({ row }) => (
            <span className="text-muted-foreground tabular-nums">
              {formatDate(row.original?.last_login_at)}
            </span>
          ),
        },
        {
          id: 'actions',
          header: <span className="sr-only">Actions</span>,
          meta: { align: 'right', width: '96px' },
          cell: ({ row }) => (
            <UserActions record={row.original} busy={isRowBusy(row.original)} {...actions} />
          ),
        },
      ].filter(Boolean);

  return (
    <div className="min-w-0">
      <DataTable
        loading={isLoading}
        columns={columns}
        data={rows}
        getRowId={(record, index) => record?._id || String(index)}
        onRowClick={isConnectMode ? undefined : record => onRowClick(record)}
        initialState={{ sorting: [{ id: 'lastLogin', desc: true }] }}
        manualPagination
        rowCount={total}
        state={{ pagination: { pageIndex: Math.max(0, page - 1), pageSize: limit } }}
        onPaginationChange={next => onPageChange(next.pageIndex + 1)}
        pagination={total > limit}
        paginationProps={{ align: 'start', showSizeChanger: false }}
        minWidth={isConnectMode ? 520 : 880}
        emptyState={
          <AccountsEmptyState
            isError={isError}
            query={query}
            hasFilters={hasFilters}
            onRetry={onRetry}
            onClearSearch={onClearSearch}
            onResetFilters={onResetFilters}
            onAddUser={isConnectMode ? undefined : onAddUser}
          />
        }
      />
    </div>
  );
}

export default AccountsTable;
