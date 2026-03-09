import { useState, useEffect, useMemo, useCallback } from 'react';
import { Form, message, notification, Typography, Dropdown, Tooltip, Button } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import {
  useUpdateTeamMutation,
  useGetCompaniesQuery,
  useGetAdminTeamMembersQuery,
} from '../../../services/api';

const { Text } = Typography;

export const useEditTeamDrawerHandler = (refetchTeams, onCompanyChange) => {
  const [form] = Form.useForm();
  const [editTeamDrawerOpen, setEditTeamDrawerOpen] = useState(false);
  const [selectedTeamForEdit, setSelectedTeamForEdit] = useState(null);

  const teamId = selectedTeamForEdit?._id;
  const open = editTeamDrawerOpen;
  const team = selectedTeamForEdit;

  const [updateTeam, { isLoading: isSubmitting }] = useUpdateTeamMutation();

  const { data: companiesResponse } = useGetCompaniesQuery(
    { page: 1, limit: 500 },
    { skip: !open }
  );

  const companiesList = companiesResponse?.data?.data ?? [];
  const companyOptions = useMemo(
    () => (open ? companiesList.map(c => ({ value: c.id, label: c.name || '--' })) : []),
    [open, companiesList]
  );

  const { data: membersData, isLoading: isLoadingMembers } = useGetAdminTeamMembersQuery(teamId, {
    skip: !open || !teamId,
  });

  const members = membersData?.data ?? [];
  const membersLoaded = !isLoadingMembers && open && teamId;

  const closeEditDrawer = useCallback(() => {
    setEditTeamDrawerOpen(false);
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
    if (!membersLoaded || !members.length) return;
    const owner = members.find(m => m.isOwner);
    const teamOwnerId = owner?.userId ?? undefined;
    const memberIds = members.filter(m => m.userId).map(m => m.userId);
    form.setFieldsValue({
      teamOwnerId,
      memberIds,
    });
  }, [membersLoaded, members, form]);

  const handleSubmit = useCallback(
    async values => {
      if (!values?.teamId) {
        message.error('Team ID is missing');
        return;
      }
      try {
        const teamMembers = (values.memberIds ?? []).map(userId => ({
          userId,
          accessConfigs: [],
        }));

        const payload = {
          _id: values.teamId,
          title: values.teamName?.trim() ?? '',
          companyId: values.companyId ?? '',
          teamOwnerId: values.teamOwnerId ?? '',
          teamMembers,
        };

        const response = await updateTeam(payload).unwrap();
        if (response?.success) {
          notification.success({
            message: 'Team updated successfully',
            placement: 'bottomRight',
          });
          onSuccess?.();
        } else {
          notification.error({
            message: response?.errorObject?.message || 'Failed to update team credits',
            placement: 'bottomRight',
          });
        }
      } catch (err) {
        notification.error({
          message: err?.data?.message || 'Something went wrong',
          placement: 'bottomRight',
        });
      }
    },
    [updateTeam, onSuccess]
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
      }
    },
    [form]
  );

  const memberTableData = useMemo(
    () =>
      members.map((m, index) => ({
        key: m._id || m.userId || index,
        name: m.name?.trim() || m.email || '—',
        email: m.email || '—',
        role: m.isOwner ? 'Owner' : 'Member',
        profilePicture: m.profilePicture,
      })),
    [members]
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
        width: 50,
        align: 'center',
        render: (_, record) => {
          const items = [
            { key: 'makeOwner', label: <span>Make Owner</span>, disabled: record.role === 'Owner' },
          ];
          const handleMenuClick = () => {
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
    ],
    []
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
    handleFinish,
    handleClose,
    handleAfterOpenChange,
    memberTableData,
    columns,
    isSubmitting,
  };
};
