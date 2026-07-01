import React, { useEffect, useRef, useState } from 'react';
import { Drawer, Button, Space, Typography, Empty } from 'antd';
import { useLazyGetTeamPlaybooksQuery } from '../../../services/api';
import PlaybookSelectionList from './PlaybookSelectionList';

const { Text } = Typography;

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

  return (
    <Drawer
      title="Assign Playbooks"
      width={720}
      onClose={onClose}
      open={open}
      destroyOnClose={false}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography.Text type="secondary">
            {draftSelectedPlaybooks.length} playbook(s) selected
          </Typography.Text>
          <Space>
            <Button size="large" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={onApply}
              loading={showListLoading || Boolean(isApplyingPlaybooks)}
              disabled={Boolean(teamId) && !teamPlaybooksInitialSyncDone}
            >
              Apply
            </Button>
          </Space>
        </div>
      }
    >
      {showListLoading ? (
        <Typography.Text type="secondary">Loading playbooks...</Typography.Text>
      ) : playbooks.length === 0 ? (
        <Empty description="No active playbooks found" />
      ) : (
        <PlaybookSelectionList
          playbooks={playbooks}
          playbookAgentLabelMap={playbookAgentLabelMap}
          selectedPlaybooks={draftSelectedPlaybooks}
          onToggle={onToggle}
        />
      )}
    </Drawer>
  );
};

export default AssignPlaybookDrawer;
