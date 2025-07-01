import {
  useGetUserChecklistQuery,
  useGetTeamMembersQuery,
  useAddDefaultChecklistMutation,
  useDeleteDefaultChecklistMutation,
  useUpdateUserChecklistMutation,
  useDeleteUserChecklistMutation,
  useUploadImageMutation,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useGetUserChecklistTaskCommentsQuery,
} from '../../../services/api';
import { notification } from 'antd';

export const useUserChecklistHandler = userId => {
  const {
    data: userChecklist,
    isLoading: isLoadingUserChecklist,
    refetch,
  } = useGetUserChecklistQuery(userId);
  const { data: teamMembers, isLoading: isLoadingTeamMembers } = useGetTeamMembersQuery(userId);
  const [addDefaultChecklist, { isLoading: isAddingDefaultChecklist }] =
    useAddDefaultChecklistMutation();
  const [updateUserChecklist, { isLoading: isUpdatingUserChecklist }] =
    useUpdateUserChecklistMutation();
  const [deleteUserChecklist, { isLoading: isDeletingUserChecklist }] =
    useDeleteUserChecklistMutation();
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadImageMutation();
  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdatingTask }] = useUpdateTaskMutation();
  const { data: taskComments, isLoading: isLoadingTaskComments } =
    useGetUserChecklistTaskCommentsQuery(userId);
  const handleAddDefaultChecklist = async (data, closeDrawer) => {
    try {
      const response = await addDefaultChecklist(data).unwrap();
      if (response.success) {
        notification.success({
          message: 'Default checklist added successfully',
          description: response.message,
        });
        closeDrawer();
      } else {
        notification.error({
          message: 'Error adding default checklist',
          description: response.message,
        });
        closeDrawer();
      }
    } catch (error) {
      console.error('Error adding default checklist:', error);
    }
  };

  const handleUpdateUserChecklist = async (id, data, closeDrawer) => {
    try {
      const response = await updateUserChecklist({ id, data }).unwrap();
      if (response.success) {
        notification.success({
          message: 'Default checklist updated successfully',
          description: response.message,
        });
        closeDrawer();
      } else {
        notification.error({
          message: 'Error updating default checklist',
          description: response.message,
        });
      }
    } catch (error) {
      console.error('Error updating default checklist:', error);
    }
  };

  const handleDeleteUserChecklist = async (id, closeDrawer) => {
    try {
      const response = await deleteUserChecklist(id).unwrap();
      if (response.success) {
        notification.success({
          message: 'Default checklist deleted successfully',
          description: response.message,
        });
        closeDrawer();
      }
    } catch (error) {
      console.error('Error deleting default checklist:', error);
    }
  };

  const handleUploadImage = async file => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await uploadImage(formData).unwrap();
      if (response.success) {
        return response.data; // Return the uploaded file data
      } else {
        notification.error({
          message: 'Error uploading image',
          description: response.message,
        });
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      notification.error({
        message: 'Error uploading image',
        description: 'Something went wrong while uploading the image',
      });
      return null;
    }
  };

  const handleCreateTask = async (data, updatedTasks, onSuccess) => {
    try {
      const response = await createTask(data).unwrap();
      if (response.success) {
        notification.success({
          message: 'Task updated successfully',
          description: response.message,
        });
        const newTask = {
          _id: response?.data?._id,
          title: response?.data?.title,
          assignedUser: response?.data?.assignedUser,
          description: response?.data?.description,
          attachments: response?.data?.attachments,
          userEmail: response?.data?.userEmail,
          isCompleted: response?.data?.isCompleted,
          commentsCount: response?.data?.commentsCount,
          createdDate: response?.data?.createdDate,
        };
        updatedTasks.push(newTask);
        if (onSuccess) onSuccess();
        refetch();
        return response;
      } else {
        notification.error({
          message: 'Error updating task',
          description: response.message,
        });
        return null;
      }
    } catch (error) {
      console.error('Error updating task:', error);
      notification.error({
        message: 'Error updating task',
        description: 'Something went wrong while updating the task',
      });
      return null;
    }
  };

  const handleUpdateTask = async (id, data, onSuccess) => {
    try {
      const response = await updateTask({ id, data }).unwrap();
      if (response.success) {
        notification.success({
          message: 'Task updated successfully',
          description: response.message,
        });
        if (onSuccess) onSuccess();
        refetch();
        return response;
      } else {
        notification.error({
          message: 'Error updating task',
          description: response.message,
        });
        return null;
      }
    } catch (error) {
      console.error('Error updating task:', error);
      notification.error({
        message: 'Error updating task',
        description: 'Something went wrong while updating the task',
      });
      return null;
    }
  };
  return {
    userChecklist,
    teamMembers,
    isLoadingUserChecklist,
    isLoadingTeamMembers,
    isUpdatingUserChecklist,
    isDeletingUserChecklist,
    isAddingDefaultChecklist,
    isCreatingTask,
    isUpdatingTask,
    isUploadingImage,
    handleAddDefaultChecklist,
    handleUpdateUserChecklist,
    handleDeleteUserChecklist,
    handleUploadImage,
    handleCreateTask,
    handleUpdateTask,
  };
};
