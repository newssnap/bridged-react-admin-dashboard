import * as XLSX from 'xlsx';
import {
  useGenerateUserTokenMutation,
  useGetAllUserDomainsMutation,
  useGetCustomerReportMutation,
  useGetResearchPartnerDateMutation,
  useGetDiscoveryAgentDataMutation,
  useGetSummaryUsageDataMutation,
  useGetSEOV3DataMutation,
  useGetSEOV4DataMutation,
  useGetBacklinkUsageDataMutation,
} from '../../../services/api';
import { useState } from 'react';
export const useReportHandler = () => {
  const [generateUserToken, { isLoading: isGeneratingToken }] = useGenerateUserTokenMutation();
  const [getAllUserDomains, { isLoading: isGettingUserDomains }] = useGetAllUserDomainsMutation();
  const [getCustomerReport, { isLoading: isGettingCustomerReport }] =
    useGetCustomerReportMutation();
  const [getResearchPartnerDate, { isLoading: isGettingResearchPartnerDate }] =
    useGetResearchPartnerDateMutation();
  const [getDiscoveryAgentData, { isLoading: isGettingDiscoveryAgentData }] =
    useGetDiscoveryAgentDataMutation();
  const [getSummaryUsageData, { isLoading: isGettingSummaryUsageData }] =
    useGetSummaryUsageDataMutation();
  const [getSEOV3Data, { isLoading: isGettingSEOV3Data }] = useGetSEOV3DataMutation();
  const [getSEOV4Data, { isLoading: isGettingSEOV4Data }] = useGetSEOV4DataMutation();
  const [getBacklinkUsageData, { isLoading: isGettingBacklinkUsageData }] =
    useGetBacklinkUsageDataMutation();
  let reportGenerateLoading =
    isGettingResearchPartnerDate ||
    isGettingDiscoveryAgentData ||
    isGettingSummaryUsageData ||
    isGettingSEOV3Data ||
    isGettingSEOV4Data ||
    isGettingBacklinkUsageData ||
    isGettingCustomerReport;
  const [userToken, setUserToken] = useState(null);
  const [userDomains, setUserDomains] = useState([]);
  const handleGenerateUserToken = async data => {
    try {
      const response = await generateUserToken(data).unwrap();
      if (response.success) {
        setUserToken(response.data.jwtToken);
        handleGetAllUserDomains(response.data.jwtToken);
        return response.data.jwtToken;
      } else {
        throw new Error(response.errorObject.userErrorText);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetAllUserDomains = async token => {
    try {
      const response = await getAllUserDomains({ customToken: token }).unwrap();
      if (response.success) {
        setUserDomains(response.data);
      } else {
        throw new Error(response.errorObject.userErrorText);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleCustomerReport = async data => {
    console.log('Using userToken:', userToken);
    try {
      const response = await getCustomerReport({ data, customToken: userToken }).unwrap();
      if (response.success) {
        // Format the data to match exportCustomerFacingExcel expected structure
        const formattedData = {
          filteredCampaigns: response.data.filteredCampaigns,
          allTimeAllCampaigns: response.data.allTimeAllCampaigns,
        };
        exportCustomerFacingExcel(formattedData, data);
      } else {
        throw new Error(response.errorObject.userErrorText);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUsageReport = async data => {
    try {
      // Make all 6 API calls concurrently
      const promises = [
        getResearchPartnerDate({
          startDate: data.startDate,
          endDate: data.endDate,
          hostnames: data.hostnames,
        }).unwrap(),
        getDiscoveryAgentData({
          startDate: data.startDate,
          endDate: data.endDate,
          hostnames: data.hostnames,
        }).unwrap(),
        getSummaryUsageData({
          startDate: data.startDate,
          endDate: data.endDate,
          hostnames: data.hostnames,
        }).unwrap(),
        getSEOV3Data({
          startDate: data.startDate,
          endDate: data.endDate,
          hostnames: data.hostnames,
        }).unwrap(),
        getSEOV4Data({
          startDate: data.startDate,
          endDate: data.endDate,
          hostnames: data.hostnames,
        }).unwrap(),
        getBacklinkUsageData({
          startDate: data.startDate,
          endDate: data.endDate,
          hostnames: data.hostnames,
        }).unwrap(),
      ];

      // Wait for all API calls to complete
      const responses = await Promise.all(promises);

      // Extract data from all successful responses and combine into one array
      const combinedData = responses
        .filter(response => response.success)
        .map(response => response.data)
        .flat(); // Flatten all arrays into one

      // Call exportProductivityExcell with the combined data
      exportProductivityExcell(combinedData, data);
    } catch (error) {
      console.log('Error in handleUsageReport:', error);
    }
  };

  function exportProductivityExcell(data, filter) {
    const flattenedData = data.flat(); // Merge all sub-arrays
    console.log('flattenedData', flattenedData);
    let serviceNames = [
      'researchPartner',
      'summaryGenerator',
      'seoAgent',
      'backlinkGenerator',
      'discoveryAgent',
      'seoAgentV4',
    ];

    // Step 2: Prepare the Excel sheet data
    const wsData = [];
    let endDate = new Date(filter.endDate);
    endDate.setDate(endDate.getDate() - 1);
    endDate = new Date(endDate.setHours(23, 59, 59, 999)).toISOString().split('T')[0];
    var dayCount = getDayDifference(filter.startDate, endDate);
    // calculate number of days between startdate and endDate

    for (let serviceName of serviceNames) {
      var filteredData = flattenedData.filter(s => s.serviceName == serviceName);
      if (filteredData.length < 1) continue;

      // Service name
      let serviceNameCell = [capitalize(serviceName)];
      if (serviceName == 'seoAgentV4') serviceNameCell = ['Pro SEO Agent'];
      wsData.push(serviceNameCell);
      for (let item of filteredData) {
        let email = [item.email ? item.email : 'No Email'];
        wsData.push(email); // Email under the service name
        wsData.push([
          '',
          'Domain',
          'Usage total',
          'From Date',
          'To Date',
          'Errors / Feedbacks',
          `Average for the last ${dayCount} Days`,
        ]);
        let d = [
          '',
          item.hostname,
          item.totalUsage,
          filter.startDate, // Assuming last 7 days usage is same
          endDate, // Assuming last 7 days usage is same
          item.totalFeedback ? item.totalFeedback : 0,
          // Math.round(item.totalUsage / dayCount) // Average per day
          item.totalUsage / dayCount, // Average per day
        ];
        wsData.push(d);
        wsData.push([]); // Empty row for spacing
        wsData.push([]); // Empty row for spacing
      }
      wsData.push([]);
    }

    // Step 3: Create Worksheet & Apply Formatting
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Step 5: Create Workbook & Save
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    XLSX.writeFile(wb, 'ProductivityUsage.xlsx');
  }

  function exportCustomerFacingExcel(data, filter) {
    const filteredDate = data.filteredCampaigns;
    const allTimeCampaigns = data.allTimeAllCampaigns;

    let endDate = new Date(filter.endDate);
    endDate.setDate(endDate.getDate() - 1);
    endDate = new Date(endDate.setHours(23, 59, 59, 999)).toISOString().split('T')[0];
    var dayCount = getDayDifference(filter.startDate, endDate);

    const filteredDataExcell = [];
    for (let item of filteredDate) {
      filteredDataExcell.push([item.title]);
      filteredDataExcell.push([
        'FromDate',
        'To Date',
        'Views',
        'Engagement',
        'Conversion',
        'Number of Days',
      ]);
      filteredDataExcell.push([
        filter.startDate,
        endDate,
        item.views,
        item.engagements,
        item.conversions,
        dayCount,
      ]);
      filteredDataExcell.push([]);
      filteredDataExcell.push([]);
    }
    const allTimeCampaignDataExcell = [];
    for (let item of allTimeCampaigns) {
      allTimeCampaignDataExcell.push([item.title]);
      allTimeCampaignDataExcell.push(['Views', 'Engagement', 'Conversion']);
      allTimeCampaignDataExcell.push([item.views, item.engagements, item.conversions]);
      allTimeCampaignDataExcell.push([]);
      allTimeCampaignDataExcell.push([]);
    }
    const fc = XLSX.utils.aoa_to_sheet(filteredDataExcell);
    const ac = XLSX.utils.aoa_to_sheet(allTimeCampaignDataExcell);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, fc, 'Report With Date Filter');
    XLSX.utils.book_append_sheet(wb, ac, 'All Time');

    XLSX.writeFile(wb, 'CustomerFacingReport.xlsx');
  }

  function capitalize(str) {
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
  }
  function getDayDifference(startDateIn, endDateIn) {
    const startDate = new Date(startDateIn);
    const endDate = new Date(endDateIn);

    // Calculate the difference in milliseconds
    const diffInMs = endDate - startDate;

    // Convert to days (1 day = 1000 * 60 * 60 * 24 milliseconds)
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return diffInDays;
  }
  return {
    exportProductivityExcell,
    exportCustomerFacingExcel,
    handleGenerateUserToken,
    handleCustomerReport,
    handleUsageReport,
    isGeneratingToken,
    isGettingUserDomains,
    isGettingCustomerReport,
    isGettingResearchPartnerDate,
    isGettingDiscoveryAgentData,
    isGettingSummaryUsageData,
    isGettingSEOV3Data,
    isGettingSEOV4Data,
    isGettingBacklinkUsageData,
    userToken,
    reportGenerateLoading,
    handleGetAllUserDomains,
    userDomains,
  };
};
