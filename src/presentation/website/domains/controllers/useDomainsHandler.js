import { notification } from 'antd';
import {
  useCreateDomainMutation,
  useDeleteDomainMutation,
  useVerifyDomainMutation,
} from '../../../../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { setDomainData } from '../../../../redux/slices/domains/domainSlice';
import { setAgentDomain } from '../../../../redux/slices/agents/agentSlice';
function removeProtocolAndWWW(inputString) {
  const regex = /^(https?:\/\/)?(www\.)?/i;
  let resultString = inputString.replace(regex, '');

  if (resultString.endsWith('/')) {
    resultString = resultString.slice(0, -1);
  }

  return resultString;
}

const useDomainsHandler = () => {
  const dispatch = useDispatch();
  const host = useSelector(state => state.domain.data.host);
  const domainData = useSelector(state => state.domain.data);

  const [_DELETE] = useDeleteDomainMutation();
  const [_ADD, { isLoading }] = useCreateDomainMutation();
  const [_VERIFY, { isLoading: isVerifyDomainLoading }] = useVerifyDomainMutation();

  // Add domain
  const addDomainHandler = async () => {
    try {
      const response = await _ADD({
        host: removeProtocolAndWWW(host),
      });

      if (response?.data?.success) {
        notification.success({
          message: 'Domain Added',
          placement: 'bottomRight',
          showProgress: true,
        });

        if (response?.data?.data?.status === 'pendingForAddingDNSRecords') {
          dispatch(
            setDomainData({
              ...domainData,
              domainStep: 1,
              currentDomain: response?.data?.data,
            })
          );
        }

        if (response?.data?.data?.status === 'verified') {
          dispatch(setAgentDomain(response?.data?.data?.host || ''));
          dispatch(
            setDomainData({
              ...domainData,
              isDomainDrawerOpen: false,
              domainStep: 0,
              host: '',
            })
          );
        }
      }

      if (response?.error) {
        // Handle and display the error message
        notification.error({
          message: response?.error?.data?.errorObject?.userErrorText,
          placement: 'bottomRight',
          showProgress: true,
        });
      }
    } catch (error) {
      console.error('Add Domain error:', error);
    }
  };

  // verify domain
  const verifyDomainHandler = async () => {
    try {
      notification.info({
        message: 'Verifing Domain',
        placement: 'bottomRight',
        showProgress: true,
      });

      const response = await _VERIFY(domainData?.currentDomain?._id);

      if (response?.data?.success) {
        if (response?.data?.data?.status === 'pendingForAddingDNSRecords') {
          notification.warning({
            message: 'Domain not verified',
            placement: 'bottomRight',
            showProgress: true,
          });
        } else {
          notification.warning({
            message: 'Domain verified',
            placement: 'bottomRight',
            showProgress: true,
          });
        }
      }

      if (response?.error) {
        // Handle and display the error message if login is unsuccessful
        notification.error({
          message: response?.error?.data?.errorObject?.userErrorText,
          placement: 'bottomRight',
          showProgress: true,
        });
      }

      dispatch(
        setDomainData({
          ...domainData,
          isDomainDrawerOpen: false,
          domainStep: 0,
          host: '',
        })
      );
    } catch (error) {
      console.error('Domain deletion error:', error);
    }
  };

  // Delete domain
  const deleteDomainHandler = async _id => {
    try {
      notification.info({
        message: 'Deleting Domain',
        placement: 'bottomRight',
        showProgress: true,
      });

      const response = await _DELETE(_id);

      if (response?.data?.success) {
        notification.success({
          message: 'Domain Deleted',
          placement: 'bottomRight',
          showProgress: true,
        });
      }
    } catch (error) {
      console.error('Domain deletion error:', error);
    }
  };

  // Verify Domain Click Handler
  const verifyClickHandler = item => {
    dispatch(
      setDomainData({
        ...domainData,
        isDomainDrawerOpen: true,
        domainStep: 1,
        currentDomain: item,
      })
    );
  };

  // Close Domain Modal Handler
  const onCloseDomainHandler = () => {
    dispatch(
      setDomainData({
        ...domainData,
        isDomainDrawerOpen: false,
        host: '',
        domainStep: 0,
      })
    );
  };

  return {
    addDomainHandler,
    deleteDomainHandler,
    verifyDomainHandler,
    verifyClickHandler,
    onCloseDomainHandler,
    isLoading: isLoading || isVerifyDomainLoading,
  };
};
export default useDomainsHandler;
