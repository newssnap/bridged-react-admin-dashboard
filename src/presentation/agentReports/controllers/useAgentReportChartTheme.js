import { useMemo } from 'react';
import { theme } from 'antd';

// Shared Highcharts options so report charts follow antd light / dark tokens.
export const useAgentReportChartTheme = () => {
  const {
    token: { colorText, colorTextSecondary, colorBorderSecondary, fontFamily },
  } = theme.useToken();

  return useMemo(() => {
    const labelStyle = { color: colorTextSecondary, fontFamily };
    return {
      chart: { backgroundColor: 'transparent', style: { fontFamily } },
      title: { text: null },
      credits: { enabled: false },
      legend: { itemStyle: { color: colorText, fontWeight: 500 } },
      xAxis: { labels: { style: labelStyle }, lineColor: colorBorderSecondary },
      yAxis: {
        labels: { style: labelStyle },
        title: { style: labelStyle },
        gridLineColor: colorBorderSecondary,
      },
    };
  }, [colorText, colorTextSecondary, colorBorderSecondary, fontFamily]);
};
