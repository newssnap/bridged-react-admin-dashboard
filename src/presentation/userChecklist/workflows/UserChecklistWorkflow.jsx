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
  Divider,
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
import { useNavigate } from 'react-router-dom';
import ChecklistDrawer from '../../defaultChecklist/components/ChecklistDrawer';
import { message as messageComponent } from 'antd';
import formatDate from '../../../utils/formatting/formateDate';
import dayjs from 'dayjs';
const { Title } = Typography;
const { Search } = Input;

const UserChecklistWorkflow = UserDetails => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    userChecklist,
    teamMembers,
    taskComments,
    isLoadingUserChecklist,
    isLoadingTeamMembers,
    isLoadingTaskComments,
    isUpdatingUserChecklist,
    isDeletingUserChecklist,
    isAddingDefaultChecklist,
    isCreatingTask,
    isUpdatingTask,
    isUploadingImage,
    isAddingTaskComment,
    handleAddDefaultChecklist,
    handleUpdateUserChecklist,
    handleDeleteUserChecklist,
    handleUploadImage,
    handleCreateTask,
    handleUpdateTask,
    handleGetTaskComments,
    clearTaskComments,
    handleAddTaskComment,
    handleDeleteTask,
    isDeletingTask,
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
  const [isTaskInfoDrawerOpen, setIsTaskInfoDrawerOpen] = useState(false);
  const [selectedTaskInfo, setSelectedTaskInfo] = useState(null);
  const [newComment, setNewComment] = useState('');

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

  const handleTaskInfoDrawerOpen = task => {
    setSelectedTaskInfo(task);
    setIsTaskInfoDrawerOpen(true);
    // Call API to get task comments
    handleGetTaskComments(task._id);
  };

  const handleTaskInfoDrawerClose = () => {
    setIsTaskInfoDrawerOpen(false);
    setSelectedTaskInfo(null);
    setNewComment('');
    clearTaskComments();
  };

  const handleAddComment = async () => {
    if (newComment.trim() && selectedTaskInfo) {
      try {
        await handleAddTaskComment(selectedTaskInfo._id, newComment.trim(), () => {
          setNewComment('');
          // Refresh comments by calling the API again
          handleGetTaskComments(selectedTaskInfo._id);
        });
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
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

  const handleDeleteTaskButton = taskId => {
    const updatedTasks = selectedChecklist.tasks.filter(task => task._id !== taskId);
    handleDeleteTask(taskId, () => {
      // Update local state after successful deletion
      setSelectedChecklist({
        ...selectedChecklist,
        tasks: updatedTasks,
      });
    });
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
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Task Information">
            <Button
              type="text"
              icon={getIcon('InfoCircleOutlined')}
              shape="circle"
              onClick={() => handleTaskInfoDrawerOpen(record)}
            />
          </Tooltip>
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
              onConfirm={() => handleDeleteTaskButton(record._id)}
            >
              <Button
                type="text"
                icon={getIcon('DeleteOutlined')}
                shape="circle"
                danger
                loading={isDeletingTask}
              />
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
      align: 'center',
      width: 20,
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
      <Flex align="center" gap={'20px'} style={{ marginBottom: 'var(--mpr-3)' }}>
        <Icon
          name="ArrowRightOutlined"
          style={{ rotate: '180deg', marginTop: '2px', cursor: 'pointer' }}
          size="small"
          onClick={() => navigate(-1)}
        />
        <Title level={2} style={{ fontWeight: 300 }}>
          User Checklist
        </Title>
      </Flex>
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
        locale={{
          emptyText: searchText
            ? `No checklists found matching "${searchText}"`
            : 'No default checklists available',
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
        width={'70%'}
        onClose={handleTasksDrawerClose}
        open={isTasksDrawerOpen}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={handleTasksDrawerClose} style={{ width: '100px' }} size="large">
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
                <Button onClick={handleTaskFormDrawerClose} size="large">
                  Cancel
                </Button>
                <Button type="primary" onClick={() => taskForm.submit()} size="large">
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
              <Input placeholder="Enter task title" size="large" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please input the task description!' }]}
            >
              <Input.TextArea placeholder="Enter task description" rows={4} size="large" />
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
                <Button loading={isUploadingImage} icon={<UploadOutlined />}>
                  Upload Image
                </Button>
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
        {/* Task Information Drawer */}
        <Drawer
          title="Task Information"
          width={600}
          onClose={handleTaskInfoDrawerClose}
          open={isTaskInfoDrawerOpen}
          bodyStyle={{ paddingBottom: 80 }}
          footer={
            <div style={{ textAlign: 'right' }}>
              <Button onClick={handleTaskInfoDrawerClose} style={{ width: '100px' }} size="large">
                Close
              </Button>
            </div>
          }
        >
          {selectedTaskInfo && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Task Details */}
              <div>
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  <div>
                    <strong>Title:</strong>
                    <div style={{ marginTop: '4px' }}>{selectedTaskInfo.title}</div>
                  </div>
                  <div>
                    <strong>Description:</strong>
                    <div style={{ marginTop: '4px' }}>{selectedTaskInfo.description}</div>
                  </div>
                  <div>
                    <strong>Due Date:</strong>
                    <div style={{ marginTop: '4px' }}>
                      {selectedTaskInfo.dueDate
                        ? formatDate(selectedTaskInfo.dueDate)
                        : 'No due date'}
                    </div>
                  </div>
                  <div>
                    <strong>Assigned To:</strong>
                    <div style={{ marginTop: '4px' }}>
                      <Space>
                        <Avatar src={selectedTaskInfo.userAvatar} size={32}>
                          {selectedTaskInfo.userFullname
                            ? selectedTaskInfo.userFullname.charAt(0).toUpperCase()
                            : 'U'}
                        </Avatar>
                        <span>{selectedTaskInfo.userEmail}</span>
                      </Space>
                    </div>
                  </div>
                  <div>
                    <strong>Status:</strong>
                    <div style={{ marginTop: '4px' }}>
                      <Tag color={selectedTaskInfo.isCompleted ? 'green' : 'orange'}>
                        {selectedTaskInfo.isCompleted ? 'Completed' : 'Pending'}
                      </Tag>
                    </div>
                  </div>
                </Space>
              </div>

              <Divider />

              {/* Comments Section */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Title level={4} style={{ fontWeight: 300 }}>
                  Comments
                </Title>
                {isLoadingTaskComments ? (
                  <div>Loading comments...</div>
                ) : (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {taskComments?.data && taskComments.data.length > 0 ? (
                      taskComments.data.map(comment => (
                        <div
                          key={comment._id}
                          style={{
                            border: '1px solid #f0f0f0',
                            borderRadius: '8px',
                            padding: '16px',
                            marginBottom: '12px',
                            backgroundColor: '#fafafa',
                          }}
                        >
                          <Space align="center" style={{ width: '100%' }}>
                            <Avatar
                              src={comment.userAvatar}
                              size={40}
                              style={{ marginRight: '10px' }}
                            >
                              {comment.userFullName
                                ? comment.userFullName.charAt(0).toUpperCase()
                                : 'U'}
                            </Avatar>
                            <div style={{ flex: 1 }}>
                              <Space
                                align="center"
                                justify="space-between"
                                style={{ marginBottom: '8px', width: '100%' }}
                              >
                                <span style={{ fontWeight: '500', fontSize: '14px' }}>
                                  {comment.userFullName}
                                </span>
                                {comment.isAdmin && (
                                  <Tag color="blue" size="small">
                                    Admin
                                  </Tag>
                                )}
                              </Space>
                              <div
                                style={{
                                  fontSize: '14px',
                                  lineHeight: '1.5',
                                  color: '#333',
                                }}
                              >
                                {comment.comment}
                              </div>
                            </div>
                          </Space>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          textAlign: 'center',
                          color: '#999',
                          padding: '20px',
                          border: '1px dashed #d9d9d9',
                          borderRadius: '8px',
                          backgroundColor: '#fafafa',
                        }}
                      >
                        No comments yet
                      </div>
                    )}

                    {/* Add Comment Section */}
                    <Divider />
                    <div>
                      <Title level={5} style={{ fontWeight: 300 }}>
                        Add Comment
                      </Title>
                      <Space.Compact style={{ width: '100%', marginTop: '10px' }}>
                        <Input
                          placeholder="Write a comment..."
                          value={newComment}
                          onChange={e => setNewComment(e.target.value)}
                          onPressEnter={handleAddComment}
                          disabled={isAddingTaskComment}
                          size="large"
                        />
                        <Button
                          type="primary"
                          onClick={handleAddComment}
                          loading={isAddingTaskComment}
                          disabled={!newComment.trim() || isAddingTaskComment}
                        >
                          Add
                        </Button>
                      </Space.Compact>
                    </div>
                  </Space>
                )}
              </div>
            </Space>
          )}
        </Drawer>
      </Drawer>

      {/* Task Form Drawer */}
    </Space>
  );
};

export default UserChecklistWorkflow;
