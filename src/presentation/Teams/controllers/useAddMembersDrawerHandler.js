import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useForm } from '@/components/form';
import { useAddTeamMemberMutation, useLazyGetUsersWithNoTeamQuery } from '../../../services/api';

export const useAddMembersDrawerHandler = ({ existingMemberUserIds, teamId, onSuccess }) => {
  const [form] = useForm();
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
        toast.error("Couldn't find the team to add members to");
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
        toast.success(succeeded === 1 ? 'Member added' : `${succeeded} members added`);
      } else if (succeeded === 0) {
        toast.error(results.length === 1 ? "Couldn't add the member" : "Couldn't add the members");
      } else {
        toast.warning(`Added ${succeeded} of ${results.length} members`, {
          description: `${failed} couldn't be added. Try them again.`,
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
