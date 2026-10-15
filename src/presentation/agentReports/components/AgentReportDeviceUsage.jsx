import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Card } from 'antd';
import { DEVICE_TYPES } from '../controllers/agentReportMetrics';
import { useAgentReportChartTheme } from '../controllers/useAgentReportChartTheme';

const DEVICE_COLORS = {
  Mobile: '#753fd0',
  Tablet: '#10b981',
  Desktop: '#3b82f6',
  Unknown: '#a3a3a3',
};

// Share of Device Base Usage per agent (Mobile / Tablet / Desktop / Unknown).
function AgentReportDeviceUsage({ deviceUsage }) {
  const chartTheme = useAgentReportChartTheme();
  const agents = deviceUsage.filter(agent => agent.total > 0);
  if (!agents.length) return null;

  const options = {
    ...chartTheme,
    chart: { ...chartTheme.chart, type: 'bar', height: Math.max(160, agents.length * 42 + 90) },
    xAxis: {
      ...chartTheme.xAxis,
      categories: agents.map(agent => agent.agentName || agent.agentId),
    },
    yAxis: {
      ...chartTheme.yAxis,
      min: 0,
      max: 100,
      title: { ...chartTheme.yAxis.title, text: 'Share of usage (%)' },
    },
    tooltip: {
      shared: true,
      pointFormat:
        '<span style="color:{point.color}">●</span> {series.name}: <b>{point.percentage:.1f}%</b> ({point.y:,.0f})<br/>',
    },
    plotOptions: { bar: { stacking: 'percent', borderWidth: 0 } },
    series: DEVICE_TYPES.map(device => ({
      name: device,
      color: DEVICE_COLORS[device],
      data: agents.map(agent => agent.counts[device]),
    })),
  };

  return (
    <Card title="Device usage per agent" size="small">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </Card>
  );
}

export default AgentReportDeviceUsage;
