import React, { useState } from 'react';
import { Space, Typography, Table, Button, Input, Flex, Dropdown, Tooltip } from 'antd';
import { PlusOutlined, MoreOutlined } from '@ant-design/icons';
import { useTeamCreditsHandler } from '../controllers/useTeamCreditsHandler';
import ManageCreditsDrawer from '../components/ManageCreditsDrawer';
import AddTeamCreditsDrawer from '../components/AddTeamCreditsDrawer';
import Icon from '../../../utils/components/Icon';
import formatDate from '../../../utils/formatting/formateDate';

function TeamCreditsWorkflow() {
  const { Title } = Typography;
  const [searchValue, setSearchValue] = useState('');
  const {
    tableData,
    isLoading,
    isDrawerOpen,
    selectedTeamData,
    historyData,
    isLoadingHistory,
    isSubmitting,
    handleOpenDrawer,
    handleCloseDrawer,
    handleSubmitForm,
    isAddDrawerOpen,
    selectedTeamIdForAdd,
    selectedTeamDataForAdd,
    addHistoryData,
    isLoadingAddHistory,
    handleOpenAddDrawer,
    handleCloseAddDrawer,
    handleTeamSelectForAdd,
    handleSubmitAddForm,
  } = useTeamCreditsHandler(searchValue);

  const columns = [
    {
      title: 'Team',
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
      title: 'Credit Balance',
      dataIndex: 'creditBalance',
      key: 'creditBalance',
      align: 'center',
      render: value => <span>{value?.toLocaleString() || 0}</span>,
    },
    {
      title: 'Last Update',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: value => <span>{value ? formatDate(value) : '--'}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '50px',
      align: 'center',
      render: (_, record) => {
        const items = [
          {
            key: 'manageCredits',
            label: <span>Manage Credits</span>,
            icon: <Icon name="EditOutlined" />,
          },
        ];

        const handleMenuClick = ({ key }) => {
          if (key === 'manageCredits') {
            handleOpenDrawer(record.teamId);
          }
        };

        return (
          <Dropdown
            trigger={['click']}
            menu={{
              items,
              onClick: handleMenuClick,
            }}
          >
            <Tooltip title="Actions">
              <Button type="text" shape="circle" icon={<MoreOutlined />} />
            </Tooltip>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2} style={{ fontWeight: 300 }}>
          Team Credits
        </Title>
        <Flex justify="space-between" align="center" style={{ width: '100%' }}>
          <Button
            size="large"
            type="primary"
            style={{ width: '150px' }}
            onClick={handleOpenAddDrawer}
          >
            <PlusOutlined />
            Add Team Credits
          </Button>
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
          pagination={{
            position: ['bottomLeft'],
            showSizeChanger: false,
            showQuickJumper: false,
          }}
          locale={{
            emptyText: 'No teams found',
          }}
        />
      </Space>

      <ManageCreditsDrawer
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        teamData={selectedTeamData}
        historyData={historyData}
        isLoadingHistory={isLoadingHistory}
        onSubmit={handleSubmitForm}
        isSubmitting={isSubmitting}
      />

      <AddTeamCreditsDrawer
        open={isAddDrawerOpen}
        onClose={handleCloseAddDrawer}
        teamsData={tableData}
        selectedTeamId={selectedTeamIdForAdd}
        selectedTeamData={selectedTeamDataForAdd}
        historyData={addHistoryData}
        isLoadingHistory={isLoadingAddHistory}
        onSubmit={handleSubmitAddForm}
        isSubmitting={isSubmitting}
        onTeamSelect={handleTeamSelectForAdd}
      />
    </>
  );
}
export default TeamCreditsWorkflow;
