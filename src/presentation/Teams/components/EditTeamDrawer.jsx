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
  Collapse,
  Tooltip,
} from 'antd';
import {
  CreditCardOutlined,
  PictureOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  useUploadImageMutation,
  useDisablePlaybookForTeamMutation,
  useEnablePlaybookForTeamMutation,
} from '../../../services/api';
import Icon from '../../../utils/components/Icon';
import AddMembersDrawer from './AddMembersDrawer';
import ManageCreditsDrawer from '../../TeamCredits/components/ManageCreditsDrawer';
import PreviewEditCustomWorkDrawer from '../../TeamCredits/components/PreviewEditCustomWorkDrawer';
import AssignPlaybookDrawer from '../../dashboard/components/AssignPlaybookDrawer';
import useAssignPlaybookDrawer from '../../dashboard/controllers/useAssignPlaybookDrawer';

const { Text } = Typography;

const EditTeamDrawer = ({
  open,
  team,
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
  addMembersDrawerOpen,
  openAddMembersDrawer,
  closeAddMembersDrawer,
  addMembersForm,
  addMembersUserOptions,
  isAddMembersUsersLoading,
  handleAddMembersFinish,
  handleAddMembersAfterOpenChange,
  isAddMembersSubmitting,
  manageCreditsDrawerOpen,
  openManageCreditsDrawer,
  closeManageCreditsDrawer,
  manageCreditsTeamData,
  creditsHistoryData,
  isLoadingCreditsHistory,
  handleManageCreditsSubmit,
  isCreditsSubmitting,
  handleEditCreditsHistorySubmit,
  isEditingHistorySubmitting,
  creditsForm,
  customWorkEditDrawerOpen,
  openCustomWorkDrawer,
  closeCustomWorkEditDrawer,
  selectedCustomWorkEntry,
  teamsDataForCustomWorkDrawer,
  handleCustomWorkSubmit,
  isCustomWorkSubmitting,
}) => {
  const fileInputRef = useRef(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isApplyingPlaybookChanges, setIsApplyingPlaybookChanges] = useState(false);
  const [assignPlaybookForm] = Form.useForm();
  const [uploadImage, { isLoading: isUploadingLogo }] = useUploadImageMutation();
  const [enablePlaybookForTeam] = useEnablePlaybookForTeamMutation();
  const [disablePlaybookForTeam] = useDisablePlaybookForTeamMutation();

  const {
    playbooks,
    playbookAgentLabelMap,
    isLoadingPlaybooks,
    draftSelectedPlaybooks,
    initialAssignedPlaybookTypes,
    teamAssignedPlaybookIdsByType,
    isPlaybookDrawerOpen,
    openPlaybooksDrawer,
    closePlaybooksDrawer,
    applyPlaybooksSelection,
    handlePlaybookToggle,
    handleTeamPlaybooksLoaded,
  } = useAssignPlaybookDrawer({ form: assignPlaybookForm });
  const isWhitelabelingEnabled = Form.useWatch('isWhitelabelingEnabled', form);
  const logoUrl = Form.useWatch('logoUrl', form);
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

  const tableStyles = () => ({
    footer: {
      backgroundColor: 'transparent',
    },
  });

  const handleAssignPlaybooks = async () => {
    const teamId = team?._id;
    if (!teamId) {
      notification.warning({
        message: 'No team selected',
        placement: 'bottomRight',
      });
      return;
    }

    const initialSet = new Set(initialAssignedPlaybookTypes);
    const draftSet = new Set(draftSelectedPlaybooks);

    const toEnableTypes = draftSelectedPlaybooks.filter(t => !initialSet.has(t));
    const toDisableTypes = initialAssignedPlaybookTypes.filter(t => !draftSet.has(t));

    if (toEnableTypes.length === 0 && toDisableTypes.length === 0) {
      applyPlaybooksSelection();
      return;
    }

    setIsApplyingPlaybookChanges(true);
    try {
      const enableTasks = toEnableTypes.map(playbookType => {
        const playbook = playbooks.find(p => p.value === playbookType);
        if (!playbook?.id) {
          return Promise.reject(new Error(`Missing playbook id for "${playbookType}"`));
        }
        return enablePlaybookForTeam({ teamId, playbookId: playbook.id }).unwrap();
      });

      const disableTasks = toDisableTypes.map(playbookType => {
        const playbookId = teamAssignedPlaybookIdsByType[playbookType];
        if (!playbookId) {
          return Promise.reject(new Error(`Missing team playbook id for "${playbookType}"`));
        }
        return disablePlaybookForTeam({ teamId, playbookId }).unwrap();
      });

      await Promise.all([...enableTasks, ...disableTasks]);

      applyPlaybooksSelection();
      notification.success({
        message: 'Team playbooks updated',
        placement: 'bottomRight',
      });
    } catch (error) {
      notification.error({
        message: error?.data?.message || error?.message || 'Failed to update team playbooks',
        placement: 'bottomRight',
      });
    } finally {
      setIsApplyingPlaybookChanges(false);
    }
  };

  return (
    <>
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
                label="WhiteLabeling"
                name="isWhitelabelingEnabled"
                valuePropName="checked"
              >
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
              extra={
                <Tooltip title="Manage credit balance and history">
                  <Button
                    // icon={<Icon name="MoneyOutlined" />}
                    onClick={() => openManageCreditsDrawer?.(team)}
                    size="small"
                    type="primary"
                  >
                    <Icon name="MoneyOutlined" color="white" />
                    Manage Credits
                  </Button>
                </Tooltip>
              }
              styles={{
                body: { padding: '16px 24px' },
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: 600 }}>
                {(team.creditBalance ?? 0).toLocaleString()}
              </Text>
            </Card>

            <Divider style={{ marginTop: '13px', marginBottom: '0px' }} />

            <Collapse
              ghost
              items={[
                {
                  key: 'members',
                  label: 'Team Members',
                  children: (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <Table
                        dataSource={memberTableData}
                        columns={columns}
                        loading={isLoadingMembers}
                        bordered
                        styles={tableStyles}
                        footer={() => (
                          <Button
                            type="primary"
                            size="middle"
                            icon={<PlusOutlined />}
                            block
                            onClick={() => openAddMembersDrawer?.()}
                          >
                            Add Members
                          </Button>
                        )}
                        pagination={{
                          position: ['bottomLeft'],
                          showSizeChanger: false,
                          showQuickJumper: false,
                        }}
                        locale={{ emptyText: 'No members' }}
                      />
                    </Space>
                  ),
                },
              ]}
              size="small"
              style={{
                backgroundColor: 'transparent',
              }}
              expandIconPosition="end"
              expandIcon={({ isActive }) => (
                <Icon
                  name="ArrowRightOutlined"
                  color="primary"
                  style={{
                    transition: 'transform 0.2s',
                    width: 6,
                    transform: isActive ? 'rotate(270deg)' : 'rotate(90deg)',
                  }}
                />
              )}
            />

            <Collapse
              ghost
              items={[
                {
                  key: 'advancedSettings',
                  label: 'Advanced Settings',
                  children: (
                    <Space wrap size={8} style={{ width: '100%' }}>
                      <Tooltip title="Manage custom work credit usage">
                        <Button
                          icon={<SettingOutlined />}
                          onClick={() => openCustomWorkDrawer?.(team)}
                          size="middle"
                        >
                          Manage Custom Work
                        </Button>
                      </Tooltip>
                      <Tooltip title="Manage assigned playbooks">
                        <Button onClick={() => openPlaybooksDrawer?.()} size="middle">
                          <Icon name={'PlayLinear'} />
                          Playbooks Management
                        </Button>
                      </Tooltip>
                    </Space>
                  ),
                },
              ]}
              size="small"
              style={{
                backgroundColor: 'transparent',
              }}
              expandIconPosition="end"
              expandIcon={({ isActive }) => (
                <Icon
                  name="ArrowRightOutlined"
                  color="primary"
                  style={{
                    transition: 'transform 0.2s',
                    width: 6,
                    transform: isActive ? 'rotate(270deg)' : 'rotate(90deg)',
                  }}
                />
              )}
            />
          </Space>
        ) : null}

        <AddMembersDrawer
          open={open && addMembersDrawerOpen}
          form={addMembersForm}
          availableUserOptions={addMembersUserOptions}
          isUsersLoading={isAddMembersUsersLoading}
          handleFinish={handleAddMembersFinish}
          handleAfterOpenChange={handleAddMembersAfterOpenChange}
          closeDrawer={closeAddMembersDrawer}
          isSubmitting={isAddMembersSubmitting}
        />
        <ManageCreditsDrawer
          open={open && manageCreditsDrawerOpen}
          onClose={closeManageCreditsDrawer}
          teamData={manageCreditsTeamData}
          historyData={creditsHistoryData}
          isLoadingHistory={isLoadingCreditsHistory}
          onSubmit={handleManageCreditsSubmit}
          isSubmitting={isCreditsSubmitting}
          onEditHistorySubmit={handleEditCreditsHistorySubmit}
          isEditingHistorySubmitting={isEditingHistorySubmitting}
          form={creditsForm}
        />

        <PreviewEditCustomWorkDrawer
          open={open && customWorkEditDrawerOpen}
          onClose={closeCustomWorkEditDrawer}
          mode="edit"
          initialRecord={selectedCustomWorkEntry}
          teamsData={teamsDataForCustomWorkDrawer}
          onSubmit={handleCustomWorkSubmit}
          isSubmitting={isCustomWorkSubmitting}
        />

        <AssignPlaybookDrawer
          open={open && isPlaybookDrawerOpen}
          teamId={team?._id}
          playbooks={playbooks}
          playbookAgentLabelMap={playbookAgentLabelMap}
          draftSelectedPlaybooks={draftSelectedPlaybooks}
          isLoadingPlaybooks={isLoadingPlaybooks}
          isApplyingPlaybooks={isApplyingPlaybookChanges}
          onTeamPlaybooksLoaded={handleTeamPlaybooksLoaded}
          onClose={closePlaybooksDrawer}
          onApply={handleAssignPlaybooks}
          onToggle={handlePlaybookToggle}
        />
      </Drawer>
    </>
  );
};

export default EditTeamDrawer;
