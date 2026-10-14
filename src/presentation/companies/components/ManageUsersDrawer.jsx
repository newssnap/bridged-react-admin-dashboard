import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserAdd01Icon, UserGroupIcon, UserRemove01Icon } from '@hugeicons/core-free-icons';
import { Badge } from '@/components/badge';
import { ConfirmPopover } from '@/components/confirm-popover';
import { DataTable } from '@/components/data-table';
import { SegmentedControl, ToolbarSearch } from '@/components/page-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import useManageUsersDrawerHandler from '../controllers/useManageUsersDrawerHandler';

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const SORT_OPTIONS = [
  { label: 'Last login (newest)', value: 'lastLogin_DESC' },
  { label: 'Last login (oldest)', value: 'lastLogin_ASC' },
];

const numberFormat = new Intl.NumberFormat('en-GB');

// The API sends "Unknown" (or blanks) when someone hasn't set a name yet.
const realName = name => {
  const trimmed = (name || '').trim();
  return trimmed && trimmed !== 'Unknown' ? trimmed : '';
};

const initialsOf = (name, email) => {
  const source = realName(name) || (email || '').split('@')[0];
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
};

const displayNameOf = user => realName(user?.fullname) || user?.email || 'Unnamed user';

/** Initials avatar, name on top and email underneath; email alone if there's no name (§15). */
function UserIdentity({ name, email }) {
  const displayName = realName(name);
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="size-9">
        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
          {initialsOf(name, email)}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <p className="truncate font-medium" title={displayName || email}>
          {displayName || email || 'Unnamed user'}
        </p>
        {displayName && email && (
          <p className="truncate text-xs text-muted-foreground" title={email}>
            {email}
          </p>
        )}
      </div>
    </div>
  );
}

