import { Space, Tag, Tooltip, Typography, theme } from 'antd';
import { LOW_SAMPLE_THRESHOLD, RATE_ARTIFACT_TEXT } from '../../../constants/agentReportTypes';
import { formatPercent } from '../controllers/agentReportMetrics';

const { Text } = Typography;

export function LowSampleTag() {
  return (
    <Tooltip
      title={`Fewer than ${LOW_SAMPLE_THRESHOLD} engaged visitors — treat this figure as indicative only.`}
    >
      <Tag color="orange" style={{ marginInlineEnd: 0 }}>
        low sample
      </Tag>
    </Tooltip>
  );
}

// Renders one evaluated metric (see evaluateMetric) applying the data-honesty rules:
// implausible rates are greyed out as tracking artifacts, small samples are tagged.
function AgentReportMetricValue({ metric, size = 'default' }) {
  const {
    token: { colorTextDisabled },
  } = theme.useToken();

  if (!metric) return <Text type="secondary">—</Text>;

  const isLarge = size === 'large';
  const valueStyle = isLarge ? { fontSize: 28, fontWeight: 600, lineHeight: 1.2 } : {};

  if (metric.isArtifact) {
    return (
      <Tooltip title={`Calculated value was ${formatPercent(metric.value)}, which is impossible.`}>
        <Space direction="vertical" size={2}>
          <Text style={{ ...valueStyle, color: colorTextDisabled }}>n/a</Text>
          <Text style={{ color: colorTextDisabled, fontSize: 12 }}>{RATE_ARTIFACT_TEXT}</Text>
        </Space>
      </Tooltip>
    );
  }

  if (metric.kind === 'timePair') {
    return (
      <Space direction="vertical" size={2}>
        <Space size={6} align="baseline" wrap>
          <Text style={valueStyle}>{metric.display}</Text>
          <Text type="secondary">engaged</Text>
        </Space>
        <Space size={6} align="baseline" wrap>
          <Text style={isLarge ? { fontSize: 18 } : {}}>{metric.secondaryDisplay}</Text>
          <Text type="secondary">not engaged</Text>
        </Space>
        {metric.isLowSample && <LowSampleTag />}
      </Space>
    );
  }

  return (
    <Space size={6} align="center" wrap>
      <Text style={valueStyle}>{metric.display}</Text>
      {metric.isLowSample && metric.hasValue && <LowSampleTag />}
    </Space>
  );
}

export default AgentReportMetricValue;
