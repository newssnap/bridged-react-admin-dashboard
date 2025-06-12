import { Col, Row, Typography, theme } from 'antd';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { DashboardTextSkeleton } from '../../skeletons/DashboardSkeletons';

const { Title, Text } = Typography;

function Reports({ isLoading }) {
  const { leadCount, aiAgentUsageCount, engagementCount, viewCount, aiAgentFeedbackCount } =
    useSelector(state => state.dashboard.dashboardInfo);

  const {
    token: { colorBorderSecondary },
  } = theme.useToken();

  const dashboardMetrics = useMemo(() => {
    return [
      {
        title: (
          <span>
            Total <br /> views
          </span>
        ),
        value: viewCount,
      },
      {
        title: (
          <span>
            Total <br /> engagements
          </span>
        ),
        value: engagementCount,
      },
      {
        title: (
          <span>
            Total <br /> Leads
          </span>
        ),
        value: leadCount,
      },
      {
        title: (
          <span>
            Productivity <br /> agents usage
          </span>
        ),
        value: aiAgentUsageCount,
        subValue: {
          label: 'Feedback count',
          value: aiAgentFeedbackCount,
        },
      },
    ];
  }, [leadCount, aiAgentUsageCount, engagementCount, viewCount, aiAgentFeedbackCount]);

  return (
    <Row gutter={[0, 0]} style={{ height: '100%' }}>
      {dashboardMetrics.map((item, index) => (
        <Col
          key={index}
          xs={24}
          sm={12}
          style={{
            borderRight: index % 2 === 0 ? `1px solid ${colorBorderSecondary}` : 'none',
            borderBottom: index < 2 ? `1px solid ${colorBorderSecondary}` : 'none',
            padding: 'var(--mpr-2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'start',
            gap: 'var(--mpr-3)',
            paddingTop: 'var(--mpr-1)',
          }}
        >
          <Text style={{ fontSize: 17.5, fontWeight: 500, lineHeight: 1.2 }}>{item.title}</Text>
          {isLoading ? (
            <DashboardTextSkeleton />
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--mpr-1)',
              }}
            >
              <Title level={2} style={{ margin: 0 }}>
                {item.value}
              </Title>
              {item.subValue && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--mpr-3)',
                  }}
                >
                  <Text type="secondary" style={{ color: '#0fb37d', whiteSpace: 'nowrap' }}>
                    {item.subValue.label}:
                  </Text>
                  <Text strong style={{ color: '#0fb37d', whiteSpace: 'nowrap' }}>
                    {item.subValue.value}
                  </Text>
                </div>
              )}
            </div>
          )}
        </Col>
      ))}
    </Row>
  );
}

export default Reports;
