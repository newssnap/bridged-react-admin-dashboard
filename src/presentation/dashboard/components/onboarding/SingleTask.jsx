import {
  Avatar,
  Checkbox,
  Col,
  Collapse,
  Flex,
  notification,
  Progress,
  Row,
  Space,
  Typography,
} from 'antd';
import Icon from '../../../../utils/components/Icon';
import formatDate from '../../../../utils/formatting/formateDate';
import { LoadingOutlined, UserOutlined } from '@ant-design/icons';
import { useUpdateTaskMutation } from '../../../../services/api';
import TaskDetails from './TaskDetails';
import { useEffect, useState } from 'react';
import { PRIMARY_COLOR } from '../../../../constants/DashboardColors';
const { Text } = Typography;

function SingleTask({ task }) {
  const [currentLoadingTaskId, setCurrentLoadingTaskId] = useState(null);
  const [taskDetails, setTaskDetails] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const completedSubTasks = task?.tasks?.filter(t => t.isCompleted).length;
  const totalSubTasks = task?.tasks?.length;

  const customExpandIcon = ({ isActive }) => (
    <Icon
      name="ArrowRightOutlined"
      style={{
        transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)',
        opacity: 0.4,
        width: 15,
        height: 15,
      }}
    />
  );

  const [_UPDATE_TASK, { isLoading }] = useUpdateTaskMutation();

  const handleUpdateTask = async (taskId, isCompleted) => {
    setCurrentLoadingTaskId(taskId);
    const response = await _UPDATE_TASK({ _id: taskId, isCompleted });

    if (response?.data?.success) {
      notification.success({
        message: `Task ${isCompleted ? 'completed' : 'pending'}`,
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

    setCurrentLoadingTaskId(null);
  };

  useEffect(() => {
    if (!isDrawerOpen) {
      setTaskDetails(null);
    }

    if (isDrawerOpen && task?.tasks?.length > 0 && taskDetails?._id) {
      const updatedTask = task?.tasks?.find(t => t._id === taskDetails?._id);
      setTaskDetails(updatedTask);
    }
  }, [isDrawerOpen, task, taskDetails]);

  return (
    <>
      <Collapse
        className="taskCollapse"
        ghost
        items={[
          {
            key: '1',
            label: (
              <Flex align="center" justify="flex-start" gap={10}>
                <Progress
                  type="circle"
                  percent={Math.round((completedSubTasks / totalSubTasks) * 100)}
                  size={20}
                  strokeColor="#0fb981"
                />
                <Text style={{ fontSize: 16, fontWeight: 500 }}>{task.title}</Text>
              </Flex>
            ),
            children: (
              <Row gutter={[0, 10]}>
                {task.tasks.map(task => {
                  let isCompleted = task.isCompleted;
                  const fullName = task?.userFullname?.trim();

                  return (
                    <Col span={24}>
                      <Row align="middle" justify="space-between" gap={10} gutter={[0, 15]}>
                        <Flex align="center" gap={10}>
                          {currentLoadingTaskId === task?._id ? (
                            <LoadingOutlined style={{ fontSize: 16 }} />
                          ) : (
                            <Checkbox
                              checked={isCompleted}
                              onChange={() => handleUpdateTask(task?._id, !isCompleted)}
                            ></Checkbox>
                          )}
                          <Flex
                            align="center"
                            gap={5}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setTaskDetails(task);
                              setIsDrawerOpen(true);
                            }}
                          >
                            <Text style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>
                              {task.title}
                            </Text>
                            <Icon
                              name="ArrowRightOutlined"
                              style={{
                                opacity: 0.7,
                                width: 10,
                                height: 10,
                              }}
                            />
                          </Flex>
                        </Flex>

                        <Space size={13}>
                          <Flex align="center" gap={10} style={{ width: '120px' }}>
                            {task?.userAvatar ? (
                              <Avatar
                                src={task.userAvatar}
                                size={20}
                                style={{ overflow: 'hidden', objectFit: 'cover' }}
                              />
                            ) : (
                              <Avatar
                                style={{ backgroundColor: PRIMARY_COLOR, fontSize: 12 }}
                                icon={fullName ? null : <UserOutlined />}
                                size={20}
                              >
                                {fullName?.charAt(0)}
                              </Avatar>
                            )}
                            <Text style={{ opacity: 0.5 }} ellipsis={true}>
                              {fullName || task?.userEmail?.split('@')[0]}
                            </Text>
                          </Flex>
                          <div style={{ height: 25, width: 1.2, backgroundColor: '#E5E5E5' }} />
                          <Flex align="center" gap={10} style={{ width: '100px', opacity: 0.5 }}>
                            <Icon name="CalendarOutlined" style={{ width: 14, height: 14 }} />
                            <Text>{formatDate(task.dueDate)}</Text>
                          </Flex>
                          <div style={{ height: 25, width: 1.2, backgroundColor: '#E5E5E5' }} />
                          <Flex align="center" gap={10} style={{ opacity: 0.5 }}>
                            <Icon name="MessageOutlined" />
                            <Text>{task.commentsCount || 0}</Text>
                          </Flex>
                          <div style={{ height: 25, width: 1.2, backgroundColor: '#E5E5E5' }} />
                          <Flex align="center" gap={10} style={{ opacity: 0.5 }}>
                            <Icon name="LinkOutlined2" />
                            <Text>{task.attachments?.length || 0}</Text>
                          </Flex>
                        </Space>
                      </Row>
                    </Col>
                  );
                })}
              </Row>
            ),
          },
        ]}
        expandIconPosition="right"
        expandIcon={customExpandIcon}
      />
      <TaskDetails
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        data={taskDetails}
        handleUpdateTask={handleUpdateTask}
        isHandleUpdateTaskLoading={isLoading}
      />
    </>
  );
}

export default SingleTask;
