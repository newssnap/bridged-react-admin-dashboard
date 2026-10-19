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
import { useState } from 'react';
import { toast } from 'sonner';

// The server's own explanation when it sends one, otherwise our fallback copy.
const errorText = (source, fallback) =>
  source?.errorObject?.userErrorText || source?.data?.errorObject?.userErrorText || fallback;

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
        toast.success('Checklist added');
        closeDrawer();
      } else {
        toast.error(errorText(response, "Couldn't add the checklist"));
        closeDrawer();
      }
    } catch (error) {
      console.error('Error adding default tasklist:', error);
      toast.error(errorText(error, "Couldn't add the checklist"));
    }
  };

  const handleDeleteDefaultChecklist = async (id, closeDrawer) => {
    try {
      setDeletingChecklistId(id);
      const response = await deleteDefaultChecklist(id).unwrap();
      if (response.success) {
        toast.success('Checklist deleted');
        if (closeDrawer) closeDrawer();
      } else {
        toast.error(errorText(response, "Couldn't delete the checklist"));
      }
    } catch (error) {
      console.error('Error deleting default tasklist:', error);
      toast.error(errorText(error, "Couldn't delete the checklist"));
    } finally {
      setDeletingChecklistId(null);
    }
  };

  const handleUpdateDefaultChecklist = async (id, data, closeDrawer) => {
    try {
      const response = await updateDefaultChecklist({ id, data }).unwrap();
      if (response.success) {
        toast.success('Checklist renamed');
        closeDrawer();
      } else {
        toast.error(errorText(response, "Couldn't rename the checklist"));
      }
    } catch (error) {
      console.error('Error updating default tasklist:', error);
      toast.error(errorText(error, "Couldn't rename the checklist"));
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
        toast.error(errorText(response, "Couldn't upload the image"));
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(errorText(error, "Couldn't upload the image"));
      return null;
    }
  };

  const handleCreateTask = async (data, updatedTasks, onSuccess) => {
    try {
      const response = await createTask(data).unwrap();
      if (response.success) {
        toast.success('Task added');
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
        if (onSuccess) onSuccess();
        refetch();
        return response;
      } else {
        toast.error(errorText(response, "Couldn't add the task"));
        return null;
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(errorText(error, "Couldn't add the task"));
      return null;
    }
  };

  const handleDeleteTask = async (id, onSuccess) => {
    try {
      setDeletingTaskId(id);
      const response = await deleteTask(id).unwrap();
      if (response.success) {
        toast.success('Task deleted');
        if (onSuccess) onSuccess();
        refetch();
        return response;
      } else {
        toast.error(errorText(response, "Couldn't delete the task"));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(errorText(error, "Couldn't delete the task"));
      return null;
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleUpdateTask = async (id, data, onSuccess) => {
    try {
      const response = await updateTask({ id, data }).unwrap();
      if (response.success) {
        toast.success('Task updated');
        if (onSuccess) onSuccess();
        refetch();
        return response;
      } else {
        toast.error(errorText(response, "Couldn't update the task"));
        return null;
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error(errorText(error, "Couldn't update the task"));
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
