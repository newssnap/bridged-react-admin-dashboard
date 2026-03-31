import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  Space,
  Divider,
  Alert,
  Avatar,
  Card,
  Checkbox,
  Tag,
  Typography,
  notification,
} from 'antd';
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import { useGetTeamsByCompanyQuery, useUploadImageMutation } from '../../../services/api';
import { AGENT_ACCESS_OPTIONS } from '../../../constants/agents';
import { PlaybookType, agentTypesForPlaybooks } from '../../../constants/playbooks';

const AddUserDrawer = ({
  open,
  onClose,
  form,
  onSubmit,
  companies,
  isLoadingCompanies,
  companySearchInputHandler,
  createCompany,
  isCreatingCompany,
  companySelectRef,
  isAddingUser,
  resetNewUserAgentStates,
  newUserAllowedAgents,
  setNewUserAllowedAgents,
}) => {
  const fileInputRef = useRef(null);
  const companyInlineInputRef = useRef(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [isPlaybookDrawerOpen, setIsPlaybookDrawerOpen] = useState(false);
  const [selectedPlaybooks, setSelectedPlaybooks] = useState([]);
  const [draftSelectedPlaybooks, setDraftSelectedPlaybooks] = useState([]);

  const playbooks = useMemo(() => Object.values(PlaybookType ?? {}), []);
  const playbookAgentLabelMap = useMemo(() => {
    const labels = {};
    agentTypesForPlaybooks?.forEach(agent => {
      labels[agent.value] = agent.label;
    });
    AGENT_ACCESS_OPTIONS?.forEach(agent => {
      if (!labels[agent.value]) {
        labels[agent.value] = agent.label;
      }
    });
    return labels;
  }, []);

  const selectedCompanyId = Form.useWatch('company', form);
  const { data: teamsResponse, isLoading: isLoadingTeams } = useGetTeamsByCompanyQuery(
    selectedCompanyId,
    { skip: !open || !selectedCompanyId }
  );
  const teamsList = teamsResponse?.data ?? [];
  const teamOptions = teamsList.map(team => ({
    label: team.title || team.companyName || team._id || '--',
    value: team._id,
  }));

  const [uploadImage, { isLoading: isUploadingImage }] = useUploadImageMutation();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ newUserAllowedAgents });
    }
  }, [newUserAllowedAgents, open, form]);

  useEffect(() => {
    if (open) {
      const formPlaybooks = form.getFieldValue('assignedPlaybooks') || [];
      setSelectedPlaybooks(formPlaybooks);
      setDraftSelectedPlaybooks(formPlaybooks);
    }
  }, [open, form]);

  useEffect(() => {
    setProfilePhotoUrl(open ? form.getFieldValue('profilePhoto') || '' : '');
  }, [open, form]);

  const handleFinish = async () => {
    const values = await form.validateFields();
    onSubmit?.(values);
  };

  const handleAfterOpenChange = isDrawerOpen => {
    if (!isDrawerOpen) {
      form.resetFields();
      setProfilePhotoUrl('');
      setSelectedPlaybooks([]);
      setDraftSelectedPlaybooks([]);
      setIsPlaybookDrawerOpen(false);
      resetNewUserAgentStates?.();
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await uploadImage(formData).unwrap();
      if (response?.success && response?.data) {
        const url = typeof response.data === 'string' ? response.data : response.data?.url;
        if (url) {
          form.setFieldValue('profilePhoto', url);
          setProfilePhotoUrl(url);
        } else {
          notification.error({
            message: 'Upload failed',
            description: 'Invalid response from server',
          });
        }
      } else {
        notification.error({
          message: 'Error uploading image',
          description: response?.message || 'Upload failed',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Error uploading image',
        description: error?.data?.message || 'Something went wrong',
      });
    }
    e.target.value = '';
  };

  const handleCompanyChange = value => {
    form.setFieldValue('teamId', undefined);
    setTimeout(() => companySelectRef.current?.blur(), 0);
  };

  const getCreatedCompanyId = createdCompany =>
    createdCompany?.id ||
    createdCompany?.data?.id ||
    createdCompany?.data?.data?.id ||
    createdCompany?._id;

  const handleAddCompany = async event => {
    event.preventDefault();
    const companyName = newCompanyName.trim();

    if (!companyName) {
      notification.warning({
        message: 'Company name is required',
      });
      return;
    }

    const createdCompany = await createCompany?.({ name: companyName });
    const createdCompanyId = getCreatedCompanyId(createdCompany);
    setNewCompanyName('');

    if (createdCompanyId) {
      form.setFieldValue('company', createdCompanyId);
      form.setFieldValue('teamId', undefined);
      setTimeout(() => {
        companyInlineInputRef.current?.focus();
      }, 0);
    }
  };

  const openPlaybooksDrawer = () => {
    setDraftSelectedPlaybooks(selectedPlaybooks);
    setIsPlaybookDrawerOpen(true);
  };

  const closePlaybooksDrawer = () => {
    setIsPlaybookDrawerOpen(false);
  };

  const applyPlaybooksSelection = () => {
    setSelectedPlaybooks(draftSelectedPlaybooks);
    form.setFieldValue('assignedPlaybooks', draftSelectedPlaybooks);
    setIsPlaybookDrawerOpen(false);
  };

  const handlePlaybookToggle = (playbookValue, checked) => {
    setDraftSelectedPlaybooks(prev =>
      checked
        ? [...new Set([...prev, playbookValue])]
        : prev.filter(value => value !== playbookValue)
    );
  };

  return (
    <Drawer
      title="Add User"
      width={600}
      onClose={onClose}
      afterOpenChange={handleAfterOpenChange}
      open={open}
      bodyStyle={{ paddingBottom: 80 }}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button size="large" onClick={onClose}>
              Close
            </Button>
            <Button type="primary" size="large" onClick={handleFinish} loading={isAddingUser}>
              Add User
            </Button>
          </Space>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item name="profilePhoto" hidden>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="assignedPlaybooks" hidden>
          <Input type="hidden" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 24 }}>
          <Space direction="vertical" align="center" style={{ width: '100%' }}>
            <Avatar
              size={80}
              src={profilePhotoUrl || undefined}
              icon={!profilePhotoUrl && <UserOutlined />}
              style={{ backgroundColor: profilePhotoUrl ? 'transparent' : '#f0f0f0' }}
            />
            <Button type="link" onClick={handleProfilePictureClick} loading={isUploadingImage}>
              Add profile picture
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </Space>
        </Form.Item>

        <Form.Item name="firstName" label="First name">
          <Input size="large" placeholder="First name" />
        </Form.Item>
        <Form.Item name="lastName" label="Last name">
          <Input size="large" placeholder="Last name" />
        </Form.Item>

        <Form.Item
          name="username"
          label="Username"
          rules={[
            { required: true, message: 'Please input the username!' },
            { type: 'email', message: 'Please enter a valid email address!' },
          ]}
        >
          <Input size="large" placeholder="email@example.com" />
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
          rules={[{ required: false, message: 'Please select the company!' }]}
        >
          <Select
            ref={companySelectRef}
            options={
              companies?.data?.data?.map(company => ({
                label: company.name,
                value: company.id,
              })) || []
            }
            loading={isLoadingCompanies}
            showSearch
            size="large"
            placeholder="Select Company"
            filterOption={false}
            onChange={handleCompanyChange}
            onSearch={companySearchInputHandler}
            onBlur={() => companySearchInputHandler?.('')}
            dropdownRender={menu => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <Space.Compact block>
                  <Input
                    placeholder="Enter company name"
                    ref={companyInlineInputRef}
                    value={newCompanyName}
                    onChange={e => setNewCompanyName(e.target.value)}
                    onKeyDown={e => e.stopPropagation()}
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    loading={isCreatingCompany}
                    onClick={handleAddCompany}
                  >
                    Add
                  </Button>
                </Space.Compact>
              </>
            )}
          />
        </Form.Item>

        <Form.Item name="teamId" label="Team">
          <Select
            size="large"
            placeholder="Select Team"
            options={teamOptions}
            loading={isLoadingTeams}
            disabled={!selectedCompanyId}
            allowClear
          />
        </Form.Item>
        <Form.Item name="newUserAllowedAgents" label="Agents Access Control">
          <Select
            mode="multiple"
            size="large"
            placeholder="Select agents"
            options={AGENT_ACCESS_OPTIONS}
            value={newUserAllowedAgents}
            onChange={setNewUserAllowedAgents}
            disabled={isAddingUser}
            allowClear
          />
        </Form.Item>
        <Form.Item label="Assign Playbooks">
          <Space direction="vertical" style={{ width: '100%' }} size={8}>
            <Button size="large" onClick={openPlaybooksDrawer}>
              Assign Playbooks {selectedPlaybooks.length > 0 ? `(${selectedPlaybooks.length})` : ''}
            </Button>
            <Typography.Text type="secondary">
              {selectedPlaybooks.length > 0
                ? `${selectedPlaybooks.length} playbook(s) selected`
                : 'No playbook selected'}
            </Typography.Text>
          </Space>
        </Form.Item>
      </Form>

      <Drawer
        title="Assign Playbooks"
        width={720}
        onClose={closePlaybooksDrawer}
        open={isPlaybookDrawerOpen}
        destroyOnClose={false}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography.Text type="secondary">
              {draftSelectedPlaybooks.length} playbook(s) selected
            </Typography.Text>
            <Space>
              <Button onClick={closePlaybooksDrawer}>Cancel</Button>
              <Button type="primary" onClick={applyPlaybooksSelection}>
                Apply
              </Button>
            </Space>
          </div>
        }
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {playbooks.map(playbook => {
            const IconComponent = playbook.icon;
            const isChecked = draftSelectedPlaybooks.includes(playbook.value);
            const playbookAgents = (playbook.agentTypes || []).map(agentType => ({
              value: agentType,
              label: playbookAgentLabelMap[agentType] || agentType,
              description: playbook.agentDescriptions?.[agentType] || '',
            }));

            return (
              <Card
                key={playbook.value}
                size="small"
                hoverable
                onClick={() => handlePlaybookToggle(playbook.value, !isChecked)}
                style={{
                  borderColor: isChecked ? '#1677ff' : undefined,
                  backgroundColor: isChecked ? '#f0f7ff' : undefined,
                  cursor: 'pointer',
                }}
              >
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                      <Checkbox
                        checked={isChecked}
                        onChange={event =>
                          handlePlaybookToggle(playbook.value, event.target.checked)
                        }
                        onClick={event => event.stopPropagation()}
                      />
                      <Space>
                        {IconComponent ? <IconComponent style={{ color: '#1677ff' }} /> : null}
                        <Typography.Text strong>{playbook.title}</Typography.Text>
                      </Space>
                    </Space>
                  </Space>

                  <Typography.Text type="secondary">{playbook.longDescription}</Typography.Text>

                  <Space wrap>
                    {playbookAgents.map(agent => (
                      <Tag key={`${playbook.value}-${agent.value}`} color="blue">
                        {agent.label}
                      </Tag>
                    ))}
                  </Space>

                  <Space direction="vertical" size={4}>
                    {playbookAgents.map(agent => (
                      <Typography.Text key={`${playbook.value}-${agent.value}-description`}>
                        <strong>{agent.label}:</strong> {agent.description || 'No description'}
                      </Typography.Text>
                    ))}
                  </Space>
                </Space>
              </Card>
            );
          })}
        </Space>
      </Drawer>
    </Drawer>
  );
};

export default AddUserDrawer;
