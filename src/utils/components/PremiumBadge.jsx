import React from 'react';
import { Typography, theme } from 'antd';

const { Paragraph } = Typography;

function PremiumBadge({ style }) {
  // Retrieve the secondary border color from the Ant Design theme
  const {
    token: { colorBorderSecondary },
  } = theme.useToken();

  return (
    <div
      className="premiumLabel"
      style={{
        border: `1px solid ${colorBorderSecondary}`,
        ...style,
      }}
    >
      <Paragraph>PREMIUM</Paragraph>
    </div>
  );
}

export default PremiumBadge;
