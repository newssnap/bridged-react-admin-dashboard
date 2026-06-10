import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Drawer,
  Typography,
  Button,
  Table,
  Space,
  Card,
  Avatar,
  Dropdown,
  Modal,
  Tooltip,
  notification,
} from 'antd';
import {
  CreditCardOutlined,
  FileTextOutlined,
  UserOutlined,
  MoreOutlined,
  LoadingOutlined,
  ChromeOutlined,
} from '@ant-design/icons';
import {
  useGetAdminTeamMembersQuery,
  useActivateUserMutation,
  useDeactivateUserMutation,
} from '../../../services/api';
import { useDashboardHandler } from '../../dashboard/controllers/useDashboardHandler';
import { openUserPortal } from '../../../utils/controllers/openUserPortal';
import Icon from '../../../utils/components/Icon';

const { Text } = Typography;

const ViewTeamDrawer = ({ open, onClose, team }) => {
  const teamId = team?._id;
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const {
    data: membersData,
    isLoading: isLoadingMembers,
    refetch: refetchMembers,
  } = useGetAdminTeamMembersQuery(teamId, {
    skip: !open || !teamId,
  });

  const [activateUser] = useActivateUserMutation();
  const [deactivateUser] = useDeactivateUserMutation();

  const {
    handleGenerateUserTokenForLogin,
    isGeneratingTokenForLogin,
    generateTokenIDLogin,
    tokenType,
  } = useDashboardHandler();

  useEffect(() => {
    if (!open) {
      setOpenDropdownId(null);
    }
  }, [open]);

  const members = membersData?.data ?? [];

  const memberTableData = members.map((m, index) => ({
    key: m.userId || m._id || index,
    _id: m.userId,
    userId: m.userId,
    name: m.name?.trim() || m.email || '—',
    email: m.email || '—',
    role: m.isOwner ? 'Owner' : 'Member',
    profilePicture: m.profilePicture,
    status: m.status,
  }));

  const handleMenuClick = useCallback(
    async (key, record) => {
      if (!record?._id) return;

      const token = await handleGenerateUserTokenForLogin({ _id: record._id }, key);
      if (!token) return;

      if (key === 'portal') {
        openUserPortal(token);
      } else if (key === 'plugin') {
        window.postMessage(
          {
            source: 'qweek-website',
            payload: {
              type: 'LOGIN_TOKEN',
              token,
            },
          },
          '*'
        );
        window.addEventListener('message', event => {
          if (event.source !== window) return;

          const message = event.data;

          if (message?.source === 'qweek-website' && message.payload?.type === 'LOGIN_STATUS') {
            if (message.payload.status === 'success') {
              notification.success({
                message: 'Login Success',
                description: 'You have been logged in successfully.',
              });
            } else {
              notification.error({
                message: 'Login Failed',
                description: 'Failed to login. Please try again.',
              });
            }
          }
        });
      }
    },
    [handleGenerateUserTokenForLogin]
  );

  const handleUpdateUserStatus = useCallback(
    async (userId, action) => {
      try {
        if (action === 'activate') {
          const response = await activateUser(userId).unwrap();
          if (response?.success) {
            notification.success({
              message: 'User activated successfully',
              placement: 'bottomRight',
              showProgress: true,
            });
            refetchMembers();
          }
        } else {
          const response = await deactivateUser(userId).unwrap();
          if (response?.success) {
            notification.success({
              message: 'User deactivated successfully',
              placement: 'bottomRight',
              showProgress: true,
            });
            refetchMembers();
          }
        }
      } catch (err) {
        notification.error({
          message: err?.data?.errorObject?.userErrorText || 'Failed to update user status',
          placement: 'bottomRight',
          showProgress: true,
        });
      }
    },
    [activateUser, deactivateUser, refetchMembers]
  );

  const showStatusConfirmModal = useCallback(
    record => {
      Modal.confirm({
        title: record?.status === 'inactive' ? 'Activate user?' : 'Deactivate user?',
        content:
          record?.status === 'inactive'
            ? 'Are you sure you want to activate this user?'
            : 'Are you sure you want to deactivate this user?',
        okText: record?.status === 'inactive' ? 'Activate' : 'Deactivate',
        okButtonProps: {
          danger: record?.status !== 'inactive',
        },
        cancelText: 'Cancel',
        centered: true,
        type: 'warning',
        onOk: () => {
          handleUpdateUserStatus(
            record._id,
            record?.status === 'inactive' ? 'activate' : 'deactivate'
          );
          setOpenDropdownId(null);
        },
      });
    },
    [handleUpdateUserStatus]
  );

  const columns = useMemo(
    () => [
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
        title: 'Actions',
        key: 'actions',
        width: '75px',
        align: 'center',
        render: (_, record) => {
          const menuItems = [
            {
              key: 'portal',
              label: (
                <Space>
                  {isGeneratingTokenForLogin &&
                  generateTokenIDLogin &&
                  tokenType === 'portal' &&
                  generateTokenIDLogin === record._id ? (
                    <LoadingOutlined />
                  ) : (
                    <Icon name="ComputerOutlined" style={{ marginBottom: '-3px' }} />
                  )}
                  <span>Login to Portal</span>
                </Space>
              ),
              onClick: () => {
                handleMenuClick('portal', record);
              },
            },
            {
              key: 'plugin',
              label: (
                <Space>
                  {isGeneratingTokenForLogin &&
                  generateTokenIDLogin &&
                  tokenType === 'plugin' &&
                  generateTokenIDLogin === record._id ? (
                    <LoadingOutlined />
                  ) : (
                    <ChromeOutlined style={{ fontSize: '15px' }} />
                  )}
                  <span>Login to Plugin</span>
                </Space>
              ),
              onClick: () => {
                handleMenuClick('plugin', record);
              },
            },
            {
              type: 'divider',
            },
            {
              key: record?.status === 'inactive' ? 'activate' : 'deactivate',
              label: (
                <Space
                  onClick={e => {
                    e.stopPropagation();
                    showStatusConfirmModal(record);
                  }}
                >
                  {record?.status === 'inactive' ? (
                    <>
                      <Icon name="PlayOutlined" style={{ marginBottom: '-2px' }} />
                      <span>Activate User</span>
                    </>
                  ) : (
                    <>
                      <Icon name="PauseOutlined" style={{ marginBottom: '-2px' }} />
                      <span>Deactivate User</span>
                    </>
                  )}
                </Space>
              ),
            },
          ];

          return (
            <div onClick={e => e.stopPropagation()}>
              <Dropdown
                open={openDropdownId === record._id}
                onOpenChange={isOpen => {
                  if (!isOpen) {
                    setOpenDropdownId(null);
                  }
                }}
                menu={{ items: menuItems }}
                trigger={['click']}
                arrow
                placement="bottomRight"
              >
                <Tooltip title="Actions">
                  <Button
                    type="text"
                    shape="circle"
                    icon={<MoreOutlined />}
                    onClick={e => {
                      e.stopPropagation();
                      setOpenDropdownId(record._id);
                    }}
                  />
                </Tooltip>
              </Dropdown>
            </div>
          );
        },
      },
    ],
    [
      handleMenuClick,
      showStatusConfirmModal,
      isGeneratingTokenForLogin,
      generateTokenIDLogin,
      tokenType,
      openDropdownId,
    ]
  );

  if (!team) return null;

  return (
    <Drawer
      title="View Team"
      placement="right"
      onClose={onClose}
      open={open}
      width={690}
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button size="large" onClick={onClose}>
            Close
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%', gap: '24px' }}>
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
          <Space align="center" style={{ gap: 24 }}>
            <Avatar size={64} src={team.logo ?? undefined} icon={<UserOutlined />} />

            <Space direction="vertical" style={{ gap: 4 }}>
              <Text strong style={{ fontSize: 18 }}>
                {team.teamName || '—'}
              </Text>
              <Text type="secondary" style={{ fontSize: 14 }}>
                {team.companyName || '—'}
              </Text>
            </Space>
          </Space>
        </Card>

        <Card
          size="small"
          title={
            <Space>
              <CreditCardOutlined />
              <span>Credit Balance</span>
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

        <Card
          size="small"
          title={
            <Space>
              <FileTextOutlined />
              <span>Custom Works</span>
            </Space>
          }
          styles={{
            body: { padding: '16px 24px' },
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: 600 }}>
            {(team.customWork ?? 0).toLocaleString()}
          </Text>
        </Card>

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
