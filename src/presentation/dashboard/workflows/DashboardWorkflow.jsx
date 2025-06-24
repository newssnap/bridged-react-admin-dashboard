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
} from 'antd';
import {
  MoreOutlined,
  UserOutlined,
  SettingOutlined,
  KeyOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useDashboardHandler } from '../controllers/useDashboardHandler';
import { useState, useMemo } from 'react';
import { PRIMARY_COLOR } from '../../../constants/DashboardColors';
const { Title } = Typography;
const { Search } = Input;

function DashboardWorkflow() {
  const {
    token: { colorBgLayout },
  } = theme.useToken();

  const { users, isLoading, error, handleAddUser, isAddingUser } = useDashboardHandler();
  const [searchText, setSearchText] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  const handleMenuClick = (key, record) => {
    console.log('Menu clicked:', key, record);
    // Add your login logic here
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

  // Filter users based on search text
  const filteredUsers = useMemo(() => {
    if (!searchText) return users;
    return users.filter(user => user.email.toLowerCase().includes(searchText.toLowerCase()));
  }, [users, searchText]);

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar src={record.picture} alt={record.fullname} size={40}>
            {record.fullname.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.fullname}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: email => <span style={{ fontSize: '14px' }}>{email}</span>,
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLoggedInDate',
      key: 'lastLoggedInDate',
      render: date => <span style={{ fontSize: '14px' }}>{date}</span>,
    },
    {
      title: 'Verification Code',
      dataIndex: 'verificationCode',
      key: 'verificationCode',
      render: code => <span style={{ fontSize: '14px' }}>{code}</span>,
    },
    {
      title: 'Role',
      key: 'role',
      render: (_, record) => (
        <Tag color={record.isTeamOwner ? 'blue' : 'default'}>
          {record.isTeamOwner ? 'Team Owner' : 'Member'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title={'Login to old dashboard'}>
            <Button
              type="text"
              shape="circle"
              onClick={() => {
                handleMenuClick('dashboard', record);
              }}
            >
              <KeyOutlined />
            </Button>
          </Tooltip>
          <Tooltip title={'Login to portal'}>
            <Button
              type="text"
              shape="circle"
              onClick={() => {
                handleMenuClick('portal', record);
              }}
            >
              <UserOutlined />
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={'large'} style={{ width: '100%' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        Users
      </Title>
      <Space size={'large'} style={{ maxWidth: '400px' }}>
        <Search
          placeholder="Search by email"
          allowClear
          size="large"
          onChange={e => setSearchText(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
        <Button
          size="large"
          type="primary"
          style={{ width: '100px' }}
          onClick={() => setIsDrawerOpen(true)}
        >
          Add User
        </Button>
      </Space>

      <Drawer
        title="Add User"
        width={720}
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
        scroll={{ x: 800 }}
      />
    </Space>
  );
}

export default DashboardWorkflow;
