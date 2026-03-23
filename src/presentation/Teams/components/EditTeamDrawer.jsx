import React, { useRef, useState } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  Card,
  Table,
  Typography,
  Alert,
  ColorPicker,
  notification,
  Divider,
} from 'antd';
import { CreditCardOutlined, PictureOutlined } from '@ant-design/icons';
import { useUploadImageMutation } from '../../../services/api';

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
  isLoadingCompanies,
  companySearchText,
  onCompanySearch,
  onCreateCompany,
  isCreatingCompany,
  handleFinish,
  handleClose,
  handleAfterOpenChange,
  memberTableData,
  columns,
  isLoadingMembers,
  isSubmitting,
}) => {
  const fileInputRef = useRef(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadImage, { isLoading: isUploadingLogo }] = useUploadImageMutation();
  const selectedTeamOwnerId = Form.useWatch('teamOwnerId', form);
  const isWhitelabelingEnabled = Form.useWatch('isWhitelabelingEnabled', form);
  const logoUrl = Form.useWatch('logoUrl', form);
  const memberOptions = getMemberOptionsExcludingOwner(userOptions, selectedTeamOwnerId);
  const displayedLogoUrl = logoPreviewUrl || logoUrl || '';

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
                loading={isLoadingCompanies}
                optionFilterProp="label"
                filterOption={false}
                allowClear
                onChange={companyId => {
                  onCompanyChange?.(companyId);
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
                          onCompanyChange?.(createdCompanyId);
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
                        Custom subdomains are available via the tech team. Contact them to enable
                        this feature for this team.
                      </span>
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
                        background: displayedLogoUrl
                          ? `center/contain no-repeat url(${displayedLogoUrl})`
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
                      {!displayedLogoUrl ? (
                        <>
                          <PictureOutlined
                            style={{ fontSize: 32, color: '#bfbfbf', marginBottom: 8 }}
                          />
                          <div style={{ color: '#8c8c8c' }}>
                            Click or drag file here to upload logo
                          </div>
                          {isUploadingLogo && (
                            <div style={{ marginTop: 8, color: '#1890ff' }}>Uploading...</div>
                          )}
                        </>
                      ) : null}
                    </div>
                    {displayedLogoUrl && (
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
                          disabled={!displayedLogoUrl}
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
          <Divider style={{ marginTop: '0px', marginBottom: '13px' }} />
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
