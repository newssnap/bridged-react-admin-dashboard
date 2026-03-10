import React from 'react';
import { Drawer, Form, Input, Select, Button, Space, Card, Table, Typography } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';

const { Text } = Typography;

const getMemberOptionsExcludingOwner = (userOptions, selectedTeamOwnerId) =>
  (userOptions ?? []).filter(opt => opt.value !== selectedTeamOwnerId);

const EditTeamDrawer = ({
  open,
  team,
  userOptions,
  isUsersLoading,
  onCompanyChange,
  form,
  companyOptions,
  handleFinish,
  handleClose,
  handleAfterOpenChange,
  memberTableData,
  columns,
  isLoadingMembers,
  isSubmitting,
}) => {
  const selectedTeamOwnerId = Form.useWatch('teamOwnerId', form);
  const memberOptions = getMemberOptionsExcludingOwner(userOptions, selectedTeamOwnerId);

  return (
    <Drawer
      title="Edit Team"
      placement="right"
      onClose={handleClose}
      afterOpenChange={handleAfterOpenChange}
      open={open}
      width={650}
      footer={
        team ? (
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose} size="large">
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
        ) : null
      }
    >
      {team ? (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
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
                  onCompanyChange?.(companyId);
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
          </Form>

          {/* Current Credit */}
          <Card
            size="small"
            title={
              <Space>
                <CreditCardOutlined />
                <span>Current Credit Balance</span>
              </Space>
            }
            styles={{
              body: { padding: '16px 24px' },
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: 600 }}>
              {(team.creditBalance ?? 0).toLocaleString()}
            </Text>
          </Card>

          {/* Current Team Members Table */}
          <Table
            dataSource={memberTableData}
            columns={columns}
            loading={isLoadingMembers}
            bordered
            pagination={{
              position: ['bottomLeft'],
              showSizeChanger: false,
              showQuickJumper: false,
            }}
            locale={{ emptyText: 'No members' }}
          />
        </Space>
      ) : null}
    </Drawer>
  );
};

export default EditTeamDrawer;
