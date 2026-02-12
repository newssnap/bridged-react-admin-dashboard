import { useState } from 'react';
import { useMemo } from 'react';
import { message } from 'antd';
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

  const tableData = useMemo(() => {
    if (!data) return [];

    return data.map((item, index) => ({
      key: item.team?.teamId || index,
      teamId: item.team?.teamId,
      teamName: item.team?.teamName || '--',
      companyName: item.team?.companyName || '--',
      creditBalance: item.creditBalance || 0,
      lastUpdated: item.lastUpdated,
    }));
  }, [data]);

  const filteredData = useMemo(() => {
    if (!searchValue) return tableData;

    const searchLower = searchValue.toLowerCase();
    return tableData.filter(item => item.teamName?.toLowerCase().includes(searchLower));
  }, [tableData, searchValue]);

  const selectedTeamData = useMemo(() => {
    if (!selectedTeamId || !data) return null;
    return data.find(item => item.team?.teamId === selectedTeamId);
  }, [selectedTeamId, data]);

  const selectedTeamDataForAdd = useMemo(() => {
    if (!selectedTeamIdForAdd || !data) return null;
    return data.find(item => item.team?.teamId === selectedTeamIdForAdd);
  }, [selectedTeamIdForAdd, data]);

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
      await adjustTeamCredits(submitData).unwrap();
      message.success('Team credits updated successfully');
      refetchTeamCredits();
      refetchHistory();
      handleCloseDrawer();
    } catch (error) {
      message.error(error?.data?.message || 'Failed to update team credits');
    }
  };

  const handleSubmitAddForm = async submitData => {
    try {
      await adjustTeamCredits(submitData).unwrap();
      message.success('Team credits added successfully');
      refetchTeamCredits();
      refetchAddHistory();
      handleCloseAddDrawer();
    } catch (error) {
      message.error(error?.data?.message || 'Failed to add team credits');
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
          teamId: selectedTeamData.team?.teamId,
          teamName: selectedTeamData.team?.teamName,
          companyName: selectedTeamData.team?.companyName,
          creditBalance: selectedTeamData.creditBalance,
        }
      : null,
    historyData,
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
          teamId: selectedTeamDataForAdd.team?.teamId,
          teamName: selectedTeamDataForAdd.team?.teamName,
          companyName: selectedTeamDataForAdd.team?.companyName,
          creditBalance: selectedTeamDataForAdd.creditBalance,
        }
      : null,
    addHistoryData,
    isLoadingAddHistory,
    handleOpenAddDrawer,
    handleCloseAddDrawer,
    handleTeamSelectForAdd,
    handleSubmitAddForm,
  };
};
