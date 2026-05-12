import { useState, useEffect, useMemo, useCallback } from 'react';
import { Form, message, notification, Typography, Popconfirm, Tooltip, Button } from 'antd';
import {
  useUpdateTeamMutation,
  useGetCompaniesQuery,
  useGetAdminTeamMembersQuery,
  useCreateCompanyMutation,
  useDeleteTeamMemberMutation,
} from '../../../services/api';
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
  const [deletingId, setDeletingId] = useState(null);

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
        _id: m._id,
        name: m.name?.trim() || m.email || '—',
        email: m.email || '—',
        role: m.isOwner ? 'Owner' : 'Member',
        profilePicture: m.profilePicture,
      })),
    [members]
  );

  const handleDeleteMember = useCallback(
    async record => {
      if (!record?._id) {
        notification.error({
          message: 'Member id is missing',
          placement: 'bottomRight',
        });
        return;
      }
      setDeletingId(record._id);
      try {
        const response = await deleteTeamMember(record._id).unwrap();
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
          if (record.role === 'Owner') return null;
          const isDeleting = deletingId === record._id;
          return (
            <Popconfirm
              title="Remove member"
              description="Remove this member from the team?"
              okText="Remove"
              okButtonProps={{ loading: isDeleting }}
              cancelText="Cancel"
              onConfirm={() => handleDeleteMember(record)}
            >
              <Tooltip title="Remove member">
                <Button type="text" shape="circle" size="small" danger loading={isDeleting}>
                  <Icon name="DeleteOutlined" />
                </Button>
              </Tooltip>
            </Popconfirm>
          );
        },
      },
    ],
    [handleDeleteMember, deletingId]
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
