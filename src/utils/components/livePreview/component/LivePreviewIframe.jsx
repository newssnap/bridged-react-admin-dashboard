import { Row, Segmented } from 'antd';
import React, { useEffect } from 'react';
import Icon from '../../Icon';
import { MobileOutlined } from '@ant-design/icons';
import LoadingSkeleton from '../skeleton/LoadingSkeleton';
import { FLIPCARD_URL } from '../../../../config/Config';

const LivePreviewIframe = ({ isLoading, iframeRef, uniqueId, displayType, setDisplayType }) => {
  useEffect(() => {
    const element = document.getElementById(`live-preview-iframe-${uniqueId}`);
    if (element && iframeRef) {
      iframeRef.current = element;
    }
  }, [uniqueId, iframeRef]);

  useEffect(() => {
    const handleMessage = event => {
      // You now have access to the data
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        if (data && data.event === 'overflow') {
          const iframe = document.getElementById(`live-preview-iframe-${uniqueId}`);
          iframe.style.height = data.totalHeight + 'px';
        }
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <>
      {isLoading && <LoadingSkeleton />}

      <Row
        style={{
          display: isLoading && 'none',
          width: '100%',
        }}
      >
        <iframe
          ref={iframeRef}
          title={`Live Preview ${uniqueId}`}
          style={{
            width: '100%',
            minWidth: '100px',
            maxWidth: displayType === 'desktop' ? '100%' : '400px',
            minHeight: '400px',
            // maxHeight: '650px',
            border: 'none',
            outline: 'none',
          }}
          id={`live-preview-iframe-${uniqueId}`}
          src={FLIPCARD_URL + `?trackerId=live-preview-tracker-id-${uniqueId}`}
          allowtransparency="true"
          sandbox="allow-same-origin allow-scripts"
          crossOrigin="anonymous"
        ></iframe>
      </Row>

      <Row
        style={{
          marginTop: 'var(--mpr-2)',
        }}
      >
        <Segmented
          onChange={e => setDisplayType(e)}
          size="large"
          options={[
            {
              value: 'desktop',
              icon: <Icon name="DesktopOutlined" />,
            },
            {
              value: 'mobile',
              icon: <MobileOutlined />,
            },
          ]}
        />
      </Row>
    </>
  );
};

export default LivePreviewIframe;
