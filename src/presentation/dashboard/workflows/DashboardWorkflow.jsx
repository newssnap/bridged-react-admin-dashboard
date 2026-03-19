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
  Popconfirm,
  Dropdown,
  Modal,
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  LoadingOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Icon from '../../../utils/components/Icon';
import { useDashboardHandler } from '../controllers/useDashboardHandler';
import useUsersTableHandler from '../controllers/useUsersTableHandler';
import useDebouncedInput from '../../../utils/controllers/useDebouncedInput';
import { useReportHandler } from '../controllers/useReportHandler';
import { useAgentManagementHandler } from '../controllers/useAgentManagementHandler';
import { useState, useMemo, useEffect, useRef } from 'react';
import { ACTIVE_COLOR } from '../../../constants/DashboardColors';
import formatDate from '../../../utils/formatting/formateDate';
import { ChromeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../../config/Config';
import {
  useCreateCompanyMutation,
  useGetCompaniesQuery,
  useGetTeamsQuery,
  useLazyGetUserForUpdateByAdminQuery,
  useUpdateUserByAdminMutation,
} from '../../../services/api';
import CompaniesWorkflow from '../../companies/workflows/CompaniesWorkflow';
import { setCompaniesDrawerState } from '../../../redux/slices/companiesSlice';
import { useDispatch } from 'react-redux';
import AddUserDrawer from '../components/AddUserDrawer';
import EditUserDrawer from '../components/EditUserDrawer';
const { Title } = Typography;
const { RangePicker } = DatePicker;

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

  const [_CREATE_COMPANY, { isLoading: isCreatingCompany }] = useCreateCompanyMutation();

  const [selectedCompanyId, setSelectedCompanyId] = useState('all');
  const [selectedTeamId, setSelectedTeamId] = useState('all');
  const {
    users,
    total,
    page,
    limit,
    handlePageChange,
    refetchUsers,
    isLoading,
    isStatusLoading,
    handleUpdateUserStatus,
  } = useUsersTableHandler(
    debouncedSearchText,
    selectedCompanyId,
    selectedTeamId,
    'all',
    'lastLogin_DESC'
  );

  const {
    data: companies,
    isLoading: isLoadingCompanies,
    refetch: refetchCompanies,
  } = useGetCompaniesQuery({
    page: 1,
    limit: 100,
    search: debouncedCompanySearchText || '',
  });

  const { data: teamsData, isLoading: isLoadingTeams } = useGetTeamsQuery();
  const teamsList = teamsData?.data ?? [];
  const teamOptions = [
    { label: 'All teams', value: 'all' },
    ...teamsList.map(team => ({
      label: team.title || team.companyName || team._id || '--',
      value: team._id,
    })),
  ];

  const {
    handleAddUser,
    isAddingUser,
    handleGenerateUserTokenForLogin,
    isGeneratingTokenForLogin,
    generateTokenIDLogin,
    tokenType,
  } = useDashboardHandler();

  const [isAddUserDrawerOpen, setIsAddUserDrawerOpen] = useState(false);
  const [isEditUserDrawerOpen, setIsEditUserDrawerOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserData, setEditingUserData] = useState(null);
  const selectRef = useRef(null);
  const companySelectRef = useRef(null);
  const [isExportReportOpen, setIsExportReportOpen] = useState(false);
  const [addUserForm] = Form.useForm();
  const [editUserForm] = Form.useForm();
  const [reportForm] = Form.useForm();
  const [_GET_USER_FOR_UPDATE, { isFetching: isFetchingUserForUpdate }] =
    useLazyGetUserForUpdateByAdminQuery();
  const [_UPDATE_USER, { isLoading: isUpdatingUser }] = useUpdateUserByAdminMutation();

  const hasCompanies = Array.isArray(companies?.data?.data) && companies.data.data.length > 0;

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
    // Existing user states (edit drawer – simplified same as Add User)
    allowedAgents,
    setAllowedAgents,
    resetExistingUserAgentStates,
    initializeExistingUserAgentStates,
    generateExistingUserConfigurations,

    // New user states (simplified agent access)
    newUserAllowedAgents,
    setNewUserAllowedAgents,

    resetNewUserAgentStates,
    generateNewUserConfigurations,
  } = useAgentManagementHandler();

  const navigate = useNavigate();

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

  const handleAddUserSubmit = async values => {
    const userConfigurations = generateNewUserConfigurations();
    const userDataWithConfig = {
      username: values.username,
      password: values.password,
      userConfigurations,
      firstName: values.firstName ?? '',
      lastName: values.lastName ?? '',
      profilePhoto: values.profilePhoto ?? '',
      teamId: values.teamId ?? '',
    };
    await handleAddUser(userDataWithConfig, handleCloseAddUserDrawer);
    refetchUsers();
  };

  const handleUpdateUserSubmit = async values => {
    if (!editingUserId) return;
    try {
      const data = {
        userConfigurations: generateExistingUserConfigurations(),
        ...(values.password ? { password: values.password } : {}),
        ...(values.firstName != null && { firstName: values.firstName }),
        ...(values.lastName != null && { lastName: values.lastName }),
        ...(values.profilePhoto != null &&
          values.profilePhoto !== '' && { profilePhoto: values.profilePhoto }),
      };

      const response = await _UPDATE_USER({ userId: editingUserId, data }).unwrap();

      if (response?.success) {
        notification.success({
          message: 'User updated successfully',
          placement: 'bottomRight',
        });
        handleCloseEditUserDrawer();
        refetchUsers();
      } else {
        notification.error({
          message: response?.errorObject?.userErrorText || 'Failed to update user',
          placement: 'bottomRight',
        });
      }
    } catch (error) {
      notification.error({
        message: error?.data?.errorObject?.userErrorText || 'Failed to update user',
        placement: 'bottomRight',
      });
    }
  };

  const handleOpenCreateUserDrawer = () => {
    setEditingUserId(null);
    addUserForm.resetFields();
    resetNewUserAgentStates();
    setIsAddUserDrawerOpen(true);
  };

  const handleOpenEditUserDrawer = async record => {
    setEditingUserId(record?._id);
    setIsEditUserDrawerOpen(true);
    setEditingUserData(null);
    resetExistingUserAgentStates();

    editUserForm.setFieldsValue({
      username: record?.email || '',
      password: '',
      firstName: '',
      lastName: '',
      profilePhoto: '',
    });

    try {
      const response = await _GET_USER_FOR_UPDATE(record?._id).unwrap();
      if (response?.success) {
        const user = response?.data;
        setEditingUserData(user);
        initializeExistingUserAgentStates(user?.userConfigurations);
        const fullname = (user?.fullname || '').trim();
        const nameParts = fullname ? fullname.split(/\s+/) : [];
        const firstName = nameParts[0] ?? '';
        const lastName = nameParts.slice(1).join(' ') ?? '';
        editUserForm.setFieldsValue({
          username: user?.email || record?.email || '',
          password: '',
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          profilePhoto: user?.picture || user?.profilePhoto || undefined,
        });
      } else {
        notification.error({
          message: response?.errorObject?.userErrorText || 'Failed to fetch user for update',
          placement: 'bottomRight',
        });
      }
    } catch (error) {
      notification.error({
        message: error?.data?.errorObject?.userErrorText || 'Failed to fetch user for update',
        placement: 'bottomRight',
      });
    }
  };

  const handleCloseAddUserDrawer = () => {
    addUserForm.resetFields();
    setIsAddUserDrawerOpen(false);
    setEditingUserId(null);
    resetNewUserAgentStates();
  };

  const handleCloseEditUserDrawer = () => {
    editUserForm.resetFields();
    setIsEditUserDrawerOpen(false);
    setEditingUserId(null);
    setEditingUserData(null);
    resetExistingUserAgentStates();
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

  const openCreateDrawer = (companyName = null) =>
    dispatch(
      setCompaniesDrawerState({ open: true, mode: 'create', record: { name: companyName } })
    );
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const createCompany = async values => {
    try {
      const result = await _CREATE_COMPANY(values.name).unwrap();

      notification.success({
        message: 'Company created successfully',
        placement: 'bottomRight',
        showProgress: true,
      });

      // Call handleCompanyCreated to select the newly created company
      await handleCompanyCreated(result);

      return result;
    } catch (error) {
      notification.error({
        message: error?.data?.errorObject?.userErrorText || 'Failed to create company',
        placement: 'bottomRight',
        showProgress: true,
      });
    }
  };

  const handleCompanyCreated = async createdCompany => {
    if (createdCompany) {
      // Get the company ID from the response
      // The response structure may vary, so we'll check multiple possible fields
      const companyId =
        createdCompany?.id ||
        createdCompany?.data?.id ||
        createdCompany?.data?.data?.id ||
        createdCompany?._id;

      if (companyId) {
        // Refetch companies to ensure the new company appears in the list
        await refetchCompanies();

        // Small delay to ensure the select options are updated
        setTimeout(() => {
          if (isAddUserDrawerOpen) {
            addUserForm.setFieldValue('company', companyId);
          }
        }, 100);
      }
    }
  };

  const showStatusConfirmModal = record => {
    Modal.confirm({
      title: record?.status === 'inactive' ? 'Activate user?' : 'Deactivate user?',
      content:
        record?.status === 'inactive'
          ? 'Are you sure you want to activate this user?'
          : 'Are you sure you want to deactivate this user?',
      okText: record?.status === 'inactive' ? 'Activate' : 'Deactivate',
      okButtonProps: {
        danger: record?.status !== 'inactive',
      },
      cancelText: 'Cancel',
      centered: true,
      type: 'warning',
      onOk: () => {
        handleUpdateUserStatus(
          record._id,
          record?.status === 'inactive' ? 'activate' : 'deactivate'
        );
        setOpenDropdownId(null);
      },
    });
  };

  const columns = [
    {
      title: 'Image',
      key: 'user',
      width: '50px',
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
      title: 'Email',
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
      title: 'Role',
      key: 'role',
      width: '100px',
      align: 'center',
      render: (_, record) => {
        if (record.teamId) {
          return (
            <Tag color={record.isTeamOwner ? 'blue' : 'default'} style={{ textAlign: 'center' }}>
              {record.isTeamOwner ? 'Team Owner' : 'Member'}
            </Tag>
          );
        } else {
          return (
            <Tooltip title="This user is not part of a team, if you login with this account, a team will be created for them.">
              <Tag color="orange" style={{ textAlign: 'center' }}>
                Not Set
              </Tag>
            </Tooltip>
          );
        }
      },
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
      title: 'Team',
      dataIndex: 'teamTitle',
      key: 'teamTitle',
      width: '100px',
      align: 'center',
      render: (_, record) => (
        <span style={{ fontSize: '14px' }}>{record?.teamTitle ? record?.teamTitle : '--'}</span>
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
      title: 'Actions',
      key: 'actions',
      width: '75px',
      fixed: 'right',
      align: 'center',
      onHeaderCell: () => ({
        style: {
          backgroundColor: 'white',
          borderRight: '1px solid #f0f0f0',
        },
      }),
      render: (_, record) => {
        const menuItems = [
          {
            key: 'edit',
            label: (
              <Space>
                <Icon name="EditOutlined" style={{ marginBottom: '-3px' }} />
                <span>Edit User</span>
              </Space>
            ),
            onClick: async () => {
              setOpenDropdownId(null);
              await handleOpenEditUserDrawer(record);
            },
          },
          {
            key: 'export',
            label: (
              <Space align="center">
                {isGeneratingToken && generateTokenID === record._id ? (
                  <LoadingOutlined />
                ) : (
                  <Icon name="Export" style={{ marginBottom: '-3px' }} />
                )}
                <span>Export Report</span>
              </Space>
            ),
            disabled: isGeneratingTokenForLogin,
            onClick: () => {
              handleExportReportClick(record);
            },
          },
          // {
          //   key: 'tasklist',
          //   label: (
          //     <Space>
          //       <Icon name="UserCheck" style={{ marginBottom: '-3px' }} />
          //       <span>View User Tasklist</span>
          //     </Space>
          //   ),
          //   onClick: () => {
          //     navigate(`/userChecklist/${record._id}`);
          //   },
          // },
          {
            key: 'portal',
            label: (
              <Space>
                {isGeneratingTokenForLogin &&
                generateTokenIDLogin &&
                tokenType === 'portal' &&
                generateTokenIDLogin === record._id ? (
                  <LoadingOutlined />
                ) : (
                  <Icon name="ComputerOutlined" style={{ marginBottom: '-3px' }} />
                )}
                <span>Login to Portal</span>
              </Space>
            ),
            onClick: () => {
              handleMenuClick('portal', record);
            },
          },
          {
            key: 'plugin',
            label: (
              <Space>
                {isGeneratingTokenForLogin &&
                generateTokenIDLogin &&
                tokenType === 'plugin' &&
                generateTokenIDLogin === record._id ? (
                  <LoadingOutlined />
                ) : (
                  <ChromeOutlined style={{ fontSize: '15px' }} />
                )}
                <span>Login to Plugin</span>
              </Space>
            ),
            onClick: () => {
              handleMenuClick('plugin', record);
            },
          },
          {
            type: 'divider',
          },
          {
            key: record?.status === 'inactive' ? 'activate' : 'deactivate',
            label: (
              <Space
                onClick={e => {
                  e.stopPropagation();
                  showStatusConfirmModal(record);
                }}
              >
                {record?.status === 'inactive' ? (
                  <>
                    <Icon name="PlayOutlined" style={{ marginBottom: '-2px' }} />
                    <span>Activate User</span>
                  </>
                ) : (
                  <>
                    <Icon name="PauseOutlined" style={{ marginBottom: '-2px' }} />
                    <span>Deactivate User</span>
                  </>
                )}
              </Space>
            ),
          },
        ];

        return (
          <Dropdown
            open={openDropdownId === record._id}
            onOpenChange={open => {
              if (!open) {
                setOpenDropdownId(null);
              }
            }}
            menu={{ items: menuItems }}
            trigger={['click']}
            arrow
            placement="bottomRight"
          >
            <Button
              type="text"
              shape="circle"
              icon={<MoreOutlined />}
              onClick={e => {
                e.stopPropagation();
                setOpenDropdownId(record._id);
              }}
            />
          </Dropdown>
        );
      },
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
                  onClick={handleOpenCreateUserDrawer}
                  icon={<PlusOutlined />}
                >
                  Add User
                </Button>

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
                  options={teamOptions}
                  loading={isLoadingTeams}
                  showSearch
                  optionFilterProp="label"
                  size="large"
                  value={selectedTeamId}
                  style={{ width: 170, minWidth: 140 }}
                  placeholder="Select Team"
                  allowClear
                  onChange={value => setSelectedTeamId(value)}
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

      <AddUserDrawer
        open={isAddUserDrawerOpen}
        onClose={handleCloseAddUserDrawer}
        form={addUserForm}
        onSubmit={handleAddUserSubmit}
        companies={companies}
        isLoadingCompanies={isLoadingCompanies}
        companySearchText={companySearchText}
        companySearchInputHandler={companySearchInputHandler}
        hasCompanies={hasCompanies}
        createCompany={createCompany}
        isCreatingCompany={isCreatingCompany}
        companySelectRef={companySelectRef}
        isAddingUser={isAddingUser}
        resetNewUserAgentStates={resetNewUserAgentStates}
        newUserAllowedAgents={newUserAllowedAgents}
        setNewUserAllowedAgents={setNewUserAllowedAgents}
      />

      <EditUserDrawer
        open={isEditUserDrawerOpen}
        onClose={handleCloseEditUserDrawer}
        form={editUserForm}
        onSubmit={handleUpdateUserSubmit}
        isFetchingUserForUpdate={isFetchingUserForUpdate}
        isUpdatingUser={isUpdatingUser}
        userData={editingUserData}
        allowedAgents={allowedAgents}
        setAllowedAgents={setAllowedAgents}
        resetExistingUserAgentStates={resetExistingUserAgentStates}
      />

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
