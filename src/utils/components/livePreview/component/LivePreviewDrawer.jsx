import React from 'react';
import { Col, Drawer, theme } from 'antd';
import LivePreviewIframe from './LivePreviewIframe';

const width = 600;
const LivePreviewDrawer = ({
  isLivePreview,
  onClose,
  isLoading,
  iframeRef,
  isButton,
  uniqueId,
  displayType,
  setDisplayType,
}) => {
  const { token } = theme.useToken();

  return (
    <Drawer
      closable={isButton ? false : true}
      onClose={onClose}
      open={isLivePreview}
      getContainer={false}
      mask={false}
      rootStyle={{
        position: 'fixed',
        top: '178px',
        bottom: '0px',
      }}
      width={width}
      contentWrapperStyle={{
        boxShadow: 'none',
        borderLeft: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <Col span={24}>
        <LivePreviewIframe
          iframeRef={iframeRef}
          isLoading={isLoading}
          uniqueId={uniqueId}
          displayType={displayType}
          setDisplayType={setDisplayType}
        />
      </Col>
    </Drawer>
  );
};

export default LivePreviewDrawer;
