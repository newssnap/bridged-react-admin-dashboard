import React, { useEffect } from 'react';
import {
  Drawer,
  Form,
  InputNumber,
  Select,
  Input,
  DatePicker,
  Button,
  Space,
  Descriptions,
  Typography,
  Tag,
} from 'antd';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

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

const getCategoryLabel = value =>
  CATEGORY_OPTIONS.find(o => o.value === value)?.label ?? value ?? '—';
const getStatusLabel = value => STATUS_OPTIONS.find(o => o.value === value)?.label ?? value ?? '—';
const formatDate = d => (d ? dayjs(d).format('YYYY-MM-DD') : '—');

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
      teamId: initialRecord.teamId,
      creditUsageId: initialRecord?.creditUsageId,
      creditsUsed: values.creditsUsed,
      usageData: {
        customWorkTitle: values.workProject,
        customWorkCategory: values.category,
        customWorkStatus: values.status,
        customWorkStartDate: values.dateFrom ? values.dateFrom.toISOString() : null,
        customWorkEndDate: values.dateTo ? values.dateTo.toISOString() : null,
        customWorkNotes: values.notes || null,
      },
    };
    onSubmit(payload);
  };

  const title = isPreview ? 'Preview Custom Work Entry' : 'Edit Custom Work Entry';

  const renderPreviewContent = () => {
    if (!initialRecord) return null;
    const r = initialRecord;
    const statusColor = r.status === 'completed' ? 'success' : 'processing';
    return (
      <>
        <div
          style={{
            padding: '16px 20px',
            marginBottom: 24,
            borderRadius: 8,
            background: 'var(--ant-color-fill-quaternary)',
            border: '1px solid var(--ant-color-border-secondary)',
          }}
        >
          <Text strong style={{ fontSize: 15, display: 'block' }}>
            {r.teamName || '—'}
          </Text>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {r.companyName || '—'}
          </Text>
        </div>

        <Descriptions
          column={1}
          size="middle"
          bordered
          labelStyle={{
            fontWeight: 600,
            width: 140,
            background: 'var(--ant-color-fill-quaternary)',
          }}
          contentStyle={{ background: 'var(--ant-color-bg-container)' }}
        >
          <Descriptions.Item label="Work / Project">{r.workProject || '—'}</Descriptions.Item>
          <Descriptions.Item label="Category">{getCategoryLabel(r.category)}</Descriptions.Item>
          <Descriptions.Item label="Credits Used">
            <Text strong>{r.creditsUsed ?? '—'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={statusColor}>{getStatusLabel(r.status)}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Date From">{formatDate(r.startDate)}</Descriptions.Item>
          <Descriptions.Item label="Date To">{formatDate(r.endDate)}</Descriptions.Item>
          <Descriptions.Item label="Notes" span={1}>
            {r.notes ? (
              <Text style={{ whiteSpace: 'pre-wrap' }}>{r.notes}</Text>
            ) : (
              <Text type="secondary">—</Text>
            )}
          </Descriptions.Item>
        </Descriptions>
      </>
    );
  };

  return (
    <Drawer
      title={title}
      placement="right"
      onClose={onClose}
      open={open}
      width={650}
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
      {isPreview ? (
        renderPreviewContent()
      ) : (
        <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
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
      )}
    </Drawer>
  );
};

export default PreviewEditCustomWorkDrawer;
