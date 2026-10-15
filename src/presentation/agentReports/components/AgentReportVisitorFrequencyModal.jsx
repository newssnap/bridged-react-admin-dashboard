import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Alert, Descriptions, Modal, Space, Spin, Tooltip, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { formatCount, formatDisplayDate, toNumber } from '../controllers/agentReportMetrics';
import { useAgentReportChartTheme } from '../controllers/useAgentReportChartTheme';

const { Text } = Typography;

export const CONVERSION_HELP_TEXT =
  'Converted = visitor submitted a form or clicked a CTA link at least once (an actionTake recorded on the card).';

// actionTakeConversionPct is already a 0-100 percentage with 2 decimals: shown as-is, never scaled.
const formatPct = value => {
  const number = toNumber(value);
  return number === null ? '—' : `${number.toFixed(2)}%`;
};

function AgentReportVisitorFrequencyModal({ open, agent, data, isLoading, errorText, onClose }) {
  const chartTheme = useAgentReportChartTheme();
  const buckets = data?.buckets || [];
  const totals = data?.totals || {};

  const options = {
    ...chartTheme,
    chart: { ...chartTheme.chart, height: 320 },
    xAxis: {
      ...chartTheme.xAxis,
      categories: buckets.map(bucket => bucket.label || `${bucket.sessionsPerVisitor}`),
      title: { text: 'Sessions per visitor', style: chartTheme.yAxis.title.style },
    },
    yAxis: [
      {
        ...chartTheme.yAxis,
        min: 0,
        title: { ...chartTheme.yAxis.title, text: 'Visitors (people)' },
      },
      {
        ...chartTheme.yAxis,
        min: 0,
        max: 100,
        opposite: true,
        title: { ...chartTheme.yAxis.title, text: 'Converted (%)' },
      },
    ],
    tooltip: { shared: true },
    series: [
      {
        type: 'column',
        name: 'Visitors',
        color: '#753fd0',
        data: buckets.map(bucket => toNumber(bucket.visitors) ?? 0),
      },
      {
        type: 'spline',
        name: 'Converted (%)',
        color: '#10b981',
        yAxis: 1,
        tooltip: { valueSuffix: '%', valueDecimals: 2 },
        data: buckets.map(bucket => toNumber(bucket.actionTakeConversionPct)),
      },
    ],
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={760}
      destroyOnClose
      title="Visitor frequency: how often visitors return, and who converts"
    >
      <Space direction="vertical" size={2} style={{ marginBottom: 'var(--mpr-2)' }}>
        <Text type="secondary">Visitors are grouped by sessions per visitor (1–9 and 10+).</Text>
        <Text type="secondary">
          <InfoCircleOutlined /> {CONVERSION_HELP_TEXT}
        </Text>
      </Space>
      {agent && (
        <Descriptions size="small" column={1} style={{ marginBottom: 'var(--mpr-2)' }}>
          <Descriptions.Item label="Agent">
            {agent.agentName ? `${agent.agentName} (${agent.agentId})` : agent.agentId}
          </Descriptions.Item>
          <Descriptions.Item label="Dates">
            {formatDisplayDate(agent.startDate)} – {formatDisplayDate(agent.endDate)}
          </Descriptions.Item>
        </Descriptions>
      )}
      {isLoading && <Spin style={{ display: 'block', margin: '40px auto' }} />}
      {!isLoading && errorText && <Alert type="error" showIcon message={errorText} />}
      {!isLoading && !errorText && data && (
        <>
          <Descriptions size="small" column={{ xs: 1, sm: 3 }} bordered>
            <Descriptions.Item label="Visitors (people)">
              {formatCount(toNumber(totals.visitors))}
            </Descriptions.Item>
            <Descriptions.Item label="Sessions">
              {formatCount(toNumber(totals.sessions))}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <Tooltip title={CONVERSION_HELP_TEXT}>
                  Converted <InfoCircleOutlined />
                </Tooltip>
              }
            >
              {formatCount(toNumber(totals.visitorsWithActionTake))} (
              {formatPct(totals.actionTakeConversionPct)})
            </Descriptions.Item>
          </Descriptions>
          {buckets.length ? (
            <HighchartsReact highcharts={Highcharts} options={options} />
          ) : (
            <Alert
              type="info"
              showIcon
              message="No visitors in this period."
              style={{ marginTop: 'var(--mpr-2)' }}
            />
          )}
        </>
      )}
    </Modal>
  );
}

export default AgentReportVisitorFrequencyModal;
