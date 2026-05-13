import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Form,
  InputNumber,
  Select,
  Input,
  DatePicker,
  Button,
  Space,
  Alert,
  Divider,
  Table,
  Typography,
  Tooltip,
} from 'antd';
import dayjs from 'dayjs';
import formatDate from '../../../utils/formatting/formateDate';
import Icon from '../../../utils/components/Icon';

const { TextArea } = Input;
const { Text } = Typography;

const ManageCreditsDrawer = ({
  open,
  onClose,
  teamData,
  historyData,
  isLoadingHistory,
  onSubmit,
  isSubmitting,
  form,
  onEditHistorySubmit,
  isEditingHistorySubmitting,
}) => {
  const [isEditHistoryDrawerOpen, setIsEditHistoryDrawerOpen] = useState(false);
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState(null);
  const [editHistoryForm] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        purchaseDate: dayjs(),
      });
    }
  }, [open, form]);

  useEffect(() => {
    console.log('teamData', teamData);
    console.log('historyData', historyData);
  }, [teamData, historyData]);

  const handleFinish = values => {
    const submitData = {
      teamId: teamData?.teamId,
      amount: values.amount,
      purchaseType: values.purchaseType,
      reason: values.reason || null,
      notes: values.notes || null,
      purchaseDate: values.purchaseDate
        ? values.purchaseDate.toISOString()
        : new Date().toISOString(),
    };
    onSubmit(submitData);
  };

  const historyTableData = historyData?.history || [];

  const openEditHistoryDrawer = record => {
    setSelectedHistoryRecord(record);
    editHistoryForm.setFieldsValue({
      amount: record?.amount,
      purchaseType: record?.purchaseType,
      reason: record?.reason || undefined,
      notes: record?.notes || undefined,
      purchaseDate: record?.purchaseDate ? dayjs(record.purchaseDate) : dayjs(),
    });
    setIsEditHistoryDrawerOpen(true);
  };

  const closeEditHistoryDrawer = () => {
    setIsEditHistoryDrawerOpen(false);
    setSelectedHistoryRecord(null);
    editHistoryForm.resetFields();
  };

  const handleEditHistoryFinish = async values => {
    if (!selectedHistoryRecord?.creditPurchaseId || !onEditHistorySubmit) return;

    const wasSuccessful = await onEditHistorySubmit({
      creditPurchaseId: selectedHistoryRecord.creditPurchaseId,
      amount: values.amount,
      purchaseType: values.purchaseType,
      reason: values.reason || null,
      notes: values.notes || null,
      purchaseDate: values.purchaseDate
        ? values.purchaseDate.toISOString()
        : new Date().toISOString(),
      teamId: selectedHistoryRecord.teamId || teamData?.teamId,
    });

    if (wasSuccessful) {
      closeEditHistoryDrawer();
    }
  };

  const historyColumns = [
    {
      title: 'Date',
      dataIndex: 'purchaseDate',
      key: 'date',
      render: value => <span>{value ? formatDate(value) : '--'}</span>,
    },
    {
      title: 'Change',
      dataIndex: 'amount',
      key: 'change',
      align: 'center',
      render: (amount, record) => {
        const isDeduct = record.purchaseType === 'deduct';
        return (
          <Text style={{ color: isDeduct ? '#ff4d4f' : '#52c41a' }}>
            {isDeduct ? '-' : '+'}
            {amount?.toLocaleString() || 0}
          </Text>
        );
      },
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: value => <span>{value || '--'}</span>,
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: value => <span>{value || '--'}</span>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Edit">
          <Button
            type="text"
            shape="circle"
            onClick={() => openEditHistoryDrawer(record)}
            style={{ padding: 0 }}
          >
            <Icon name="EditOutlined" />
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <Drawer
      title="Manage Team Credits"
      placement="right"
      onClose={onClose}
      open={open}
      width={800}
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} size="large">
            Cancel
          </Button>
          <Button type="primary" size="large" onClick={() => form.submit()} loading={isSubmitting}>
            Submit
          </Button>
        </Space>
      }
    >
      {teamData && (
        <Alert
          message={
            <div>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                {teamData.teamName || '--'}
              </div>
              <div style={{ fontSize: '14px', color: '#8c8c8c' }}>
                {teamData.companyName || '--'}
              </div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>
                <strong>Current Balance:</strong>{' '}
                {historyData?.creditBalance?.toLocaleString() || 0}
              </div>
            </div>
          }
          type="info"
          style={{ marginBottom: '24px' }}
        />
      )}

      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <Form.Item
          label="Amount"
          name="amount"
          rules={[
            {
              required: true,
              message: 'Please enter the amount',
            },
            {
              type: 'number',
              min: 1,
              message: 'Amount must be greater than 0',
            },
          ]}
        >
          <InputNumber size="large" placeholder="Enter amount" style={{ width: '100%' }} min={1} />
        </Form.Item>

        <Form.Item
          label="Type"
          name="purchaseType"
          rules={[
            {
              required: true,
              message: 'Please select a type',
            },
          ]}
        >
          <Select size="large" placeholder="Select type">
            <Select.Option value="assign">Assign</Select.Option>
            <Select.Option value="deduct">Deduct</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Reason" name="reason">
          <Input size="large" placeholder="Enter reason (optional)" />
        </Form.Item>

        <Form.Item label="Note" name="notes">
          <TextArea rows={4} placeholder="Enter notes (optional)" size="large" />
        </Form.Item>

        <Form.Item
          label="Date Input"
          name="purchaseDate"
          rules={[
            {
              required: true,
              message: 'Please select a date',
            },
          ]}
        >
          <DatePicker size="large" style={{ width: '100%' }} format="YYYY-MM-DD HH:mm" showTime />
        </Form.Item>
      </Form>

      <Divider style={{ margin: '24px 0' }}>Ledger History</Divider>

      <Table
        dataSource={historyTableData}
        columns={historyColumns}
        loading={isLoadingHistory}
        pagination={false}
        rowKey={record => record.creditPurchaseId}
        locale={{
          emptyText: 'No history found',
        }}
      />

      <Drawer
        title="Edit Ledger History"
        placement="right"
        width={520}
        open={isEditHistoryDrawerOpen}
        onClose={closeEditHistoryDrawer}
        destroyOnClose
        footer={
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={closeEditHistoryDrawer} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={() => editHistoryForm.submit()}
              loading={isEditingHistorySubmitting}
            >
              Save
            </Button>
          </Space>
        }
      >
        <Form
          form={editHistoryForm}
          layout="vertical"
          onFinish={handleEditHistoryFinish}
          requiredMark={false}
        >
          <Form.Item
            label="Amount"
            name="amount"
            rules={[
              {
                required: true,
                message: 'Please enter the amount',
              },
              {
                type: 'number',
                min: 1,
                message: 'Amount must be greater than 0',
              },
            ]}
          >
            <InputNumber
              size="large"
              placeholder="Enter amount"
              style={{ width: '100%' }}
              min={1}
            />
          </Form.Item>

          <Form.Item
            label="Type"
            name="purchaseType"
            rules={[
              {
                required: true,
                message: 'Please select a type',
              },
            ]}
          >
            <Select size="large" placeholder="Select type">
              <Select.Option value="assign">Assign</Select.Option>
              <Select.Option value="deduct">Deduct</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Reason" name="reason">
            <Input size="large" placeholder="Enter reason (optional)" />
          </Form.Item>

          <Form.Item label="Note" name="notes">
            <TextArea rows={4} placeholder="Enter notes (optional)" size="large" />
          </Form.Item>

          <Form.Item
            label="Date Input"
            name="purchaseDate"
            rules={[
              {
                required: true,
                message: 'Please select a date',
              },
            ]}
          >
            <DatePicker size="large" style={{ width: '100%' }} format="YYYY-MM-DD HH:mm" showTime />
          </Form.Item>
        </Form>
      </Drawer>
    </Drawer>
  );
};

export default ManageCreditsDrawer;
