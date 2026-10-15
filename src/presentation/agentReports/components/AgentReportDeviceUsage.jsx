import React, { useMemo } from 'react';
import { Bar } from '@/components/charts';
import { DEVICE_TYPES } from '../controllers/agentReportMetrics';
import { ReportSection } from './ReportParts';

const numberFormat = new Intl.NumberFormat('en-GB');

// Share of Device Base Usage per agent (Mobile / Tablet / Desktop / Unknown), as stacked
// percentages; the tooltip also gives the raw count.
function AgentReportDeviceUsage({ deviceUsage }) {
  const agents = useMemo(() => deviceUsage.filter(agent => agent.total > 0), [deviceUsage]);

  const data = useMemo(
    () =>
      agents.flatMap(agent =>
        DEVICE_TYPES.map(device => ({
          agent: agent.agentName || agent.agentId,
          device,
          share: agent.total ? (agent.counts[device] / agent.total) * 100 : 0,
          count: agent.counts[device],
        }))
      ),
    [agents]
  );

  if (!agents.length) return null;

  return (
    <ReportSection
      title="Device usage per agent"
      description="Share of each agent's usage by device type."
    >
      <Bar
        data={data}
        xField="share"
        yField="agent"
        seriesField="device"
        isStack
        height={Math.max(160, agents.length * 42 + 90)}
        meta={{ share: { alias: 'Share', formatter: value => `${Number(value).toFixed(1)}%` } }}
        tooltip={{
          formatter: datum => ({
            name: datum.device,
            value: `${Number(datum.share).toFixed(1)}% (${numberFormat.format(datum.count)})`,
          }),
        }}
        legend={{ position: 'top-left' }}
      />
    </ReportSection>
  );
}

export default AgentReportDeviceUsage;
