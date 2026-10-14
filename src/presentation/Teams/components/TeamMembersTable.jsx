import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ChromeIcon,
  ComputerIcon,
  MoreHorizontalIcon,
  PauseIcon,
  PlayIcon,
  UserAdd01Icon,
  UserGroupIcon,
  UserRemove01Icon,
} from '@hugeicons/core-free-icons';
import { Badge } from '@/components/badge';
import { confirm } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { MemberIdentity } from './TeamParts';

const PAGE_SIZE = 10;

function MemberActions({
  record,
  onLogin,
  onUpdateStatus,
  onRemove,
  busyUserId,
  busyTokenType,
  isRemoving,
}) {
  const isOwner = record.role === 'Owner';
  const isInactive = record?.status === 'inactive';
  const isSigningIn = !!busyUserId && busyUserId === record._id;
  const busy = isSigningIn || isRemoving;
  const who = record.name && record.name !== '—' ? record.name : record.email;

  const askStatus = () =>
    confirm({
      title: isInactive ? 'Activate this user?' : 'Deactivate this user?',
      description: isInactive
        ? `${who} can sign in and use the team again.`
        : `${who} can't sign in until you activate them again.`,
      confirmText: isInactive ? 'Activate' : 'Deactivate',
      variant: isInactive ? 'default' : 'destructive',
      icon: <HugeiconsIcon icon={isInactive ? PlayIcon : PauseIcon} strokeWidth={2} />,
      onConfirm: () => onUpdateStatus(record._id, isInactive ? 'activate' : 'deactivate'),
    });

  const askRemove = () =>
    confirm({
      title: 'Remove this member?',
      description: `${who} loses access to this team. You can add them again later.`,
      confirmText: 'Remove',
      variant: 'destructive',
      icon: <HugeiconsIcon icon={UserRemove01Icon} strokeWidth={2} className="text-destructive" />,
      onConfirm: () => onRemove(record),
    });

  return (
    <div className="flex items-center justify-end" onClick={event => event.stopPropagation()}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`More actions for ${who}`}
            className="text-muted-foreground hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground"
          >
            {busy ? <Spinner /> : <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem disabled={isSigningIn} onSelect={() => onLogin('portal', record)}>
            {isSigningIn && busyTokenType === 'portal' ? (
              <Spinner />
            ) : (
              <HugeiconsIcon icon={ComputerIcon} strokeWidth={2} />
            )}
            Sign in to portal
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isSigningIn} onSelect={() => onLogin('plugin', record)}>
            {isSigningIn && busyTokenType === 'plugin' ? (
              <Spinner />
            ) : (
              <HugeiconsIcon icon={ChromeIcon} strokeWidth={2} />
            )}
            Sign in to plugin
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={askStatus}>
            <HugeiconsIcon icon={isInactive ? PlayIcon : PauseIcon} strokeWidth={2} />
            {isInactive ? 'Activate user' : 'Deactivate user'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" disabled={isOwner} onSelect={askRemove}>
            <HugeiconsIcon icon={UserRemove01Icon} strokeWidth={2} />
            <span className="flex flex-col">
              Remove from team
              {isOwner && (
                <span className="text-xs text-muted-foreground">The owner can't be removed</span>
              )}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** The team's people, owner first (the handler sorts them), each with a sign-in / status menu. */
function TeamMembersTable({
  data,
  loading,
  onAddMembers,
  onLogin,
  onUpdateStatus,
  onRemove,
  deletingId,
  busyUserId,
  busyTokenType,
}) {
  const columns = [
    {
      id: 'member',
      header: 'Member',
      meta: { minWidth: '240px' },
      cell: ({ row }) => {
        const record = row.original;
        return (
          <MemberIdentity photo={record.profilePicture} name={record.name} email={record.email} />
        );
      },
    },
    {
      accessorKey: 'role',
      id: 'role',
      header: 'Role',
      meta: { width: '110px' },
      cell: ({ getValue }) =>
        getValue() === 'Owner' ? (
          <Badge variant="outline">Owner</Badge>
        ) : (
          <span className="text-muted-foreground">Member</span>
        ),
    },
    {
      accessorKey: 'status',
      id: 'status',
      header: 'Status',
      meta: { width: '110px' },
      cell: ({ getValue }) =>
        getValue() === 'inactive' ? (
          <Badge variant="secondary">Inactive</Badge>
        ) : (
          <Badge variant="success">Active</Badge>
        ),
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      meta: { align: 'right', width: '64px' },
      cell: ({ row }) => (
        <MemberActions
          record={row.original}
          onLogin={onLogin}
          onUpdateStatus={onUpdateStatus}
          onRemove={onRemove}
          busyUserId={busyUserId}
          busyTokenType={busyTokenType}
          isRemoving={!!deletingId && deletingId === row.original.membershipId}
        />
      ),
    },
  ];

  return (
    <DataTable
      loading={loading}
      columns={columns}
      data={data ?? []}
      getRowId={(record, index) => String(record?.key ?? index)}
      pagination={(data?.length || 0) > PAGE_SIZE}
      initialState={{ pagination: { pageIndex: 0, pageSize: PAGE_SIZE } }}
      paginationProps={{ align: 'start', showSizeChanger: false }}
      minWidth={560}
      emptyState={
        <Empty className="py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>No members yet</EmptyTitle>
            <EmptyDescription>Add people so they can work in this team.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" variant="outline" onClick={onAddMembers}>
              <HugeiconsIcon icon={UserAdd01Icon} strokeWidth={2} data-icon="inline-start" />
              Add members
            </Button>
          </EmptyContent>
        </Empty>
      }
    />
  );
}

export default TeamMembersTable;
