import React, { useState } from 'react';
import {
  Space,
  Typography,
  Table,
  Button,
  Input,
  Flex,
  Select,
  Dropdown,
  Tooltip,
  Form,
  notification,
} from 'antd';
import { PlusOutlined, MoreOutlined } from '@ant-design/icons';
import { useTeamsHandler } from '../controllers/useTeamsHandler';
import AddTeamDrawer from '../components/AddTeamDrawer';
import ViewTeamDrawer from '../components/ViewTeamDrawer';
import EditTeamDrawer from '../components/EditTeamDrawer';
import ManageCreditsDrawer from '../../TeamCredits/components/ManageCreditsDrawer';
import PreviewEditCustomWorkDrawer from '../../TeamCredits/components/PreviewEditCustomWorkDrawer';
import Icon from '../../../utils/components/Icon';
import AssignPlaybookDrawer from '../../dashboard/components/AssignPlaybookDrawer';
import useAssignPlaybookDrawer from '../../dashboard/controllers/useAssignPlaybookDrawer';
import {
  useDisablePlaybookForTeamMutation,
  useEnablePlaybookForTeamMutation,
} from '../../../services/api';

function TeamsWorkflow() {
  const { Title } = Typography;
  const [searchValue, setSearchValue] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [assignPlaybookForm] = Form.useForm();
  const [selectedTeamForPlaybooks, setSelectedTeamForPlaybooks] = useState(null);
  const [isApplyingPlaybookChanges, setIsApplyingPlaybookChanges] = useState(false);

  const {
    playbooks,
    playbookAgentLabelMap,
    isLoadingPlaybooks,
    draftSelectedPlaybooks,
    initialAssignedPlaybookTypes,
    teamAssignedPlaybookIdsByType,
    isPlaybookDrawerOpen,
    openPlaybooksDrawer,
    closePlaybooksDrawer,
    applyPlaybooksSelection,
    handlePlaybookToggle,
    handleTeamPlaybooksLoaded,
  } = useAssignPlaybookDrawer({ form: assignPlaybookForm });

  const [enablePlaybookForTeam] = useEnablePlaybookForTeamMutation();
  const [disablePlaybookForTeam] = useDisablePlaybookForTeamMutation();

  const handleAssignPlaybooks = async () => {
    const teamId = selectedTeamForPlaybooks?._id;
    if (!teamId) {
      notification.warning({
        message: 'No team selected',
        placement: 'bottomRight',
      });
      return;
    }

    const initialSet = new Set(initialAssignedPlaybookTypes);
    const draftSet = new Set(draftSelectedPlaybooks);

    const toEnableTypes = draftSelectedPlaybooks.filter(t => !initialSet.has(t));
    const toDisableTypes = initialAssignedPlaybookTypes.filter(t => !draftSet.has(t));

    if (toEnableTypes.length === 0 && toDisableTypes.length === 0) {
      applyPlaybooksSelection();
      setSelectedTeamForPlaybooks(null);
      return;
    }

    setIsApplyingPlaybookChanges(true);
    try {
      const enableTasks = toEnableTypes.map(playbookType => {
        const playbook = playbooks.find(p => p.value === playbookType);
        if (!playbook?.id) {
          return Promise.reject(new Error(`Missing playbook id for "${playbookType}"`));
        }
        return enablePlaybookForTeam({ teamId, playbookId: playbook.id }).unwrap();
      });

      const disableTasks = toDisableTypes.map(playbookType => {
        const playbookId = teamAssignedPlaybookIdsByType[playbookType];
        if (!playbookId) {
          return Promise.reject(new Error(`Missing team playbook id for "${playbookType}"`));
        }
        return disablePlaybookForTeam({ teamId, playbookId }).unwrap();
      });

      await Promise.all([...enableTasks, ...disableTasks]);

      applyPlaybooksSelection();
      notification.success({
        message: 'Team playbooks updated',
        placement: 'bottomRight',
      });
      setSelectedTeamForPlaybooks(null);
    } catch (error) {
      notification.error({
        message: error?.data?.message || error?.message || 'Failed to update team playbooks',
        placement: 'bottomRight',
      });
    } finally {
      setIsApplyingPlaybookChanges(false);
    }
  };

  const {
    tableData,
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
    isLoadingEditCompanies,
    editCompanySearchText,
    handleEditCompanySearch,
    createEditCompany,
    isCreatingEditCompany,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    addTeamCompanyOptions,
    userOptions,
    isUsersLoading,
    isLoadingAddCompanies,
    onCompanyChange,
    addCompanySearchText,
    handleAddCompanySearch,
    createAddCompany,
    isCreatingAddCompany,
    handleSubmit,
    isSubmitting,
    manageCreditsDrawerOpen,
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
    form,
  } = useTeamsHandler(searchValue, selectedCompany);

  const columns = [
    {
      title: 'Team Name',
      dataIndex: 'teamName',
      key: 'teamName',
      render: value => <span>{value || '--'}</span>,
    },
    {
      title: 'Company',
      dataIndex: 'companyName',
      key: 'companyName',
      render: value => <span>{value || '--'}</span>,
    },
    {
      title: 'Owner',
      dataIndex: 'ownerEmail',
      key: 'ownerEmail',
      render: value => <span>{value || '--'}</span>,
    },
    {
      title: '# Members',
      dataIndex: 'memberCount',
      key: 'memberCount',
      align: 'center',
      render: value => <span>{value?.toLocaleString() ?? 0}</span>,
    },
    {
      title: 'Credit Balance',
      dataIndex: 'creditBalance',
      key: 'creditBalance',
      align: 'center',
      render: value => <span>{value?.toLocaleString() ?? 0}</span>,
    },
    {
      title: '# Custom Works',
      dataIndex: 'customWork',
      key: 'customWork',
      align: 'center',
      render: value => <span>{value?.toLocaleString() ?? 0}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '50px',
      align: 'center',
      render: (_, record) => {
        const items = [
          { key: 'viewTeam', label: <span>View Team</span>, icon: <Icon name="UsersLeft" /> },
          { key: 'editTeam', label: <span>Edit Team</span>, icon: <Icon name="EditOutlined" /> },
          {
            key: 'manageCredits',
            label: <span>Manage Credits</span>,
            icon: <Icon name="MoneyOutlined" />,
          },
          {
            key: 'manageCustomWork',
            label: <span>Manage Custom Work</span>,
            icon: <Icon name="SettingOutlined" />,
          },
          {
            key: 'assignPlaybooks',
            label: <span>Playbooks Management</span>,
            icon: <Icon name="ResumeFilled" />,
          },
        ];

        const handleMenuClick = ({ key }) => {
          if (key === 'viewTeam') openViewDrawer(record);
          if (key === 'editTeam') openEditDrawer(record);
          if (key === 'manageCredits') openManageCreditsDrawer(record);
          if (key === 'manageCustomWork') openCustomWorkDrawer(record);
          if (key === 'assignPlaybooks') {
            setSelectedTeamForPlaybooks(record);
            openPlaybooksDrawer();
          }
        };

        return (
          <div onClick={e => e.stopPropagation()}>
            <Dropdown trigger={['click']} menu={{ items, onClick: handleMenuClick }}>
              <Tooltip title="Actions">
                <Button type="text" shape="circle" icon={<MoreOutlined />} />
              </Tooltip>
            </Dropdown>
          </div>
        );
      },
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2} style={{ fontWeight: 300 }}>
        Teams
      </Title>
      <Flex justify="space-between" align="center" style={{ width: '100%' }}>
        <Space direction="horizontal">
          <Button size="large" type="primary" style={{ width: '150px' }} onClick={openDrawer}>
            <PlusOutlined />
            Add Team
          </Button>
          <Select
            placeholder="All Companies"
            allowClear
            value={selectedCompany || undefined}
            onChange={value => setSelectedCompany(value ?? '')}
            options={companyOptions}
            size="large"
            style={{ minWidth: '200px', maxWidth: '400px' }}
          />
        </Space>
        <Input
          placeholder="Search teams"
          allowClear
          size="large"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </Flex>
      <Table
        dataSource={tableData}
        loading={isLoading}
        columns={columns}
        bordered
        onRow={record => ({
          onClick: () => openViewDrawer(record),
          style: {
            cursor: 'pointer',
            backgroundColor: record?.companyId === '' ? '#f5f5f5' : undefined,
          },
        })}
        pagination={{
          position: ['bottomLeft'],
          showSizeChanger: false,
          showQuickJumper: false,
        }}
        locale={{
          emptyText: (
            <Space direction="vertical" align="center">
              <span>No teams has been added yet.</span>
              <Button type="primary" icon={<PlusOutlined />} onClick={openDrawer}>
                Add your First Team
              </Button>
            </Space>
          ),
        }}
      />

      <AddTeamDrawer
        open={isDrawerOpen}
        onClose={closeDrawer}
        companyOptions={addTeamCompanyOptions}
        isLoadingCompanies={isLoadingAddCompanies}
        companySearchText={addCompanySearchText}
        onCompanySearch={handleAddCompanySearch}
        onCreateCompany={createAddCompany}
        isCreatingCompany={isCreatingAddCompany}
        userOptions={userOptions}
        isUsersLoading={isUsersLoading}
        onCompanyChange={onCompanyChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <ViewTeamDrawer
        open={viewTeamDrawerOpen}
        onClose={closeViewDrawer}
        team={selectedTeamForView}
      />

      <EditTeamDrawer
        open={editTeamDrawerOpen}
        team={selectedTeamForEdit}
        userOptions={userOptions}
        isUsersLoading={isUsersLoading}
        onCompanyChange={onCompanyChange}
        form={editTeamForm}
        companyOptions={editTeamCompanyOptions}
        isLoadingCompanies={isLoadingEditCompanies}
        companySearchText={editCompanySearchText}
        onCompanySearch={handleEditCompanySearch}
        onCreateCompany={createEditCompany}
        isCreatingCompany={isCreatingEditCompany}
        handleFinish={handleEditFinish}
        handleClose={handleEditClose}
        handleAfterOpenChange={handleEditAfterOpenChange}
        memberTableData={editMemberTableData}
        columns={editColumns}
        isLoadingMembers={isLoadingEditMembers}
        isSubmitting={isEditSubmitting}
      />

      <ManageCreditsDrawer
        open={manageCreditsDrawerOpen}
        onClose={closeManageCreditsDrawer}
        teamData={manageCreditsTeamData}
        historyData={creditsHistoryData}
        isLoadingHistory={isLoadingCreditsHistory}
        onSubmit={handleManageCreditsSubmit}
        isSubmitting={isCreditsSubmitting}
        form={form}
      />

      <PreviewEditCustomWorkDrawer
        open={customWorkEditDrawerOpen}
        onClose={closeCustomWorkEditDrawer}
        mode="edit"
        initialRecord={selectedCustomWorkEntry}
        teamsData={teamsDataForCustomWorkDrawer}
        onSubmit={handleCustomWorkSubmit}
        isSubmitting={isCustomWorkSubmitting}
      />

      <AssignPlaybookDrawer
        open={isPlaybookDrawerOpen}
        teamId={selectedTeamForPlaybooks?._id}
        playbooks={playbooks}
        playbookAgentLabelMap={playbookAgentLabelMap}
        draftSelectedPlaybooks={draftSelectedPlaybooks}
        isLoadingPlaybooks={isLoadingPlaybooks}
        isApplyingPlaybooks={isApplyingPlaybookChanges}
        onTeamPlaybooksLoaded={handleTeamPlaybooksLoaded}
        onClose={() => {
          closePlaybooksDrawer();
          setSelectedTeamForPlaybooks(null);
        }}
        onApply={handleAssignPlaybooks}
        onToggle={handlePlaybookToggle}
      />
    </Space>
  );
}

export default TeamsWorkflow;
