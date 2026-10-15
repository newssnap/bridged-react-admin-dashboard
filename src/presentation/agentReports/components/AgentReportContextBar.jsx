import { Button, Popover, Segmented, Space, Tag, Typography, theme } from 'antd';
import { DownloadOutlined, WarningOutlined } from '@ant-design/icons';
import { AGENT_REPORT_TYPE_OPTIONS } from '../../../constants/agentReportTypes';
import { formatDateTime, formatDisplayDate } from '../controllers/agentReportMetrics';

const { Text } = Typography;

const MAX_VISIBLE_AGENTS = 6;

// Always visible while a report is open: states exactly which agents and dates the numbers cover.
function AgentReportContextBar({
  campaigns,
  agentNames,
  dateSummary,
  agentType,
  onChangeType,
  typeDetectedFromData,
  generatedAt,
  expiresAt,
  onDownload,
  canDownload,
  onNewReport,
}) {
  const {
    token: { colorBgContainer, colorPrimary, colorBorderSecondary },
  } = theme.useToken();

  const agentText = campaign =>
    agentNames[campaign.id] ? `${agentNames[campaign.id]} (${campaign.id})` : campaign.id;
  const visibleCampaigns = campaigns.slice(0, MAX_VISIBLE_AGENTS);
  const hiddenCount = campaigns.length - visibleCampaigns.length;

  const allAgentsContent = (
    <Space direction="vertical" size={2} style={{ maxHeight: 300, overflowY: 'auto' }}>
      {campaigns.map(campaign => (
        <Text key={campaign.id}>
          {agentText(campaign)}: {formatDisplayDate(campaign.startDate)} →{' '}
          {formatDisplayDate(campaign.endDate)}
        </Text>
      ))}
    </Space>
  );

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: colorBgContainer,
        border: `1px solid ${colorBorderSecondary}`,
        borderLeft: `4px solid ${colorPrimary}`,
        borderRadius: 5,
        padding: 'var(--mpr-2)',
      }}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Space wrap size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space wrap size="small">
            <Text strong>Dates:</Text>
            {dateSummary.isUniform ? (
              <Text strong style={{ fontSize: 16 }}>
                {formatDisplayDate(dateSummary.startDate)} –{' '}
                {formatDisplayDate(dateSummary.endDate)}
              </Text>
            ) : (
              <Popover title="Date range per agent" content={allAgentsContent}>
                <Tag icon={<WarningOutlined />} color="warning">
                  Agents have different date ranges ({formatDisplayDate(dateSummary.startDate)} –{' '}
                  {formatDisplayDate(dateSummary.endDate)})
                </Tag>
              </Popover>
            )}
          </Space>
          <Space wrap size="small">
            {typeDetectedFromData && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                View set from the agent type in the data — change it if needed
              </Text>
            )}
            <Segmented
              size="small"
              options={AGENT_REPORT_TYPE_OPTIONS}
              value={agentType}
              onChange={onChangeType}
            />
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={onDownload}
              disabled={!canDownload}
            >
              Download Excel
            </Button>
            <Button onClick={onNewReport}>Close report</Button>
          </Space>
        </Space>
        <Space wrap size={[4, 4]}>
          <Text strong>Agents ({campaigns.length}):</Text>
          {visibleCampaigns.map(campaign => (
            <Tag key={campaign.id}>{agentText(campaign)}</Tag>
          ))}
          {hiddenCount > 0 && (
            <Popover title="All agents in this report" content={allAgentsContent}>
              <Tag style={{ cursor: 'pointer' }}>+{hiddenCount} more</Tag>
            </Popover>
          )}
        </Space>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {generatedAt ? `Generated ${formatDateTime(generatedAt)}` : 'Not generated yet'}
          {expiresAt
            ? ` · Expires ${formatDateTime(expiresAt)} (reports are kept for one day)`
            : ''}
        </Text>
      </Space>
    </div>
  );
}

export default AgentReportContextBar;
