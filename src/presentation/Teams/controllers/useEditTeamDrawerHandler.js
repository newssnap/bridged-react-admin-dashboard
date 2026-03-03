import { message, notification } from 'antd';
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
  };

  return {
    handleSubmit,
    isSubmitting,
  };
};
