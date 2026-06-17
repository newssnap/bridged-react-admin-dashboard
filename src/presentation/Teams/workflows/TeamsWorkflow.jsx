import React, { useState } from 'react';
import { Space, Typography, Table, Button, Input, Flex, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTeamsHandler } from '../controllers/useTeamsHandler';
import AddTeamDrawer from '../components/AddTeamDrawer';
import EditTeamDrawer from '../components/EditTeamDrawer';

function TeamsWorkflow() {
  const { Title } = Typography;
  const [searchValue, setSearchValue] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');

  const {
    tableData,
    isLoading,
    companyOptions,
    domainOptions,
    isDomainsLoading,
    editTeamDrawerOpen,
    selectedTeamForEdit,
    openEditDrawer,
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
    addMembersDrawerOpen,
    openAddMembersDrawer,
    closeAddMembersDrawer,
    addMembersForm,
    addMembersUserOptions,
    isAddMembersUsersLoading,
    handleAddMembersFinish,
    handleAddMembersAfterOpenChange,
    isAddMembersSubmitting,
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
    handleEditCreditsHistorySubmit,
    isEditingHistorySubmitting,
    customWorkEditDrawerOpen,
    selectedCustomWorkEntry,
    teamsDataForCustomWorkDrawer,
    openCustomWorkDrawer,
    closeCustomWorkEditDrawer,
    handleCustomWorkSubmit,
    isCustomWorkSubmitting,
    form,
  } = useTeamsHandler(searchValue, selectedCompany, selectedDomain);

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
          <Select
            placeholder="All Domains"
            allowClear
            value={selectedDomain || undefined}
            onChange={value => setSelectedDomain(value ?? '')}
            options={domainOptions}
            loading={isDomainsLoading}
            showSearch
            optionFilterProp="label"
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
          onClick: () => openEditDrawer(record),
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

      <EditTeamDrawer
        open={editTeamDrawerOpen}
        team={selectedTeamForEdit}
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
        addMembersDrawerOpen={addMembersDrawerOpen}
        openAddMembersDrawer={openAddMembersDrawer}
        closeAddMembersDrawer={closeAddMembersDrawer}
        addMembersForm={addMembersForm}
        addMembersUserOptions={addMembersUserOptions}
        isAddMembersUsersLoading={isAddMembersUsersLoading}
        handleAddMembersFinish={handleAddMembersFinish}
        handleAddMembersAfterOpenChange={handleAddMembersAfterOpenChange}
        isAddMembersSubmitting={isAddMembersSubmitting}
        manageCreditsDrawerOpen={manageCreditsDrawerOpen}
        openManageCreditsDrawer={openManageCreditsDrawer}
        closeManageCreditsDrawer={closeManageCreditsDrawer}
        manageCreditsTeamData={manageCreditsTeamData}
        creditsHistoryData={creditsHistoryData}
        isLoadingCreditsHistory={isLoadingCreditsHistory}
        handleManageCreditsSubmit={handleManageCreditsSubmit}
        isCreditsSubmitting={isCreditsSubmitting}
        handleEditCreditsHistorySubmit={handleEditCreditsHistorySubmit}
        isEditingHistorySubmitting={isEditingHistorySubmitting}
        creditsForm={form}
        customWorkEditDrawerOpen={customWorkEditDrawerOpen}
        openCustomWorkDrawer={openCustomWorkDrawer}
        closeCustomWorkEditDrawer={closeCustomWorkEditDrawer}
        selectedCustomWorkEntry={selectedCustomWorkEntry}
        teamsDataForCustomWorkDrawer={teamsDataForCustomWorkDrawer}
        handleCustomWorkSubmit={handleCustomWorkSubmit}
        isCustomWorkSubmitting={isCustomWorkSubmitting}
      />
    </Space>
  );
}

export default TeamsWorkflow;
