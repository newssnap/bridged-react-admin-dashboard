import * as XLSX from 'xlsx';
import { summarizeCampaignDates } from './agentReportMetrics';

const EXCEL_SHEET_NAME_LIMIT = 31;

// Sheets in meta.sheetOrder first, then any extra sheet the backend returned.
export const getOrderedSheetNames = result => {
  const sheets = result?.sheets || {};
  const order = result?.meta?.sheetOrder || [];
  const ordered = order.filter(name => sheets[name]);
  const extras = Object.keys(sheets).filter(name => !ordered.includes(name));
  return [...ordered, ...extras];
};

const sheetToWorksheet = sheet => {
  if (sheet?.type === 'aoa') {
    const worksheet = XLSX.utils.aoa_to_sheet([
      sheet.categories || [],
      sheet.headers || [],
      ...(sheet.rows || []),
    ]);
    if (sheet.merges?.length) worksheet['!merges'] = sheet.merges;
    return worksheet;
  }
  return XLSX.utils.json_to_sheet(sheet?.rows || []);
};

export const buildAgentReportWorkbook = result => {
  const workbook = XLSX.utils.book_new();
  getOrderedSheetNames(result).forEach(sheetName => {
    XLSX.utils.book_append_sheet(
      workbook,
      sheetToWorksheet(result.sheets[sheetName]),
      sheetName.slice(0, EXCEL_SHEET_NAME_LIMIT)
    );
  });
  return workbook;
};

const toFileSafe = value =>
  String(value)
    .trim()
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

export const buildAgentReportFileName = (campaigns = [], firstAgentName) => {
  const { startDate, endDate } = summarizeCampaignDates(campaigns);
  const agentPart =
    campaigns.length === 1
      ? toFileSafe(firstAgentName || campaigns[0].id)
      : `${campaigns.length}-agents`;
  return `Bridged-report_${agentPart || 'agents'}_${startDate}_${endDate}.xlsx`;
};

export const downloadAgentReportExcel = (result, campaigns, firstAgentName) => {
  const workbook = buildAgentReportWorkbook(result);
  XLSX.writeFile(workbook, buildAgentReportFileName(campaigns, firstAgentName));
};
