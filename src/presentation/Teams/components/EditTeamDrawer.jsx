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
  Row,
  Col,
  Checkbox,
  Dropdown,
  InputNumber,
  Tag,
} from 'antd';
import {
  CreditCardOutlined,
  PictureOutlined,
  PlusOutlined,
  SettingOutlined,
  LinkOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  DownOutlined,
} from '@ant-design/icons';
import {
  useUploadImageMutation,
  useDisablePlaybookForTeamMutation,
  useEnablePlaybookForTeamMutation,
  useCrawlBrandingMutation,
} from '../../../services/api';
import Icon from '../../../utils/components/Icon';
import AddMembersDrawer from './AddMembersDrawer';
import ManageCreditsDrawer from '../../TeamCredits/components/ManageCreditsDrawer';
import PreviewEditCustomWorkDrawer from '../../TeamCredits/components/PreviewEditCustomWorkDrawer';
import AssignPlaybookDrawer from '../../dashboard/components/AssignPlaybookDrawer';
import useAssignPlaybookDrawer from '../../dashboard/controllers/useAssignPlaybookDrawer';

const { Text } = Typography;
const defaultBrandSyncTheme = 'light';
const CRAWL_PREVIEW_FIELDS = [
  { key: 'primaryColor', label: 'Primary Color', whitelabeling: true, brandSync: true },
  { key: 'accentColour', label: 'Accent Color', whitelabeling: false, brandSync: true },
  { key: 'logo', label: 'Logo', whitelabeling: true, brandSync: true },
  { key: 'theme', label: 'Theme', whitelabeling: false, brandSync: true },
  { key: 'fontName', label: 'Font Name', whitelabeling: false, brandSync: true },
  { key: 'baseFontScale', label: 'Base Font Scale', whitelabeling: false, brandSync: true },
  { key: 'borderRadius', label: 'Border Radius', whitelabeling: false, brandSync: true },
];
const ALL_CRAWL_FIELD_KEYS = CRAWL_PREVIEW_FIELDS.map(field => field.key);
const crawlImportMenuItems = [
  { key: 'whitelabeling', label: 'Import to Whitelabeling' },
  { key: 'brandSync', label: 'Import to BrandSync' },
  { key: 'both', label: 'Import to Both' },
];

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
  const brandSyncFileInputRef = useRef(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [brandSyncLogoPreviewUrl, setBrandSyncLogoPreviewUrl] = useState('');
  const [isBrandSyncDragging, setIsBrandSyncDragging] = useState(false);
  const [isCrawlDrawerOpen, setIsCrawlDrawerOpen] = useState(false);
  const [crawlUrl, setCrawlUrl] = useState('');
  const [crawledBrandData, setCrawledBrandData] = useState(null);
  const [selectedCrawlFields, setSelectedCrawlFields] = useState([]);
  const [isApplyingPlaybookChanges, setIsApplyingPlaybookChanges] = useState(false);
  const [assignPlaybookForm] = Form.useForm();
  const [uploadImage, { isLoading: isUploadingLogo }] = useUploadImageMutation();
  const [crawlBranding, { isLoading: isCrawlingBranding }] = useCrawlBrandingMutation();
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
  const isBrandSyncEnabled = Form.useWatch('isBrandSyncEnabled', form);
  const logoUrl = Form.useWatch('logoUrl', form);
  const brandSyncLogo = Form.useWatch('brandSyncLogo', form);
  const displayedLogoUrl = logoPreviewUrl || logoUrl || '';
  const displayedBrandSyncLogoUrl = brandSyncLogoPreviewUrl || brandSyncLogo || '';
  const allCrawlFieldsSelected =
    ALL_CRAWL_FIELD_KEYS.length > 0 &&
    ALL_CRAWL_FIELD_KEYS.every(key => selectedCrawlFields.includes(key));
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

  const handleBrandSyncLogoUploadClick = () => {
    brandSyncFileInputRef.current?.click();
  };

  const processBrandSyncLogoFile = async file => {
    if (!file || !file.type?.startsWith('image/')) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await uploadImage(formData).unwrap();
      if (response?.success && response?.data) {
        const url = typeof response.data === 'string' ? response.data : response.data?.url;
        if (url) {
          form.setFieldValue('brandSyncLogo', url);
          setBrandSyncLogoPreviewUrl(url);
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

  const handleBrandSyncLogoFileChange = async event => {
    const file = event.target.files?.[0];
    if (file) await processBrandSyncLogoFile(file);
    event.target.value = '';
  };

  const handleBrandSyncLogoDrop = event => {
    event.preventDefault();
    setIsBrandSyncDragging(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) processBrandSyncLogoFile(file);
  };

  const handleBrandSyncLogoDragOver = event => {
    event.preventDefault();
    event.stopPropagation();
    setIsBrandSyncDragging(true);
  };

  const handleBrandSyncLogoDragLeave = event => {
    event.preventDefault();
    event.stopPropagation();
    setIsBrandSyncDragging(false);
  };

  const handleDeleteBrandSyncLogo = () => {
    form.setFieldValue('brandSyncLogo', undefined);
    setBrandSyncLogoPreviewUrl('');
  };

  const handleToggleCrawlField = (fieldKey, checked) => {
    setSelectedCrawlFields(prev =>
      checked ? [...new Set([...prev, fieldKey])] : prev.filter(key => key !== fieldKey)
    );
  };

  const handleToggleAllCrawlFields = () => {
    setSelectedCrawlFields(allCrawlFieldsSelected ? [] : [...ALL_CRAWL_FIELD_KEYS]);
  };

  const renderCrawledFieldValue = (fieldKey, value) => {
    if (fieldKey === 'primaryColor' || fieldKey === 'accentColour') {
      return value ? (
        <ColorPicker defaultValue={value} showText disabled />
      ) : (
        <Text type="secondary">--</Text>
      );
    }
    if (fieldKey === 'logo' && value) {
      return (
        <Space size={8}>
          <img
            src={value}
            alt="Crawled logo"
            style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 4 }}
          />
          <Text type="secondary" className="singleLine" style={{ maxWidth: 280 }}>
            {value}
          </Text>
        </Space>
      );
    }
    return <Text type="secondary">{value ?? '--'}</Text>;
  };

  const handleCrawlBranding = async () => {
    const trimmedUrl = crawlUrl?.trim();
    if (!trimmedUrl) {
      notification.warning({
        message: 'Please enter a website URL',
        placement: 'bottomRight',
      });
      return;
    }

    try {
      const response = await crawlBranding({ url: trimmedUrl }).unwrap();
      if (!response?.success || !response?.data) {
        notification.error({
          message: response?.errorObject?.userErrorText || 'Failed to fetch branding data',
          placement: 'bottomRight',
        });
        return;
      }

      setCrawledBrandData({
        primaryColor: response.data.primaryColor || '',
        accentColour: response.data.accentColour || '',
        logo: response.data.logo || '',
        theme: response.data.theme || defaultBrandSyncTheme,
        fontName: response.data.fontName || '',
        baseFontScale: response.data.baseFontScale ?? undefined,
        borderRadius: response.data.borderRadius || '',
      });
      setSelectedCrawlFields([...ALL_CRAWL_FIELD_KEYS]);
      notification.success({
        message: 'Crawled data is ready',
        placement: 'bottomRight',
      });
    } catch (error) {
      notification.error({
        message: error?.data?.errorObject?.userErrorText || error?.data?.message || 'Crawl failed',
        placement: 'bottomRight',
      });
    }
  };

  const handleImportCrawledSettings = target => {
    if (!crawledBrandData) return;
    if (!selectedCrawlFields.length) {
      notification.warning({
        message: 'Select at least one field to import',
        placement: 'bottomRight',
      });
      return;
    }

    const applyToWhitelabeling = target === 'whitelabeling' || target === 'both';
    const applyToBrandSync = target === 'brandSync' || target === 'both';
    const isSelected = fieldKey => selectedCrawlFields.includes(fieldKey);
    let importedCount = 0;

    if (applyToWhitelabeling) {
      if (isSelected('primaryColor')) {
        form.setFieldValue('primaryColor', crawledBrandData.primaryColor || '#753fd0');
        importedCount += 1;
      }
      if (isSelected('logo') && crawledBrandData.logo) {
        form.setFieldValue('logoUrl', crawledBrandData.logo);
        setLogoPreviewUrl(crawledBrandData.logo);
        importedCount += 1;
      }
    }

    if (applyToBrandSync) {
      const updates = {};
      if (isSelected('primaryColor'))
        updates.brandSyncPrimaryColor = crawledBrandData.primaryColor || undefined;
      if (isSelected('accentColour'))
        updates.brandSyncAccentColour = crawledBrandData.accentColour || undefined;
      if (isSelected('logo') && crawledBrandData.logo) {
        updates.brandSyncLogo = crawledBrandData.logo;
        setBrandSyncLogoPreviewUrl(crawledBrandData.logo);
      }
      if (isSelected('theme'))
        updates.brandSyncTheme = crawledBrandData.theme || defaultBrandSyncTheme;
      if (isSelected('fontName'))
        updates.brandSyncFontName = crawledBrandData.fontName || undefined;
      if (isSelected('baseFontScale'))
        updates.brandSyncBaseFontScale = crawledBrandData.baseFontScale;
      if (isSelected('borderRadius'))
        updates.brandSyncBorderRadius = crawledBrandData.borderRadius || undefined;
      if (Object.keys(updates).length) {
        form.setFieldsValue(updates);
        importedCount += Object.keys(updates).length;
      }
    }

    if (!importedCount) {
      notification.warning({
        message: 'No applicable fields for this destination',
        description: 'The selected fields are not used in the chosen import target.',
        placement: 'bottomRight',
      });
      return;
    }

    notification.success({
      message:
        target === 'both'
          ? 'Imported into Whitelabeling and BrandSync'
          : target === 'whitelabeling'
            ? 'Imported into Whitelabeling'
            : 'Imported into BrandSync',
      placement: 'bottomRight',
    });
    setIsCrawlDrawerOpen(false);
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
        width={980}
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

              <Card
                size="small"
                title={
                  <Space>
                    <PictureOutlined />
                    <Text strong>Brand Configuration</Text>
                  </Space>
                }
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Alert
                    type="info"
                    showIcon
                    message="Configure manually or import from website"
                    description="Use crawl to fetch brand style and import it into Whitelabeling or BrandSync."
                    action={
                      <Button
                        type="primary"
                        size="small"
                        icon={<LinkOutlined />}
                        onClick={() => setIsCrawlDrawerOpen(true)}
                      >
                        Crawl From Website
                      </Button>
                    }
                  />

                  <Row gutter={16}>
                    <Col span={12}>
                      <Card
                        size="small"
                        title="Whitelabeling"
                        extra={
                          <Form.Item
                            name="isWhitelabelingEnabled"
                            valuePropName="checked"
                            style={{ marginBottom: 0 }}
                          >
                            <Switch />
                          </Form.Item>
                        }
                        style={{ height: '100%', opacity: isWhitelabelingEnabled ? 1 : 0.65 }}
                      >
                        <Form.Item
                          label="Primary Color"
                          name="primaryColor"
                          getValueFromEvent={color => color?.toHexString?.() ?? color}
                        >
                          <ColorPicker format="hex" showText disabled={!isWhitelabelingEnabled} />
                        </Form.Item>

                        <Form.Item label="Logo" name="logoUrl">
                          <div>
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => isWhitelabelingEnabled && handleLogoUploadClick()}
                              onKeyDown={e =>
                                isWhitelabelingEnabled &&
                                e.key === 'Enter' &&
                                handleLogoUploadClick()
                              }
                              onDragOver={e => {
                                if (!isWhitelabelingEnabled) return;
                                handleLogoDragOver(e);
                              }}
                              onDragLeave={e => {
                                if (!isWhitelabelingEnabled) return;
                                handleLogoDragLeave(e);
                              }}
                              onDrop={e => {
                                if (!isWhitelabelingEnabled) return;
                                handleLogoDrop(e);
                              }}
                              style={{
                                border: `1px dashed ${isDragging ? '#1890ff' : '#d9d9d9'}`,
                                borderRadius: 8,
                                padding: 24,
                                textAlign: 'center',
                                cursor: isWhitelabelingEnabled ? 'pointer' : 'not-allowed',
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
                                disabled={isUploadingLogo || !isWhitelabelingEnabled}
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
                                    <div style={{ marginTop: 8, color: '#1890ff' }}>
                                      Uploading...
                                    </div>
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
                                  disabled={!isWhitelabelingEnabled}
                                  style={{ flex: 1 }}
                                >
                                  Change
                                </Button>
                                <Button
                                  type="default"
                                  size="middle"
                                  onClick={handleDeleteLogo}
                                  disabled={!displayedLogoUrl || !isWhitelabelingEnabled}
                                  style={{ flex: 1 }}
                                >
                                  Delete
                                </Button>
                              </div>
                            )}
                          </div>
                        </Form.Item>
                      </Card>
                    </Col>

                    <Col span={12}>
                      <Card
                        size="small"
                        title="BrandSync"
                        extra={
                          <Form.Item
                            name="isBrandSyncEnabled"
                            valuePropName="checked"
                            style={{ marginBottom: 0 }}
                          >
                            <Switch />
                          </Form.Item>
                        }
                        style={{ height: '100%', opacity: isBrandSyncEnabled ? 1 : 0.65 }}
                      >
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item
                              label="Primary Color"
                              name="brandSyncPrimaryColor"
                              getValueFromEvent={color => color?.toHexString?.() ?? color}
                            >
                              <ColorPicker format="hex" showText disabled={!isBrandSyncEnabled} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              label="Accent Color"
                              name="brandSyncAccentColour"
                              getValueFromEvent={color => color?.toHexString?.() ?? color}
                            >
                              <ColorPicker format="hex" showText disabled={!isBrandSyncEnabled} />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item label="Theme" name="brandSyncTheme">
                              <Select
                                size="large"
                                disabled={!isBrandSyncEnabled}
                                options={[
                                  { value: 'light', label: 'Light' },
                                  { value: 'dark', label: 'Dark' },
                                ]}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Font Name" name="brandSyncFontName">
                              <Input
                                size="large"
                                placeholder="Inter"
                                disabled={!isBrandSyncEnabled}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item label="Base Font Scale" name="brandSyncBaseFontScale">
                              <InputNumber
                                size="large"
                                style={{ width: '100%' }}
                                min={1}
                                max={12}
                                disabled={!isBrandSyncEnabled}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Border Radius" name="brandSyncBorderRadius">
                              <Input
                                size="large"
                                placeholder="0px"
                                disabled={!isBrandSyncEnabled}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item label="Logo" name="brandSyncLogo">
                          <div>
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => isBrandSyncEnabled && handleBrandSyncLogoUploadClick()}
                              onKeyDown={event =>
                                isBrandSyncEnabled &&
                                event.key === 'Enter' &&
                                handleBrandSyncLogoUploadClick()
                              }
                              onDragOver={event => {
                                if (!isBrandSyncEnabled) return;
                                handleBrandSyncLogoDragOver(event);
                              }}
                              onDragLeave={event => {
                                if (!isBrandSyncEnabled) return;
                                handleBrandSyncLogoDragLeave(event);
                              }}
                              onDrop={event => {
                                if (!isBrandSyncEnabled) return;
                                handleBrandSyncLogoDrop(event);
                              }}
                              style={{
                                border: `1px dashed ${isBrandSyncDragging ? '#1890ff' : '#d9d9d9'}`,
                                borderRadius: 8,
                                padding: 24,
                                textAlign: 'center',
                                cursor: isBrandSyncEnabled ? 'pointer' : 'not-allowed',
                                background: displayedBrandSyncLogoUrl
                                  ? `center/contain no-repeat url(${displayedBrandSyncLogoUrl})`
                                  : isBrandSyncDragging
                                    ? '#e6f7ff'
                                    : '#fafafa',
                                minHeight: 120,
                              }}
                            >
                              <input
                                ref={brandSyncFileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleBrandSyncLogoFileChange}
                                disabled={isUploadingLogo || !isBrandSyncEnabled}
                              />
                              {!displayedBrandSyncLogoUrl ? (
                                <>
                                  <PictureOutlined
                                    style={{ fontSize: 32, color: '#bfbfbf', marginBottom: 8 }}
                                  />
                                  <div style={{ color: '#8c8c8c' }}>
                                    Click or drag file here to upload BrandSync logo
                                  </div>
                                </>
                              ) : null}
                            </div>
                            {displayedBrandSyncLogoUrl && (
                              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                                <Button
                                  type="primary"
                                  size="middle"
                                  onClick={handleBrandSyncLogoUploadClick}
                                  loading={isUploadingLogo}
                                  disabled={!isBrandSyncEnabled}
                                  style={{ flex: 1 }}
                                >
                                  Change
                                </Button>
                                <Button
                                  type="default"
                                  size="middle"
                                  onClick={handleDeleteBrandSyncLogo}
                                  disabled={!displayedBrandSyncLogoUrl || !isBrandSyncEnabled}
                                  style={{ flex: 1 }}
                                >
                                  Delete
                                </Button>
                              </div>
                            )}
                          </div>
                        </Form.Item>
                      </Card>
                    </Col>
                  </Row>
                </Space>
              </Card>
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

      <Drawer
        title="Crawl From Website"
        placement="right"
        width={720}
        open={open && isCrawlDrawerOpen}
        onClose={() => setIsCrawlDrawerOpen(false)}
        footer={
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button size="large" onClick={() => setIsCrawlDrawerOpen(false)}>
              Cancel
            </Button>
            <Dropdown
              menu={{
                items: crawlImportMenuItems,
                onClick: ({ key }) => handleImportCrawledSettings(key),
              }}
              trigger={['click']}
              disabled={!crawledBrandData || selectedCrawlFields.length === 0}
            >
              <Button
                type="primary"
                size="large"
                disabled={!crawledBrandData || selectedCrawlFields.length === 0}
              >
                Import settings <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            message="Paste a website URL and crawl its branding"
            description="Select the fields you want, then choose an import destination from the Import settings menu."
          />

          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="https://stg-blog.bridged.media"
              value={crawlUrl}
              onChange={event => setCrawlUrl(event.target.value)}
              onPressEnter={handleCrawlBranding}
              size="large"
            />
            <Button
              type="primary"
              icon={<SyncOutlined />}
              loading={isCrawlingBranding}
              onClick={handleCrawlBranding}
              size="large"
            >
              Crawl
            </Button>
          </Space.Compact>

          {crawledBrandData ? (
            <Card
              size="small"
              type="inner"
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <Text strong>Crawled Data Preview</Text>
                  <Text type="secondary">({selectedCrawlFields.length} selected)</Text>
                </Space>
              }
              extra={
                <Button type="link" size="small" onClick={handleToggleAllCrawlFields}>
                  {allCrawlFieldsSelected ? 'Deselect all' : 'Select all'}
                </Button>
              }
            >
              <Space direction="vertical" size={0} style={{ width: '100%' }}>
                {CRAWL_PREVIEW_FIELDS.map((field, index) => {
                  const value = crawledBrandData[field.key];
                  const isChecked = selectedCrawlFields.includes(field.key);

                  return (
                    <div
                      key={field.key}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: '12px 0',
                        borderBottom:
                          index < CRAWL_PREVIEW_FIELDS.length - 1
                            ? '1px solid var(--primary-Color-Opacity)'
                            : 'none',
                      }}
                    >
                      <Checkbox
                        checked={isChecked}
                        onChange={event => handleToggleCrawlField(field.key, event.target.checked)}
                        style={{ marginTop: 2 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Space
                          style={{
                            width: '100%',
                            justifyContent: 'space-between',
                            marginBottom: 4,
                          }}
                          align="start"
                        >
                          <Text strong>{field.label}</Text>
                          <Space size={4} wrap>
                            {field.whitelabeling ? (
                              <Tag color="blue" style={{ margin: 0 }}>
                                Whitelabeling
                              </Tag>
                            ) : null}
                            {field.brandSync ? (
                              <Tag color="purple" style={{ margin: 0 }}>
                                BrandSync
                              </Tag>
                            ) : null}
                          </Space>
                        </Space>
                        {renderCrawledFieldValue(field.key, value)}
                      </div>
                    </div>
                  );
                })}
              </Space>
            </Card>
          ) : (
            <Alert
              type="warning"
              showIcon
              message="No crawled data yet"
              description="Run crawl to see preview."
            />
          )}
        </Space>
      </Drawer>
    </>
  );
};

export default EditTeamDrawer;
