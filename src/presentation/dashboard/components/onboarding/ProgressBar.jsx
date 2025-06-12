import { theme, Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

function ProgressBar({ completed = 0, total = 0 }) {
  const percentage = Math.round((completed / total) * 100);

  const {
    token: { colorBgLayout },
  } = theme.useToken();

  return (
    <div className="progress-container" style={{ backgroundColor: colorBgLayout }}>
      <div className="progress-header">
        <Text style={{ fontSize: 16, fontWeight: 500 }}>
          {completed}/{total} tasks completed
        </Text>
        <Text style={{ fontSize: 16, fontWeight: 500 }}>{percentage || 0}%</Text>
      </div>
      <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
    </div>
  );
}

export default ProgressBar;
