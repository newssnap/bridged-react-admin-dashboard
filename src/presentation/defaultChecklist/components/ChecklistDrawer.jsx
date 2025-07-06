import React from 'react';
import { Drawer, Form, Input, Button, Space } from 'antd';

const ChecklistDrawer = ({ isOpen, onClose, isEditing, form, onSubmit, isLoading }) => {
  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      title={isEditing ? 'Edit Checklist' : 'Add New Checklist'}
      placement="right"
      onClose={handleClose}
      open={isOpen}
      width={'40%'}
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={handleClose} size="large">
            Cancel
          </Button>
          <Button type="primary" onClick={() => form.submit()} loading={isLoading} size="large">
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="title"
          label="Title"
          rules={[
            {
              required: true,
              message: 'Please enter a title for the checklist',
            },
          ]}
        >
          <Input placeholder="Enter checklist title" size="large" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default ChecklistDrawer;
