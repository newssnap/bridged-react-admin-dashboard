import React, { useEffect, useRef, useState } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  Alert,
  ColorPicker,
  notification,
} from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import { useUploadImageMutation } from '../../../services/api';

const AddTeamDrawer = ({
  open,
  onClose,
  companyOptions,
  isLoadingCompanies,
  companySearchText,
  onCompanySearch,
  onCreateCompany,
  isCreatingCompany,
  userOptions,
  isUsersLoading,
  onCompanyChange,
  onSubmit,
  isSubmitting,
}) => {
  const [form] = Form.useForm();
  const fileInputRef = useRef(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadImage, { isLoading: isUploadingLogo }] = useUploadImageMutation();

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        teamName: undefined,
        companyId: undefined,
        teamOwnerId: undefined,
        memberIds: undefined,
        isWhitelabelingEnabled: false,
        dashboardURL: undefined,
        primaryColor: '#753fd0',
        logoUrl: undefined,
      });
      setLogoPreviewUrl('');
    }
  }, [open, form]);

  const handleLogoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const processLogoFile = async file => {
    if (!file || !file.type?.startsWith('image/')) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await uploadImage(formData).unwrap();
      if (response?.success && response?.data) {
        const url = typeof response.data === 'string' ? response.data : response.data?.url;
        if (url) {
          form.setFieldValue('logoUrl', url);
          setLogoPreviewUrl(url);
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
  };

  const handleLogoFileChange = async e => {
    const file = e.target.files?.[0];
    if (file) await processLogoFile(file);
    e.target.value = '';
  };

  const handleLogoDrop = e => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processLogoFile(file);
  };

  const handleLogoDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleLogoDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDeleteLogo = () => {
    form.setFieldValue('logoUrl', undefined);
    setLogoPreviewUrl('');
  };

  const handleFinish = values => {
    const primaryColor =
      typeof values.primaryColor === 'string'
        ? values.primaryColor
        : (values.primaryColor?.toHexString?.() ?? '');
    const dashboardURL = values.dashboardURL?.trim()
      ? `${values.dashboardURL.trim()}.bridged.media`
      : undefined;
    onSubmit({
      ...values,
      primaryColor,
      dashboardURL,
    });
  };

  const isWhitelabelingEnabled = Form.useWatch('isWhitelabelingEnabled', form);
  const selectedTeamOwnerId = Form.useWatch('teamOwnerId', form);
  const memberOptions = (userOptions ?? []).filter(opt => opt.value !== selectedTeamOwnerId);

  return (
    <Drawer
      title="Add Team"
      placement="right"
      onClose={onClose}
      open={open}
      width={520}
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} size="large">
            Cancel
          </Button>
          <Button type="primary" size="large" onClick={() => form.submit()} loading={isSubmitting}>
            Create Team
          </Button>
        </Space>
      }
    >
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
            loading={isLoadingCompanies}
            optionFilterProp="label"
            filterOption={false}
            allowClear
            onChange={companyId => {
              form.setFieldValue('teamOwnerId', undefined);
              form.setFieldValue('memberIds', undefined);
              onCompanyChange(companyId);
            }}
            onSearch={onCompanySearch}
            onBlur={() => onCompanySearch?.('')}
            notFoundContent={
              !isLoadingCompanies && companySearchText?.trim() ? (
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
                    onClick={async () => {
                      const createdCompanyId = await onCreateCompany?.({
                        name: companySearchText ?? '',
                      });
                      if (!createdCompanyId) return;

                      form.setFieldValue('companyId', createdCompanyId);
                      form.setFieldValue('teamOwnerId', undefined);
                      form.setFieldValue('memberIds', undefined);
                      onCompanyChange(createdCompanyId);
                    }}
                    loading={isCreatingCompany}
                  >
                    Create "{companySearchText || 'company'}"
                  </Button>
                </div>
              ) : null
            }
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

        <Form.Item label="WhiteLabeling" name="isWhitelabelingEnabled" valuePropName="checked">
          <Switch />
        </Form.Item>

        {isWhitelabelingEnabled && (
          <>
            {/* <Form.Item
              label="Dashboard subdomain"
              name="dashboardURL"
              tooltip="Your team dashboard will be available at subdomain.bridged.media"
            >
              <Input size="large" placeholder="subdomain" addonAfter=".bridged.media" />
            </Form.Item> */}
            <Alert
              type="info"
              showIcon
              message="Need a custom subdomain?"
              description={
                <Space direction="vertical" size={4}>
                  <span>
                    Custom subdomains are available via the tech team. Contact them to enable this
                    feature for this team.
                  </span>
                  <Button type="link" size="small" style={{ paddingInline: 0 }} className="linkTag">
                    Contact Tech Team
                  </Button>
                </Space>
              }
              style={{ marginBottom: 16 }}
            />

            <Form.Item
              label="Primary Color"
              name="primaryColor"
              getValueFromEvent={color => color?.toHexString?.() ?? color}
            >
              <ColorPicker format="hex" showText />
            </Form.Item>

            <Form.Item label="Logo" name="logoUrl">
              <div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={handleLogoUploadClick}
                  onKeyDown={e => e.key === 'Enter' && handleLogoUploadClick()}
                  onDragOver={handleLogoDragOver}
                  onDragLeave={handleLogoDragLeave}
                  onDrop={handleLogoDrop}
                  style={{
                    border: `1px dashed ${isDragging ? '#1890ff' : '#d9d9d9'}`,
                    borderRadius: 8,
                    padding: 24,
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: logoPreviewUrl
                      ? `center/contain no-repeat url(${logoPreviewUrl})`
                      : isDragging
                        ? '#e6f7ff'
                        : '#fafafa',
                    minHeight: 120,
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleLogoFileChange}
                    disabled={isUploadingLogo}
                  />
                  {!logoPreviewUrl ? (
                    <>
                      <PictureOutlined
                        style={{ fontSize: 32, color: '#bfbfbf', marginBottom: 8 }}
                      />
                      <div style={{ color: '#8c8c8c' }}>Click or drag file here to upload logo</div>
                      {isUploadingLogo && (
                        <div style={{ marginTop: 8, color: '#1890ff' }}>Uploading...</div>
                      )}
                    </>
                  ) : null}
                </div>
                {logoPreviewUrl && (
                  <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                    <Button
                      type="primary"
                      size="middle"
                      onClick={handleLogoUploadClick}
                      loading={isUploadingLogo}
                      style={{ flex: 1 }}
                    >
                      Change
                    </Button>
                    <Button
                      type="default"
                      size="middle"
                      onClick={handleDeleteLogo}
                      disabled={!logoPreviewUrl}
                      style={{ flex: 1 }}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </Form.Item>
          </>
        )}
      </Form>
    </Drawer>
  );
};

export default AddTeamDrawer;
