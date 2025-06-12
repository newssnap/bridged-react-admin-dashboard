import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import formatDate from '../formatting/formateDate';

export const arrayToExcelDashboard = (timelineData, title, metrics) => {
  const excludeKeys = ['_id'];

  // Define custom column names mapping
  const columnNames = {
    date: 'Date',
    cardViews: 'Views',
    engagementCount: 'Engagements',
    actionCount: 'Leads',
    timeSpent: 'Time Spent',
    productivityAgentUsageCount: 'Productivity Agent Usage',
    productivityAgentFeedbackCount: 'Productivity Agent Feedback',
  };

  const filteredData = timelineData.map(item => {
    const newItem = {};
    Object.keys(item).forEach(key => {
      if (!excludeKeys.includes(key)) {
        // Format date if the key is 'date'
        if (key === 'date') {
          newItem[columnNames[key]] = formatDate(item[key]);
        } else {
          // Use custom column name if available, otherwise use original key
          newItem[columnNames[key] || key] = item[key];
        }
      }
    });
    return newItem;
  });

  const workbook = XLSX.utils.book_new();

  // First sheet with metrics
  const secondSheetData = [
    {
      'Views Count': metrics?.viewCount || 0,
      'Total Engagements': metrics?.engagementCount || 0,
      'Total Leads': metrics?.leadCount || 0,
      'Productivity Agents Usage': metrics?.aiAgentUsageCount || 0,
      'Feedback Count': metrics?.aiAgentFeedbackCount || 0,
      'Start Date': metrics?.startDate || 'N/A',
      'End Date': metrics?.endDate || 'N/A',
    },
  ];

  // First sheet with date data
  const firstWorksheet = XLSX.utils.json_to_sheet(filteredData);
  XLSX.utils.book_append_sheet(workbook, firstWorksheet, 'Sheet 1');

  // Second sheet with metrics
  const secondWorksheet = XLSX.utils.json_to_sheet(secondSheetData);
  XLSX.utils.book_append_sheet(workbook, secondWorksheet, 'Sheet 2');

  // Third sheet with per agent usage (no Domain column, data starts from column B)
  if (metrics?.perAgentUsage?.length > 0) {
    const startDate = dayjs(metrics.startDate);
    const endDate = dayjs(metrics.endDate);
    const dateDiff = endDate.diff(startDate, 'day') + 1;

    let thirdSheetRows = [];
    metrics.perAgentUsage.forEach(agent => {
      const totalUsage = agent.successUsageCount;
      const usageRate = dateDiff > 0 ? (totalUsage / dateDiff).toFixed(9) : 0;
      // 1. Agent Title
      thirdSheetRows.push([agent.title || '']);
      // 2. Email or No Email
      thirdSheetRows.push([agent.email ? agent.email : 'No Email']);
      // 3. Header row (with actual number of days, shifted to column B)
      thirdSheetRows.push([
        '',
        'Usage total',
        'From Date',
        'To Date',
        'Errors',
        'Feedbacks',
        `Average for the last ${dateDiff} days`,
      ]);
      // 4. Data row (shifted to column B)
      thirdSheetRows.push([
        '',
        totalUsage,
        metrics.startDate,
        metrics.endDate,
        agent.failedUsageCount || 0,
        agent.feedbackCount || 0,
        usageRate,
      ]);
      // 5. Blank row for spacing
      thirdSheetRows.push([]);
    });

    const thirdWorksheet = XLSX.utils.aoa_to_sheet(thirdSheetRows);
    XLSX.utils.book_append_sheet(workbook, thirdWorksheet, 'Sheet 3');
  }

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  const excelBlob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const excelTitle = `Bridged Media - ${title ? title : 'Analytics'}.xlsx`;

  saveAs(excelBlob, excelTitle);
};
