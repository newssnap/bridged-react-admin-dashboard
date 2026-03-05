import { useState } from 'react';
import { useMemo } from 'react';
import { message, notification } from 'antd';
import {
  useGetTeamCreditsQuery,
  useGetTeamCreditsHistoryQuery,
  useAdjustTeamCreditsMutation,
} from '../../../services/api';

export const useTeamCreditsHandler = searchValue => {
  const { data, isLoading, error, refetch: refetchTeamCredits } = useGetTeamCreditsQuery();
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTeamIdForAdd, setSelectedTeamIdForAdd] = useState(null);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  const {
    data: historyData,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useGetTeamCreditsHistoryQuery(selectedTeamId, {
    skip: !selectedTeamId,
  });

  const {
    data: addHistoryData,
    isLoading: isLoadingAddHistory,
    refetch: refetchAddHistory,
  } = useGetTeamCreditsHistoryQuery(selectedTeamIdForAdd, {
    skip: !selectedTeamIdForAdd,
  });

  const [adjustTeamCredits, { isLoading: isSubmitting }] = useAdjustTeamCreditsMutation();

  const rawList = data?.data ?? [];

  const tableData = useMemo(() => {
    return rawList.map((item, index) => ({
      key: item.teams?.teamId || index,
      teamId: item.teams?.teamId,
      teamName: item.teams?.teamName || '--',
      companyName: item.teams?.companyName || '--',
      creditBalance: item.creditBalance || 0,
      lastUpdated: item.lastUpdatedAt,
    }));
  }, [rawList]);

  const filteredData = useMemo(() => {
    if (!searchValue) return tableData;

    const searchLower = searchValue.toLowerCase();
    return tableData.filter(item => item.teamName?.toLowerCase().includes(searchLower));
  }, [tableData, searchValue]);

  const selectedTeamData = useMemo(() => {
    if (!selectedTeamId || !rawList.length) return null;
    return rawList.find(item => item.teams?.teamId === selectedTeamId);
  }, [selectedTeamId, rawList]);

  const selectedTeamDataForAdd = useMemo(() => {
    if (!selectedTeamIdForAdd || !rawList.length) return null;
    return rawList.find(item => item.teams?.teamId === selectedTeamIdForAdd);
  }, [selectedTeamIdForAdd, rawList]);

  const handleOpenDrawer = teamId => {
    setSelectedTeamId(teamId);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTeamId(null);
  };

  const handleOpenAddDrawer = () => {
    setIsAddDrawerOpen(true);
    setSelectedTeamIdForAdd(null);
  };

  const handleCloseAddDrawer = () => {
    setIsAddDrawerOpen(false);
    setSelectedTeamIdForAdd(null);
  };

  const handleTeamSelectForAdd = teamId => {
    setSelectedTeamIdForAdd(teamId);
  };

  const handleSubmitForm = async submitData => {
    try {
      const response = await adjustTeamCredits(submitData).unwrap();
      if (response?.success) {
        notification.success({
          message: 'Team credits updated successfully',
          placement: 'bottomRight',
        });

        refetchTeamCredits();
        refetchHistory();
        handleCloseDrawer();
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
  };

  const handleSubmitAddForm = async submitData => {
    try {
      const response = await adjustTeamCredits(submitData).unwrap();
      if (response?.success) {
        notification.success({
          message: 'Team credits added successfully',
          placement: 'bottomRight',
        });
        refetchTeamCredits();
        refetchAddHistory();
        handleCloseAddDrawer();
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
  };

  return {
    tableData: filteredData,
    isLoading,
    error,
    isDrawerOpen,
    selectedTeamId,
    selectedTeamData: selectedTeamData
      ? {
          teamId: selectedTeamData.teams?.teamId,
          teamName: selectedTeamData.teams?.teamName,
          companyName: selectedTeamData.teams?.companyName,
          creditBalance: selectedTeamData.creditBalance,
        }
      : null,
    historyData: historyData?.data ?? null,
    isLoadingHistory,
    isSubmitting,
    handleOpenDrawer,
    handleCloseDrawer,
    handleSubmitForm,
    // Add drawer related
    isAddDrawerOpen,
    selectedTeamIdForAdd,
    selectedTeamDataForAdd: selectedTeamDataForAdd
      ? {
          teamId: selectedTeamDataForAdd.teams?.teamId,
          teamName: selectedTeamDataForAdd.teams?.teamName,
          companyName: selectedTeamDataForAdd.teams?.companyName,
          creditBalance: selectedTeamDataForAdd.creditBalance,
        }
      : null,
    addHistoryData: addHistoryData?.data ?? null,
    isLoadingAddHistory,
    handleOpenAddDrawer,
    handleCloseAddDrawer,
    handleTeamSelectForAdd,
    handleSubmitAddForm,
  };
};
