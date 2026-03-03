import { message } from 'antd';
import { useUpdateTeamMutation } from '../../../services/api';

export const useEditTeamDrawerHandler = onSuccess => {
  const [updateTeam, { isLoading: isSubmitting }] = useUpdateTeamMutation();

  const handleSubmit = async values => {
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

      await updateTeam(payload).unwrap();
      message.success('Team updated successfully');
      onSuccess?.();
    } catch (err) {
      message.error(err?.data?.message || 'Failed to update team');
      throw err;
    }
  };

  return {
    handleSubmit,
    isSubmitting,
  };
};
