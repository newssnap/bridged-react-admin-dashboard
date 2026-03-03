import React, { useEffect } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  Space,
  Card,
  Table,
  Typography,
  Dropdown,
  Tooltip,
} from 'antd';
import { CreditCardOutlined, MoreOutlined } from '@ant-design/icons';
import { useGetAdminTeamMembersQuery, useGetCompaniesQuery } from '../../../services/api';

const { Text } = Typography;

const EditTeamDrawer = ({
  open,
  onClose,
  team,
  companyOptions: companyOptionsProp,
  userOptions,
  isUsersLoading,
  onCompanyChange,
  onSubmit,
  isSubmitting,
}) => {
  const [form] = Form.useForm();
  const teamId = team?._id;

  const { data: companiesResponse } = useGetCompaniesQuery(
    { page: 1, limit: 500 },
    { skip: !open }
  );

  const companiesList = companiesResponse?.data?.data ?? [];
  const companyOptions = open
    ? companiesList.map(c => ({ value: c.id, label: c.name || '--' }))
    : (companyOptionsProp ?? []);

  const { data: membersData, isLoading: isLoadingMembers } = useGetAdminTeamMembersQuery(teamId, {
    skip: !open || !teamId,
  });

  const members = membersData?.data ?? [];
  const membersLoaded = !isLoadingMembers && open && teamId;
  const userOptionsReady = !isUsersLoading && Array.isArray(userOptions);

  useEffect(() => {
    if (!open || !team) return;
    const companyId = companyOptions?.find(o => o.label === team.companyName)?.value;
    form.setFieldsValue({
      teamName: team.teamName ?? undefined,
      companyId: companyId ?? undefined,
    });
    if (companyId) {
      onCompanyChange?.(companyId);
    }
  }, [open, team, companyOptions, form, onCompanyChange]);

  useEffect(() => {
    if (!open || !teamId) return;
    form.setFieldsValue({ teamOwnerId: undefined, memberIds: [] });
  }, [open, teamId, form]);

  useEffect(() => {
    if (!membersLoaded || !userOptionsReady || !members.length) return;
    const owner = members.find(m => m.isOwner);
    const teamOwnerId = owner?.userId ?? undefined;
    const memberIds = members.filter(m => m.userId).map(m => m.userId);
    form.setFieldsValue({
      teamOwnerId,
      memberIds,
    });
  }, [membersLoaded, userOptionsReady, members, form]);

  const handleFinish = values => {
    onSubmit?.({ ...values, teamId: team?._id });
  };

  const handleClose = () => {
    onClose?.();
  };

  const handleAfterOpenChange = open => {
    if (!open) {
      form.resetFields();
    }
  };

  const memberTableData = members.map((m, index) => ({
    key: m._id || m.userId || index,
    name: m.name?.trim() || m.email || '—',
    email: m.email || '—',
    role: m.isOwner ? 'Owner' : 'Member',
    profilePicture: m.profilePicture,
  }));

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: name => <Text>{name}</Text>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: value => <Text type="secondary">{value}</Text>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: role => (
        <Text strong={role === 'Owner'} type={role === 'Owner' ? null : 'secondary'}>
          {role}
        </Text>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 50,
      align: 'center',
      render: (_, record) => {
        const items = [
          { key: 'makeOwner', label: <span>Make Owner</span>, disabled: record.role === 'Owner' },
        ];
        const handleMenuClick = ({ key }) => {
          // API to be implemented later
        };
        return (
          <Dropdown trigger={['click']} menu={{ items, onClick: handleMenuClick }}>
            <Tooltip title="Actions">
              <Button type="text" shape="circle" size="small" icon={<MoreOutlined />} />
            </Tooltip>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Drawer
      title="Edit Team"
      placement="right"
      onClose={handleClose}
      afterOpenChange={handleAfterOpenChange}
      open={open}
      width={650}
      footer={
        team ? (
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={() => form.submit()}
              loading={isSubmitting}
            >
              Save
            </Button>
          </Space>
        ) : null
      }
    >
      {team ? (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
            <Form.Item
              label="Team Name"
              name="teamName"
              rules={[{ required: true, message: 'Please enter team name' }]}
            >
              <Input size="large" placeholder="Enter team name" />
            </Form.Item>

            <Form.Item
              label="Company"
              name="companyId"
              rules={[{ required: true, message: 'Please select a company' }]}
            >
              <Select
                size="large"
                placeholder="Select company"
                options={companyOptions}
                showSearch
                optionFilterProp="label"
                allowClear
                onChange={companyId => {
                  onCompanyChange?.(companyId);
                }}
              />
            </Form.Item>

            <Form.Item
              label="Team Owner"
              name="teamOwnerId"
              rules={[{ required: true, message: 'Please select team owner' }]}
            >
              <Select
                size="large"
                placeholder="Select team owner"
                options={userOptions}
                showSearch
                optionFilterProp="label"
                loading={isUsersLoading}
                allowClear
              />
            </Form.Item>

            <Form.Item label="Members (Optional)" name="memberIds">
              <Select
                size="large"
                mode="multiple"
                placeholder="Select members"
                options={userOptions}
                showSearch
                optionFilterProp="label"
                loading={isUsersLoading}
                allowClear
              />
            </Form.Item>
          </Form>

          {/* Current Credit */}
          <Card
            size="small"
            title={
              <Space>
                <CreditCardOutlined />
                <span>Current Credit Balance</span>
              </Space>
            }
            styles={{
              body: { padding: '16px 24px' },
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: 600 }}>
              {(team.creditBalance ?? 0).toLocaleString()}
            </Text>
          </Card>

          {/* Current Team Members Table */}
          <Table
            dataSource={memberTableData}
            columns={columns}
            loading={isLoadingMembers}
            bordered
            pagination={{
              position: ['bottomLeft'],
              showSizeChanger: false,
              showQuickJumper: false,
            }}
            locale={{ emptyText: 'No members' }}
          />
        </Space>
      ) : null}
    </Drawer>
  );
};

export default EditTeamDrawer;
