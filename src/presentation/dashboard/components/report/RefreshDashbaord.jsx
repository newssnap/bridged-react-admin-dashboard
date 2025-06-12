import { Button, Card, Col, Row, Skeleton } from 'antd';
import React from 'react';
import Icon from '../../../../utils/components/Icon';

import moment from 'moment';
import useRefreshDashboard from '../../controllers/useRefreshDashboard';

function RefreshDashbaord() {
  const { isRefreshing, handleRefreshCache } = useRefreshDashboard();
  return (
    <Card size="small" style={{ backgroundColor: 'var(--primary-Color-Opacity)' }}>
      <Row wrap={false} justify="space-between" align="middle" style={{ gap: 'var(--mpr-2)' }}>
        <Row justify="start" align="middle" style={{ gap: 'var(--mpr-3)' }}>
          <Row justify="start" align="middle" style={{ gap: 'var(--mpr-3)' }}>
            <Icon name="InfoCircleOutlined" />
          </Row>
          {isRefreshing ? (
            <Skeleton.Button
              active
              style={{
                height: '20px',
                width: '180px',
              }}
            />
          ) : (
            <h4>To get the latest data please refresh the dashboard.</h4>
          )}
        </Row>
        <Button
          type="primary"
          disabled={isRefreshing}
          onClick={handleRefreshCache}
          loading={isRefreshing}
        >
          Refresh Dashboard
        </Button>
      </Row>
    </Card>
  );
}

export default RefreshDashbaord;
