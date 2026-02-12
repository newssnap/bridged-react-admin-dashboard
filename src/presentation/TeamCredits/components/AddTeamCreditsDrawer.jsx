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
  Alert,
  Divider,
  Table,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import formatDate from '../../../utils/formatting/formateDate';

const { TextArea } = Input;
const { Text } = Typography;

const AddTeamCreditsDrawer = ({
  open,
  onClose,
  teamsData,
  selectedTeamId,
  selectedTeamData,
  historyData,
  isLoadingHistory,
  onSubmit,
  isSubmitting,
  onTeamSelect,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        teamId: undefined,
        purchaseDate: dayjs(),
      });
    }
  }, [open, form]);

  useEffect(() => {
    if (selectedTeamId && selectedTeamData) {
      form.setFieldsValue({
        teamId: selectedTeamId,
      });
    }
  }, [selectedTeamId, selectedTeamData, form]);

  const handleFinish = values => {
    const submitData = {
      teamId: values.teamId,
      amount: values.amount,
      purchaseData: {
        purchaseType: values.purchaseType,
        reason: values.reason || null,
        notes: values.notes || null,
        purchaseDate: values.purchaseDate
          ? values.purchaseDate.toISOString()
          : new Date().toISOString(),
      },
    };
    onSubmit(submitData);
  };

  const handleTeamChange = value => {
    onTeamSelect(value);
  };

  const historyColumns = [
    {
      title: 'Date',
      dataIndex: ['purchaseData', 'purchaseDate'],
      key: 'date',
      render: value => <span>{value ? formatDate(value) : '--'}</span>,
    },
    {
      title: 'Change',
      dataIndex: 'amount',
      key: 'change',
      align: 'center',
      render: (amount, record) => {
        const isDeduct = record.purchaseData?.purchaseType === 'deduct';
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
      dataIndex: ['purchaseData', 'reason'],
      key: 'reason',
      render: value => <span>{value || '--'}</span>,
    },
    {
      title: 'Notes',
      dataIndex: ['purchaseData', 'notes'],
      key: 'notes',
      render: value => <span>{value || '--'}</span>,
    },
  ];

  const historyTableData = historyData?.history || [];
  const hasSelectedTeam = !!selectedTeamId;

  return (
    <Drawer
      title="Add Team Credits"
      placement="right"
      onClose={onClose}
      open={open}
      width={600}
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
      <Alert
        title="Information"
        description="Once credits are added to a team, credit usage and reporting will be enabled for that team."
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <Form.Item
          label="Team"
          name="teamId"
          rules={[
            {
              required: true,
              message: 'Please select a team',
            },
          ]}
        >
          <Select
            size="large"
            placeholder="Select a team"
            onChange={handleTeamChange}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {teamsData?.map(team => (
              <Select.Option
                key={team.teamId}
                value={team.teamId}
                label={`${team.teamName} - ${team.companyName}`}
              >
                {team.teamName} - {team.companyName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {hasSelectedTeam && selectedTeamData && (
          <Alert
            message={
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                  {selectedTeamData.teamName || '--'}
                </div>
                <div style={{ fontSize: '14px', color: '#8c8c8c' }}>
                  {selectedTeamData.companyName || '--'}
                </div>
                <div style={{ fontSize: '14px', marginTop: '8px' }}>
                  <strong>Current Balance:</strong>{' '}
                  {selectedTeamData.creditBalance?.toLocaleString() || 0}
                </div>
              </div>
            }
            type="info"
            style={{ marginBottom: '15px' }}
          />
        )}

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

      {hasSelectedTeam && (
        <>
          <Divider style={{ margin: '24px 0' }}>Ledger History</Divider>

          <Table
            dataSource={historyTableData}
            columns={historyColumns}
            loading={isLoadingHistory}
            pagination={false}
            rowKey={(record, index) => index}
            locale={{
              emptyText: 'No history found',
            }}
          />
        </>
      )}
    </Drawer>
  );
};

export default AddTeamCreditsDrawer;
