import React from 'react';
import { Drawer, Typography, Button, Table, Space, Card, Avatar } from 'antd';
import { CreditCardOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useGetAdminTeamMembersQuery } from '../../../services/api';

const { Text } = Typography;

const ViewTeamDrawer = ({ open, onClose, team }) => {
  const navigate = useNavigate();
  const teamId = team?._id;

  const { data: membersData, isLoading: isLoadingMembers } = useGetAdminTeamMembersQuery(teamId, {
    skip: !open || !teamId,
  });

  const members = membersData?.data ?? [];

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
      render: (name, record) => (
        <Space align="center">
          {/* <Avatar
            size="small"
            src={record.profilePicture}
            style={{ backgroundColor: 'var(--ant-color-primary)' }}
          >
            {(name || '?').charAt(0).toUpperCase()}
          </Avatar> */}
          <Text>{name}</Text>
        </Space>
      ),
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
  ];

  if (!team) return null;

  return (
    <Drawer
      title="View Team"
      placement="right"
      onClose={onClose}
      open={open}
      width={590}
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button size="large" onClick={onClose}>
            Close
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%', gap: '24px' }}>
        {/* 1. Team Summary */}
        <Card
          size="small"
          styles={{
            body: { padding: '0px' },
          }}
          style={{
            background: 'var(--ant-color-fill-quaternary)',
            border: '1px solid var(--ant-color-border-secondary)',
          }}
        >
          <Text strong style={{ fontSize: 18, display: 'block', marginBottom: 4 }}>
            {team.teamName || '—'}
          </Text>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {team.companyName || '—'}
          </Text>
        </Card>

        {/* 2. Credit Balance */}
        <Card
          size="small"
          title={
            <Space>
              <CreditCardOutlined />
              <span>Credit Balance</span>
            </Space>
          }
          // extra={
          //   <Button type="primary" size="small" onClick={() => { onClose(); navigate('/teams/credits'); }}>
          //     Manage Credits
          //   </Button>
          // }
          styles={{
            body: { padding: '16px 24px' },
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: 600 }}>
            {(team.creditBalance ?? 0).toLocaleString()}
          </Text>
        </Card>

        {/* 3. Custom Works */}
        <Card
          size="small"
          title={
            <Space>
              <FileTextOutlined />
              <span>Custom Works</span>
            </Space>
          }
          // extra={
          //   <Button type="primary" size="small" onClick={() => { onClose(); navigate('/teams/custom-work'); }}>
          //     Manage Custom Work
          //   </Button>
          // }
          styles={{
            body: { padding: '16px 24px' },
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: 600 }}>
            {(team.customWork ?? 0).toLocaleString()}
          </Text>
        </Card>

        {/* 4. Team Members Table */}
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
          locale={{
            emptyText: 'No members',
          }}
        />
      </Space>
    </Drawer>
  );
};

export default ViewTeamDrawer;
