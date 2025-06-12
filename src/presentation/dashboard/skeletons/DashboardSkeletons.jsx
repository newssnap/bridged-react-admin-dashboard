import { Skeleton } from 'antd';

/**
 * DashboardTextSkeleton component
 */
export function DashboardTextSkeleton({ style }) {
  return (
    <Skeleton.Button
      active
      style={{
        marginTop: '5px',
        ...style,
      }}
    />
  );
}

/**
 * PerformanceSkeleton component
 */
export function ReportChartSkeleton() {
  return (
    <Skeleton.Button
      active
      block
      style={{
        height: '250px',
      }}
    />
  );
}
