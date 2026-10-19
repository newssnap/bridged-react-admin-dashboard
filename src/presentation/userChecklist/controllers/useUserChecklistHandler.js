import { useState } from 'react';
import {
  useGetUserChecklistQuery,
  useGetTeamMembersQuery,
  useAddDefaultChecklistMutation,
  useUpdateUserChecklistMutation,
  useDeleteTaskMutation,
  useDeleteUserChecklistMutation,
  useUploadImageMutation,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useGetUserChecklistTaskCommentsQuery,
  useAddTaskCommentMutation,
} from '../../../services/api';
import { toast } from 'sonner';

// The server's own explanation when it sends one, otherwise our fallback copy.
const errorText = (source, fallback) =>
  source?.errorObject?.userErrorText || source?.data?.errorObject?.userErrorText || fallback;

export const useUserChecklistHandler = userId => {
  const {
    data: userChecklist,
    isLoading: isLoadingUserChecklist,
    isError: isUserChecklistError,
    isFetching: isFetchingUserChecklist,
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
  const [addTaskComment, { isLoading: isAddingTaskComment }] = useAddTaskCommentMutation();
  const [deleteTask, { isLoading: isDeletingTask }] = useDeleteTaskMutation();
  const [taskIdForComments, setTaskIdForComments] = useState(null);
  const {
    data: taskComments,
    isLoading: isLoadingTaskComments,
    refetch: refetchTaskComments,
  } = useGetUserChecklistTaskCommentsQuery(taskIdForComments, {
    skip: !taskIdForComments,
  });

  const handleGetTaskComments = taskId => {
    setTaskIdForComments(taskId);
  };

  const clearTaskComments = () => {
    setTaskIdForComments(null);
  };

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

  const handleUpdateUserChecklist = async (id, data, closeDrawer) => {
    try {
      const response = await updateUserChecklist({ id, data }).unwrap();
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

  const handleDeleteUserChecklist = async (id, closeDrawer) => {
    try {
      const response = await deleteUserChecklist(id).unwrap();
      if (response.success) {
        toast.success('Checklist deleted');
        closeDrawer();
      } else {
        toast.error(errorText(response, "Couldn't delete the checklist"));
      }
    } catch (error) {
      console.error('Error deleting default tasklist:', error);
      toast.error(errorText(error, "Couldn't delete the checklist"));
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
          _id: response?.data?._id,
          title: response?.data?.title,
          assignedUser: response?.data?.assignedUser,
          description: response?.data?.description,
          attachments: response?.data?.attachments,
          userEmail: response?.data?.userEmail,
          isCompleted: response?.data?.isCompleted,
          commentsCount: response?.data?.commentsCount,
          createdDate: response?.data?.createdDate,
          dueDate: response?.data?.dueDate,
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

  const handleAddTaskComment = async (taskId, comment, onSuccess) => {
    try {
      const response = await addTaskComment({ taskId, comment }).unwrap();
      if (response.success) {
        toast.success('Comment added');
        refetchTaskComments();
        if (onSuccess) onSuccess();
        return response;
      } else {
        toast.error(errorText(response, "Couldn't add the comment"));
        return null;
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(errorText(error, "Couldn't add the comment"));
      return null;
    }
  };

  const handleDeleteTask = async (taskId, onSuccess) => {
    try {
      const response = await deleteTask(taskId).unwrap();
      if (response.success) {
        toast.success('Task deleted');
        if (onSuccess) onSuccess();
        refetch();
        return response;
      } else {
        toast.error(errorText(response, "Couldn't delete the task"));
        return null;
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(errorText(error, "Couldn't delete the task"));
      return null;
    }
  };
  return {
    userChecklist,
    teamMembers,
    taskComments,
    isLoadingUserChecklist,
    isUserChecklistError,
    isFetchingUserChecklist,
    refetchUserChecklist: refetch,
    isLoadingTeamMembers,
    isLoadingTaskComments,
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
    handleGetTaskComments,
    clearTaskComments,
    handleAddTaskComment,
    isAddingTaskComment,
    isDeletingTask,
    handleDeleteTask,
  };
};
