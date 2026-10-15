import { Alert, Button, Col, Row, Space, Spin, Typography } from 'antd';
import { useAgentReportForm } from '../controllers/useAgentReportForm';
import { useAgentReportHandler } from '../controllers/useAgentReportHandler';
import { useAgentReportVisitorFrequency } from '../controllers/useAgentReportVisitorFrequency';
import { useAgentReportLeads } from '../controllers/useAgentReportLeads';
import AgentReportForm from '../components/AgentReportForm';
import AgentReportProgress from '../components/AgentReportProgress';
import AgentReportContextBar from '../components/AgentReportContextBar';
import AgentReportKpiTiles from '../components/AgentReportKpiTiles';
import AgentReportAgentTable from '../components/AgentReportAgentTable';
import AgentReportDeviceUsage from '../components/AgentReportDeviceUsage';
import AgentReportSheetTabs from '../components/AgentReportSheetTabs';
import AgentReportLeads from '../components/AgentReportLeads';
import AgentReportVisitorFrequencyModal from '../components/AgentReportVisitorFrequencyModal';
import RecentAgentReports from '../components/RecentAgentReports';

const { Title, Text } = Typography;

function AgentReportsWorkflow() {
  const form = useAgentReportForm();
  const report = useAgentReportHandler();
  const visitorFrequency = useAgentReportVisitorFrequency();
  const leads = useAgentReportLeads({
    reportId: report.activeReport?.reportId,
    campaigns: report.campaigns,
    agentNames: report.agentNames,
    firstAgentName: report.firstAgentName,
  });

  const handleGenerate = () => {
    const campaigns = form.buildCampaigns();
    if (campaigns) report.submitReport(campaigns, form.agentType);
  };

  const handleOpenRecent = entry => {
    report.openRecentReport(entry);
    form.loadCampaigns(entry.campaigns, entry.agentType);
  };

  const { activeReport, result } = report;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space direction="vertical" size={0}>
        <Title level={2} style={{ fontWeight: 300, marginBottom: 0 }}>
          Agent Reports
        </Title>
        <Text type="secondary">
          Generate a report for one or more agents and download it as Excel.
        </Text>
      </Space>

      <Row gutter={[15, 15]}>
        <Col xs={24} xl={16}>
          <AgentReportForm
            form={form}
            onGenerate={handleGenerate}
            isSubmitting={report.isSubmitting}
            submitError={report.submitError}
          />
        </Col>
        <Col xs={24} xl={8}>
          <RecentAgentReports
            recentReports={report.recentReports}
            activeReportId={activeReport?.reportId}
            onOpen={handleOpenRecent}
            onRemove={report.removeRecentReport}
            onClear={report.clearRecentReports}
          />
        </Col>
      </Row>

      {activeReport && (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <AgentReportContextBar
            campaigns={report.campaigns}
            agentNames={report.agentNames}
            dateSummary={report.dateSummary}
            agentType={report.agentType}
            onChangeType={report.setViewType}
            typeDetectedFromData={report.typeDetectedFromData}
            generatedAt={result?.meta?.generatedAt}
            expiresAt={report.statusData?.expiresAt || activeReport.expiresAt}
            onDownload={() => report.downloadExcel(leads.reportLeadActions)}
            includesLeads={leads.includeLeadsInReport}
            canDownload={Boolean(result) && report.hasSheets}
            onNewReport={report.closeReport}
          />

          <AgentReportProgress
            statusData={report.statusData}
            statusAgents={report.statusAgents}
            failedAgents={report.failedAgents}
            statusErrorText={report.statusErrorText}
            isExpired={report.isExpired}
            isPolling={report.isPolling}
            isTerminal={report.isTerminal}
            onRunAgain={report.runAgain}
            isSubmitting={report.isSubmitting}
          />

          {report.isReady && report.isResultLoading && !result && (
            <Spin tip="Loading report data…">
              <div style={{ height: 120 }} />
            </Spin>
          )}

          {report.resultErrorText && (
            <Alert
              type="error"
              showIcon
              message="The report finished but its data could not be loaded"
              description={report.resultErrorText}
              action={<Button onClick={report.refetchResult}>Retry</Button>}
            />
          )}

          {result && !report.isExpired && (
            <>
              <AgentReportKpiTiles kpis={report.kpis} agentCount={report.agentTableRows.length} />
              <AgentReportAgentTable
                rows={report.agentTableRows}
                typeConfig={report.typeConfig}
                onOpenVisitorFrequency={visitorFrequency.openVisitorFrequency}
              />
              <AgentReportDeviceUsage deviceUsage={report.deviceUsage} />
              {/*
                AI insights slot (future): an "AI insights" panel will render here, fed by
                report.kpis, report.agentTableRows and report.result. Intentionally not rendered yet.
              */}
              <AgentReportSheetTabs
                result={result}
                sheetNames={report.visibleSheetNames}
                extraItems={[
                  {
                    key: 'leads',
                    label: leads.isLeadsLoaded
                      ? `Leads (${leads.totalLeads.toLocaleString()})`
                      : 'Leads',
                    children: (
                      <AgentReportLeads
                        leads={leads}
                        dateSummary={report.dateSummary}
                        agentCount={report.campaigns.length}
                      />
                    ),
                  },
                ]}
              />
            </>
          )}
        </Space>
      )}

      <AgentReportVisitorFrequencyModal
        open={visitorFrequency.isVisitorFrequencyOpen}
        agent={visitorFrequency.selectedAgent}
        data={visitorFrequency.visitorFrequency}
        isLoading={visitorFrequency.isVisitorFrequencyLoading}
        errorText={visitorFrequency.visitorFrequencyErrorText}
        onClose={visitorFrequency.closeVisitorFrequency}
      />
    </Space>
  );
}

export default AgentReportsWorkflow;
