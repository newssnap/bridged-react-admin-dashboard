import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { useLazyGetTeamPlaybooksQuery } from '../../../services/api';
import { plural } from './AccountParts';
import PlaybookSelectionList, { PlaybookSelectionSkeleton } from './PlaybookSelectionList';

/**
 * Picks the playbooks assigned to a team. With a `teamId` it loads the team's current playbooks
 * first (reported through `onTeamPlaybooksLoaded`) and keeps Apply off until they're in.
 */

const AssignPlaybookDrawer = ({
  open,
  teamId,
  playbooks,
  playbookAgentLabelMap,
  draftSelectedPlaybooks,
  isLoadingPlaybooks,
  isApplyingPlaybooks,
  onTeamPlaybooksLoaded,
  onClose,
  onApply,
  onToggle,
}) => {
  const hasSyncedTeamPlaybooksRef = useRef(false);
  const [teamPlaybooksInitialSyncDone, setTeamPlaybooksInitialSyncDone] = useState(false);

  const [
    fetchTeamPlaybooks,
    {
      data: teamPlaybooksResponse,
      isLoading: isLoadingTeamPlaybooksQuery,
      isFetching: isFetchingTeamPlaybooks,
      isUninitialized,
    },
    { lastArg: teamPlaybooksLastArg },
  ] = useLazyGetTeamPlaybooksQuery();

  useEffect(() => {
    if (!open) {
      hasSyncedTeamPlaybooksRef.current = false;
      setTeamPlaybooksInitialSyncDone(false);
      return;
    }
    if (!teamId) {
      return;
    }
    hasSyncedTeamPlaybooksRef.current = false;
    setTeamPlaybooksInitialSyncDone(false);
    fetchTeamPlaybooks(teamId, false);
  }, [open, teamId, fetchTeamPlaybooks]);

  useEffect(() => {
    if (!open || !teamId || hasSyncedTeamPlaybooksRef.current) {
      return;
    }
    if (isUninitialized) {
      return;
    }
    if (teamPlaybooksLastArg !== teamId) {
      return;
    }
    if (isLoadingTeamPlaybooksQuery || isFetchingTeamPlaybooks) {
      return;
    }
    const items = teamPlaybooksResponse?.data ?? [];
    onTeamPlaybooksLoaded?.(items);
    hasSyncedTeamPlaybooksRef.current = true;
    setTeamPlaybooksInitialSyncDone(true);
  }, [
    open,
    teamId,
    isUninitialized,
    teamPlaybooksLastArg,
    isLoadingTeamPlaybooksQuery,
    isFetchingTeamPlaybooks,
    teamPlaybooksResponse,
    onTeamPlaybooksLoaded,
  ]);

  const showListLoading =
    isLoadingPlaybooks ||
    (Boolean(teamId) && (isLoadingTeamPlaybooksQuery || isFetchingTeamPlaybooks));
  const isApplying = Boolean(isApplyingPlaybooks);
  const selectedCount = draftSelectedPlaybooks.length;

  return (
    <Sheet
      open={open}
      onOpenChange={next => {
        if (!next) onClose?.();
      }}
    >
      <SheetContent
        onOpenAutoFocus={event => event.preventDefault()}
        className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[600px]"
      >
        <SheetHeader className="border-b pe-14">
          <SheetTitle className="text-[17px] font-semibold tracking-[-0.01em]">
            Assign playbooks
          </SheetTitle>
          <SheetDescription>Pick the playbooks this team can use.</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-6">
          {showListLoading ? (
            <PlaybookSelectionSkeleton />
          ) : (
            <PlaybookSelectionList
              playbooks={playbooks}
              playbookAgentLabelMap={playbookAgentLabelMap}
              selectedPlaybooks={draftSelectedPlaybooks}
              onToggle={onToggle}
            />
          )}
        </div>

        <SheetFooter className="flex-row items-center justify-end gap-2 border-t px-6 py-4">
          <p className="me-auto text-sm text-muted-foreground tabular-nums" aria-live="polite">
            {showListLoading ? null : `${plural(selectedCount, 'playbook')} selected`}
          </p>
          <Button type="button" variant="outline" onClick={onClose} disabled={isApplying}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onApply}
            disabled={
              showListLoading || isApplying || (Boolean(teamId) && !teamPlaybooksInitialSyncDone)
            }
          >
            {isApplying && <Spinner data-icon="inline-start" />}
            {isApplying ? 'Assigning…' : 'Assign playbooks'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AssignPlaybookDrawer;