function RoleBadge({ user }) {
  if (user?.teamId) {
    return user.isTeamOwner ? (
      <Badge variant="outline">Team owner</Badge>
    ) : (
      <Badge variant="secondary">Member</Badge>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="warning" tabIndex={0} className="cursor-default">
          Not set
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">
        Not in a team yet. Logging in as this user creates a team for them.
      </TooltipContent>
    </Tooltip>
  );
}

/** Rows that stand in for the user list on its first load. */
function UsersSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10"
      aria-hidden="true"
    >
      <div className="h-11 border-b border-border bg-muted" />
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 border-b border-border px-5 py-3 last:border-b-0"
        >
          <Skeleton className="size-9 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-32 rounded-md" />
            <Skeleton className="h-3 w-44 rounded-md" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

const ManageUsersDrawer = ({ open, setManageUsersDrawer, companyId, companyName }) => {
  const {
    users,
    isUsersLoading,
    isUsersError,
    dataSource,
    userIds,
    rowSelection,
    handleSubmit,
    isSubmitting,
    pagination,
    fetchUsers,
    filters,
    searchValue,
    onSearchChange,
    handleStatusChange,
    handleSortChange,
  } = useManageUsersDrawerHandler(companyId);

  const close = () => setManageUsersDrawer({ open: false, companyId: null });

  const handleSave = async () => {
    const success = await handleSubmit();
    if (success) close();
  };

  // Adding or removing one person goes through the same per-page selection handler the
  // checkbox table used, so selections on other pages are kept.
  const pageSelectedIds = dataSource.filter(user => userIds.includes(user._id)).map(u => u._id);
  const addUser = id => rowSelection.onChange([...pageSelectedIds, id]);
  const removeUser = id => rowSelection.onChange(pageSelectedIds.filter(key => key !== id));

  const searching = Boolean((searchValue || '').trim());
  const selectedCount = userIds.length;
  const companyLabel = companyName || 'this company';

  const columns = [
    {
      id: 'user',
      header: 'User',
      cell: ({ row }) => <UserIdentity name={row.original.fullname} email={row.original.email} />,
    },
    {
      id: 'role',
      header: 'Role',
      meta: { width: '112px' },
      cell: ({ row }) => <RoleBadge user={row.original} />,
    },
    {
      id: 'company',
      header: 'Company',
      meta: { width: '136px', ellipsis: true },
      cell: ({ row }) => row.original.company?.name || '—',
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      meta: { align: 'right', width: '112px' },
      cell: ({ row }) => {
        const user = row.original;
        const name = displayNameOf(user);
        const isSelected = userIds.includes(user._id);

        if (!isSelected) {
          return (
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={`Add ${name} to ${companyLabel}`}
              onClick={() => addUser(user._id)}
            >
              <HugeiconsIcon icon={UserAdd01Icon} strokeWidth={2} data-icon="inline-start" />
              Add
            </Button>
          );
        }

        const removeButton = (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Remove ${name} from ${companyLabel}`}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/15"
            onClick={user.company?._id === companyId ? undefined : () => removeUser(user._id)}
          >
            <HugeiconsIcon icon={UserRemove01Icon} strokeWidth={2} data-icon="inline-start" />
            Remove
          </Button>
        );

        // Someone already in the company: confirm before taking them out. A person added in
        // this session is just un-added.
        if (user.company?._id !== companyId) return removeButton;
        return (
          <ConfirmPopover
            title={`Remove ${name}?`}
            description={`They'll leave ${companyLabel} when you save changes.`}
            confirmText="Remove"
            cancelText="Cancel"
            confirmVariant="destructive"
            onConfirm={() => removeUser(user._id)}
            align="end"
          >
            {removeButton}
          </ConfirmPopover>
        );
      },
    },
  ];

  const retry = () => fetchUsers(pagination.pageNumber, pagination.limit);

  let body;
  if (isUsersError) {
    body = (
      <Empty className="rounded-lg border border-dashed bg-muted/30 py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>Couldn't load users</EmptyTitle>
          <EmptyDescription>Check your connection and try again.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button type="button" variant="outline" onClick={retry} disabled={isUsersLoading}>
            {isUsersLoading && <Spinner data-icon="inline-start" />}
            Try again
          </Button>
        </EmptyContent>
      </Empty>
    );
  } else if (isUsersLoading && users.length === 0) {
    body = <UsersSkeleton />;
  } else {
    body = (
      <DataTable
        loading={isUsersLoading}
        columns={columns}
        data={dataSource}
        getRowId={(record, index) => record?._id || String(index)}
        state={{
          rowSelection: Object.fromEntries(userIds.map(id => [id, true])),
          pagination: { pageIndex: pagination.pageNumber - 1, pageSize: pagination.limit },
        }}
        manualPagination
        rowCount={pagination.total}
        pagination={pagination.total > pagination.limit}
        onPaginationChange={next => fetchUsers(next.pageIndex + 1, next.pageSize)}
        paginationProps={{ align: 'start', showSizeChanger: false, size: 'sm' }}
        minWidth={540}
        emptyState={
          <Empty className="py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle>
                {searching ? `No users match “${searchValue.trim()}”` : 'No users found'}
              </EmptyTitle>
              <EmptyDescription>
                {searching
                  ? 'Try another name or email.'
                  : 'Try another status, or check back once people have signed up.'}
              </EmptyDescription>
            </EmptyHeader>
            {searching && (
              <EmptyContent>
                <Button type="button" variant="outline" onClick={() => onSearchChange('')}>
                  Clear search
                </Button>
              </EmptyContent>
            )}
          </Empty>
        }
      />
    );
  }

  return (
    <Sheet
      open={open}
      onOpenChange={next => {
        if (!next) close();
      }}
    >
      <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[600px]">
        <SheetHeader className="border-b pe-14">
          <SheetTitle className="text-[17px] font-semibold tracking-[-0.01em]">
            Manage users
          </SheetTitle>
          <SheetDescription>
            Choose who belongs to {companyLabel}. Changes apply when you save.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pt-4 pb-6">
          <ToolbarSearch
            placeholder="Search users"
            value={searchValue}
            onChange={onSearchChange}
            className="sm:w-full"
          />
          <div className="flex flex-wrap items-center gap-2.5">
            <SegmentedControl
              label="Status"
              layoutId="company-users-status"
              options={STATUS_OPTIONS}
              value={filters.status}
              onValueChange={handleStatusChange}
            />
            <Select value={filters.sort} onValueChange={handleSortChange}>
              <SelectTrigger aria-label="Sort users" className="w-full sm:ms-auto sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-0">{body}</div>
        </div>

        <SheetFooter className="flex-row items-center justify-end gap-2 border-t px-6 py-4">
          <p className="me-auto text-sm text-muted-foreground tabular-nums" aria-live="polite">
            {numberFormat.format(selectedCount)} selected
          </p>
          <Button type="button" variant="outline" onClick={close} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting && <Spinner data-icon="inline-start" />}
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ManageUsersDrawer;
