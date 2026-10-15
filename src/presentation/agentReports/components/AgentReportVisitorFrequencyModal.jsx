import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Alert, Descriptions, Modal, Spin } from 'antd';
import {
  formatCount,
  formatDisplayDate,
  formatPercent,
  toNumber,
} from '../controllers/agentReportMetrics';
import { useAgentReportChartTheme } from '../controllers/useAgentReportChartTheme';

// *Pct fields are percentages (0-100); formatPercent expects a 0-1 ratio.
const toRatio = value => {
  const number = toNumber(value);
  return number === null ? null : number / 100;
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
        title: { ...chartTheme.yAxis.title, text: 'Action-take conversion (%)' },
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
        name: 'Action-take conversion',
        color: '#10b981',
        yAxis: 1,
        tooltip: { valueSuffix: '%', valueDecimals: 1 },
        data: buckets.map(bucket => {
          const ratio = toRatio(bucket.actionTakeConversionPct);
          return ratio === null ? null : ratio * 100;
        }),
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
      title={`Visitor frequency — ${agent?.agentName || agent?.agentId || ''}`}
    >
      {agent && (
        <Descriptions size="small" column={1} style={{ marginBottom: 'var(--mpr-2)' }}>
          <Descriptions.Item label="Agent ID">{agent.agentId}</Descriptions.Item>
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
            <Descriptions.Item label="Took an action">
              {formatCount(toNumber(totals.visitorsWithActionTake))} (
              {formatPercent(toRatio(totals.actionTakeConversionPct))})
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
