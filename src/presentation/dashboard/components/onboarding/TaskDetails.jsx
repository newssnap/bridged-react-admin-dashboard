import {
  Avatar,
  Button,
  Checkbox,
  Col,
  Drawer,
  Dropdown,
  Empty,
  Flex,
  Input,
  Modal,
  notification,
  Row,
  Skeleton,
  Tag,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import {
  CloseOutlined,
  LoadingOutlined,
  RocketTwoTone,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons';
import Title from 'antd/es/typography/Title';
import formatDate from '../../../../utils/formatting/formateDate';
import Icon from '../../../../utils/components/Icon';
import {
  useCreateTaskCommentMutation,
  useDeleteTaskCommentMutation,
  useGetTaskCommentsQuery,
  useUpdateTaskCommentMutation,
} from '../../../../services/api';
import { skipToken } from '@reduxjs/toolkit/query';
import moment from 'moment';
import { useEffect, useState } from 'react';
const { Text } = Typography;

function TaskDetails({
  isDrawerOpen,
  setIsDrawerOpen,
  data,
  handleUpdateTask,
  isHandleUpdateTaskLoading,
}) {
  const fullName = data?.userFullname?.trim();

  const {
    token: { colorBgLayout },
  } = theme.useToken();

  const [comment, setComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const { data: taskComments, isLoading: isTaskCommentsLoading } = useGetTaskCommentsQuery(
    data?._id && isDrawerOpen ? data?._id : skipToken
  );

  const [_ADD_COMMENT, { isLoading: isAddCommentLoading }] = useCreateTaskCommentMutation();

  const handleAddComment = async () => {
    if (!comment) {
      notification.error({
        message: 'Please enter a comment',
        placement: 'bottomRight',
        showProgress: true,
      });
      return;
    }

    const response = await _ADD_COMMENT({
      taskId: data?._id,
      comment,
    });

    if (response?.data?.success) {
      setComment('');
    }

    if (response?.error) {
      notification.error({
        message: response?.error?.data?.errorObject?.userErrorText,
        placement: 'bottomRight',
        showProgress: true,
      });
    }
  };

  const [_UPDATE_TASK_COMMENT, { isLoading: isUpdateTaskCommentLoading }] =
    useUpdateTaskCommentMutation();

  const [_DELETE_TASK_COMMENT, { isLoading: isDeleteTaskCommentLoading }] =
    useDeleteTaskCommentMutation();

  const handleUpdateComment = async commentId => {
    if (!editCommentText) {
      notification.error({
        message: 'Please enter a comment',
        placement: 'bottomRight',
        showProgress: true,
      });
      return;
    }

    const response = await _UPDATE_TASK_COMMENT({
      taskId: data?._id,
      commentId,
      comment: editCommentText,
    });

    if (response?.data?.success) {
      setEditingComment(null);
      setEditCommentText('');
      notification.success({
        message: 'Comment updated successfully',
        placement: 'bottomRight',
        showProgress: true,
      });
    }

    if (response?.error) {
      notification.error({
        message: response?.error?.data?.errorObject?.userErrorText,
        placement: 'bottomRight',
        showProgress: true,
      });
    }
  };

  const handleDeleteComment = async commentId => {
    const response = await _DELETE_TASK_COMMENT(commentId);

    if (response?.data?.success) {
      setDeleteModalOpen(false);
      setCommentToDelete(null);
      notification.success({
        message: 'Comment deleted successfully',
        placement: 'bottomRight',
        showProgress: true,
      });
    }

    if (response?.error) {
      notification.error({
        message: response?.error?.data?.errorObject?.userErrorText,
        placement: 'bottomRight',
        showProgress: true,
      });
    }
  };

  useEffect(() => {
    if (isDrawerOpen) {
      setComment('');
      setEditingComment(null);
      setEditCommentText('');
      setDeleteModalOpen(false);
      setCommentToDelete(null);
    }
  }, [isDrawerOpen]);

  return (
    <>
      <Drawer
        title={data?.title}
        onClose={() => {
          setIsDrawerOpen(false);
        }}
        closeIcon
        open={isDrawerOpen}
        width={600}
        extra={
          <Tag
            color={data?.isCompleted ? 'success' : 'error'}
            style={{
              margin: 0,
              padding: '4px 12px',
              borderRadius: '6px',
              fontWeight: 500,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                opacity: 0.8,
              },
            }}
            className="taskDrawerTag"
            onClick={() => handleUpdateTask(data?._id, !data?.isCompleted)}
          >
            {isHandleUpdateTaskLoading ? (
              <LoadingOutlined style={{ fontSize: 16 }} />
            ) : (
              <Checkbox
                checked={data?.isCompleted}
                onChange={() => handleUpdateTask(data?._id, !data?.isCompleted)}
              />
            )}
            {data?.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          </Tag>
        }
        footer={
          <Row style={{ padding: 'var(--mpr-2)', width: '100%', position: 'relative' }}>
            <Input.TextArea
              placeholder="Add a comment"
              style={{ width: '100%' }}
              autoSize={{ minRows: 4, maxRows: 4 }}
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
            <Button
              type="primary"
              style={{ position: 'absolute', right: 24, bottom: 24, opacity: 1 }}
              onClick={() => handleAddComment()}
              loading={isAddCommentLoading}
            >
              Comment
            </Button>
          </Row>
        }
      >
        <Row style={{ width: '100%' }} gutter={[20, 20]}>
          <Col span={24}>
            <Flex vertical gap={15}>
              <Flex gap={10} align="center">
                <Title level={4} className="lightTitle" style={{ width: '100px' }}>
                  Assignee
                </Title>
                <Button
                  style={{
                    backgroundColor: colorBgLayout,
                    cursor: 'not-allowed',
                    width: '150px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 500,
                  }}
                  type="text"
                >
                  {fullName || data?.userEmail?.split('@')[0]}
                  <CloseOutlined style={{ opacity: 0.8 }} />
                </Button>
              </Flex>
              <Flex gap={10} align="center">
                <Title level={4} className="lightTitle" style={{ width: '100px' }}>
                  Due Date
                </Title>
                <Button
                  style={{
                    backgroundColor: colorBgLayout,
                    cursor: 'not-allowed',
                    width: '150px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 500,
                  }}
                  type="text"
                >
                  {formatDate(data?.dueDate)}
                  <CloseOutlined style={{ opacity: 0.8 }} />
                </Button>
              </Flex>

              <Flex gap={15} align="flex-start" vertical>
                <Title level={4} className="lightTitle">
                  Description
                </Title>

                <Input.TextArea
                  value={data?.description}
                  autoSize={{ minRows: 10, maxRows: 10 }}
                  placeholder="No description added"
                  style={{ borderRadius: '6px' }}
                  readOnly
                />
              </Flex>
            </Flex>
          </Col>

          <Col span={24}>
            <Flex gap={15} vertical>
              <Title level={4} className="lightTitle">
                Attachments
              </Title>
              <Flex gap={10} align="center">
                {data?.attachments?.length === 0 ? (
                  <Row justify="center" align="center" style={{ width: '100%' }}>
                    <Empty description="No attachments yet." />
                  </Row>
                ) : (
                  data?.attachments?.map(attachment => (
                    <Tooltip title="View attachment">
                      <Button
                        style={{
                          backgroundColor: colorBgLayout,
                          width: '150px',
                          display: 'flex',
                          justifyContent: 'flex-start',
                          fontWeight: 500,
                          overflow: 'hidden',
                          padding: '0 8px',
                        }}
                        type="text"
                        onClick={() => {
                          window.open(attachment?.url, '_blank');
                        }}
                      >
                        <Flex gap={10} align="center" style={{ width: '100%', overflow: 'hidden' }}>
                          <Icon
                            name="LinkOutlined2"
                            style={{ width: 13, height: 13, flexShrink: 0 }}
                          />
                          <Text
                            className="singleLine"
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flex: 1,
                            }}
                          >
                            {attachment?.fileName}
                          </Text>
                        </Flex>
                      </Button>
                    </Tooltip>
                  ))
                )}
              </Flex>
            </Flex>
          </Col>

          <Col span={24}>
            <Flex gap={15} vertical>
              <Title level={4} className="lightTitle">
                Comments
              </Title>
              <Row gutter={[15, 15]}>
                {isTaskCommentsLoading ? (
                  <>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Col span={24} key={index}>
                        <Skeleton.Button block active style={{ height: 70 }} />
                      </Col>
                    ))}
                  </>
                ) : taskComments?.data?.length === 0 ? (
                  <Col span={24}>
                    <Empty description="No comments yet." />
                  </Col>
                ) : (
                  taskComments?.data?.map(comment => (
                    <Col span={24} key={comment._id}>
                      <Flex
                        gap={10}
                        style={{
                          padding: 'var(--mpr-2)',
                          backgroundColor: colorBgLayout,
                          borderRadius: 'var(--mpr-3)',
                        }}
                      >
                        <Avatar
                          src={
                            comment?.isAdmin
                              ? 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
                              : null
                          }
                          alt={comment?.userFullName}
                          size={40}
                          icon={comment?.userFullName ? null : <UserOutlined />}
                          style={{
                            flexShrink: 0,
                            backgroundColor: comment?.userFullName ? '#0fb981' : undefined,
                          }}
                        >
                          {comment?.userFullName?.charAt(0)}
                        </Avatar>
                        <Flex vertical style={{ flex: 1 }}>
                          <Flex justify="space-between" align="center">
                            <Flex gap={6} align="center">
                              <Text strong>{comment?.userFullName || comment?.userEmail}</Text>
                              {comment?.isAdmin && (
                                <Tag color="blue" style={{ margin: 0 }}>
                                  Admin
                                </Tag>
                              )}
                            </Flex>
                            <Flex gap={8} align="center">
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {moment(comment?.createdDate).fromNow()}
                              </Text>
                              <Dropdown
                                menu={{
                                  items: [
                                    {
                                      key: 'edit',
                                      label: 'Edit',
                                      onClick: () => {
                                        setEditingComment(comment._id);
                                        setEditCommentText(comment.comment);
                                      },
                                    },
                                    {
                                      key: 'delete',
                                      label: <Text type="danger">Delete</Text>,
                                      onClick: () => {
                                        setCommentToDelete(comment._id);
                                        setDeleteModalOpen(true);
                                      },
                                    },
                                  ],
                                }}
                                trigger={['click']}
                                placement="bottomRight"
                              >
                                <Button
                                  type="text"
                                  icon={<MoreOutlined />}
                                  style={{ padding: '4px' }}
                                  shape="circle"
                                />
                              </Dropdown>
                            </Flex>
                          </Flex>
                          {editingComment === comment._id ? (
                            <Flex vertical gap={8} style={{ marginTop: '8px' }}>
                              <Input.TextArea
                                value={editCommentText}
                                onChange={e => setEditCommentText(e.target.value)}
                                autoSize={{ minRows: 2, maxRows: 4 }}
                                style={{ borderRadius: '6px' }}
                              />
                              <Flex gap={8} justify="flex-end">
                                <Button
                                  onClick={() => {
                                    setEditingComment(null);
                                    setEditCommentText('');
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="primary"
                                  onClick={() => handleUpdateComment(comment._id)}
                                  loading={isUpdateTaskCommentLoading}
                                >
                                  Update
                                </Button>
                              </Flex>
                            </Flex>
                          ) : (
                            <Text style={{ marginTop: '4px' }}>{comment?.comment}</Text>
                          )}
                        </Flex>
                      </Flex>
                    </Col>
                  ))
                )}
              </Row>
            </Flex>
          </Col>
        </Row>
      </Drawer>

      <Modal
        title="Delete Comment"
        open={deleteModalOpen}
        onOk={() => handleDeleteComment(commentToDelete)}
        onCancel={() => {
          setDeleteModalOpen(false);
          setCommentToDelete(null);
        }}
        centered
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          loading: isDeleteTaskCommentLoading,
        }}
        icon={<ExclamationCircleFilled style={{ color: '#ff4d4f' }} />}
      >
        <p>Are you sure you want to delete this comment? This action cannot be undone.</p>
      </Modal>
    </>
  );
}

export default TaskDetails;
