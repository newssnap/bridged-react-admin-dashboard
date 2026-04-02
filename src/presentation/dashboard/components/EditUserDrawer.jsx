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
  Spin,
  Avatar,
  notification,
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useGetTeamsByCompanyQuery, useUploadImageMutation } from '../../../services/api';
import { AGENT_ACCESS_OPTIONS } from '../../../constants/agents';

const EditUserDrawer = ({
  open,
  onClose,
  form,
  onSubmit,
  isFetchingUserForUpdate,
  isUpdatingUser,
  allowedAgents,
  setAllowedAgents,
  resetExistingUserAgentStates,
  userData,
  companies,
  isLoadingCompanies,
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
      form.setFieldsValue({ allowedAgents });
    }
  }, [allowedAgents, open, form]);

  useEffect(() => {
    if (open && userData) {
      setProfilePhotoUrl(userData.picture || userData.profilePhoto || '');
    }
    if (!open) {
      setProfilePhotoUrl('');
    }
  }, [open, userData]);

  const handleFinish = async () => {
    const values = await form.validateFields();
    onSubmit?.(values);
  };

  const handleAfterOpenChange = isDrawerOpen => {
    if (!isDrawerOpen) {
      form.resetFields();
      setProfilePhotoUrl('');
      resetExistingUserAgentStates?.();
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

  const displayPicture = profilePhotoUrl || userData?.picture || userData?.profilePhoto;
  const handleCompanyChange = () => {
    form.setFieldValue('teamId', undefined);
  };

  return (
    <Drawer
      title="Edit User"
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
            <Button type="primary" size="large" onClick={handleFinish} loading={isUpdatingUser}>
              Update User
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
              src={displayPicture || undefined}
              icon={!displayPicture && <UserOutlined />}
              style={{ backgroundColor: displayPicture ? 'transparent' : '#f0f0f0' }}
            />
            <Button
              type="link"
              onClick={handleProfilePictureClick}
              loading={isUploadingImage}
              disabled={isFetchingUserForUpdate}
            >
              Change profile picture
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
          <Input size="large" placeholder="First name" disabled={isFetchingUserForUpdate} />
        </Form.Item>
        <Form.Item name="lastName" label="Last name">
          <Input size="large" placeholder="Last name" disabled={isFetchingUserForUpdate} />
        </Form.Item>

        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: 'Please input the username!' }]}
        >
          <Input size="large" disabled />
        </Form.Item>
        <Form.Item name="password" label="New Password (optional)">
          <Input.Password size="large" disabled={isFetchingUserForUpdate} />
        </Form.Item>
        <Form.Item name="company" label="Company">
          <Select
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
            optionFilterProp="label"
            onChange={handleCompanyChange}
            disabled={isFetchingUserForUpdate || isUpdatingUser}
            allowClear
          />
        </Form.Item>
        <Form.Item name="teamId" label="Team">
          <Select
            size="large"
            placeholder="Select Team"
            options={teamOptions}
            loading={isLoadingTeams}
            disabled={!selectedCompanyId || isFetchingUserForUpdate || isUpdatingUser}
            allowClear
          />
        </Form.Item>

        {/* <Spin spinning={isFetchingUserForUpdate} tip="Loading configuration...">
          <Form.Item name="allowedAgents" label="Agents">
            <Select
              mode="multiple"
              size="large"
              placeholder="Select agents"
              options={AGENT_ACCESS_OPTIONS}
              value={allowedAgents}
              onChange={setAllowedAgents}
              disabled={isUpdatingUser || isFetchingUserForUpdate}
              allowClear
            />
          </Form.Item>
        </Spin> */}
      </Form>
    </Drawer>
  );
};

export default EditUserDrawer;
