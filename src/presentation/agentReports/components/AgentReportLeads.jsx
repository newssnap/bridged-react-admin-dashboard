import { useMemo } from 'react';
import { Alert, Button, Card, Empty, Space, Spin, Switch, Table, Tag, Typography } from 'antd';
import { DownloadOutlined, LockOutlined, TeamOutlined } from '@ant-design/icons';
import { formatDisplayDate } from '../controllers/agentReportMetrics';

const { Text, Title } = Typography;

const renderLeadCell = value =>
  value === null || value === undefined || value === '' ? '—' : String(value);

function LeadActionTable({ action }) {
  const columns = action.columns.map(column => ({
    title: column,
    dataIndex: column,
    key: column,
    render: renderLeadCell,
    sorter: (a, b) => String(a[column] ?? '').localeCompare(String(b[column] ?? '')),
  }));
  // Row keys live on a copy so the source rows (also used for Excel) stay untouched.
  const dataSource = useMemo(
    () => action.rows.map((row, index) => ({ ...row, __leadKey: index })),
    [action.rows]
  );

  return (
    <Space direction="vertical" size={4} style={{ width: '100%' }}>
      <Space wrap size="small">
        <Text strong>{action.title}</Text>
        <Tag>{action.actionType}</Tag>
        <Text type="secondary">{action.rows.length.toLocaleString()} lead(s)</Text>
      </Space>
      <Table
        rowKey="__leadKey"
        dataSource={dataSource}
        columns={columns}
        size="small"
        bordered
        scroll={{ x: 'max-content' }}
        pagination={{
          defaultPageSize: 10,
          pageSizeOptions: [10, 25, 50, 100],
          showSizeChanger: true,
          position: ['bottomLeft'],
          showTotal: total => `${total.toLocaleString()} leads`,
        }}
      />
    </Space>
  );
}

// On-demand leads for the open report's agents and dates (personal data).
function AgentReportLeads({ leads, dateSummary, agentCount }) {
  const {
    loadLeads,
    isLoadingLeads,
    isLeadsLoaded,
    leadsErrors,
    leadsByAgent,
    totalLeads,
    hasLeads,
    downloadLeads,
    includeLeadsInReport,
    setIncludeLeadsInReport,
  } = leads;

  const dateText = dateSummary.isUniform
    ? `${formatDisplayDate(dateSummary.startDate)} – ${formatDisplayDate(dateSummary.endDate)}`
    : 'each agent’s own date range';

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Alert
        type="warning"
        showIcon
        icon={<LockOutlined />}
        message="Leads are personal data for internal use — do not share them outside the client."
      />

      <Space wrap>
        <Button
          type={isLeadsLoaded ? 'default' : 'primary'}
          icon={<TeamOutlined />}
          onClick={loadLeads}
          loading={isLoadingLeads}
        >
          {isLeadsLoaded ? 'Reload leads' : 'Load leads'}
        </Button>
        <Text type="secondary">
          For the {agentCount} agent(s) in this report, {dateText}.
        </Text>
      </Space>

      {leadsErrors.map(errorText => (
        <Alert key={errorText} type="error" showIcon message={errorText} />
      ))}

      {isLoadingLeads && (
        <Spin tip="Loading leads — large agents can take a few seconds…">
          <div style={{ height: 100 }} />
        </Spin>
      )}

      {!isLoadingLeads && isLeadsLoaded && !hasLeads && !leadsErrors.length && (
        <Empty description="No leads were collected by these agents in this period." />
      )}

      {!isLoadingLeads && hasLeads && (
        <>
          <Space wrap size="middle">
            <Text strong>{totalLeads.toLocaleString()} lead(s) in total</Text>
            <Button icon={<DownloadOutlined />} onClick={downloadLeads}>
              Download leads (Excel)
            </Button>
            <Space size="small">
              <Switch
                size="small"
                checked={includeLeadsInReport}
                onChange={setIncludeLeadsInReport}
                aria-label="Include leads in the main report download"
              />
              <Text>Include leads in the main report download</Text>
            </Space>
          </Space>

          {leadsByAgent.map(agent => (
            <Card
              key={agent.agentId}
              size="small"
              title={
                <Space wrap size="small">
                  <Title level={5} style={{ margin: 0 }}>
                    {agent.agentName}
                  </Title>
                  <Text type="secondary" style={{ fontWeight: 400 }}>
                    {agent.agentId} · {agent.leadCount.toLocaleString()} lead(s)
                  </Text>
                </Space>
              }
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {agent.actions.map(action => (
                  <LeadActionTable key={action.key} action={action} />
                ))}
              </Space>
            </Card>
          ))}
        </>
      )}
    </Space>
  );
}

export default AgentReportLeads;
