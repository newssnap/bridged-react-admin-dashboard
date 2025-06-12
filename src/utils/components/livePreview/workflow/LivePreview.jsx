import React, { useEffect } from 'react';
import LivePreviewButton from '../component/LivePreviewButton';
import LivePreviewDrawer from '../component/LivePreviewDrawer';
import useIframeCommunication from '../controllers/useIframeCommunication';
import LivePreviewIframe from '../component/LivePreviewIframe';

function LivePreview({
  isLivePreviewLocal,
  setIsLivePreviewLocal,
  isCloseDisabled,
  isButton,
  isInline,
  localIframeData,
  uniqueId = 'default',
  setIsDesktopPreview,
}) {
  // Destructuring directly in the function parameters
  const { iframeRef, setIsLivePreview, isLivePreview, isLoading, displayType, setDisplayType } =
    useIframeCommunication(isLivePreviewLocal, localIframeData, uniqueId);

  useEffect(() => {
    if (setIsDesktopPreview) {
      if (displayType === 'desktop') {
        setIsDesktopPreview(true);
      } else {
        setIsDesktopPreview(false);
      }
    }
  }, [displayType]);

  if (isInline) {
    return (
      <LivePreviewIframe
        iframeRef={iframeRef}
        isLoading={isLoading}
        uniqueId={uniqueId}
        displayType={displayType}
        setDisplayType={setDisplayType}
      />
    );
  }
  return (
    <>
      <LivePreviewButton
        onClick={() => {
          setIsLivePreview(!isLivePreview);
        }}
        isLivePreview={isLivePreview}
        isCloseDisabled={isCloseDisabled}
        isButton={isButton}
      />

      <LivePreviewDrawer
        isLivePreview={isLivePreview}
        onClose={() => {
          setIsLivePreview(false);
          if (setIsLivePreviewLocal) {
            setIsLivePreviewLocal(false);
          }
        }}
        isLoading={isLoading}
        iframeRef={iframeRef}
        isButton={isButton}
        uniqueId={uniqueId}
        displayType={displayType}
        setDisplayType={setDisplayType}
      />
    </>
  );
}

export default LivePreview;
