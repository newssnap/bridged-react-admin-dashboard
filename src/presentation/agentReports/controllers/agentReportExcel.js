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

// ---------- Leads ----------

const INVALID_SHEET_NAME_CHARS = /[[\]:*?/\\]/g;

// Excel sheet names: max 31 chars, no []:*?/\, no leading/trailing apostrophe, unique
// (case-insensitive) within the workbook.
export const toUniqueSheetName = (rawName, usedNames) => {
  const base =
    String(rawName || '')
      .replace(INVALID_SHEET_NAME_CHARS, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^'+|'+$/g, '')
      .slice(0, EXCEL_SHEET_NAME_LIMIT)
      .trim() || 'Leads';
  let name = base;
  for (let copy = 2; usedNames.has(name.toLowerCase()); copy += 1) {
    const suffix = ` (${copy})`;
    name = `${base.slice(0, EXCEL_SHEET_NAME_LIMIT - suffix.length).trim()}${suffix}`;
  }
  usedNames.add(name.toLowerCase());
  return name;
};

// One sheet per lead action, named "<agent> - <action title>".
export const buildLeadSheets = (leadActions = [], reservedNames = []) => {
  const usedNames = new Set(reservedNames.map(name => name.toLowerCase()));
  return leadActions.map(action => ({
    name: toUniqueSheetName(`${action.agentName} - ${action.title}`, usedNames),
    worksheet: XLSX.utils.json_to_sheet(action.rows, { header: action.columns }),
  }));
};

export const buildAgentReportWorkbook = (result, leadActions = []) => {
  const workbook = XLSX.utils.book_new();
  const sheetNames = getOrderedSheetNames(result).map(sheetName => ({
    sheetName,
    excelName: sheetName.slice(0, EXCEL_SHEET_NAME_LIMIT),
  }));
  sheetNames.forEach(({ sheetName, excelName }) => {
    XLSX.utils.book_append_sheet(workbook, sheetToWorksheet(result.sheets[sheetName]), excelName);
  });
  buildLeadSheets(
    leadActions,
    sheetNames.map(({ excelName }) => excelName)
  ).forEach(({ name, worksheet }) => XLSX.utils.book_append_sheet(workbook, worksheet, name));
  return workbook;
};

const toFileSafe = value =>
  String(value)
    .trim()
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

export const buildAgentReportFileName = (
  campaigns = [],
  firstAgentName,
  prefix = 'Bridged-report'
) => {
  const { startDate, endDate } = summarizeCampaignDates(campaigns);
  const agentPart =
    campaigns.length === 1
      ? toFileSafe(firstAgentName || campaigns[0].id)
      : `${campaigns.length}-agents`;
  return `${prefix}_${agentPart || 'agents'}_${startDate}_${endDate}.xlsx`;
};

export const downloadAgentReportExcel = (result, campaigns, firstAgentName, leadActions = []) => {
  const workbook = buildAgentReportWorkbook(result, leadActions);
  XLSX.writeFile(workbook, buildAgentReportFileName(campaigns, firstAgentName));
};

export const downloadLeadsExcel = (leadActions, campaigns, firstAgentName) => {
  const workbook = XLSX.utils.book_new();
  buildLeadSheets(leadActions).forEach(({ name, worksheet }) =>
    XLSX.utils.book_append_sheet(workbook, worksheet, name)
  );
  XLSX.writeFile(workbook, buildAgentReportFileName(campaigns, firstAgentName, 'Bridged-leads'));
};
