import { Card, Col, Row, Space, Tag, Tooltip, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import AgentReportMetricValue from './AgentReportMetricValue';

const { Text } = Typography;

const UNIT_TAGS = {
  events: { color: 'default', label: 'events' },
  people: { color: 'blue', label: 'unique people' },
};

function AgentReportKpiTiles({ kpis, agentCount }) {
  if (!kpis.length) return null;

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      {agentCount > 1 && (
        <Text type="secondary">
          Totals across {agentCount} agents. Unique-people figures are summed per agent, so a
          visitor who used two agents is counted twice.
        </Text>
      )}
      <Row gutter={[15, 15]}>
        {kpis.map(metric => {
          const unitTag = UNIT_TAGS[metric.unit];
          return (
            <Col key={metric.key} xs={24} sm={12} lg={6}>
              <Card size="small" style={{ height: '100%' }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Space size={6} wrap>
                    <Text strong>{metric.label}</Text>
                    {unitTag && (
                      <Tag color={unitTag.color} style={{ marginInlineEnd: 0 }}>
                        {unitTag.label}
                      </Tag>
                    )}
                    <Tooltip title={metric.help}>
                      <InfoCircleOutlined aria-label={`About ${metric.label}`} />
                    </Tooltip>
                  </Space>
                  <AgentReportMetricValue metric={metric} size="large" />
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Space>
  );
}

export default AgentReportKpiTiles;
