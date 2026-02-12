import React, { useState } from 'react';
import { Space, Typography, Table, Button, Input, Flex, Dropdown, Tooltip, Modal, Tag } from 'antd';
import { PlusOutlined, MoreOutlined } from '@ant-design/icons';
import { useCustomWorkHandler } from '../controllers/useCustomWorkHandler';
import AddCustomWorkDrawer from '../components/AddCustomWorkDrawer';
import PreviewEditCustomWorkDrawer from '../components/PreviewEditCustomWorkDrawer';
import Icon from '../../../utils/components/Icon';
import formatDate from '../../../utils/formatting/formateDate';

function CustomWorkWorkflow() {
  const { Title } = Typography;
  const [searchValue, setSearchValue] = useState('');
  const {
    tableData,
    isLoading,
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
  } = useCustomWorkHandler(searchValue);

  const getStatusColor = status => {
    const statusMap = {
      pending: 'orange',
      completed: 'green',
      'in-progress': 'blue',
      approved: 'cyan',
    };
    return statusMap[status?.toLowerCase()] || 'default';
  };

  const getStatusLabel = status => {
    const labelMap = {
      pending: 'Pending',
      completed: 'Completed',
      'in-progress': 'In Progress',
      approved: 'Approved',
    };
    return labelMap[status?.toLowerCase()] || status || '--';
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return '--';
    const start = formatDate(startDate, true);
    const end = formatDate(endDate, true);
    return `${start} - ${end}`;
  };

  const columns = [
    {
      title: 'Team',
      dataIndex: 'teamName',
      key: 'teamName',
      render: (value, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{value || '--'}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.companyName || '--'}</div>
        </div>
      ),
    },
    {
      title: 'Work / Project',
      dataIndex: 'workProject',
      key: 'workProject',
      render: value => <span>{value || '--'}</span>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: value => <span>{value || '--'}</span>,
    },
    {
      title: 'Credits Used',
      dataIndex: 'creditsUsed',
      key: 'creditsUsed',
      align: 'center',
      render: value => <span>{value?.toLocaleString() || 0}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: status => <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>,
    },
    {
      title: 'Date Range',
      key: 'dateRange',
      render: (_, record) => <span>{formatDateRange(record.startDate, record.endDate)}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '50px',
      align: 'center',
      render: (_, record) => {
        const items = [
          {
            key: 'edit',
            label: <span>Edit</span>,
            icon: <Icon name="EditOutlined" />,
          },
          {
            key: 'preview',
            label: <span>Preview</span>,
            icon: <Icon name="InfoCircleOutlined" />,
          },
          {
            key: 'delete',
            label: <span>Delete</span>,
            icon: <Icon name="DeleteOutlined" />,
          },
        ];

        const handleMenuClick = ({ key }) => {
          if (key === 'edit') {
            handleEdit(record);
          }
          if (key === 'preview') {
            handlePreview(record);
          }
          if (key === 'delete') {
            Modal.confirm({
              title: 'Delete Custom Work Entry',
              content: `Are you sure you want to delete "${record.workProject}"?`,
              okText: 'Yes',
              centered: true,
              cancelText: 'No',
              okButtonProps: { danger: true },
              onOk: () => handleDelete(record),
            });
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
          Custom Work
        </Title>
        <Flex justify="space-between" align="center" style={{ width: '100%' }}>
          <Button
            size="large"
            type="primary"
            style={{ width: '200px' }}
            onClick={handleOpenAddDrawer}
          >
            <PlusOutlined />
            Add Custom Work Entry
          </Button>
          <Input
            placeholder="Search teams, projects, or categories"
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
            emptyText: 'No custom work entries found',
          }}
        />
      </Space>

      <AddCustomWorkDrawer
        open={isAddDrawerOpen}
        onClose={handleCloseAddDrawer}
        teamsData={teamsForSelect}
        onSubmit={handleSubmitAddForm}
        isSubmitting={isSubmitting}
      />

      <PreviewEditCustomWorkDrawer
        open={isPreviewEditDrawerOpen}
        onClose={handleClosePreviewEditDrawer}
        mode={previewEditMode}
        initialRecord={selectedRecord}
        teamsData={teamsForEditSelect}
        onSubmit={handleSubmitEditForm}
        isSubmitting={isEditSubmitting}
      />
    </>
  );
}
export default CustomWorkWorkflow;
