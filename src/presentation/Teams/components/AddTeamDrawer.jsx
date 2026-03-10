import React, { useEffect } from 'react';
import { Drawer, Form, Input, Select, Switch, Button, Space, ColorPicker } from 'antd';

const AddTeamDrawer = ({
  open,
  onClose,
  companyOptions,
  userOptions,
  isUsersLoading,
  onCompanyChange,
  onSubmit,
  isSubmitting,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        teamName: undefined,
        companyId: undefined,
        teamOwnerId: undefined,
        memberIds: undefined,
        isWhitelabelingEnabled: false,
        dashboardURL: undefined,
        primaryColor: '#753fd0',
        logoUrl: undefined,
      });
    }
  }, [open, form]);

  const handleFinish = values => {
    const primaryColor =
      typeof values.primaryColor === 'string'
        ? values.primaryColor
        : (values.primaryColor?.toHexString?.() ?? '');
    const dashboardURL = values.dashboardURL?.trim()
      ? `${values.dashboardURL.trim()}.bridged.media`
      : undefined;
    onSubmit({
      ...values,
      primaryColor,
      dashboardURL,
    });
  };

  const isWhitelabelingEnabled = Form.useWatch('isWhitelabelingEnabled', form);
  const selectedTeamOwnerId = Form.useWatch('teamOwnerId', form);
  const memberOptions = (userOptions ?? []).filter(opt => opt.value !== selectedTeamOwnerId);

  return (
    <Drawer
      title="Add Team"
      placement="right"
      onClose={onClose}
      open={open}
      width={520}
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} size="large">
            Cancel
          </Button>
          <Button type="primary" size="large" onClick={() => form.submit()} loading={isSubmitting}>
            Create Team
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <Form.Item
          label="Team Name"
          name="teamName"
          rules={[{ required: true, message: 'Please enter team name' }]}
        >
          <Input size="large" placeholder="Enter team name" />
        </Form.Item>

        <Form.Item
          label="Company"
          name="companyId"
          rules={[{ required: true, message: 'Please select a company' }]}
        >
          <Select
            size="large"
            placeholder="Select company"
            options={companyOptions}
            showSearch
            optionFilterProp="label"
            allowClear
            onChange={companyId => {
              form.setFieldValue('teamOwnerId', undefined);
              form.setFieldValue('memberIds', undefined);
              onCompanyChange(companyId);
            }}
          />
        </Form.Item>

        <Form.Item
          label="Team Owner"
          name="teamOwnerId"
          rules={[{ required: true, message: 'Please select team owner' }]}
        >
          <Select
            size="large"
            placeholder="Select team owner"
            options={userOptions}
            showSearch
            optionFilterProp="label"
            loading={isUsersLoading}
            allowClear
          />
        </Form.Item>

        <Form.Item label="Members (Optional)" name="memberIds">
          <Select
            size="large"
            mode="multiple"
            placeholder="Select members"
            options={memberOptions}
            showSearch
            optionFilterProp="label"
            loading={isUsersLoading}
            allowClear
          />
        </Form.Item>

        <Form.Item label="WhiteLabeling" name="isWhitelabelingEnabled" valuePropName="checked">
          <Switch />
        </Form.Item>

        {isWhitelabelingEnabled && (
          <>
            <Form.Item
              label="Dashboard subdomain"
              name="dashboardURL"
              tooltip="Your team dashboard will be available at subdomain.bridged.media"
            >
              <Input size="large" placeholder="subdomain" addonAfter=".bridged.media" />
            </Form.Item>

            <Form.Item
              label="Primary Color"
              name="primaryColor"
              getValueFromEvent={color => color?.toHexString?.() ?? color}
            >
              <ColorPicker format="hex" showText />
            </Form.Item>

            <Form.Item label="Logo URL" name="logoUrl">
              <Input size="large" placeholder="Enter logo URL" />
            </Form.Item>
          </>
        )}
      </Form>
    </Drawer>
  );
};

export default AddTeamDrawer;
