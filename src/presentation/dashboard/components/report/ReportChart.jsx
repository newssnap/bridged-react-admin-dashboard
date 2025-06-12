import { Line } from '@ant-design/charts';
import { Button, Col, Row, Select, Space, theme, Tooltip } from 'antd';
import { ReportChartSkeleton } from '../../skeletons/DashboardSkeletons';
import DateFilter from '../../../../utils/components/dateFilter/workflow/DateFilter';
import Icon from '../../../../utils/components/Icon';

function ReportChart({ isLoading, chartConfig, CHART_FILTERS, chartFilter, setChartFilter }) {
  const {
    token: { colorBgLayout },
  } = theme.useToken();

  return (
    <Row gutter={[15, 15]} style={{ padding: 'var(--mpr-2)' }}>
      <Col span={24}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 15 }}>
          <Select
            options={CHART_FILTERS}
            size="small"
            style={{
              width: '170px',
              backgroundColor: colorBgLayout,
              borderRadius: 'var(--mpr-4)',
            }}
            value={chartFilter}
            onChange={setChartFilter}
            variant="borderless"
          />
        </Row>
      </Col>
      <Col span={24}>
        <Row gutter={[15, 15]}>
          <Col span={24}>{isLoading ? <ReportChartSkeleton /> : <Line {...chartConfig} />}</Col>
        </Row>
      </Col>
    </Row>
  );
}

export default ReportChart;
