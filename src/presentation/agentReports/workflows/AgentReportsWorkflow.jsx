import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { PageHeader } from '@/components/page-header';
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Agent reports"
        description="Generate a report for one or more agents and download it as Excel."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AgentReportForm
            form={form}
            onGenerate={handleGenerate}
            isSubmitting={report.isSubmitting}
            submitError={report.submitError}
          />
        </div>
        <RecentAgentReports
          recentReports={report.recentReports}
          activeReportId={activeReport?.reportId}
          onOpen={handleOpenRecent}
          onRemove={report.removeRecentReport}
          onClear={report.clearRecentReports}
        />
      </div>

      {activeReport && (
        <div className="flex flex-col gap-6">
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
            <div className="flex flex-col gap-3" role="status" aria-label="Loading report data">
              <Skeleton className="h-28 rounded-lg" />
              <Skeleton className="h-64 rounded-lg" />
            </div>
          )}

          {report.resultErrorText && (
            <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
              <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
              <AlertTitle>The report finished but its data couldn't be loaded</AlertTitle>
              <AlertDescription>{report.resultErrorText}</AlertDescription>
              <AlertAction>
                <Button variant="outline" size="sm" onClick={report.refetchResult}>
                  Try again
                </Button>
              </AlertAction>
            </Alert>
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
                    label: 'Leads',
                    count: leads.isLeadsLoaded ? leads.totalLeads : null,
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
        </div>
      )}

      <AgentReportVisitorFrequencyModal
        open={visitorFrequency.isVisitorFrequencyOpen}
        agent={visitorFrequency.selectedAgent}
        data={visitorFrequency.visitorFrequency}
        isLoading={visitorFrequency.isVisitorFrequencyLoading}
        errorText={visitorFrequency.visitorFrequencyErrorText}
        onClose={visitorFrequency.closeVisitorFrequency}
      />
    </div>
  );
}

export default AgentReportsWorkflow;
