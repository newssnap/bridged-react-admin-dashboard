import React from 'react';
import { Drawer, Space, Flex, Typography, Button, Table, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { PRIMARY_COLOR } from '../../../constants/DashboardColors';

const { Title } = Typography;

const TaskManagementDrawer = ({
  isOpen,
  onClose,
  selectedChecklist,
  taskColumns,
  isLoading,
  onAddTask,
}) => {
  return (
    <Drawer
      title={`Tasks - ${selectedChecklist?.title}`}
      placement="right"
      onClose={onClose}
      open={isOpen}
      width="100%"
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Close</Button>
        </Space>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Flex justify="space-between" align="center" style={{ width: '100%' }}>
          <Title level={3}>Tasks</Title>
          <Button size="large" type="primary" icon={<PlusOutlined />} onClick={onAddTask}>
            Add Task
          </Button>
        </Flex>

        {/* Tasks Table */}
        <Table
          dataSource={selectedChecklist?.tasks || []}
          loading={isLoading}
          columns={taskColumns}
          bordered
          rowKey="_id"
          pagination={false}
        />
      </Space>
    </Drawer>
  );
};

export default TaskManagementDrawer;
