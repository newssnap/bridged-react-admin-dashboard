import React from 'react';
import { Button, Popconfirm, Space, Table, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import Icon from '../../../utils/components/Icon';
import useCompaniesTableHandler from '../controllers/useCompaniesTableHandler';

const { Text } = Typography;

const CompaniesTable = ({ onEdit, onDelete, searchValue, setManageUsersDrawer }) => {
  const { companies, total, page, limit, handlePageChange, isLoading } =
    useCompaniesTableHandler(searchValue);

  const columns = [
    {
      title: 'Company Name',
      dataIndex: 'name',
      key: 'name',
      render: value => <Text ellipsis>{value}</Text>,
    },
    {
      title: 'Number of Accounts',
      dataIndex: 'accounts_count',
      key: 'accounts_count',
      width: 180,
      align: 'center',
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: value => dayjs(value).format('YYYY-MM-DD'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit company name">
            <Button
              type="text"
              shape="circle"
              icon={<Icon name="EditOutlined" />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete company"
            description={`Are you sure you want to delete ${record.name}?`}
            onConfirm={() => onDelete(record)}
            okButtonProps={{ danger: true }}
            okText="Yes"
            cancelText="No"
            placement="topRight"
          >
            <Tooltip title="Delete company">
              <Button type="text" shape="circle" icon={<Icon name="DeleteOutlined" />} />
            </Tooltip>
          </Popconfirm>
          <Tooltip title="Manage users">
            <Button
              type="text"
              shape="circle"
              onClick={() => setManageUsersDrawer({ open: true, companyId: record?.id })}
              icon={
                <Icon
                  name="UsersLeft"
                  style={{ marginBottom: '-3px', width: '18px', height: '18px' }}
                />
              }
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      loading={isLoading}
      pagination={{
        current: page,
        pageSize: limit,
        total: total,
        position: ['bottomLeft'],
        showSizeChanger: false,
        showQuickJumper: false,
        onChange: handlePageChange,
      }}
      bordered
      rowKey="id"
      columns={columns}
      dataSource={Array.isArray(companies) ? companies : []}
    />
  );
};

export default CompaniesTable;
