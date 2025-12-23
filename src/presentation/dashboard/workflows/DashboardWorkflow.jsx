/* global chrome */
import {
  Typography,
  Table,
  Avatar,
  Tag,
  Space,
  Row,
  Col,
  Button,
  Input,
  Drawer,
  Form,
  Checkbox,
  notification,
  Select,
  DatePicker,
  Divider,
  Alert,
  Spin,
  Badge,
  Tooltip,
} from 'antd';
import { UserOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Icon from '../../../utils/components/Icon';
import { useDashboardHandler } from '../controllers/useDashboardHandler';
import useUsersTableHandler from '../controllers/useUsersTableHandler';
import useDebouncedInput from '../../../utils/controllers/useDebouncedInput';
import { useReportHandler } from '../controllers/useReportHandler';
import { useAgentManagementHandler } from '../controllers/useAgentManagementHandler';
import { useState, useMemo, useEffect, useRef } from 'react';
import { ACTIVE_COLOR, PRIMARY_COLOR } from '../../../constants/DashboardColors';
import formatDate from '../../../utils/formatting/formateDate';
import { ChromeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../../config/Config';
import {
  AUTOMATE_PACK_OPTIONS,
  ENGAGE_PACK_OPTIONS,
  MONETIZE_PACK_OPTIONS,
} from '../../../constants/agents';
import { useGetCompaniesQuery } from '../../../services/api';
import CompaniesWorkflow from '../../companies/workflows/CompaniesWorkflow';
import { setCompaniesDrawerState } from '../../../redux/slices/companiesSlice';
import { useDispatch } from 'react-redux';
const { Title } = Typography;
const { RangePicker } = DatePicker;
const getIcon = name => <Icon name={name} />;

function DashboardWorkflow() {
  const dispatch = useDispatch();
  const {
    inputQuery: searchText,
    debouncedValue: debouncedSearchText,
    inputHandler,
  } = useDebouncedInput('');

  const {
    inputQuery: companySearchText,
    debouncedValue: debouncedCompanySearchText,
    inputHandler: companySearchInputHandler,
  } = useDebouncedInput('');

  const [selectedCompanyId, setSelectedCompanyId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSort, setSelectedSort] = useState('lastLogin_DESC');
  const { users, total, page, limit, handlePageChange, isLoading } = useUsersTableHandler(
    debouncedSearchText,
    selectedCompanyId,
    selectedStatus,
    selectedSort
  );

  const { data: companies, isLoading: isLoadingCompanies } = useGetCompaniesQuery({
    page: 1,
    limit: 100,
    search: debouncedCompanySearchText || '',
  });

  const {
    handleAddUser,
    isAddingUser,
    handleGenerateUserTokenForLogin,
    isGeneratingTokenForLogin,
    generateTokenIDLogin,
    tokenType,
  } = useDashboardHandler();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const selectRef = useRef(null);
  const companySelectRef = useRef(null);
  const [isExportReportOpen, setIsExportReportOpen] = useState(false);
  const [isAgentsDrawerOpen, setIsAgentsDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [reportForm] = Form.useForm();
  const [agentsForm] = Form.useForm();
  const {
    userDomains,
    handleGenerateUserToken,
    handleCustomerReport,
    isGeneratingToken,
    handleUsageReport,
    reportGenerateLoading,
    generateTokenID,
  } = useReportHandler();
  const [selectedReportTypes, setSelectedReportTypes] = useState([]);

  // Agent management hook
  const {
    // Existing user states
    selectedUserForAgents,
    allowedCampaigns,
    allowedMonetizePack,
    allowedAIAgents,
    setAllowedCampaigns,
    setAllowedMonetizePack,
    setAllowedAIAgents,

    // New user states
    newUserAllowedCampaigns,
    newUserAllowedMonetizePack,
    newUserAllowedAIAgents,
    setNewUserAllowedCampaigns,
    setNewUserAllowedMonetizePack,
    setNewUserAllowedAIAgents,

    // Loading states
    isFetchingUserConfig,
    isSavingUserConfig,

    // Existing user handlers
    handleSelectAllCampaigns,
    handleClearCampaigns,
    handleSelectAllMonetizePack,
    handleClearMonetizePack,
    handleSelectAllAIAgents,
    handleClearAIAgents,
    handleOpenAgentsDrawer,
    handleCloseAgentsDrawer,
    handleSaveAgentsConfig,

    // New user handlers
    handleSelectAllNewUserCampaigns,
    handleClearNewUserCampaigns,
    handleSelectAllNewUserMonetizePack,
    handleClearNewUserMonetizePack,
    handleSelectAllNewUserAIAgents,
    handleClearNewUserAIAgents,
    resetNewUserAgentStates,
    generateNewUserConfigurations,
  } = useAgentManagementHandler();

  const navigate = useNavigate();

  useEffect(() => {
    // sync form fields when allowed lists change (pre-check on load)
    if (isAgentsDrawerOpen && selectedUserForAgents) {
      agentsForm.setFieldsValue({
        allowedCampaigns,
        allowedMonetizePack,
        allowedAIAgents,
      });
    }
  }, [
    allowedCampaigns,
    allowedMonetizePack,
    allowedAIAgents,
    isAgentsDrawerOpen,
    selectedUserForAgents,
  ]);

  useEffect(() => {
    if (isDrawerOpen) {
      form.setFieldsValue({
        newUserAllowedCampaigns,
        newUserAllowedMonetizePack,
        newUserAllowedAIAgents,
      });
    }
  }, [newUserAllowedCampaigns, newUserAllowedMonetizePack, newUserAllowedAIAgents, isDrawerOpen]);

  const handleMenuClick = async (key, record) => {
    const token = await handleGenerateUserTokenForLogin(
      {
        _id: record._id,
      },
      key
    );
    if (token) {
      if (key === 'dashboard') {
        if (API_URL.includes('stg')) {
          window.open(`https://stg-dashboard.bridged.media/?accessToken=${token}`, '_blank');
        } else {
          window.open(`https://dashboard.bridged.media/?accessToken=${token}`, '_blank');
        }
      } else if (key === 'portal') {
        if (API_URL.includes('stg')) {
          window.open(`https://stg-portal.bridged.media/?accessToken=${token}`, '_blank');
        } else {
          window.open(`https://portal.bridged.media/?accessToken=${token}`, '_blank');
        }
      } else if (key === 'plugin') {
        window.postMessage(
          {
            source: 'qweek-website',
            payload: {
              type: 'LOGIN_TOKEN',
              token: token,
            },
          },
          '*'
        );
        window.addEventListener('message', event => {
          if (event.source !== window) return;

          const message = event.data;

          if (message?.source === 'qweek-website' && message.payload?.type === 'LOGIN_STATUS') {
            if (message.payload.status === 'success') {
              notification.success({
                message: 'Login Success',
                description: 'You have been logged in successfully.',
              });
            } else {
              notification.error({
                message: 'Login Failed',
                description: 'Failed to login. Please try again.',
              });
            }
          }
        });
      }
    } else {
      notification.error({
        message: 'Error',
        description: 'Failed to generate user token. Please try again.',
      });
    }
  };

  const handleOpenAgentsDrawerWrapper = async record => {
    await handleOpenAgentsDrawer(record);
    setIsAgentsDrawerOpen(true);
  };

  const handleCloseAgentsDrawerWrapper = () => {
    setIsAgentsDrawerOpen(false);
    agentsForm.resetFields();
    handleCloseAgentsDrawer();
  };

  const handleAddUserSubmit = async () => {
    const values = await form.validateFields();
    // Generate user configurations using the hook
    const userConfigurations = generateNewUserConfigurations();

    // Add userConfigurations to the payload
    const userDataWithConfig = {
      username: values.username,
      password: values.password,
      companyId: values.company,
      userConfigurations,
    };

    await handleAddUser(userDataWithConfig, handleCloseDrawer);
  };

  const handleCloseDrawer = () => {
    form.resetFields();
    setIsDrawerOpen(false);
    // Reset new user agent configuration states using the hook
    resetNewUserAgentStates();
  };

  const handleCloseReportDrawer = () => {
    reportForm.resetFields();
    setSelectedReportTypes([]);
    setIsExportReportOpen(false);
  };

  const handleGenerateReport = async () => {
    try {
      const values = await reportForm.validateFields();

      if (selectedReportTypes.includes('customer')) {
        await handleCustomerReport({
          startDate: values.dateRange[0].format('YYYY-MM-DD'),
          endDate: values.dateRange[1].format('YYYY-MM-DD'),
        });
      }
      if (selectedReportTypes.includes('productivity')) {
        await handleUsageReport({
          startDate: values.dateRange[0].format('YYYY-MM-DD'),
          endDate: values.dateRange[1].format('YYYY-MM-DD'),
          hostnames: values.domain,
        });
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
      await handleGenerateUserToken({
        _id: record._id,
      });
      setIsExportReportOpen(true);
    } catch (error) {
      console.error('Error generating user token:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to generate user token. Please try again.',
      });
    }
  };

  const openCreateDrawer = () =>
    dispatch(setCompaniesDrawerState({ open: true, mode: 'create', record: null }));

  const columns = [
    {
      title: 'Avatar',
      key: 'user',
      width: '70px',
      align: 'center',
      render: (_, record) => (
        <Space align="center">
          <Avatar src={record.picture} icon={<UserOutlined />} alt={record.fullname} size={40}>
            {record.fullname.charAt(0).toUpperCase()}
          </Avatar>
        </Space>
      ),
    },
    {
      title: 'User Email',
      dataIndex: 'email',
      key: 'email',
      width: '190px',
      render: (email, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Tooltip title={record?.status === 'active' ? 'Active user' : 'Inactive user'}>
            <span>
              {record?.status === 'active' ? (
                <Icon
                  name="PlayFilled"
                  className={record?.status === 'active' ? 'pulse-2' : ''}
                  style={{ width: '8px', height: '8px' }}
                />
              ) : (
                <Icon name="PauseFilled" style={{ width: '8px', height: '8px' }} />
              )}
            </span>
          </Tooltip>
          <span>
            <a href={`mailto:${email}`} className="linkTag">
              {email}
            </a>
          </span>
        </div>
      ),
    },
    {
      title: 'Full Name',
      dataIndex: 'fullname',
      key: 'fullname',
      width: '150px',
      render: fullname => (
        <span style={{ fontSize: '14px' }}>{fullname !== ' ' ? fullname : '--'}</span>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'last_login_at',
      key: 'last_login_at',
      align: 'center',
      width: '120px',
      render: date => <span style={{ fontSize: '14px' }}>{formatDate(date)}</span>,
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      width: '100px',
      align: 'center',
      render: company => <span style={{ fontSize: '14px' }}>{company ? company.name : '--'}</span>,
    },
    {
      title: 'Role',
      key: 'role',
      width: '100px',
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
      width: '180px',
      fixed: 'right',
      align: 'center',
      onHeaderCell: () => ({
        style: {
          backgroundColor: 'white',
          borderRight: '1px solid #f0f0f0',
        },
      }),
      render: (_, record) => (
        <Space>
          <Tooltip title={'Export Report'}>
            <Button
              type="text"
              shape="circle"
              disabled={isGeneratingTokenForLogin}
              onClick={() => {
                handleExportReportClick(record);
              }}
            >
              {isGeneratingToken && generateTokenID === record._id ? (
                <LoadingOutlined />
              ) : (
                getIcon('Export')
              )}
            </Button>
          </Tooltip>
          <Tooltip title={'View User Tasklist'}>
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
          <Tooltip title={'Agents Management'}>
            <Button
              type="text"
              shape="circle"
              onClick={() => handleOpenAgentsDrawerWrapper(record)}
            >
              {getIcon('SettingOutlined')}
            </Button>
          </Tooltip>
          <Tooltip title={'Login to Portal'}>
            <Button
              type="text"
              shape="circle"
              onClick={() => {
                handleMenuClick('portal', record);
              }}
            >
              {isGeneratingTokenForLogin &&
              generateTokenIDLogin &&
              tokenType === 'portal' &&
              generateTokenIDLogin === record._id ? (
                <LoadingOutlined />
              ) : (
                getIcon('ComputerOutlined')
              )}
            </Button>
          </Tooltip>
          <Tooltip title={'Login to Plugin'}>
            <Button
              type="text"
              shape="circle"
              onClick={() => {
                handleMenuClick('plugin', record);
              }}
            >
              {isGeneratingTokenForLogin &&
              generateTokenIDLogin &&
              tokenType === 'plugin' &&
              generateTokenIDLogin === record._id ? (
                <LoadingOutlined />
              ) : (
                <ChromeOutlined style={{ fontSize: '16px' }} />
              )}
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Row gutter={[15, 30]} justify="space-between" align="middle">
        <Col span={24}>
          <Title level={2} style={{ marginBottom: '24px', fontWeight: 300 }}>
            Users
          </Title>
        </Col>
        <Col span={24}>
          <Row gutter={[15, 15]} align="middle">
            {/* LEFT SIDE: Actions & Filters */}
            <Col xs={24} sm={24} md={16} lg={16} xl={18} xxl={18}>
              <Space size="middle" wrap style={{ width: '100%' }}>
                <Button
                  size="large"
                  type="primary"
                  onClick={() => setIsDrawerOpen(true)}
                  icon={<PlusOutlined />}
                >
                  Add User
                </Button>

                <Select
                  options={[
                    { label: 'Last login (Newest)', value: 'lastLogin_DESC' },
                    { label: 'Last login (Oldest)', value: 'lastLogin_ASC' },
                  ]}
                  size="large"
                  style={{ width: 175, minWidth: 150 }}
                  value={selectedSort}
                  onChange={value => setSelectedSort(value)}
                />

                <Select
                  ref={selectRef}
                  options={[
                    { label: 'All companies', value: 'all' },
                    ...(companies?.data?.data?.map(company => ({
                      label: company.name,
                      value: company.id,
                    })) || []),
                  ]}
                  loading={isLoadingCompanies}
                  showSearch
                  size="large"
                  value={selectedCompanyId}
                  style={{ width: 170, minWidth: 140 }}
                  placeholder="Select Company"
                  filterOption={false}
                  onChange={value => {
                    setSelectedCompanyId(value);
                    setTimeout(() => selectRef.current?.blur(), 0);
                  }}
                  onSearch={companySearchInputHandler}
                  onBlur={() => companySearchInputHandler('')}
                  dropdownRender={menu => (
                    <>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        block
                        onClick={() => openCreateDrawer()}
                      >
                        Add Company
                      </Button>
                    </>
                  )}
                />

                <Select
                  options={[
                    { label: 'All', value: 'all' },
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' },
                  ]}
                  size="large"
                  style={{ width: 130, minWidth: 110 }}
                  value={selectedStatus}
                  onChange={value => setSelectedStatus(value)}
                />
              </Space>
            </Col>

            <Col xs={24} sm={24} md={24} lg={8} xl={6} xxl={6}>
              <Input
                placeholder="Search by email"
                allowClear
                size="large"
                value={searchText}
                onChange={e => inputHandler(e.target.value)}
                style={{
                  width: '100%',
                }}
              />
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <Table
            columns={columns}
            dataSource={Array.isArray(users) ? users : []}
            rowKey="_id"
            loading={isLoading}
            bordered
            pagination={{
              current: page,
              pageSize: limit,
              total: total,
              position: ['bottomLeft'],
              showSizeChanger: false,
              showQuickJumper: false,
              onChange: handlePageChange,
            }}
            scroll={{ x: 990 }}
            locale={{
              emptyText: searchText
                ? `No users found matching "${searchText}"`
                : 'No users available',
            }}
          />
        </Col>
      </Row>

      <Drawer
        title="Add User"
        width={600}
        onClose={handleCloseDrawer}
        open={isDrawerOpen}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button size="large" onClick={handleCloseDrawer}>
                Close
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handleAddUserSubmit}
                loading={isAddingUser}
              >
                Add User
              </Button>
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
            <Input size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input the password!' }]}
          >
            <Input.Password size="large" />
          </Form.Item>
          <Form.Item
            name="company"
            label="Company"
            rules={[{ required: true, message: 'Please select the company!' }]}
          >
            <Select
              ref={companySelectRef}
              options={[
                { label: 'All', value: 'all' },
                ...(companies?.data?.data?.map(company => ({
                  label: company.name,
                  value: company.id,
                })) || []),
              ]}
              loading={isLoadingCompanies}
              showSearch
              size="large"
              placeholder="Select Company"
              filterOption={false}
              onChange={() => {
                // Remove focus after selection
                setTimeout(() => {
                  companySelectRef.current?.blur();
                }, 0);
              }}
              onSearch={companySearchInputHandler}
              onBlur={() => {
                companySearchInputHandler('');
              }}
            />
          </Form.Item>

          {/* Agent Management Section */}
          <Divider style={{ margin: '24px 0 16px' }} />

          <Alert
            type="info"
            showIcon
            message="Agent Access Control"
            description="Select agents you want to give access to this new user."
            style={{ marginBottom: 16 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={5} style={{ margin: 0 }}>
              Automate Pack
            </Title>
            <Space size={8}>
              <Badge
                count={`${newUserAllowedAIAgents.length}/${AUTOMATE_PACK_OPTIONS.length}`}
                style={{ backgroundColor: PRIMARY_COLOR }}
              />
              <Button size="small" onClick={handleSelectAllNewUserAIAgents} disabled={isAddingUser}>
                Select All
              </Button>
              <Button size="small" onClick={handleClearNewUserAIAgents} disabled={isAddingUser}>
                Clear
              </Button>
            </Space>
          </div>
          <Form.Item name="newUserAllowedAIAgents" style={{ marginTop: 12 }}>
            <Checkbox.Group
              options={AUTOMATE_PACK_OPTIONS}
              value={newUserAllowedAIAgents}
              onChange={setNewUserAllowedAIAgents}
              disabled={isAddingUser}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 8 }}
            />
          </Form.Item>
          <Divider style={{ margin: '8px 0 16px' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={5} style={{ margin: 0 }}>
              Engage Pack
            </Title>
            <Space size={8}>
              <Badge
                count={`${newUserAllowedCampaigns.length}/${ENGAGE_PACK_OPTIONS.length}`}
                style={{ backgroundColor: PRIMARY_COLOR }}
              />
              <Button
                size="small"
                onClick={handleSelectAllNewUserCampaigns}
                disabled={isAddingUser}
              >
                Select All
              </Button>
              <Button size="small" onClick={handleClearNewUserCampaigns} disabled={isAddingUser}>
                Clear
              </Button>
            </Space>
          </div>
          <Form.Item name="newUserAllowedCampaigns" style={{ marginTop: 12 }}>
            <Checkbox.Group
              options={ENGAGE_PACK_OPTIONS}
              value={newUserAllowedCampaigns}
              onChange={setNewUserAllowedCampaigns}
              disabled={isAddingUser}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 8 }}
            />
          </Form.Item>

          <Divider style={{ margin: '8px 0 16px' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={5} style={{ margin: 0 }}>
              Monetize Pack
            </Title>
            <Space size={8}>
              <Badge
                count={`${newUserAllowedMonetizePack.length}/${MONETIZE_PACK_OPTIONS.length}`}
                style={{ backgroundColor: PRIMARY_COLOR }}
              />
              <Button
                size="small"
                onClick={handleSelectAllNewUserMonetizePack}
                disabled={isAddingUser}
              >
                Select All
              </Button>
              <Button size="small" onClick={handleClearNewUserMonetizePack} disabled={isAddingUser}>
                Clear
              </Button>
            </Space>
          </div>
          <Form.Item name="newUserAllowedMonetizePack" style={{ marginTop: 12 }}>
            <Checkbox.Group
              options={MONETIZE_PACK_OPTIONS}
              value={newUserAllowedMonetizePack}
              onChange={setNewUserAllowedMonetizePack}
              disabled={isAddingUser}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 8 }}
            />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Agents Management Drawer */}
      <Drawer
        title={
          <Space direction="vertical" size={2}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              This user will have access to the selected agents
            </span>
            {selectedUserForAgents ? (
              <span style={{ color: '#888', fontSize: 12 }}>
                {selectedUserForAgents.fullname || ''}{' '}
                {selectedUserForAgents.email ? `(${selectedUserForAgents.email})` : ''}
              </span>
            ) : null}
          </Space>
        }
        width={500}
        onClose={handleCloseAgentsDrawerWrapper}
        open={isAgentsDrawerOpen}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button
                size="large"
                onClick={handleCloseAgentsDrawerWrapper}
                style={{ color: PRIMARY_COLOR }}
              >
                Close
              </Button>
              <Button
                size="large"
                type="primary"
                onClick={handleSaveAgentsConfig}
                loading={isSavingUserConfig}
                disabled={isFetchingUserConfig}
                style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
              >
                Save
              </Button>
            </Space>
          </div>
        }
      >
        <Spin spinning={isFetchingUserConfig} tip="Loading configuration...">
          <Alert
            type="info"
            showIcon
            message="Agent Access Control"
            description="Select agents you want to give access to this user."
            style={{ marginBottom: 16 }}
          />
          <Form form={agentsForm} layout="vertical">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={5} style={{ margin: 0 }}>
                Automate Pack
              </Title>
              <Space size={8}>
                <Badge
                  count={`${allowedAIAgents.length}/${AUTOMATE_PACK_OPTIONS.length}`}
                  style={{ backgroundColor: PRIMARY_COLOR }}
                />
                <Button
                  size="small"
                  onClick={handleSelectAllAIAgents}
                  disabled={isFetchingUserConfig || isSavingUserConfig}
                >
                  Select All
                </Button>
                <Button
                  size="small"
                  onClick={handleClearAIAgents}
                  disabled={isFetchingUserConfig || isSavingUserConfig}
                >
                  Clear
                </Button>
              </Space>
            </div>
            <Form.Item name="allowedAIAgents" style={{ marginTop: 12 }}>
              <Checkbox.Group
                options={AUTOMATE_PACK_OPTIONS}
                value={allowedAIAgents}
                onChange={setAllowedAIAgents}
                disabled={isFetchingUserConfig}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 8 }}
              />
            </Form.Item>

            <Divider style={{ margin: '8px 0 16px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={5} style={{ margin: 0 }}>
                Engage Pack
              </Title>
              <Space size={8}>
                <Badge
                  count={`${allowedCampaigns.length}/${ENGAGE_PACK_OPTIONS.length}`}
                  style={{ backgroundColor: PRIMARY_COLOR }}
                />
                <Button
                  size="small"
                  onClick={handleSelectAllCampaigns}
                  disabled={isFetchingUserConfig || isSavingUserConfig}
                >
                  Select All
                </Button>
                <Button
                  size="small"
                  onClick={handleClearCampaigns}
                  disabled={isFetchingUserConfig || isSavingUserConfig}
                >
                  Clear
                </Button>
              </Space>
            </div>
            <Form.Item name="allowedCampaigns" style={{ marginTop: 12 }}>
              <Checkbox.Group
                options={ENGAGE_PACK_OPTIONS}
                value={allowedCampaigns}
                onChange={setAllowedCampaigns}
                disabled={isFetchingUserConfig}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 8 }}
              />
            </Form.Item>

            <Divider style={{ margin: '8px 0 16px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={5} style={{ margin: 0 }}>
                Monetize Pack
              </Title>
              <Space size={8}>
                <Badge
                  count={`${allowedMonetizePack.length}/${MONETIZE_PACK_OPTIONS.length}`}
                  style={{ backgroundColor: PRIMARY_COLOR }}
                />
                <Button
                  size="small"
                  onClick={handleSelectAllMonetizePack}
                  disabled={isFetchingUserConfig || isSavingUserConfig}
                >
                  Select All
                </Button>
                <Button
                  size="small"
                  onClick={handleClearMonetizePack}
                  disabled={isFetchingUserConfig || isSavingUserConfig}
                >
                  Clear
                </Button>
              </Space>
            </div>
            <Form.Item name="allowedMonetizePack" style={{ marginTop: 12 }}>
              <Checkbox.Group
                options={MONETIZE_PACK_OPTIONS}
                value={allowedMonetizePack}
                onChange={setAllowedMonetizePack}
                disabled={isFetchingUserConfig}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 8 }}
              />
            </Form.Item>
          </Form>
        </Spin>
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
              <Button size="large" onClick={handleCloseReportDrawer}>
                Close
              </Button>
              <Button
                size="large"
                type="primary"
                onClick={handleGenerateReport}
                loading={reportGenerateLoading}
              >
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

      {/* add company drawer */}
      <CompaniesWorkflow isUsersDashboard={true} />
    </>
  );
}

export default DashboardWorkflow;
