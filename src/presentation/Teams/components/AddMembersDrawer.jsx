import React from 'react';
import { Drawer, Form, Select, Button, Space } from 'antd';

const AddMembersDrawer = ({
  open,
  form,
  availableUserOptions,
  isUsersLoading,
  handleFinish,
  handleAfterOpenChange,
  closeDrawer,
  isSubmitting,
}) => {
  return (
    <Drawer
      title="Add Members"
      placement="right"
      width={520}
      open={open}
      onClose={closeDrawer}
      afterOpenChange={handleAfterOpenChange}
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={closeDrawer} size="large">
            Cancel
          </Button>
          <Button type="primary" size="large" onClick={() => form.submit()} loading={isSubmitting}>
            Save
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <Form.Item
          label="Members"
          name="memberIds"
          rules={[
            {
              required: true,
              type: 'array',
              min: 1,
              message: 'Please select at least one member',
            },
          ]}
        >
          <Select
            size="large"
            mode="multiple"
            placeholder="Select members"
            options={availableUserOptions}
            showSearch
            optionFilterProp="label"
            loading={isUsersLoading}
            allowClear
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AddMembersDrawer;
