import { Button, Card, Space, Table, Tag, Typography } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { AGENT_REPORT_METRICS } from '../../../constants/agentReportTypes';
import { formatDisplayDate } from '../controllers/agentReportMetrics';
import AgentReportMetricValue from './AgentReportMetricValue';

const { Text } = Typography;

const UNIT_SUFFIX = { events: ' (events)', people: ' (people)' };

// Sortable value for a metric cell; artifacts and missing values sort last.
const sortValue = metric => {
  if (!metric || metric.isArtifact || !metric.hasValue) return -Infinity;
  if (metric.kind === 'timePair') return metric.value?.primary ?? -Infinity;
  return metric.value;
};

const compareMetrics = (a, b) => {
  const left = sortValue(a);
  const right = sortValue(b);
  return left === right ? 0 : left - right;
};

function AgentReportAgentTable({ rows, typeConfig, onOpenVisitorFrequency }) {
  const metricColumns = typeConfig.tableMetrics.map(metricKey => {
    const metric = AGENT_REPORT_METRICS[metricKey];
    return {
      title: `${metric.label}${UNIT_SUFFIX[metric.unit] || ''}`,
      key: metricKey,
      align: 'right',
      sorter: (a, b) => compareMetrics(a.metrics[metricKey], b.metrics[metricKey]),
      render: (_, record) =>
        record.hasData ? <AgentReportMetricValue metric={record.metrics[metricKey]} /> : '—',
    };
  });

  const columns = [
    {
      title: 'Agent',
      key: 'agent',
      fixed: 'left',
      sorter: (a, b) => (a.agentName || a.agentId).localeCompare(b.agentName || b.agentId),
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.agentName || 'Unnamed agent'}</Text>
          <Text type="secondary" copyable={{ text: record.agentId }} style={{ fontSize: 12 }}>
            {record.agentId}
          </Text>
          <Space size={4} wrap>
            {record.agentDataTypeLabel && <Tag>{record.agentDataTypeLabel}</Tag>}
            {!record.hasData && <Tag color="error">no data</Tag>}
          </Space>
        </Space>
      ),
    },
    {
      title: 'Dates',
      key: 'dates',
      render: (_, record) =>
        record.startDate ? (
          <Text style={{ whiteSpace: 'nowrap' }}>
            {formatDisplayDate(record.startDate)} – {formatDisplayDate(record.endDate)}
          </Text>
        ) : (
          '—'
        ),
    },
    ...metricColumns,
    {
      title: '',
      key: 'actions',
      render: (_, record) => (
        <Button
          size="small"
          icon={<BarChartOutlined />}
          onClick={() => onOpenVisitorFrequency(record)}
          disabled={!record.startDate}
        >
          Visitor frequency
        </Button>
      ),
    },
  ];

  return (
    <Card title="Per-agent breakdown" size="small">
      <Table
        dataSource={rows}
        columns={columns}
        size="small"
        bordered
        scroll={{ x: 'max-content' }}
        pagination={
          rows.length > 10
            ? { pageSize: 10, position: ['bottomLeft'], showSizeChanger: false }
            : false
        }
        locale={{ emptyText: 'No per-agent statistics in this report — see the sheet tabs below.' }}
      />
    </Card>
  );
}

export default AgentReportAgentTable;
