import {
  useGetDefaultChecklistQuery,
  useAddDefaultChecklistMutation,
  useDeleteDefaultChecklistMutation,
  useUpdateDefaultChecklistMutation,
  useUploadImageMutation,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} from '../../../services/api';
import { notification } from 'antd';
import { useState } from 'react';

export const useDefaultChecklistHandler = () => {
  const [deletingChecklistId, setDeletingChecklistId] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  const {
    data: defaultChecklists,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetDefaultChecklistQuery();
  const [addDefaultChecklist, { isLoading: isAddingDefaultChecklist }] =
    useAddDefaultChecklistMutation();
  const [deleteDefaultChecklist, { isLoading: isDeletingDefaultChecklist }] =
    useDeleteDefaultChecklistMutation();
  const [updateDefaultChecklist, { isLoading: isUpdatingDefaultChecklist }] =
    useUpdateDefaultChecklistMutation();
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadImageMutation();
  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation();
  const [deleteTask, { isLoading: isDeletingTask }] = useDeleteTaskMutation();
  const [updateTask, { isLoading: isUpdatingTask }] = useUpdateTaskMutation();

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

  const handleDeleteDefaultChecklist = async (id, closeDrawer) => {
    try {
      setDeletingChecklistId(id);
      const response = await deleteDefaultChecklist(id).unwrap();
      if (response.success) {
        notification.success({
          message: 'Default checklist deleted successfully',
          description: response.message,
        });
        if (closeDrawer) closeDrawer();
      }
    } catch (error) {
      console.error('Error deleting default checklist:', error);
    } finally {
      setDeletingChecklistId(null);
    }
  };

  const handleUpdateDefaultChecklist = async (id, data, closeDrawer) => {
    try {
      const response = await updateDefaultChecklist({ id, data }).unwrap();
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
          _id: response?.data?._id, // Temporary ID
          title: response?.data?.title,
          description: response?.data?.description,
          attachments: response?.data?.attachments,
          isCompleted: response?.data?.isCompleted,
          commentsCount: response?.data?.commentsCount,
          createdDate: response?.data?.createdDate,
        };
        updatedTasks.push(newTask);
        if (onSuccess) onSuccess(); // <- This was missing
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

  const handleDeleteTask = async (id, onSuccess) => {
    try {
      setDeletingTaskId(id);
      const response = await deleteTask(id).unwrap();
      if (response.success) {
        notification.success({
          message: 'Task deleted successfully',
          description: response.message,
        });
        if (onSuccess) onSuccess();
        refetch();
        return response;
      } else {
        notification.error({
          message: 'Error deleting task',
          description: response.message,
        });
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      notification.error({
        message: 'Error deleting task',
        description: 'Something went wrong while deleting the task',
      });
      return null;
    } finally {
      setDeletingTaskId(null);
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
    defaultChecklists: defaultChecklists?.data || [],
    isLoading,
    error,
    refetch,
    isFetching,
    handleAddDefaultChecklist,
    isAddingDefaultChecklist,
    handleDeleteDefaultChecklist,
    isDeletingDefaultChecklist,
    deletingChecklistId,
    handleUpdateDefaultChecklist,
    isUpdatingDefaultChecklist,
    handleUploadImage,
    isUploadingImage,
    handleCreateTask,
    isCreatingTask,
    handleDeleteTask,
    isDeletingTask,
    deletingTaskId,
    handleUpdateTask,
    isUpdatingTask,
  };
};
