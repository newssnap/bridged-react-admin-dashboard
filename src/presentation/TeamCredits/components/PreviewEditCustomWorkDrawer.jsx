import React, { useEffect } from 'react';
import { Drawer, Form, InputNumber, Select, Input, DatePicker, Button, Space, Alert } from 'antd';
import dayjs from 'dayjs';

const { TextArea } = Input;

const CATEGORY_OPTIONS = [
  { label: 'Custom Features', value: 'Custom Feature' },
  { label: 'Data Integration', value: 'Data Integration' },
  { label: 'Enablement & Support', value: 'Enablement & Support' },
  { label: 'Quality Assurance', value: 'Quality Assurance' },
];

const STATUS_OPTIONS = [
  { label: 'In Execution', value: 'pending' },
  { label: 'Completed', value: 'completed' },
];

const PreviewEditCustomWorkDrawer = ({
  open,
  onClose,
  mode,
  initialRecord,
  teamsData,
  onSubmit,
  isSubmitting,
}) => {
  const [form] = Form.useForm();
  const isPreview = mode === 'preview';

  useEffect(() => {
    if (open && initialRecord) {
      form.setFieldsValue({
        teamId: initialRecord.teamId,
        workProject: initialRecord.workProject,
        category: initialRecord.category,
        creditsUsed: initialRecord.creditsUsed,
        status: initialRecord.status,
        dateFrom: initialRecord.startDate ? dayjs(initialRecord.startDate) : null,
        dateTo: initialRecord.endDate ? dayjs(initialRecord.endDate) : null,
        notes: initialRecord.notes ?? undefined,
      });
    }
  }, [open, initialRecord, form]);

  const handleFinish = values => {
    const payload = {
      creditUsageId: initialRecord?.creditUsageId,
      creditsUsed: values.creditsUsed,
      usageData: {
        customWorkTitle: values.workProject,
        customWorkCategory: values.category,
        customWorkStatus: values.status,
        customWorkStartDate: values.dateFrom ? values.dateFrom.toISOString() : null,
        customWorkEndDate: values.dateTo ? values.dateTo.toISOString() : null,
        notes: values.notes || null,
      },
    };
    onSubmit(payload);
  };

  const title = isPreview ? 'Preview Custom Work Entry' : 'Edit Custom Work Entry';

  return (
    <Drawer
      title={title}
      placement="right"
      onClose={onClose}
      open={open}
      width={600}
      footer={
        isPreview ? (
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onClose} size="large">
              Close
            </Button>
          </Space>
        ) : (
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onClose} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={() => form.submit()}
              loading={isSubmitting}
            >
              Save
            </Button>
          </Space>
        )
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        disabled={isPreview}
      >
        {isPreview ? (
          initialRecord && (
            <Alert
              message={
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                    {initialRecord.teamName || '--'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#8c8c8c' }}>
                    {initialRecord.companyName || '--'}
                  </div>
                </div>
              }
              type="info"
              style={{ marginBottom: '24px' }}
            />
          )
        ) : (
          <Form.Item
            label="Team"
            name="teamId"
            rules={[{ required: true, message: 'Please select a team' }]}
          >
            <Select
              size="large"
              placeholder="Select a team"
              showSearch
              optionLabelProp="label"
              filterOption={(input, option) => {
                const searchText = `${option?.label ?? ''} ${option?.companyName ?? ''}`;
                return searchText.toLowerCase().includes(input.toLowerCase());
              }}
            >
              {teamsData?.map(team => (
                <Select.Option
                  key={team.teamId}
                  value={team.teamId}
                  label={team.teamName}
                  companyName={team.companyName}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{team.teamName}</div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{team.companyName}</div>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          label="Work / Project"
          name="workProject"
          rules={[{ required: true, message: 'Please enter work or project title' }]}
        >
          <Input size="large" placeholder="Enter work or project title" />
        </Form.Item>

        <Form.Item
          label="Category"
          name="category"
          rules={[{ required: true, message: 'Please select a category' }]}
        >
          <Select size="large" placeholder="Select category">
            {CATEGORY_OPTIONS.map(opt => (
              <Select.Option key={opt.value} value={opt.value}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Credits Used"
          name="creditsUsed"
          rules={[
            { required: true, message: 'Please enter credits used' },
            { type: 'number', min: 0, message: 'Must be 0 or greater' },
          ]}
        >
          <InputNumber
            size="large"
            placeholder="Enter credits used"
            style={{ width: '100%' }}
            min={0}
          />
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Select size="large" placeholder="Select status">
            {STATUS_OPTIONS.map(opt => (
              <Select.Option key={opt.value} value={opt.value}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Date From"
          name="dateFrom"
          rules={[{ required: true, message: 'Please select start date' }]}
        >
          <DatePicker size="large" style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          label="Date To"
          name="dateTo"
          rules={[{ required: true, message: 'Please select end date' }]}
        >
          <DatePicker size="large" style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item label="Notes" name="notes">
          <TextArea rows={4} placeholder="Enter notes (optional)" size="large" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default PreviewEditCustomWorkDrawer;
