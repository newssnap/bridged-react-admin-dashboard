import { useState, useMemo, useCallback } from 'react';
import { Form, notification } from 'antd';
import { useAddTeamMemberMutation, useLazyGetUsersWithNoTeamQuery } from '../../../services/api';

export const useAddMembersDrawerHandler = ({ existingMemberUserIds, teamId, onSuccess }) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [addTeamMember, { isLoading: isSubmitting }] = useAddTeamMemberMutation();

  const [
    fetchUsersWithNoTeam,
    { data: usersResponse, isFetching: isUsersFetching, isLoading: isUsersLoadingQuery },
  ] = useLazyGetUsersWithNoTeamQuery();

  const userOptions = useMemo(() => {
    const usersList = usersResponse?.data ?? [];
    return usersList.map(u => ({
      value: u._id,
      label: u.fullname ? `${u.fullname} (${u.email})` : u.email || u._id,
      fullname: u.fullname,
      email: u.email,
    }));
  }, [usersResponse]);

  const availableUserOptions = useMemo(() => {
    const existing = new Set(existingMemberUserIds ?? []);
    return (userOptions ?? []).filter(o => !existing.has(o.value));
  }, [userOptions, existingMemberUserIds]);

  const isUsersLoading = open && (isUsersFetching || isUsersLoadingQuery);

  const openDrawer = useCallback(() => {
    setOpen(true);
    fetchUsersWithNoTeam();
  }, [fetchUsersWithNoTeam]);

  const closeDrawer = useCallback(() => {
    setOpen(false);
  }, []);

  const handleAfterOpenChange = useCallback(
    isOpen => {
      if (!isOpen) {
        form.resetFields();
      }
    },
    [form]
  );

  const handleSubmit = useCallback(
    async values => {
      const memberIds = values?.memberIds ?? [];
      if (!teamId) {
        notification.error({
          message: 'Team ID is missing',
          placement: 'bottomRight',
        });
        return;
      }
      if (!memberIds.length) return;

      const results = await Promise.allSettled(
        memberIds.map(userId =>
          addTeamMember({
            teamId,
            userId,
            accessConfigs: [],
          }).unwrap()
        )
      );

      const failed = results.filter(r => r.status === 'rejected').length;
      const succeeded = results.length - failed;

      if (failed === 0) {
        notification.success({
          message:
            succeeded === 1
              ? 'Member added successfully'
              : `${succeeded} members added successfully`,
          placement: 'bottomRight',
        });
      } else if (succeeded === 0) {
        notification.error({
          message: 'Failed to add members',
          placement: 'bottomRight',
        });
      } else {
        notification.warning({
          message: `Added ${succeeded} of ${results.length} members. ${failed} failed.`,
          placement: 'bottomRight',
        });
      }

      if (succeeded > 0) {
        onSuccess?.();
        closeDrawer();
      }
    },
    [addTeamMember, teamId, onSuccess, closeDrawer]
  );

  const handleFinish = useCallback(
    values => {
      handleSubmit(values);
    },
    [handleSubmit]
  );

  return {
    open,
    openDrawer,
    closeDrawer,
    form,
    availableUserOptions,
    isUsersLoading,
    handleFinish,
    handleAfterOpenChange,
    isSubmitting,
  };
};
