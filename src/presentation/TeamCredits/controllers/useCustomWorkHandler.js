import { useState, useMemo, useEffect } from 'react';
import {
  useGetCustomWorkQuery,
  useGetTeamCreditsQuery,
  useAddCustomWorkMutation,
  useEditCustomWorkMutation,
} from '../../../services/api';
import { message, notification } from 'antd';

export const useCustomWorkHandler = searchValue => {
  const { data, isLoading, error, refetch } = useGetCustomWorkQuery();
  const { data: teamsData } = useGetTeamCreditsQuery();
  const [addCustomWork, { isLoading: isSubmitting }] = useAddCustomWorkMutation();
  const [editCustomWork, { isLoading: isEditSubmitting }] = useEditCustomWorkMutation();
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isPreviewEditDrawerOpen, setIsPreviewEditDrawerOpen] = useState(false);
  const [previewEditMode, setPreviewEditMode] = useState('preview');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const tableData = useMemo(() => {
    if (!data) return [];

    return data.map((item, index) => ({
      key: item.creditUsageId || index,
      creditUsageId: item.creditUsageId,
      teamId: item.team?.teamId,
      teamName: item.team?.teamName || '--',
      companyName: item.team?.companyName || '--',
      workProject: item.usageData?.customWorkTitle || '--',
      category: item.usageData?.customWorkCategory || '--',
      creditsUsed: item.creditsUsed || 0,
      status: item.usageData?.customWorkStatus || '--',
      startDate: item.usageData?.customWorkStartDate,
      endDate: item.usageData?.customWorkEndDate,
      notes: item.usageData?.notes,
    }));
  }, [data]);

  const filteredData = useMemo(() => {
    if (!searchValue) return tableData;

    const searchLower = searchValue.toLowerCase();
    return tableData.filter(
      item =>
        item.teamName?.toLowerCase().includes(searchLower) ||
        item.workProject?.toLowerCase().includes(searchLower) ||
        item.category?.toLowerCase().includes(searchLower)
    );
  }, [tableData, searchValue]);

  const teamsForSelect = useMemo(() => {
    if (!teamsData) return [];
    return teamsData.map((item, index) => ({
      key: item.team?.teamId || index,
      teamId: item.team?.teamId,
      teamName: item.team?.teamName || '--',
      companyName: item.team?.companyName || '--',
    }));
  }, [teamsData]);

  const teamsForEditSelect = useMemo(() => {
    if (!selectedRecord || previewEditMode !== 'edit') return teamsForSelect;
    const exists = teamsForSelect.some(t => t.teamId === selectedRecord.teamId);
    if (exists) return teamsForSelect;
    return [
      {
        teamId: selectedRecord.teamId,
        teamName: selectedRecord.teamName,
        companyName: selectedRecord.companyName,
      },
      ...teamsForSelect,
    ];
  }, [teamsForSelect, selectedRecord, previewEditMode]);

  const handleOpenAddDrawer = () => setIsAddDrawerOpen(true);
  const handleCloseAddDrawer = () => setIsAddDrawerOpen(false);

  const handleSubmitAddForm = async payload => {
    try {
      await addCustomWork(payload).unwrap();
      message.success('Custom work entry added successfully');
      refetch();
      handleCloseAddDrawer();
    } catch (err) {
      message.error(err?.data?.message || 'Failed to add custom work entry');
    }
  };

  useEffect(() => {
    if (error) {
      notification.error({
        message: 'Failed to fetch custom work data',
        placement: 'bottomRight',
        showProgress: true,
      });
    }
  }, [error]);

  const handleEdit = record => {
    setSelectedRecord(record);
    setPreviewEditMode('edit');
    setIsPreviewEditDrawerOpen(true);
  };

  const handlePreview = record => {
    setSelectedRecord(record);
    setPreviewEditMode('preview');
    setIsPreviewEditDrawerOpen(true);
  };

  const handleClosePreviewEditDrawer = () => {
    setIsPreviewEditDrawerOpen(false);
    setSelectedRecord(null);
  };

  const handleSubmitEditForm = async payload => {
    try {
      await editCustomWork(payload).unwrap();
      message.success('Custom work entry updated successfully');
      refetch();
      handleClosePreviewEditDrawer();
    } catch (err) {
      message.error(err?.data?.message || 'Failed to update custom work entry');
    }
  };

  const handleDelete = record => {
    // TODO: Implement delete functionality
    console.log('Delete:', record);
  };

  return {
    tableData: filteredData,
    isLoading,
    error,
    refetch,
    handleEdit,
    handlePreview,
    handleDelete,
    isAddDrawerOpen,
    teamsForSelect,
    isSubmitting,
    handleOpenAddDrawer,
    handleCloseAddDrawer,
    handleSubmitAddForm,
    isPreviewEditDrawerOpen,
    previewEditMode,
    selectedRecord,
    teamsForEditSelect,
    isEditSubmitting,
    handleClosePreviewEditDrawer,
    handleSubmitEditForm,
  };
};
