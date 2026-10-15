import { Button, Card, Empty, List, Popconfirm, Space, Tag, Tooltip, Typography } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { AGENT_REPORT_TYPES } from '../../../constants/agentReportTypes';
import {
  formatDateTime,
  formatDisplayDate,
  summarizeCampaignDates,
} from '../controllers/agentReportMetrics';

const { Text } = Typography;

// Reports live for one day; expiresAt comes from the backend, createdAt + 1 day is the fallback.
const getExpiry = entry => {
  const expiresAt = entry.expiresAt ? dayjs(entry.expiresAt) : dayjs(entry.createdAt).add(1, 'day');
  const hoursLeft = expiresAt.diff(dayjs(), 'hour', true);
  if (entry.expired || hoursLeft <= 0) return { label: 'expired', color: 'default' };
  if (hoursLeft < 1) return { label: 'expires in < 1h', color: 'orange' };
  return { label: `expires in ${Math.floor(hoursLeft)}h`, color: 'green' };
};

function RecentAgentReports({ recentReports, activeReportId, onOpen, onRemove, onClear }) {
  return (
    <Card
      title="Recent reports"
      extra={
        recentReports.length > 0 && (
          <Popconfirm title="Clear the recent reports list?" onConfirm={onClear} okText="Clear">
            <Button type="link" size="small">
              Clear
            </Button>
          </Popconfirm>
        )
      }
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Text type="secondary">
          Saved in this browser. Reports expire one day after they are created — after that, run
          them again.
        </Text>
        {recentReports.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No reports yet" />
        ) : (
          <List
            size="small"
            dataSource={recentReports}
            style={{ maxHeight: 560, overflowY: 'auto' }}
            renderItem={entry => {
              const campaigns = entry.campaigns || [];
              const { startDate, endDate, isUniform } = summarizeCampaignDates(campaigns);
              const names = campaigns.map(
                campaign => entry.agentNames?.[campaign.id] || campaign.id
              );
              const expiry = getExpiry(entry);
              const isActive = entry.reportId === activeReportId;
              return (
                <List.Item
                  onClick={() => onOpen(entry)}
                  style={{ cursor: 'pointer', fontWeight: isActive ? 600 : undefined }}
                  actions={[
                    <Tooltip title="Remove from list" key="remove">
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        aria-label="Remove from recent reports"
                        onClick={event => {
                          event.stopPropagation();
                          onRemove(entry.reportId);
                        }}
                      />
                    </Tooltip>,
                  ]}
                >
                  <Space direction="vertical" size={0} style={{ minWidth: 0 }}>
                    <Space size={4} wrap>
                      <Tag color="purple">
                        {AGENT_REPORT_TYPES[entry.agentType]?.label || entry.agentType}
                      </Tag>
                      <Tag color={expiry.color}>{expiry.label}</Tag>
                    </Space>
                    <Text ellipsis style={{ maxWidth: 280 }}>
                      {names.slice(0, 3).join(', ')}
                      {names.length > 3 ? ` +${names.length - 3} more` : ''}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDisplayDate(startDate)} – {formatDisplayDate(endDate)}
                      {isUniform ? '' : ' (mixed ranges)'} · created{' '}
                      {formatDateTime(entry.createdAt)}
                    </Text>
                  </Space>
                </List.Item>
              );
            }}
          />
        )}
      </Space>
    </Card>
  );
}

export default RecentAgentReports;
