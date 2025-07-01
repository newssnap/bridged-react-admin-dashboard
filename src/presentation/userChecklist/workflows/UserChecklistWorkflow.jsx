import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useUserChecklistHandler } from '../controllers/useUserChecklistHandler';
import {
  Table,
  Tag,
  Button,
  Tooltip,
  Flex,
  Input,
  Form,
  Popconfirm,
  Drawer,
  Space,
  Typography,
  Avatar,
  DatePicker,
  Select,
  Checkbox,
  Upload,
  List,
} from 'antd';
import { Space as SpaceComponent, Typography as TypographyComponent, Image } from 'antd';
import Icon from '../../../utils/components/Icon';
import {
  PlusOutlined,
  FileOutlined,
  UploadOutlined,
  DeleteOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import ChecklistDrawer from '../../defaultChecklist/components/ChecklistDrawer';
import { message as messageComponent } from 'antd';
import formatDate from '../../../utils/formatting/formateDate';
import dayjs from 'dayjs';
const { Title } = Typography;
const { Search } = Input;

const UserChecklistWorkflow = UserDetails => {
  const { id } = useParams();
  const {
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
  } = useUserChecklistHandler(id);
  const [searchText, setSearchText] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isTasksDrawerOpen, setIsTasksDrawerOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [isTaskFormDrawerOpen, setIsTaskFormDrawerOpen] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskAttachments, setTaskAttachments] = useState([]);
  const [form] = Form.useForm();
  const [taskForm] = Form.useForm();

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleTasksDrawerOpen = checklist => {
    setSelectedChecklist(checklist);
    setIsTasksDrawerOpen(true);
  };

  const handleTasksDrawerClose = () => {
    setIsTasksDrawerOpen(false);
    setSelectedChecklist(null);
  };

  const handleTaskFormDrawerOpen = (task = null) => {
    if (task) {
      setIsEditingTask(true);
      setEditingTask(task);
      setTaskAttachments(task.attachments || []);
      taskForm.setFieldsValue({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate ? dayjs(task.dueDate) : null,
        assignedUser: task.assignedUser,
        isCompleted: task.isCompleted,
      });
    } else {
      setIsEditingTask(false);
      setEditingTask(null);
      setTaskAttachments([]);
      taskForm.resetFields();
    }
    setIsTaskFormDrawerOpen(true);
  };

  const handleTaskFormDrawerClose = () => {
    setIsTaskFormDrawerOpen(false);
    setIsEditingTask(false);
    setEditingTask(null);
    setTaskAttachments([]);
    taskForm.resetFields();
  };

  const handleTaskFormSubmit = async values => {
    try {
      const taskData = {
        title: values.title,
        description: values.description,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
        checklistId: selectedChecklist._id,
        assignedUser: values.assignedUser,
        attachments: taskAttachments,
        isCompleted: values.isCompleted || false,
      };
      let updatedTasks = [...selectedChecklist.tasks];
      if (isEditingTask) {
        console.log('Updating task:', editingTask._id, taskData);
        // Add your update task logic here
        updatedTasks = updatedTasks.map(task =>
          task._id === editingTask._id
            ? {
                ...task,
                title: values.title,
                description: values.description,
                attachments: taskAttachments,
                isCompleted: values.isCompleted || false,
              }
            : task
        );
        await handleUpdateTask(
          editingTask._id,
          {
            checklistId: selectedChecklist._id,
            title: values.title,
            description: values.description,
            attachments: taskAttachments,
            isCompleted: values.isCompleted || false,
          },
          () => {
            setSelectedChecklist({
              ...selectedChecklist,
              tasks: updatedTasks,
            });
            handleTaskFormDrawerClose();
          }
        );
      } else {
        console.log('Creating new task:', taskData);
        // Add your create task logic here
        handleCreateTask(taskData, updatedTasks, () => {
          setSelectedChecklist({
            ...selectedChecklist,
            tasks: updatedTasks,
          });
          handleTaskFormDrawerClose();
        });
        messageComponent.success('Task created successfully');
        handleTaskFormDrawerClose();
      }
    } catch (error) {
      messageComponent.error('Something went wrong');
    }
  };

  // const handleFileUpload = (info) => {
  //   if (info.file.status === 'done') {
  //     const newAttachment = {
  //       url: info.file.response.url, // Assuming API returns file URL
  //       type: info.file.type,
  //       fileName: info.file.name,
  //     };
  //     setTaskAttachments([...taskAttachments, newAttachment]);
  //     messageComponent.success(`${info.file.name} uploaded successfully`);
  //   } else if (info.file.status === 'error') {
  //     messageComponent.error(`${info.file.name} upload failed`);
  //   }
  // };

  const handleRemoveAttachment = file => {
    const newAttachments = taskAttachments.filter(attachment => attachment.url !== file.url);
    setTaskAttachments(newAttachments);
  };

  const handleFormSubmit = async values => {
    try {
      if (isEditing) {
        // Handle edit logic here
        console.log('Editing checklist:', editingRecord.id, values);
        handleUpdateUserChecklist(
          editingRecord._id,
          { title: values.title, isDefault: false, assignedUser: id },
          handleDrawerClose
        );
      } else {
        // Handle add logic here
        console.log('Adding new checklist:', values);
        handleAddDefaultChecklist(
          { title: values.title, tasks: [], isDefault: false, assignedUser: id },
          handleDrawerClose
        );
      }
    } catch (error) {
      messageComponent.error('Something went wrong');
    }
  };
  const handleEditChecklist = record => {
    setIsEditing(true);
    setEditingRecord(record);
    form.setFieldsValue({
      title: record.title,
    });
    setIsDrawerOpen(true);
  };

  const handleDeleteChecklist = id => {
    handleDeleteUserChecklist(id, handleDrawerClose);
  };

  const handleFileUpload = async file => {
    try {
      const uploadedFile = await handleUploadImage(file);
      if (uploadedFile) {
        setTaskAttachments(prev => [...prev, uploadedFile]);
        messageComponent.success('File uploaded successfully');
      }
    } catch (error) {
      messageComponent.error('Failed to upload file');
    }
  };
  useEffect(() => {
    console.log(userChecklist);
  }, [userChecklist]);

  const getIcon = name => <Icon name={name} size={20} />;

  // Tasks table columns
  const taskColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: title => <span style={{ fontSize: '14px', fontWeight: '500' }}>{title}</span>,
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      align: 'center',
      render: dueDate => (
        <span style={{ fontSize: '14px' }}>{dueDate ? formatDate(dueDate) : 'No due date'}</span>
      ),
    },
    {
      title: 'Assigned To',
      dataIndex: 'userEmail',
      key: 'userEmail',
      render: (userEmail, record) => (
        <Space>
          <Avatar src={record.userAvatar} size={32}>
            {record.userFullname ? record.userFullname.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <span style={{ fontSize: '14px' }}>{userEmail}</span>
        </Space>
      ),
    },
    {
      title: 'Attachments',
      dataIndex: 'attachments',
      key: 'attachments',
      align: 'center',
      render: attachments => (
        <Space align="center" size={10}>
          <span style={{ fontSize: '14px', marginBottom: '2px' }}>
            {attachments?.length || 0} files
          </span>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isCompleted',
      key: 'isCompleted',
      render: isCompleted => (
        <Tag color={isCompleted ? 'green' : 'orange'}>{isCompleted ? 'Completed' : 'Pending'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Task">
            <Button
              type="text"
              icon={getIcon('EditOutlined')}
              shape="circle"
              onClick={() => handleTaskFormDrawerOpen(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Task">
            <Popconfirm
              title="Are you sure you want to delete this task?"
              onConfirm={() => console.log('Delete task:', record._id)}
            >
              <Button type="text" icon={getIcon('DeleteOutlined')} shape="circle" danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredChecklists = useMemo(() => {
    if (!searchText) return userChecklist?.data;
    return userChecklist?.data.filter(checklist =>
      checklist.title.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [userChecklist?.data, searchText]);
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Tasks',
      dataIndex: 'tasks',
      key: 'tasks',
      render: (_, record) => {
        return (
          <Space>
            <Tag>{record.tasks.length + ' Tasks'}</Tag>
          </Space>
        );
      },
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (_, record) => {
        const assignedUser = teamMembers?.data?.find(member => member._id === record.assignedUser);
        return assignedUser ? assignedUser.email : 'Unknown User';
      },
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      render: (_, record) => {
        return (
          <Space>
            <Tooltip title="View Tasks">
              <Button
                type="text"
                icon={getIcon('Tasks')}
                shape="circle"
                onClick={() => handleTasksDrawerOpen(record)}
              />
            </Tooltip>
            <Tooltip title="Delete Checklist">
              <Popconfirm
                title="Are you sure you want to delete this checklist?"
                onConfirm={() => handleDeleteChecklist(record._id)}
              >
                <Button
                  type="text"
                  icon={getIcon('DeleteOutlined')}
                  shape="circle"
                  danger
                  loading={isDeletingUserChecklist}
                />
              </Popconfirm>
            </Tooltip>
            <Tooltip title="Edit Checklist">
              <Button
                type="text"
                icon={getIcon('EditOutlined')}
                shape="circle"
                onClick={() => handleEditChecklist(record)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>User Checklist</Title>
      <Flex justify="space-between" align="center" style={{ width: '100%' }}>
        <Button size="large" type="primary" style={{ width: '150px' }} onClick={handleDrawerOpen}>
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
      <Table
        dataSource={filteredChecklists}
        columns={columns}
        loading={isLoadingUserChecklist}
        bordered
        pagination={{
          position: ['bottomLeft'],
          showSizeChanger: false,
          showQuickJumper: false,
        }}
      />
      <ChecklistDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        isEditing={isEditing}
        form={form}
        onSubmit={handleFormSubmit}
        isLoading={isUpdatingUserChecklist || isAddingDefaultChecklist}
      />

      {/* Tasks Drawer */}
      <Drawer
        title={`Tasks - ${selectedChecklist?.title || ''}`}
        width={800}
        onClose={handleTasksDrawerClose}
        open={isTasksDrawerOpen}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={handleTasksDrawerClose} style={{ width: '100px' }}>
              Close
            </Button>
          </div>
        }
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => handleTaskFormDrawerOpen()}
        >
          Create New Task
        </Button>
        <Table
          columns={taskColumns}
          dataSource={selectedChecklist?.tasks || []}
          rowKey="_id"
          pagination={{
            position: ['bottomLeft'],
            showSizeChanger: false,
            showQuickJumper: false,
          }}
          scroll={{ x: 700 }}
        />
        <Drawer
          title={isEditingTask ? 'Edit Task' : 'Create New Task'}
          width={600}
          onClose={handleTaskFormDrawerClose}
          open={isTaskFormDrawerOpen}
          bodyStyle={{ paddingBottom: 80 }}
          footer={
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={handleTaskFormDrawerClose}>Cancel</Button>
                <Button type="primary" onClick={() => taskForm.submit()}>
                  {isEditingTask ? 'Update Task' : 'Create Task'}
                </Button>
              </Space>
            </div>
          }
        >
          <Form form={taskForm} layout="vertical" onFinish={handleTaskFormSubmit}>
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please input the task title!' }]}
            >
              <Input placeholder="Enter task title" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please input the task description!' }]}
            >
              <Input.TextArea placeholder="Enter task description" rows={4} />
            </Form.Item>

            <Form.Item name="dueDate" label="Due Date">
              <DatePicker
                style={{ width: '100%' }}
                placeholder="Select due date"
                showTime={false}
              />
            </Form.Item>

            <Form.Item
              name="assignedUser"
              label="Assign To"
              rules={[{ required: true, message: 'Please select an assigned user!' }]}
            >
              <Select
                placeholder="Select a team member"
                options={
                  teamMembers?.data?.map(member => ({
                    label: member.email,
                    value: member._id,
                  })) || []
                }
              />
            </Form.Item>

            <Form.Item name="isCompleted" valuePropName="checked">
              <Checkbox>Mark as completed</Checkbox>
            </Form.Item>

            <Form.Item label="Attachments">
              <Upload
                name="file"
                action="/api/upload" // Replace with your upload endpoint
                beforeUpload={file => {
                  handleFileUpload(file);
                  return false; // Prevent default upload behavior
                }}
                // onChange={handleFileUpload}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>Upload File</Button>
              </Upload>
            </Form.Item>

            {taskAttachments.length > 0 && (
              <Form.Item label="Uploaded Files">
                <List
                  size="small"
                  dataSource={taskAttachments}
                  renderItem={file => (
                    <List.Item
                      actions={[
                        <Button
                          type="text"
                          icon={<CloseOutlined />}
                          onClick={() => handleRemoveAttachment(file)}
                          danger
                        />,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Image
                            src={file.url}
                            alt={file.fileName}
                            width={40}
                            height={40}
                            style={{ objectFit: 'cover' }}
                          />
                        }
                        title={file.fileName}
                        description={`Type: ${file.type}`}
                      />
                    </List.Item>
                  )}
                />
              </Form.Item>
            )}
          </Form>
        </Drawer>
      </Drawer>

      {/* Task Form Drawer */}
    </Space>
  );
};

export default UserChecklistWorkflow;
