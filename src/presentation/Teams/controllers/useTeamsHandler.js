import { useState, useMemo, useCallback, useEffect } from 'react';
import { notification } from 'antd';
import { Form } from 'antd';
import {
  useGetTeamsQuery,
  useGetTeamCreditsHistoryQuery,
  useAdjustTeamCreditsMutation,
  useAddCustomWorkMutation,
  useEditCustomWorkMutation,
} from '../../../services/api';
import { useAddTeamDrawerHandler } from './useAddTeamDrawerHandler';
import { useEditTeamDrawerHandler } from './useEditTeamDrawerHandler';
import dayjs from 'dayjs';

export const useTeamsHandler = (searchValue, selectedCompany) => {
  const [form] = Form.useForm();

  const { data, isLoading, refetch: refetchTeams } = useGetTeamsQuery();

  const [viewTeamDrawerOpen, setViewTeamDrawerOpen] = useState(false);
  const [selectedTeamForView, setSelectedTeamForView] = useState(null);
  const [manageCreditsDrawerOpen, setManageCreditsDrawerOpen] = useState(false);
  const [selectedTeamForCredits, setSelectedTeamForCredits] = useState(null);
  const [customWorkEditDrawerOpen, setCustomWorkEditDrawerOpen] = useState(false);
  const [selectedCustomWorkEntry, setSelectedCustomWorkEntry] = useState(null);

  const rawTeams = data?.data ?? [];

  const tableData = useMemo(() => {
    return rawTeams.map((item, index) => ({
      key: item._id || index,
      _id: item._id,
      teamName: item.title || '--',
      companyName: item.companyName || '--',
      ownerEmail: item.ownerEmail || '--',
      memberCount: item.memberCount ?? 0,
      creditBalance: item.creditBalance ?? 0,
      customWork: item.customWork ?? 0,
      companyId: item.companyId ?? undefined,
      isWhitelabelingEnabled: !!item.isWhitelabelingEnabled,
      dashboardURL: item.dashboardURL ?? undefined,
      primaryColor: item.primaryColor ?? undefined,
      logo: item.logo ?? undefined,
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
  useEffect(() => {
    console.log(filteredData);
  }, [filteredData]);

  const {
    editTeamDrawerOpen,
    selectedTeamForEdit,
    openEditDrawer,
    closeEditDrawer,
    form: editTeamForm,
    companyOptions: editTeamCompanyOptions,
    handleFinish: handleEditFinish,
    handleClose: handleEditClose,
    handleAfterOpenChange: handleEditAfterOpenChange,
    memberTableData: editMemberTableData,
    columns: editColumns,
    isLoadingMembers: isLoadingEditMembers,
    isSubmitting: isEditSubmitting,
  } = useEditTeamDrawerHandler(refetchTeams);

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

  const {
    data: creditsHistoryData,
    isLoading: isLoadingCreditsHistory,
    refetch: creditHistoryRefetch,
  } = useGetTeamCreditsHistoryQuery(selectedTeamForCredits?._id, {
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
        const response = await adjustTeamCredits(submitData).unwrap();

        if (response?.success) {
          notification.success({
            message: 'Team credits updated successfully',
            placement: 'bottomRight',
          });

          refetchTeams();
          creditHistoryRefetch();
          form.resetFields();
          form.setFieldsValue({
            purchaseDate: dayjs(),
          });
        } else {
          notification.error({
            message: response?.errorObject?.message || 'Failed to update team credits',
            placement: 'bottomRight',
          });
        }
      } catch (err) {
        notification.error({
          message: err?.data?.message || 'Something went wrong',
          placement: 'bottomRight',
        });
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
          const response = await editCustomWork(payload).unwrap();
          if (response?.success) {
            notification.success({
              message: 'Custom work entry updated successfully',
              placement: 'bottomRight',
            });
          } else {
            notification.error({
              message: response?.errorObject?.message || 'Failed to update team credits',
              placement: 'bottomRight',
            });
          }
        } else {
          const response = await addCustomWork({
            teamId: payload.teamId,
            creditsUsed: payload.creditsUsed,
            usageData: payload.usageData,
          }).unwrap();
          if (response?.success) {
            notification.success({
              message: 'Custom work entry added successfully',
              placement: 'bottomRight',
            });
            refetchTeams();
            closeCustomWorkEditDrawer();
          } else {
            notification.error({
              message: response?.errorObject?.message || 'Failed to update team credits',
              placement: 'bottomRight',
            });
          }
        }
      } catch (err) {
        notification.error({
          message: err?.data?.message || 'Something went wrong',
          placement: 'bottomRight',
        });
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
    editTeamForm,
    editTeamCompanyOptions,
    handleEditFinish,
    handleEditClose,
    handleEditAfterOpenChange,
    editMemberTableData,
    editColumns,
    isLoadingEditMembers,
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
    creditsHistoryData: creditsHistoryData?.data ?? null,
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
    form,
  };
};
