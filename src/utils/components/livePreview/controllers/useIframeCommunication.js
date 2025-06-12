import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setIframeSS,
  setIsIframeLoaded,
  setIsShouldIframeTakeSS,
} from '../../../../redux/slices/iframe/iframeSlice';
import { notification } from 'antd';

const useIframeCommunication = (isLivePreviewLocal, localIframeData, uniqueId) => {
  const [displayType, setDisplayType] = useState('desktop');
  const [isMessageShown, setIsMessageShown] = useState(false);
  // State management
  const [isLivePreview, setIsLivePreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [screenshotRequested, setScreenshotRequested] = useState(false);

  // Redux state and dispatch
  const dispatch = useDispatch();
  const iframeRef = useRef(null);
  const iframeData = useSelector(state => state.iframe.iframeData);
  const isIframeLoaded = useSelector(state => state.iframe.isIframeLoaded);
  const isClickSS = useSelector(state => state.iframe.isShouldIframeTakeSS);
  const iframeUniqueId = useSelector(state => state.iframe.iframeUniqueId);

  // Effect for updating the iframe data
  useEffect(() => {
    const iframeWindow = iframeRef.current?.contentWindow;

    if (isClickSS && isLoading && !isMessageShown) {
      notification.info({
        message: 'Iframe is loading',
        placement: 'bottomRight',
        showProgress: true,
      });
      setIsMessageShown(true);
    }

    if (iframeWindow) {
      const shouldSendScreenshot = isClickSS && uniqueId === iframeUniqueId && !screenshotRequested;

      if (shouldSendScreenshot) {
        setScreenshotRequested(true);
        iframeWindow.postMessage(JSON.stringify({ event: 'screenshot' }), '*');
      } else {
        iframeWindow.postMessage(
          JSON.stringify(localIframeData ? localIframeData : iframeData),
          '*'
        );
      }
    }

    if (isClickSS) {
      dispatch(setIsShouldIframeTakeSS(false));
    }
  }, [
    iframeData,
    isIframeLoaded,
    iframeRef,
    isClickSS,
    isLoading,
    isMessageShown,
    localIframeData,
    uniqueId,
    iframeUniqueId,
    screenshotRequested,
  ]);

  // Function to handle iframe messages
  const handleMessage = event => {
    const eventData = event?.data;

    if (typeof eventData === 'string' && eventData.includes('image')) {
      // Reset the screenshot requested flag when we receive the image
      setScreenshotRequested(false);
      const iframeImg = JSON.parse(eventData)?.image;
      dispatch(setIframeSS(iframeImg));
    }

    if (typeof eventData === 'string' && eventData.includes('"event":"appLoaded"')) {
      dispatch(setIsIframeLoaded(!isIframeLoaded));
      setIsLoading(false);
    }
  };

  // Attach and detach the message event listener
  useEffect(() => {
    const handleEvent = handleMessage;

    window.addEventListener('message', handleEvent);

    return () => {
      window.removeEventListener('message', handleEvent);
    };
  }, []);

  useEffect(() => {
    if (isLivePreviewLocal !== null) {
      setIsLivePreview(isLivePreviewLocal);
    }
  }, [isLivePreviewLocal]);

  return {
    iframeRef,
    setIsLivePreview,
    isLivePreview,
    isLoading,
    displayType,
    setDisplayType,
  };
};

export default useIframeCommunication;
