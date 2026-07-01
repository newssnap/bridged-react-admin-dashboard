import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Form,
  message,
  notification,
  Typography,
  Popconfirm,
  Tooltip,
  Button,
  Space,
  Dropdown,
  Modal,
} from 'antd';
import { LoadingOutlined, ChromeOutlined, MoreOutlined } from '@ant-design/icons';
import {
  useUpdateTeamMutation,
  useGetCompaniesQuery,
  useGetAdminTeamMembersQuery,
  useCreateCompanyMutation,
  useDeleteTeamMemberMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
} from '../../../services/api';
import { useDashboardHandler } from '../../dashboard/controllers/useDashboardHandler';
import { openUserPortal } from '../../../utils/controllers/openUserPortal';
import Icon from '../../../utils/components/Icon';

const { Text } = Typography;

export const useEditTeamDrawerHandler = (refetchTeams, onCompanyChange) => {
  const [form] = Form.useForm();
  const [editTeamDrawerOpen, setEditTeamDrawerOpen] = useState(false);
  const [selectedTeamForEdit, setSelectedTeamForEdit] = useState(null);
  const [companySearchText, setCompanySearchText] = useState('');

  const teamId = selectedTeamForEdit?._id;
  const open = editTeamDrawerOpen;
  const team = selectedTeamForEdit;

  const [updateTeam, { isLoading: isSubmitting }] = useUpdateTeamMutation();
  const [deleteTeamMember] = useDeleteTeamMemberMutation();
  const [activateUser] = useActivateUserMutation();
  const [deactivateUser] = useDeactivateUserMutation();
  const [deletingId, setDeletingId] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const {
    handleGenerateUserTokenForLogin,
    isGeneratingTokenForLogin,
    generateTokenIDLogin,
    tokenType,
  } = useDashboardHandler();

  const {
    data: companiesResponse,
    isLoading: isLoadingCompanies,
    refetch: refetchCompanies,
  } = useGetCompaniesQuery(
    { page: 1, limit: 500, search: companySearchText || '' },
    { skip: !open }
  );
  const [createCompanyMutation, { isLoading: isCreatingCompany }] = useCreateCompanyMutation();

  const companiesList = companiesResponse?.data?.data ?? [];
  const companyOptions = useMemo(
    () => (open ? companiesList.map(c => ({ value: c.id, label: c.name || '--' })) : []),
    [open, companiesList]
  );

  const {
    data: membersData,
    isLoading: isLoadingMembers,
    refetch: refetchTeamMembers,
  } = useGetAdminTeamMembersQuery(teamId, {
    skip: !open || !teamId,
  });

  const members = membersData?.data ?? [];

  const closeEditDrawer = useCallback(() => {
    setEditTeamDrawerOpen(false);
    setCompanySearchText('');
    setOpenDropdownId(null);
    setTimeout(() => setSelectedTeamForEdit(null), 300);
  }, []);

  const openEditDrawer = useCallback(record => {
    setSelectedTeamForEdit(record);
    setEditTeamDrawerOpen(true);
  }, []);

  const onSuccess = useCallback(() => {
    refetchTeams?.();
  }, [refetchTeams]);

  useEffect(() => {
    if (!open || !team) return;
    const companyId = companyOptions?.find(o => o.label === team.companyName)?.value;
    const dashboardSubdomain = team.dashboardURL?.endsWith('.bridged.media')
      ? team.dashboardURL.replace('.bridged.media', '')
      : (team.dashboardURL ?? undefined);
    form.setFieldsValue({
      teamName: team.teamName ?? undefined,
      companyId: companyId ?? undefined,
      isWhitelabelingEnabled: !!team.isWhitelabelingEnabled,
      dashboardURL: dashboardSubdomain,
      primaryColor: team.primaryColor ?? '#753fd0',
      logoUrl: team.logo ?? undefined,
    });
    if (companyId) {
      onCompanyChange?.(companyId);
    }
  }, [open, team, companyOptions, form, onCompanyChange]);

  const handleSubmit = useCallback(
    async values => {
      if (!values?.teamId) {
        message.error('Team ID is missing');
        return;
      }
      try {
        const payload = {
          _id: values.teamId,
          title: values.teamName?.trim() ?? '',
          companyId: values.companyId ?? '',
          isWhitelabelingEnabled: !!values.isWhitelabelingEnabled,
        };

        if (payload.isWhitelabelingEnabled) {
          payload.dashboardURL = values.dashboardURL?.trim()
            ? `${values.dashboardURL.trim()}.bridged.media`
            : '';
          payload.primaryColor = values.primaryColor ?? '';
          payload.logo = values.logoUrl?.trim() ?? '';
        } else {
          payload.dashboardURL = '';
          payload.primaryColor = '';
          payload.logo = '';
        }

        const response = await updateTeam(payload).unwrap();
        if (response?.success) {
          notification.success({
            message: 'Team updated successfully',
            placement: 'bottomRight',
          });
          await refetchTeamMembers?.();
          closeEditDrawer();
          onSuccess?.();
        } else {
          notification.error({
            message: response?.data?.errorObject?.userErrorText || 'Failed to update team credits',
            placement: 'bottomRight',
          });
        }
      } catch (err) {
        console.log(err);
        notification.error({
          message: err?.data?.errorObject?.userErrorText || 'Something went wrong',
          placement: 'bottomRight',
        });
      }
    },
    [updateTeam, onSuccess, refetchTeamMembers, closeEditDrawer]
  );

  const handleFinish = useCallback(
    values => {
      handleSubmit({ ...values, teamId: team?._id });
    },
    [handleSubmit, team]
  );

  const handleClose = useCallback(() => {
    closeEditDrawer();
  }, [closeEditDrawer]);

  const handleAfterOpenChange = useCallback(
    isOpen => {
      if (!isOpen) {
        form.resetFields();
        setCompanySearchText('');
      }
    },
    [form]
  );

  const handleCompanySearch = useCallback(value => {
    setCompanySearchText(value ?? '');
  }, []);

  const createCompany = useCallback(
    async values => {
      const companyName = values?.name?.trim();
      if (!companyName) return null;

      try {
        const result = await createCompanyMutation(companyName).unwrap();
        notification.success({
          message: 'Company created successfully',
          placement: 'bottomRight',
        });

        await refetchCompanies();
        setCompanySearchText('');

        return result?.id || result?.data?.id || result?.data?.data?.id || result?._id || null;
      } catch (error) {
        notification.error({
          message: error?.data?.errorObject?.userErrorText || 'Failed to create company',
          placement: 'bottomRight',
        });
        return null;
      }
    },
    [createCompanyMutation, refetchCompanies]
  );

  const memberTableData = useMemo(
    () =>
      members.map((m, index) => ({
        key: m._id || m.userId || index,
        _id: m.userId || m._id,
        membershipId: m._id,
        userId: m.userId,
        name: m.name?.trim() || m.email || '—',
        email: m.email || '—',
        role: m.isOwner ? 'Owner' : 'Member',
        profilePicture: m.profilePicture,
        status: m.status,
      })),
    [members]
  );

  const handleMenuClick = useCallback(
    async (key, record) => {
      if (!record?._id) return;

      const token = await handleGenerateUserTokenForLogin({ _id: record._id }, key);
      if (!token) return;

      if (key === 'portal') {
        openUserPortal(token);
      } else if (key === 'plugin') {
        const handlePluginStatus = event => {
          if (event.source !== window) return;
          const eventSource = event.data?.source;
          const eventType = event.data?.payload?.type;
          if (eventSource !== 'qweek-website' || eventType !== 'LOGIN_STATUS') return;

          window.removeEventListener('message', handlePluginStatus);

          if (event.data?.payload?.status === 'success') {
            notification.success({
              message: 'Login Success',
              description: 'You have been logged in successfully.',
            });
            return;
          }

          notification.error({
            message: 'Login Failed',
            description: 'Failed to login. Please try again.',
          });
        };

        window.addEventListener('message', handlePluginStatus);
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
            refetchTeamMembers?.();
          }
          return;
        }

        const response = await deactivateUser(userId).unwrap();
        if (response?.success) {
          notification.success({
            message: 'User deactivated successfully',
            placement: 'bottomRight',
            showProgress: true,
          });
          refetchTeamMembers?.();
        }
      } catch (err) {
        notification.error({
          message: err?.data?.errorObject?.userErrorText || 'Failed to update user status',
          placement: 'bottomRight',
          showProgress: true,
        });
      }
    },
    [activateUser, deactivateUser, refetchTeamMembers]
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

  const handleDeleteMember = useCallback(
    async record => {
      if (!record?.membershipId) {
        notification.error({
          message: 'Member id is missing',
          placement: 'bottomRight',
        });
        return;
      }
      setDeletingId(record.membershipId);
      try {
        const response = await deleteTeamMember(record.membershipId).unwrap();
        if (response?.success) {
          notification.success({
            message: 'Member removed successfully',
            placement: 'bottomRight',
          });
          await refetchTeamMembers?.();
          refetchTeams?.();
        } else {
          notification.error({
            message: response?.errorObject?.userErrorText || 'Failed to remove member',
            placement: 'bottomRight',
          });
        }
      } catch (err) {
        notification.error({
          message: err?.data?.errorObject?.userErrorText || 'Something went wrong',
          placement: 'bottomRight',
        });
      } finally {
        setDeletingId(null);
      }
    },
    [deleteTeamMember, refetchTeamMembers, refetchTeams]
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
        title: 'Action',
        key: 'action',
        width: 60,
        align: 'center',
        render: (_, record) => {
          const isDeleting = deletingId === record.membershipId;
          const isOwner = record.role === 'Owner';
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
            { type: 'divider' },
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

            ...(!isOwner
              ? [
                  { type: 'divider' },
                  {
                    key: 'remove',
                    label: (
                      <Popconfirm
                        title="Remove member"
                        description="Remove this member from the team?"
                        okText="Remove"
                        okButtonProps={{ loading: isDeleting }}
                        cancelText="Cancel"
                        onConfirm={() => handleDeleteMember(record)}
                      >
                        <Space>
                          <Icon name="DeleteOutlined" />
                          <span>Remove Member</span>
                        </Space>
                      </Popconfirm>
                    ),
                  },
                ]
              : []),
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
                    size="small"
                    icon={<MoreOutlined />}
                    onClick={e => {
                      e.stopPropagation();
                      setOpenDropdownId(record._id);
                    }}
                  ></Button>
                </Tooltip>
              </Dropdown>
            </div>
          );
        },
      },
    ],
    [
      handleDeleteMember,
      deletingId,
      handleMenuClick,
      showStatusConfirmModal,
      isGeneratingTokenForLogin,
      generateTokenIDLogin,
      tokenType,
      openDropdownId,
    ]
  );

  return {
    editTeamDrawerOpen,
    selectedTeamForEdit,
    openEditDrawer,
    closeEditDrawer,
    form,
    companyOptions,
    members,
    isLoadingMembers,
    refetchTeamMembers,
    handleFinish,
    handleClose,
    handleAfterOpenChange,
    memberTableData,
    columns,
    isSubmitting,
    isLoadingCompanies,
    companySearchText,
    handleCompanySearch,
    createCompany,
    isCreatingCompany,
  };
};
