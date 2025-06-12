import React from 'react';
import { Row, Skeleton } from 'antd';

const LoadingSkeleton = () => {
  return (
    <Row
      style={{
        width: '100%',
        padding: '0px',
      }}
      justify="center"
      align="middle"
    >
      <Skeleton.Button
        active={true}
        block={true}
        style={{
          height: '350px',
          borderRadius: 'var(--mpr-2)',
        }}
      />
    </Row>
  );
};

export default LoadingSkeleton;
