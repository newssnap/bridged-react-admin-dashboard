import {
  theme,
  Typography,
  Table,
  Avatar,
  Tag,
  Space,
  Dropdown,
  Button,
  Tooltip,
  Input,
  Drawer,
  Form,
  Checkbox,
  notification,
  Flex,
  Select,
  DatePicker,
} from 'antd';
import {
  MoreOutlined,
  UserOutlined,
  LoadingOutlined,
  KeyOutlined,
  SearchOutlined,
  PlusOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Icon from '../../../utils/components/Icon';
import { useDashboardHandler } from '../controllers/useDashboardHandler';
import { useReportHandler } from '../controllers/useReportHandler';
import { useState, useMemo, useEffect } from 'react';
import { PRIMARY_COLOR } from '../../../constants/DashboardColors';
import formatDate from '../../../utils/formatting/formateDate';
import { useNavigate } from 'react-router-dom';
const { Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;
const getIcon = name => <Icon name={name} />;

function DashboardWorkflow() {
  const {
    token: { colorBgLayout },
  } = theme.useToken();

  const { users, isLoading, error, handleAddUser, isAddingUser } = useDashboardHandler();
  const [searchText, setSearchText] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExportReportOpen, setIsExportReportOpen] = useState(false);
  const [form] = Form.useForm();
  const [reportForm] = Form.useForm();
  const {
    userDomains,
    handleGenerateUserToken,
    handleCustomerReport,
    isGeneratingToken,
    handleUsageReport,
    reportGenerateLoading,
  } = useReportHandler();
  const [selectedReportTypes, setSelectedReportTypes] = useState([]);
  const [currentUserToken, setCurrentUserToken] = useState(null);
  const navigate = useNavigate();
  const handleMenuClick = (key, record) => {
    if (key === 'dashboard') {
      window.open(
        `https://dashboard.bridged.media/?accessToken=${localStorage.getItem('accessToken')}`,
        '_blank'
      );
    } else if (key === 'portal') {
      window.open(
        `https://portal.bridged.media/?accessToken=${localStorage.getItem('accessToken')}`,
        '_blank'
      );
    }
  };

  const handleAddUserSubmit = async () => {
    const values = await form.validateFields();
    const result = await handleAddUser(values, handleCloseDrawer);
  };

  const handleCloseDrawer = () => {
    form.resetFields();
    setIsDrawerOpen(false);
  };

  const handleCloseReportDrawer = () => {
    reportForm.resetFields();
    setSelectedReportTypes([]);
    setIsExportReportOpen(false);
    setCurrentUserToken(null);
  };

  const handleGenerateReport = async () => {
    try {
      const values = await reportForm.validateFields();
      console.log('Report values:', values);

      if (selectedReportTypes.includes('customer')) {
        const reportData = await handleCustomerReport({
          startDate: values.dateRange[0].format('YYYY-MM-DD'),
          endDate: values.dateRange[1].format('YYYY-MM-DD'),
        });
        console.log('Report data:', reportData);
      }
      if (selectedReportTypes.includes('productivity')) {
        const reportData = await handleUsageReport({
          startDate: values.dateRange[0].format('YYYY-MM-DD'),
          endDate: values.dateRange[1].format('YYYY-MM-DD'),
          hostnames: values.domain,
        });
        console.log('Report data:', reportData);
      }

      // Add your report generation logic here
      notification.success({
        message: 'Report Generated',
        description: 'Your report has been generated successfully.',
      });
      handleCloseReportDrawer();
    } catch (error) {
      console.error('Report generation error:', error);
      notification.error({
        message: 'Report Generation Failed',
        description: 'Failed to generate report. Please try again.',
      });
    }
  };

  const handleReportTypeChange = checkedValues => {
    setSelectedReportTypes(checkedValues);
  };

  const handleExportReportClick = async record => {
    try {
      const token = await handleGenerateUserToken({
        _id: record._id,
      });
      setCurrentUserToken(token);
      setIsExportReportOpen(true);
    } catch (error) {
      console.error('Error generating user token:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to generate user token. Please try again.',
      });
    }
  };

  // Filter users based on search text
  const filteredUsers = useMemo(() => {
    if (!searchText) return users;
    return users.filter(user => user.email.toLowerCase().includes(searchText.toLowerCase()));
  }, [users, searchText]);

  const columns = [
    {
      title: '#',
      key: 'user',
      width: 15,
      align: 'center',
      render: (_, record) => (
        <Space align="center">
          <Avatar src={record.picture} alt={record.fullname} size={50}>
            {record.fullname.charAt(0).toUpperCase()}
          </Avatar>
        </Space>
      ),
    },
    {
      title: 'Fullname',
      dataIndex: 'fullname',
      key: 'fullname',
      width: 30,
      render: fullname => <span style={{ fontSize: '14px' }}>{fullname}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 60,
      render: email => <span style={{ fontSize: '14px' }}>{email}</span>,
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLoggedInDate',
      key: 'lastLoggedInDate',
      align: 'center',
      width: 15,
      render: date => <span style={{ fontSize: '14px' }}>{formatDate(date)}</span>,
    },
    {
      title: () => <span style={{ fontSize: '12px' }}>Verification Code</span>,
      dataIndex: 'verificationCode',
      key: 'verificationCode',
      align: 'center',
      width: 20,
      render: code => <span style={{ fontSize: '14px' }}>{code}</span>,
    },
    {
      title: 'Role',
      key: 'role',
      width: 15,
      align: 'center',
      render: (_, record) => (
        <Tag color={record.isTeamOwner ? 'blue' : 'default'} style={{ textAlign: 'center' }}>
          {record.isTeamOwner ? 'Team Owner' : 'Member'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 20,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title={'Export Report'}>
            <Button
              type="text"
              shape="circle"
              disabled={isGeneratingToken}
              onClick={() => {
                handleExportReportClick(record);
              }}
            >
              {isGeneratingToken ? <LoadingOutlined /> : getIcon('Export')}
            </Button>
          </Tooltip>
          <Tooltip title={'View User Checklist'}>
            <Button
              type="text"
              shape="circle"
              onClick={() => {
                navigate(`/userChecklist/${record._id}`);
              }}
            >
              {getIcon('UserCheck')}
            </Button>
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'dashboard',
                  label: 'Login to Old Dashboard',
                  icon: <KeyOutlined />,
                },
                {
                  key: 'portal',
                  label: 'Login to Portal',
                  icon: <UserOutlined />,
                },
              ],
              onClick: ({ key }) => handleMenuClick(key, record),
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button type="text" shape="circle">
              <MoreOutlined />
            </Button>
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={'large'} style={{ width: '100%' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        Users
      </Title>
      <Flex justify="space-between" align="center" style={{ width: '100%' }}>
        <Button
          size="large"
          type="primary"
          style={{ width: '100px' }}
          onClick={() => setIsDrawerOpen(true)}
        >
          <PlusOutlined />
          Add User
        </Button>
        <Search
          placeholder="Search by email"
          allowClear
          size="large"
          onChange={e => setSearchText(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </Flex>

      <Drawer
        title="Add User"
        width={400}
        onClose={handleCloseDrawer}
        open={isDrawerOpen}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button type="primary" onClick={handleAddUserSubmit} loading={isAddingUser}>
                Add User
              </Button>
              <Button onClick={handleCloseDrawer}>Close</Button>
            </Space>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input the username!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input the password!' }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Report Generation Drawer */}
      <Drawer
        title="Generate Report"
        width={500}
        onClose={handleCloseReportDrawer}
        open={isExportReportOpen}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCloseReportDrawer}>Close</Button>
              <Button type="primary" onClick={handleGenerateReport} loading={reportGenerateLoading}>
                Generate Report
              </Button>
            </Space>
          </div>
        }
      >
        <Form form={reportForm} layout="vertical">
          <Form.Item
            name="reportTypes"
            label="Report Types"
            rules={[{ required: true, message: 'Please select at least one report type!' }]}
          >
            <Checkbox.Group
              options={[
                { label: 'Customer Facing Report', value: 'customer' },
                { label: 'Productivity Usage Report', value: 'productivity' },
              ]}
              onChange={handleReportTypeChange}
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="domain"
            label="User Domain"
            rules={[
              {
                required: selectedReportTypes.includes('productivity'),
                message: 'Please select a domain for Productivity Usage Report!',
              },
            ]}
          >
            <Select
              placeholder="Select a domain"
              loading={reportGenerateLoading}
              disabled={!selectedReportTypes.includes('productivity')}
              mode="multiple"
              options={
                userDomains?.map(domain => ({
                  label: domain.host,
                  value: domain.host,
                })) || []
              }
            />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Date Range"
            rules={[{ required: true, message: 'Please select date range!' }]}
          >
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['Start Date', 'End Date']}
              presets={[
                { label: 'Today', value: [dayjs(), dayjs()] },
                { label: 'Last 7 Days', value: [dayjs().subtract(7, 'days'), dayjs()] },
                { label: 'Last 30 Days', value: [dayjs().subtract(30, 'days'), dayjs()] },
                { label: 'This Month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
              ]}
            />
          </Form.Item>
        </Form>
      </Drawer>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="_id"
        loading={isLoading}
        bordered
        pagination={{
          position: ['bottomLeft'],
          showSizeChanger: false,
          showQuickJumper: false,
        }}
        scroll={{ x: 990 }}
      />
    </Space>
  );
}

export default DashboardWorkflow;
