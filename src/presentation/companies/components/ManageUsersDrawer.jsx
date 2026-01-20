import { Button, Col, Drawer, Input, Row, Select, Space, Table } from 'antd';
import React from 'react';
import useManageUsersDrawerHandler from '../controllers/useManageUsersDrawerHandler';

const ManageUsersDrawer = ({ open, setManageUsersDrawer, companyId }) => {
  const {
    isUsersLoading,
    columns,
    dataSource,
    userIds,
    rowSelection,
    handleSubmit,
    isSubmitting,
    pagination,
    fetchUsers,
    filters,
    searchValue,
    onSearchChange,
    handleStatusChange,
    handleSortChange,
  } = useManageUsersDrawerHandler(companyId);

  const handleSave = async () => {
    const success = await handleSubmit();
    if (success) {
      setManageUsersDrawer({ open: false, companyId: null });
    }
  };

  return (
    <Drawer
      title="Manage Users"
      open={open}
      destroyOnClose
      onClose={() => setManageUsersDrawer({ open: false, companyId: null })}
      width={900}
      footer={
        <Space
          size="middle"
          style={{ width: '100%', justifyContent: 'flex-end', padding: 'var(--mpr-3)' }}
        >
          <Button
            size="large"
            onClick={() => setManageUsersDrawer({ open: false, companyId: null })}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button size="large" type="primary" onClick={handleSave} loading={isSubmitting}>
            Save Changes
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col {...{ xs: 24, sm: 24, md: 12, lg: 16 }}>
            <Space size="middle" style={{ width: '100%' }}>
              <Select
                value={filters.status}
                onChange={handleStatusChange}
                style={{ minWidth: 125 }}
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                ]}
                size="large"
              />
              <Select
                value={filters.sort}
                onChange={handleSortChange}
                style={{ minWidth: 150 }}
                options={[
                  { label: 'Last Login (Newest)', value: 'lastLogin_DESC' },
                  { label: 'Last Login (Oldest)', value: 'lastLogin_ASC' },
                ]}
                size="large"
              />
            </Space>
          </Col>
          <Col {...{ xs: 24, sm: 24, md: 12, lg: 8 }}>
            <Input
              allowClear
              placeholder="Search users"
              value={searchValue}
              onChange={e => onSearchChange(e.target.value)}
              size="large"
            />
          </Col>
        </Row>

        <Table
          rowSelection={{ ...rowSelection, hideSelectAll: true }}
          bordered
          dataSource={dataSource}
          columns={columns}
          loading={isUsersLoading}
          pagination={{
            position: ['bottomLeft'],
            current: pagination.pageNumber,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: false,
            onChange: (page, pageSize) => {
              fetchUsers(page, pageSize);
            },
            onShowSizeChange: (current, size) => {
              fetchUsers(1, size);
            },
          }}
        />
      </Space>
    </Drawer>
  );
};

export default ManageUsersDrawer;
