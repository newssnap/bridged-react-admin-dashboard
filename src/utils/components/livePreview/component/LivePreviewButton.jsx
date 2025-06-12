import React from 'react';
import { Button } from 'antd';

const LivePreviewButton = ({ onClick, isLivePreview, isCloseDisabled, isButton }) => {
  const width = 600;

  return (
    <>
      {isButton && (
        <Button
          onClick={onClick}
          type="primary"
          disabled={isCloseDisabled}
          style={{
            position: 'fixed',
            top: '50%',
            right: isLivePreview ? `${width - 16}px` : '-23px',
            transform: 'rotate(-90deg)',
            borderRadius: '0px',
          }}
        >
          {isLivePreview ? 'Close' : 'Preview'}
        </Button>
      )}
    </>
  );
};

export default LivePreviewButton;
