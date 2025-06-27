import {
  useGetDefaultChecklistQuery,
  useAddDefaultChecklistMutation,
  useDeleteDefaultChecklistMutation,
  useUpdateDefaultChecklistMutation,
  useUploadImageMutation,
  useUpdateTaskMutation,
} from '../../../services/api';
import { notification } from 'antd';
export const useDefaultChecklistHandler = () => {
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
      const response = await deleteDefaultChecklist(id).unwrap();
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

  const handleUpdateTask = async (id, data) => {
    try {
      const response = await updateTask({ checklistId: id, data }).unwrap();
    } catch (error) {
      console.error('Error updating task:', error);
      notification.error({
        message: 'Error updating task',
        description: 'Something went wrong while updating the task',
      });
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
    handleUpdateDefaultChecklist,
    isUpdatingDefaultChecklist,
    handleUploadImage,
    isUploadingImage,
    handleUpdateTask,
    isUpdatingTask,
  };
};
