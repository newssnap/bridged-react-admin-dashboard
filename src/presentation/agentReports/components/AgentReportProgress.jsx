import { Alert, Button, Card, Collapse, List, Progress, Space, Spin, Tag, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import {
  AGENT_REPORT_POLL_INTERVAL_MS,
  AGENT_REPORT_STATUS_META,
  AGENT_STATUS_META,
} from '../../../constants/agentReportTypes';
import { toPlainAgentError } from '../controllers/agentReportMetrics';

const { Text } = Typography;

const agentLabel = agent =>
  agent.agentName ? `${agent.agentName} (${agent.agentId})` : agent.agentId;

function AgentReportProgress({
  statusData,
  statusAgents,
  failedAgents,
  statusErrorText,
  isExpired,
  isPolling,
  isTerminal,
  onRunAgain,
  isSubmitting,
}) {
  const runAgainButton = (
    <Button icon={<ReloadOutlined />} onClick={onRunAgain} loading={isSubmitting}>
      Run again
    </Button>
  );

  if (isExpired) {
    return (
      <Alert
        type="warning"
        showIcon
        message="This report has expired"
        description="Reports are kept for one day after they are created. Run it again to get fresh numbers for the same agents and dates."
        action={runAgainButton}
      />
    );
  }

  if (statusErrorText && !statusData) {
    return (
      <Alert
        type="error"
        showIcon
        message="Could not load the report status"
        description={isPolling ? `${statusErrorText} Retrying automatically…` : statusErrorText}
        action={runAgainButton}
      />
    );
  }

  if (!statusData) {
    return (
      <Card>
        <Space>
          <Spin size="small" />
          <Text>Checking report status…</Text>
        </Space>
      </Card>
    );
  }

  const { status, progress = {} } = statusData;
  const total = progress.total || statusAgents.length || 0;
  // progress.completed already includes failed agents.
  const finished = progress.completed || 0;
  const failedCount = progress.failed || 0;
  const percent = total ? Math.round((finished / total) * 100) : 0;
  const statusMeta = AGENT_REPORT_STATUS_META[status] || { label: status, color: 'default' };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {status === 'failed' && (
        <Alert
          type="error"
          showIcon
          message="The report could not be generated"
          description={
            <Space direction="vertical" size={2}>
              {statusData.error && <Text>{toPlainAgentError(statusData.error)}</Text>}
              {failedAgents.map(agent => (
                <Text key={agent.agentId}>
                  <Text strong>{agentLabel(agent)}</Text> — {agent.plainError}
                </Text>
              ))}
              {!statusData.error && !failedAgents.length && (
                <Text>No reason was given. Try running it again.</Text>
              )}
            </Space>
          }
          action={runAgainButton}
        />
      )}

      {status === 'partial' && (
        <Alert
          type="warning"
          showIcon
          message={`${failedAgents.length} agent(s) had no data`}
          description={
            <Space direction="vertical" size={2}>
              <Text>
                The numbers below are complete for every other agent. These agents are missing:
              </Text>
              {failedAgents.map(agent => (
                <Text key={agent.agentId}>
                  <Text strong>{agentLabel(agent)}</Text> — {agent.plainError}
                </Text>
              ))}
            </Space>
          }
        />
      )}

      {statusErrorText && (
        <Alert
          type={isPolling ? 'info' : 'error'}
          showIcon
          message={
            isPolling
              ? `Lost contact with the server (${statusErrorText}). Retrying automatically…`
              : statusErrorText
          }
        />
      )}

      <Card size="small">
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space wrap>
            <Text strong>Status</Text>
            <Tag color={statusMeta.color}>{statusMeta.label}</Tag>
            <Text>
              {finished} / {total} agents finished ({failedCount} failed)
            </Text>
          </Space>
          <Progress
            percent={percent}
            status={status === 'failed' ? 'exception' : isTerminal ? 'success' : 'active'}
          />
          {!isTerminal && (
            <Text type="secondary">
              Reports usually take 30 seconds to 5 minutes. Keep this page open — the status is
              checked every {AGENT_REPORT_POLL_INTERVAL_MS / 1000} seconds.
            </Text>
          )}
          {statusAgents.length > 0 && (
            <Collapse
              size="small"
              defaultActiveKey={!isTerminal || failedAgents.length ? ['agents'] : []}
              items={[
                {
                  key: 'agents',
                  label: `Per-agent status (${statusAgents.length})`,
                  children: (
                    <List
                      size="small"
                      dataSource={statusAgents}
                      pagination={
                        statusAgents.length > 20 ? { pageSize: 20, size: 'small' } : false
                      }
                      renderItem={agent => {
                        const meta = AGENT_STATUS_META[agent.status] || {
                          label: agent.status,
                          color: 'default',
                        };
                        return (
                          <List.Item>
                            <Space direction="vertical" size={0}>
                              <Space wrap>
                                <Tag color={meta.color}>{meta.label}</Tag>
                                <Text>{agentLabel(agent)}</Text>
                              </Space>
                              {agent.plainError && <Text type="danger">{agent.plainError}</Text>}
                            </Space>
                          </List.Item>
                        );
                      }}
                    />
                  ),
                },
              ]}
            />
          )}
        </Space>
      </Card>
    </Space>
  );
}

export default AgentReportProgress;
