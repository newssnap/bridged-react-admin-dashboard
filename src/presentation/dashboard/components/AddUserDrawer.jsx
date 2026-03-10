import React, { useEffect, useRef, useState } from 'react';
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
  notification,
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useGetTeamsByCompanyQuery, useUploadImageMutation } from '../../../services/api';
import { AGENT_ACCESS_OPTIONS } from '../../../constants/agents';

const AddUserDrawer = ({
  open,
  onClose,
  form,
  onSubmit,
  companies,
  isLoadingCompanies,
  companySearchText,
  companySearchInputHandler,
  hasCompanies,
  createCompany,
  isCreatingCompany,
  companySelectRef,
  isAddingUser,
  resetNewUserAgentStates,
  newUserAllowedAgents,
  setNewUserAllowedAgents,
}) => {
  const fileInputRef = useRef(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');

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
          rules={[{ required: true, message: 'Please select the company!' }]}
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
            notFoundContent={
              !isLoadingCompanies && !hasCompanies ? (
                <div
                  style={{
                    borderRadius: 8,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 120,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      marginBottom: 20,
                      textAlign: 'center',
                    }}
                  >
                    No companies found.
                  </div>
                  <Button
                    type="primary"
                    size="middle"
                    style={{ minWidth: 140 }}
                    onClick={() => createCompany?.({ name: companySearchText ?? '' })}
                    loading={isCreatingCompany}
                  >
                    Create "{companySearchText || 'company'}"
                  </Button>
                </div>
              ) : null
            }
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
      </Form>
    </Drawer>
  );
};

export default AddUserDrawer;
