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
  Typography,
  Collapse,
  Card,
  Tag,
  InputNumber,
  Row,
  Col,
  Checkbox,
  Dropdown,
} from 'antd';
import {
  PictureOutlined,
  LinkOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useCrawlBrandingMutation, useUploadImageMutation } from '../../../services/api';
import useAssignPlaybookDrawer from '../../dashboard/controllers/useAssignPlaybookDrawer';
import PlaybookSelectionList from '../../dashboard/components/PlaybookSelectionList';
import Icon from '../../../utils/components/Icon';

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

const PlaybooksCollapseField = ({
  value = [],
  onChange,
  playbooks = [],
  playbookAgentLabelMap = {},
  isLoadingPlaybooks = false,
}) => {
  const handleToggle = (playbookValue, checked) => {
    const nextValue = checked
      ? [...new Set([...value, playbookValue])]
      : value.filter(item => item !== playbookValue);
    onChange?.(nextValue);
  };

  return (
    <Collapse
      size="small"
      className="playbookCollapse"
      style={{ backgroundColor: 'transparent' }}
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
      items={[
        {
          key: 'playbooks',
          label: (
            <Space size={8}>
              <Text>Playbooks</Text>
              {value.length > 0 ? <Text type="secondary">({value.length})</Text> : null}
            </Space>
          ),
          children: isLoadingPlaybooks ? (
            <Text type="secondary">Loading playbooks...</Text>
          ) : (
            <PlaybookSelectionList
              playbooks={playbooks}
              playbookAgentLabelMap={playbookAgentLabelMap}
              selectedPlaybooks={value}
              onToggle={handleToggle}
            />
          ),
        },
      ]}
    />
  );
};

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
  const brandSyncFileInputRef = useRef(null);

  const [logoPreviewUrl, setLogoPreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [brandSyncLogoPreviewUrl, setBrandSyncLogoPreviewUrl] = useState('');
  const [isBrandSyncDragging, setIsBrandSyncDragging] = useState(false);

  const [isCrawlDrawerOpen, setIsCrawlDrawerOpen] = useState(false);
  const [crawlUrl, setCrawlUrl] = useState('');
  const [crawledBrandData, setCrawledBrandData] = useState(null);
  const [selectedCrawlFields, setSelectedCrawlFields] = useState([]);

  const [uploadImage, { isLoading: isUploadingLogo }] = useUploadImageMutation();
  const [crawlBranding, { isLoading: isCrawlingBranding }] = useCrawlBrandingMutation();

  const { playbooks, playbookAgentLabelMap, isLoadingPlaybooks } = useAssignPlaybookDrawer({
    form,
  });

  useEffect(() => {
    if (!open) return;

    form.resetFields();
    form.setFieldsValue({
      teamName: undefined,
      companyId: undefined,
      teamOwnerId: undefined,
      memberIds: undefined,
      assignedPlaybooks: [],
      isWhitelabelingEnabled: false,
      isBrandSyncEnabled: false,
      dashboardURL: undefined,
      primaryColor: '#753fd0',
      logoUrl: undefined,
      brandSyncPrimaryColor: undefined,
      brandSyncAccentColour: undefined,
      brandSyncLogo: undefined,
      brandSyncTheme: defaultBrandSyncTheme,
      brandSyncFontName: undefined,
      brandSyncBaseFontScale: undefined,
      brandSyncBorderRadius: undefined,
    });

    setLogoPreviewUrl('');
    setBrandSyncLogoPreviewUrl('');
    setIsCrawlDrawerOpen(false);
    setCrawlUrl('');
    setCrawledBrandData(null);
    setSelectedCrawlFields([]);
  }, [open, form]);

  const allCrawlFieldsSelected =
    ALL_CRAWL_FIELD_KEYS.length > 0 &&
    ALL_CRAWL_FIELD_KEYS.every(key => selectedCrawlFields.includes(key));

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
        <Space size={8}>
          <ColorPicker defaultValue={value} showText disabled={true} />
        </Space>
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

  const processUploadedFile = async ({ file, onSetValue, onSetPreview }) => {
    if (!file || !file.type?.startsWith('image/')) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await uploadImage(formData).unwrap();
      if (response?.success && response?.data) {
        const url = typeof response.data === 'string' ? response.data : response.data?.url;
        if (url) {
          onSetValue(url);
          onSetPreview(url);
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

  const handleLogoFileChange = async event => {
    const file = event.target.files?.[0];
    if (file) {
      await processUploadedFile({
        file,
        onSetValue: url => form.setFieldValue('logoUrl', url),
        onSetPreview: setLogoPreviewUrl,
      });
    }
    event.target.value = '';
  };

  const handleBrandSyncLogoFileChange = async event => {
    const file = event.target.files?.[0];
    if (file) {
      await processUploadedFile({
        file,
        onSetValue: url => form.setFieldValue('brandSyncLogo', url),
        onSetPreview: setBrandSyncLogoPreviewUrl,
      });
    }
    event.target.value = '';
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
      const brandSyncUpdates = {};

      if (isSelected('primaryColor')) {
        brandSyncUpdates.brandSyncPrimaryColor = crawledBrandData.primaryColor || undefined;
      }
      if (isSelected('accentColour')) {
        brandSyncUpdates.brandSyncAccentColour = crawledBrandData.accentColour || undefined;
      }
      if (isSelected('logo') && crawledBrandData.logo) {
        brandSyncUpdates.brandSyncLogo = crawledBrandData.logo;
        setBrandSyncLogoPreviewUrl(crawledBrandData.logo);
      }
      if (isSelected('theme')) {
        brandSyncUpdates.brandSyncTheme = crawledBrandData.theme || defaultBrandSyncTheme;
      }
      if (isSelected('fontName')) {
        brandSyncUpdates.brandSyncFontName = crawledBrandData.fontName || undefined;
      }
      if (isSelected('baseFontScale')) {
        brandSyncUpdates.brandSyncBaseFontScale = crawledBrandData.baseFontScale;
      }
      if (isSelected('borderRadius')) {
        brandSyncUpdates.brandSyncBorderRadius = crawledBrandData.borderRadius || undefined;
      }

      if (Object.keys(brandSyncUpdates).length) {
        form.setFieldsValue(brandSyncUpdates);
        importedCount += Object.keys(brandSyncUpdates).length;
      }
    }

    if (importedCount === 0) {
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

  const handleFinish = values => {
    const assignedPlaybookTypes = values.assignedPlaybooks ?? [];
    const playbookIds = assignedPlaybookTypes
      .map(playbookType => playbooks.find(playbook => playbook.value === playbookType)?.id)
      .filter(Boolean);

    if (playbookIds.length === 0) {
      notification.error({
        message: 'Please select at least one playbook',
        placement: 'bottomRight',
      });
      return;
    }

    const primaryColor =
      typeof values.primaryColor === 'string'
        ? values.primaryColor
        : (values.primaryColor?.toHexString?.() ?? '');
    const dashboardURL = values.dashboardURL?.trim()
      ? `${values.dashboardURL.trim()}.bridged.media`
      : undefined;

    const agentVisualizationConfig = {
      primaryColor:
        typeof values.brandSyncPrimaryColor === 'string'
          ? values.brandSyncPrimaryColor
          : values.brandSyncPrimaryColor?.toHexString?.(),
      accentColour:
        typeof values.brandSyncAccentColour === 'string'
          ? values.brandSyncAccentColour
          : values.brandSyncAccentColour?.toHexString?.(),
      logo: values.brandSyncLogo?.trim() || '',
      theme: values.brandSyncTheme || defaultBrandSyncTheme,
      fontName: values.brandSyncFontName?.trim() || '',
      baseFontScale: values.brandSyncBaseFontScale,
      borderRadius: values.brandSyncBorderRadius?.trim() || '',
    };

    onSubmit({
      ...values,
      playbookIds,
      primaryColor,
      dashboardURL,
      isAgentVisualizationEnabled: !!values.isBrandSyncEnabled,
      agentVisualizationConfig,
    });
  };

  const isWhitelabelingEnabled = Form.useWatch('isWhitelabelingEnabled', form);
  const isBrandSyncEnabled = Form.useWatch('isBrandSyncEnabled', form);
  const selectedTeamOwnerId = Form.useWatch('teamOwnerId', form);
  const memberOptions = (userOptions ?? []).filter(opt => opt.value !== selectedTeamOwnerId);

  return (
    <>
      <Drawer
        title="Add Team"
        placement="right"
        onClose={onClose}
        open={open}
        width={980}
        footer={
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onClose} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={() => form.submit()}
              loading={isSubmitting}
            >
              Create Team
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Team Name"
                name="teamName"
                rules={[{ required: true, message: 'Please enter team name' }]}
              >
                <Input size="large" placeholder="Enter team name" />
              </Form.Item>
            </Col>
            <Col span={12}>
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
            </Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: '8px' }}>
            <Col span={12}>
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
            </Col>
            <Col span={12}>
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
            </Col>
          </Row>

          <Form.Item
            name="assignedPlaybooks"
            style={{ marginBottom: '22px' }}
            initialValue={[]}
            rules={[
              {
                type: 'array',
                min: 1,
                message: 'Please select at least one playbook',
              },
            ]}
          >
            <PlaybooksCollapseField
              playbooks={playbooks}
              playbookAgentLabelMap={playbookAgentLabelMap}
              isLoadingPlaybooks={isLoadingPlaybooks}
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
                          onClick={() => isWhitelabelingEnabled && fileInputRef.current?.click()}
                          onKeyDown={event =>
                            isWhitelabelingEnabled &&
                            event.key === 'Enter' &&
                            fileInputRef.current?.click()
                          }
                          onDragOver={event => {
                            if (!isWhitelabelingEnabled) return;
                            event.preventDefault();
                            event.stopPropagation();
                            setIsDragging(true);
                          }}
                          onDragLeave={event => {
                            if (!isWhitelabelingEnabled) return;
                            event.preventDefault();
                            event.stopPropagation();
                            setIsDragging(false);
                          }}
                          onDrop={event => {
                            if (!isWhitelabelingEnabled) return;
                            event.preventDefault();
                            setIsDragging(false);
                            const file = event.dataTransfer?.files?.[0];
                            if (file) {
                              processUploadedFile({
                                file,
                                onSetValue: url => form.setFieldValue('logoUrl', url),
                                onSetPreview: setLogoPreviewUrl,
                              });
                            }
                          }}
                          style={{
                            border: `1px dashed ${isDragging ? '#1890ff' : '#d9d9d9'}`,
                            borderRadius: 8,
                            padding: 24,
                            textAlign: 'center',
                            cursor: isWhitelabelingEnabled ? 'pointer' : 'not-allowed',
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
                            disabled={isUploadingLogo || !isWhitelabelingEnabled}
                          />
                          {!logoPreviewUrl ? (
                            <>
                              <PictureOutlined
                                style={{ fontSize: 32, color: '#bfbfbf', marginBottom: 8 }}
                              />
                              <div style={{ color: '#8c8c8c' }}>
                                Click or drag file here to upload logo
                              </div>
                              {isUploadingLogo ? (
                                <div style={{ marginTop: 8, color: '#1890ff' }}>Uploading...</div>
                              ) : null}
                            </>
                          ) : null}
                        </div>
                        {logoPreviewUrl ? (
                          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                            <Button
                              type="primary"
                              size="middle"
                              onClick={() => fileInputRef.current?.click()}
                              loading={isUploadingLogo}
                              disabled={!isWhitelabelingEnabled}
                              style={{ flex: 1 }}
                            >
                              Change
                            </Button>
                            <Button
                              type="default"
                              size="middle"
                              onClick={() => {
                                form.setFieldValue('logoUrl', undefined);
                                setLogoPreviewUrl('');
                              }}
                              disabled={!isWhitelabelingEnabled}
                              style={{ flex: 1 }}
                            >
                              Delete
                            </Button>
                          </div>
                        ) : null}
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
                          <Input size="large" placeholder="Inter" disabled={!isBrandSyncEnabled} />
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
                          <Input size="large" placeholder="0px" disabled={!isBrandSyncEnabled} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item label="Logo" name="brandSyncLogo">
                      <div>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            isBrandSyncEnabled && brandSyncFileInputRef.current?.click()
                          }
                          onKeyDown={event =>
                            isBrandSyncEnabled &&
                            event.key === 'Enter' &&
                            brandSyncFileInputRef.current?.click()
                          }
                          onDragOver={event => {
                            if (!isBrandSyncEnabled) return;
                            event.preventDefault();
                            event.stopPropagation();
                            setIsBrandSyncDragging(true);
                          }}
                          onDragLeave={event => {
                            if (!isBrandSyncEnabled) return;
                            event.preventDefault();
                            event.stopPropagation();
                            setIsBrandSyncDragging(false);
                          }}
                          onDrop={event => {
                            if (!isBrandSyncEnabled) return;
                            event.preventDefault();
                            setIsBrandSyncDragging(false);
                            const file = event.dataTransfer?.files?.[0];
                            if (file) {
                              processUploadedFile({
                                file,
                                onSetValue: url => form.setFieldValue('brandSyncLogo', url),
                                onSetPreview: setBrandSyncLogoPreviewUrl,
                              });
                            }
                          }}
                          style={{
                            border: `1px dashed ${isBrandSyncDragging ? '#1890ff' : '#d9d9d9'}`,
                            borderRadius: 8,
                            padding: 24,
                            textAlign: 'center',
                            cursor: isBrandSyncEnabled ? 'pointer' : 'not-allowed',
                            background: brandSyncLogoPreviewUrl
                              ? `center/contain no-repeat url(${brandSyncLogoPreviewUrl})`
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
                          {!brandSyncLogoPreviewUrl ? (
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
                        {brandSyncLogoPreviewUrl ? (
                          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                            <Button
                              type="primary"
                              size="middle"
                              onClick={() => brandSyncFileInputRef.current?.click()}
                              loading={isUploadingLogo}
                              disabled={!isBrandSyncEnabled}
                              style={{ flex: 1 }}
                            >
                              Change
                            </Button>
                            <Button
                              type="default"
                              size="middle"
                              onClick={() => {
                                form.setFieldValue('brandSyncLogo', undefined);
                                setBrandSyncLogoPreviewUrl('');
                              }}
                              disabled={!isBrandSyncEnabled}
                              style={{ flex: 1 }}
                            >
                              Delete
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
            </Space>
          </Card>
        </Form>
      </Drawer>

      <Drawer
        title="Crawl From Website"
        placement="right"
        width={720}
        open={isCrawlDrawerOpen}
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

export default AddTeamDrawer;
