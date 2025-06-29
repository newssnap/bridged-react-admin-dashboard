import React from 'react';
import { useState, useMemo } from 'react';
import { PRIMARY_COLOR } from '../../../constants/DashboardColors';
import {
  Space,
  Typography,
  Table,
  Button,
  Form,
  Input,
  Flex,
  message,
  Popconfirm,
  Tooltip,
} from 'antd';
import { useDefaultChecklistHandler } from '../controllers/useDefaultChecklistHandler';
import { CheckCircleOutlined } from '@ant-design/icons';
import { EditOutlined, DeleteOutlined, PlusOutlined, OrderedListOutlined } from '@ant-design/icons';
import { render } from '@testing-library/react';

// Import new drawer components
import ChecklistDrawer from '../components/ChecklistDrawer';
import TaskManagementDrawer from '../components/TaskManagementDrawer';
import TaskFormDrawer from '../components/TaskFormDrawer';

const { Title } = Typography;
const { Search } = Input;

const DefaultChecklistWorkflow = () => {
  const {
    defaultChecklists,
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
    handleCreateTask,
    isCreatingTask,
    handleDeleteTask,
    isDeletingTask,
    handleUpdateTask,
    isUpdatingTask,
  } = useDefaultChecklistHandler();
  const [form] = Form.useForm();
  const [taskForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // Task management states
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Task form drawer states
  const [isTaskFormDrawerOpen, setIsTaskFormDrawerOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleAddChecklist = () => {
    setIsEditing(false);
    setEditingRecord(null);
    form.resetFields();
    setIsDrawerOpen(true);
  };

  const handleEditChecklist = record => {
    setIsEditing(true);
    setEditingRecord(record);
    form.setFieldsValue({
      title: record.title,
    });
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setIsEditing(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleFormSubmit = async values => {
    try {
      if (isEditing) {
        // Handle edit logic here
        console.log('Editing checklist:', editingRecord.id, values);
        handleUpdateDefaultChecklist(
          editingRecord._id,
          { title: values.title, tasks: values.tasks, isDefault: true },
          handleDrawerClose
        );
      } else {
        // Handle add logic here
        console.log('Adding new checklist:', values);
        handleAddDefaultChecklist(
          { title: values.title, tasks: [], isDefault: true },
          handleDrawerClose
        );
      }
      refetch(); // Refresh the data
    } catch (error) {
      message.error('Something went wrong');
    }
  };

  const handleDeleteChecklist = id => {
    handleDeleteDefaultChecklist(id, handleDrawerClose);
  };

  // Task management handlers
  const handleOpenTaskDrawer = checklist => {
    setSelectedChecklist(checklist);
    setIsTaskDrawerOpen(true);
  };

  const handleCloseTaskDrawer = () => {
    setIsTaskDrawerOpen(false);
    setSelectedChecklist(null);
    setIsEditingTask(false);
    setEditingTask(null);
    taskForm.resetFields();
  };

  const handleAddTask = () => {
    setIsEditingTask(false);
    setEditingTask(null);
    setUploadedFiles([]);
    taskForm.resetFields();
    setIsTaskFormDrawerOpen(true);
  };

  const handleEditTask = task => {
    setIsEditingTask(true);
    setEditingTask(task);
    setUploadedFiles(task.attachments || []);
    taskForm.setFieldsValue({
      title: task.title,
      description: task.description,
    });
    setIsTaskFormDrawerOpen(true);
  };

  const handleCloseTaskFormDrawer = () => {
    setIsTaskFormDrawerOpen(false);
    setIsEditingTask(false);
    setEditingTask(null);
    setUploadedFiles([]);
    taskForm.resetFields();
  };

  const handleFileUpload = async file => {
    try {
      const uploadedFile = await handleUploadImage(file);
      if (uploadedFile) {
        setUploadedFiles(prev => [...prev, uploadedFile]);
        message.success('File uploaded successfully');
      }
    } catch (error) {
      message.error('Failed to upload file');
    }
  };

  const handleRemoveFile = fileToRemove => {
    setUploadedFiles(prev => prev.filter(file => file.url !== fileToRemove.url));
    message.success('File removed');
  };

  const handleDeleteTaskButton = taskId => {
    const updatedTasks = selectedChecklist.tasks.filter(task => task._id !== taskId);
    handleDeleteTask(taskId, () => {
      // Update local state
      setSelectedChecklist({
        ...selectedChecklist,
        tasks: updatedTasks,
      });
    });
  };

  const handleTaskFormSubmit = async values => {
    try {
      let updatedTasks = [...selectedChecklist.tasks];
      console.log('updatedTasks', updatedTasks);

      if (isEditingTask) {
        // Update existing task
        updatedTasks = updatedTasks.map(task =>
          task._id === editingTask._id
            ? {
                ...task,
                title: values.title,
                description: values.description,
                attachments: uploadedFiles,
              }
            : task
        );
        await handleUpdateTask(
          editingTask._id,
          {
            checklistId: selectedChecklist._id,
            title: values.title,
            description: values.description,
            attachments: uploadedFiles,
          },
          () => {
            setSelectedChecklist({
              ...selectedChecklist,
              tasks: updatedTasks,
            });
            handleCloseTaskFormDrawer();
          }
        );
      } else {
        await handleCreateTask(
          {
            title: values.title,
            description: values.description,
            attachments: uploadedFiles,
            isDefault: selectedChecklist.isDefault,
            checklistId: selectedChecklist._id,
          },
          updatedTasks,
          () => {
            setSelectedChecklist({
              ...selectedChecklist,
              tasks: updatedTasks,
            });
            handleCloseTaskFormDrawer();
          }
        );
      }
    } catch (error) {
      console.log('error', error);
      message.error('Something went wrong');
    }
  };

  // Task table columns
  const taskColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 300,
    },
    {
      title: 'Attachments',
      dataIndex: 'attachments',
      key: 'attachments',
      width: 150,
      render: attachments => <span>{attachments?.length || 0} files</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Task">
            <Button
              type="text"
              shape="circle"
              icon={<EditOutlined style={{ fontSize: '15px' }} />}
              onClick={() => handleEditTask(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this task?"
            onConfirm={() => handleDeleteTaskButton(record._id)}
          >
            <Tooltip title="Delete Task">
              <Button
                type="text"
                shape="circle"
                icon={<DeleteOutlined style={{ fontSize: '15px', color: 'red' }} />}
                loading={isDeletingTask}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'Tasks',
      dataIndex: 'tasks',
      key: 'tasks',
      width: 150,
      render: (_, record) => (
        <Space>{record.tasks.length > 0 ? record.tasks.length + ' tasks' : 'No tasks'}</Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 10,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Checklist Name">
            <Button
              type="text"
              shape="circle"
              icon={<EditOutlined style={{ fontSize: '15px' }} />}
              onClick={() => handleEditChecklist(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this checklist?"
            onConfirm={() => handleDeleteChecklist(record._id)}
          >
            <Tooltip title="Delete Checklist">
              <Button
                type="text"
                shape="circle"
                icon={<DeleteOutlined style={{ color: 'red', fontSize: '15px' }} />}
                loading={isDeletingDefaultChecklist}
              />
            </Tooltip>
          </Popconfirm>
          <Tooltip title="Manage Tasks">
            <Button
              type="text"
              shape="circle"
              icon={<OrderedListOutlined style={{ color: PRIMARY_COLOR, fontSize: '15px' }} />}
              onClick={() => handleOpenTaskDrawer(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  const filteredChecklists = useMemo(() => {
    if (!searchText) return defaultChecklists;
    return defaultChecklists.filter(checklist =>
      checklist.title.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [defaultChecklists, searchText]);
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>Default Checklists</Title>
      <Flex justify="space-between" align="center" style={{ width: '100%' }}>
        <Button size="large" type="primary" style={{ width: '150px' }} onClick={handleAddChecklist}>
          <PlusOutlined />
          Add Checklist
        </Button>
        <Search
          placeholder="Search by title"
          allowClear
          size="large"
          onChange={e => setSearchText(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </Flex>
      <Table dataSource={filteredChecklists} loading={isLoading} columns={columns} bordered />

      {/* Checklist Drawer Component */}
      <ChecklistDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        isEditing={isEditing}
        form={form}
        onSubmit={handleFormSubmit}
        isLoading={isAddingDefaultChecklist || isUpdatingDefaultChecklist}
      />

      {/* Task Management Drawer Component */}
      <TaskManagementDrawer
        isOpen={isTaskDrawerOpen}
        onClose={handleCloseTaskDrawer}
        selectedChecklist={selectedChecklist}
        taskColumns={taskColumns}
        isLoading={isLoading}
        onAddTask={handleAddTask}
      />

      {/* Task Form Drawer Component */}
      <TaskFormDrawer
        isOpen={isTaskFormDrawerOpen}
        onClose={handleCloseTaskFormDrawer}
        isEditing={isEditingTask}
        form={taskForm}
        onSubmit={handleTaskFormSubmit}
        isLoading={isCreatingTask || isUpdatingTask}
        isUploadingImage={isUploadingImage}
        onFileUpload={handleFileUpload}
        uploadedFiles={uploadedFiles}
        onRemoveFile={handleRemoveFile}
      />
    </Space>
  );
};

export default DefaultChecklistWorkflow;
