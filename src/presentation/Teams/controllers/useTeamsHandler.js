import { useState, useMemo, useCallback } from 'react';
import { message } from 'antd';
import {
  useGetTeamsQuery,
  useGetTeamCreditsHistoryQuery,
  useAdjustTeamCreditsMutation,
  useAddCustomWorkMutation,
  useEditCustomWorkMutation,
} from '../../../services/api';
import { useAddTeamDrawerHandler } from './useAddTeamDrawerHandler';
import { useEditTeamDrawerHandler } from './useEditTeamDrawerHandler';

export const useTeamsHandler = (searchValue, selectedCompany) => {
  const { data, isLoading, refetch: refetchTeams } = useGetTeamsQuery();

  const [viewTeamDrawerOpen, setViewTeamDrawerOpen] = useState(false);
  const [selectedTeamForView, setSelectedTeamForView] = useState(null);
  const [editTeamDrawerOpen, setEditTeamDrawerOpen] = useState(false);
  const [selectedTeamForEdit, setSelectedTeamForEdit] = useState(null);
  const [manageCreditsDrawerOpen, setManageCreditsDrawerOpen] = useState(false);
  const [selectedTeamForCredits, setSelectedTeamForCredits] = useState(null);
  const [customWorkEditDrawerOpen, setCustomWorkEditDrawerOpen] = useState(false);
  const [selectedCustomWorkEntry, setSelectedCustomWorkEntry] = useState(null);

  const rawTeams = data?.data ?? [];

  const tableData = useMemo(() => {
    return rawTeams.map((item, index) => ({
      key: item._id || index,
      _id: item._id,
      teamName: item.companyName || item.ownerEmail || '--',
      companyName: item.companyName || '--',
      ownerEmail: item.ownerEmail || '--',
      memberCount: item.memberCount ?? 0,
      creditBalance: item.creditBalance ?? 0,
      customWork: item.customWork ?? 0,
      companyId: item.companyId ?? undefined,
    }));
  }, [rawTeams]);

  const companyOptions = useMemo(() => {
    const names = rawTeams.map(item => item.companyName?.trim()).filter(Boolean);
    const unique = [...new Set(names)].sort((a, b) => a.localeCompare(b));
    return [
      { value: '', label: 'All Companies' },
      ...unique.map(name => ({ value: name, label: name })),
    ];
  }, [rawTeams]);

  const filteredData = useMemo(() => {
    let result = tableData;
    if (selectedCompany) {
      result = result.filter(item => item.companyName === selectedCompany);
    }
    if (searchValue?.trim()) {
      const searchLower = searchValue.toLowerCase().trim();
      result = result.filter(
        item =>
          item.teamName?.toLowerCase().includes(searchLower) ||
          item.companyName?.toLowerCase().includes(searchLower) ||
          item.ownerEmail?.toLowerCase().includes(searchLower)
      );
    }
    return result;
  }, [tableData, searchValue, selectedCompany]);

  const {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    companyOptions: addTeamCompanyOptions,
    userOptions,
    isUsersLoading,
    onCompanyChange,
    handleSubmit,
    isSubmitting,
  } = useAddTeamDrawerHandler(editTeamDrawerOpen);

  const closeEditDrawer = useCallback(() => {
    setEditTeamDrawerOpen(false);
    setTimeout(() => setSelectedTeamForEdit(null), 300);
  }, []);

  const { handleSubmit: handleEditSubmit, isSubmitting: isEditSubmitting } =
    useEditTeamDrawerHandler(closeEditDrawer);

  const { data: creditsHistoryData, isLoading: isLoadingCreditsHistory } =
    useGetTeamCreditsHistoryQuery(selectedTeamForCredits?._id, {
      skip: !manageCreditsDrawerOpen || !selectedTeamForCredits?._id,
    });

  const [adjustTeamCredits, { isLoading: isCreditsSubmitting }] = useAdjustTeamCreditsMutation();
  const [addCustomWork, { isLoading: isAddCustomWorkSubmitting }] = useAddCustomWorkMutation();
  const [editCustomWork, { isLoading: isEditCustomWorkSubmitting }] = useEditCustomWorkMutation();

  const manageCreditsTeamData = useMemo(
    () =>
      selectedTeamForCredits
        ? {
            teamId: selectedTeamForCredits._id,
            teamName: selectedTeamForCredits.teamName,
            companyName: selectedTeamForCredits.companyName,
            creditBalance: selectedTeamForCredits.creditBalance,
          }
        : null,
    [selectedTeamForCredits]
  );

  const teamsDataForCustomWorkDrawer = useMemo(
    () =>
      filteredData.map(t => ({
        teamId: t._id,
        teamName: t.teamName,
        companyName: t.companyName,
      })),
    [filteredData]
  );

  const openViewDrawer = useCallback(record => {
    setSelectedTeamForView(record);
    setViewTeamDrawerOpen(true);
  }, []);

  const closeViewDrawer = useCallback(() => {
    setViewTeamDrawerOpen(false);
    setSelectedTeamForView(null);
  }, []);

  const openEditDrawer = useCallback(record => {
    setSelectedTeamForEdit(record);
    setEditTeamDrawerOpen(true);
  }, []);

  const openManageCreditsDrawer = useCallback(record => {
    setSelectedTeamForCredits(record);
    setManageCreditsDrawerOpen(true);
  }, []);

  const closeManageCreditsDrawer = useCallback(() => {
    setManageCreditsDrawerOpen(false);
    setTimeout(() => setSelectedTeamForCredits(null), 300);
  }, []);

  const handleManageCreditsSubmit = useCallback(
    async submitData => {
      try {
        await adjustTeamCredits(submitData).unwrap();
        message.success('Team credits updated successfully');
        refetchTeams();
        closeManageCreditsDrawer();
      } catch (err) {
        message.error(err?.data?.message || 'Failed to update team credits');
      }
    },
    [adjustTeamCredits, refetchTeams, closeManageCreditsDrawer]
  );

  const openCustomWorkDrawer = useCallback(record => {
    setSelectedCustomWorkEntry({
      teamId: record._id,
      teamName: record.teamName,
      companyName: record.companyName,
    });
    setCustomWorkEditDrawerOpen(true);
  }, []);

  const closeCustomWorkEditDrawer = useCallback(() => {
    setCustomWorkEditDrawerOpen(false);
    setTimeout(() => setSelectedCustomWorkEntry(null), 300);
  }, []);

  const handleCustomWorkSubmit = useCallback(
    async payload => {
      try {
        if (payload.creditUsageId) {
          await editCustomWork(payload).unwrap();
          message.success('Custom work entry updated successfully');
        } else {
          await addCustomWork({
            teamId: payload.teamId,
            creditsUsed: payload.creditsUsed,
            usageData: payload.usageData,
          }).unwrap();
          message.success('Custom work entry added successfully');
        }
        refetchTeams();
        closeCustomWorkEditDrawer();
      } catch (err) {
        message.error(err?.data?.message || 'Failed to save custom work entry');
      }
    },
    [editCustomWork, addCustomWork, refetchTeams, closeCustomWorkEditDrawer]
  );

  const isCustomWorkSubmitting = isAddCustomWorkSubmitting || isEditCustomWorkSubmitting;

  return {
    tableData: filteredData,
    isLoading,
    companyOptions,

    viewTeamDrawerOpen,
    selectedTeamForView,
    openViewDrawer,
    closeViewDrawer,

    editTeamDrawerOpen,
    selectedTeamForEdit,
    openEditDrawer,
    closeEditDrawer,
    handleEditSubmit,
    isEditSubmitting,

    isDrawerOpen,
    openDrawer,
    closeDrawer,
    addTeamCompanyOptions,
    userOptions,
    isUsersLoading,
    onCompanyChange,
    handleSubmit,
    isSubmitting,

    manageCreditsDrawerOpen,
    selectedTeamForCredits,
    manageCreditsTeamData,
    creditsHistoryData,
    isLoadingCreditsHistory,
    openManageCreditsDrawer,
    closeManageCreditsDrawer,
    handleManageCreditsSubmit,
    isCreditsSubmitting,

    customWorkEditDrawerOpen,
    selectedCustomWorkEntry,
    teamsDataForCustomWorkDrawer,
    openCustomWorkDrawer,
    closeCustomWorkEditDrawer,
    handleCustomWorkSubmit,
    isCustomWorkSubmitting,
  };
};
