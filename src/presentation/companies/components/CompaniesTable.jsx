import React from 'react';
import { Button, Dropdown, Modal, Table, Tooltip, Typography } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
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
      width: '50px',
      align: 'center',
      render: (_, record) => {
        const items = [
          {
            key: 'edit',
            label: <span>Edit company name</span>,
            icon: <Icon name="EditOutlined" />,
          },
          {
            key: 'manageUsers',
            label: <span>Manage users</span>,
            icon: (
              <Icon
                name="UsersLeft"
                style={{ marginBottom: '-3px', width: '17px', height: '17px' }}
              />
            ),
          },
          {
            key: 'delete',
            label: <span>Delete company</span>,
            icon: <Icon name="DeleteOutlined" />,
          },
        ];

        const handleMenuClick = ({ key }) => {
          if (key === 'edit') {
            onEdit(record);
          }
          if (key === 'manageUsers') {
            setManageUsersDrawer({ open: true, companyId: record?.id });
          }
          if (key === 'delete') {
            Modal.confirm({
              title: 'Delete company',
              content: `Are you sure you want to delete ${record.name}?`,
              okText: 'Yes',
              centered: true,
              cancelText: 'No',
              okButtonProps: { danger: true },
              onOk: () => onDelete(record),
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
