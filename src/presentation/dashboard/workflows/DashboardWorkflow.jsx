import { theme, Typography, Table, Avatar, Tag, Space, Dropdown, Button } from 'antd';
import { MoreOutlined, UserOutlined, SettingOutlined, KeyOutlined } from '@ant-design/icons';
import { useDashboardHandler } from '../controllers/useDashboardHandler';

const { Title } = Typography;

function DashboardWorkflow() {
  const {
    token: { colorBgLayout },
  } = theme.useToken();

  const { users, isLoading, error } = useDashboardHandler();

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

  const getMenuItems = record => [
    {
      key: 'portal',
      icon: <KeyOutlined />,
      label: `Login To Portal`,
      onClick: () => handleMenuClick('portal', record),
    },
    {
      key: 'dashboard',
      icon: <UserOutlined />,
      label: `Login To Old Dashboard`,
      onClick: () => handleMenuClick('dashboard', record),
    },
  ];

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
        <Dropdown
          menu={{
            items: getMenuItems(record),
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<MoreOutlined />} size="small" style={{ border: 'none' }} />
        </Dropdown>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={'large'} style={{ width: '100%' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        Users
      </Title>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
        }}
        scroll={{ x: 800 }}
      />
    </Space>
  );
}

export default DashboardWorkflow;
