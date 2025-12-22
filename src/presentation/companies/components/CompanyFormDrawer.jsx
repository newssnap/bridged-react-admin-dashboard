import React, { useEffect } from 'react';
import { Button, Drawer, Form, Input, Space } from 'antd';

const CompanyFormDrawer = ({ open, mode, initialValues, onClose, onSubmit, confirmLoading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ name: initialValues?.name || '' });
    }
  }, [form, open, initialValues]);

  const handleFinish = values => {
    onSubmit(values);
  };

  return (
    <Drawer
      title={mode === 'edit' ? 'Edit Company name' : 'Add Company name'}
      open={open}
      width={420}
      onClose={onClose}
      destroyOnClose
      footer={
        <Space
          size="middle"
          style={{ width: '100%', justifyContent: 'flex-end', padding: 'var(--mpr-3)' }}
        >
          <Button size="large" onClick={onClose}>
            Cancel
          </Button>
          <Button size="large" type="primary" onClick={form.submit} loading={confirmLoading}>
            {mode === 'edit' ? 'Save Changes' : 'Create Company'}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <Form.Item
          label="Company Name"
          name="name"
          rules={[{ required: true, message: 'Company name is required' }]}
        >
          <Input size="large" placeholder="Enter company name" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default CompanyFormDrawer;
